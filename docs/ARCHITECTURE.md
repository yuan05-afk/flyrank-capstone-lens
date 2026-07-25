# Lens architecture

## Layers

`repository -> service -> route handler`

- Repositories contain Prisma access only.
- Services own classification, embedding, ranking, guard, eval, worker, library, and cost logic.
- Providers implement `VisionProvider` and `EmbeddingProvider`.
- Route handlers authenticate, validate, call one service, and serialize.

## Pipeline

```text
images -> durable classify job (idempotent + leased) -> schema-validated tags
      -> image embeddings (model + dims stored)
posts  -> durable embed job -------------------------> post embeddings
post + candidates -> same-space cosine rank
                  -> guard_policy_v1 feature audit
                  -> suggested | guarded | no_match
                  -> human approve/reject
cost ledger + MAX_BATCH_USD stops the worker when budget is spent
```

## Mismatch guard (`guard_policy_v1`)

Order matters:

1. Explicit post/image subject disagreement returns `guarded`.
2. Score below the similarity floor returns `no_match`.
3. Image confidence below the confidence floor is guarded for review.

Every persisted pairing stores `policyId` and `featuresJson` (cosine, subject
agreement, alias overlap, floor flags). The fox/wolf/dog fixture is the
acceptance case. Threshold sweeps live in `docs/eval/threshold-curve.md`.

## Jobs

- Idempotency keys prevent double-enqueue of classify/embed work.
- Claims set `lockedAt`, `leaseUntil`, and `heartbeatAt`.
- Expired leases can be reclaimed.
- A single item failure retries with backoff; drain continues for the rest of the batch.

## Provider safety

The seed providers are the default, work with zero cloud keys, and write
zero-dollar cost events. Classification retries once on invalid structured
output. Matching refuses mixed embedding models or dimensions. A live
OpenAI-compatible implementation is isolated behind the same interfaces and is
activated only with explicit environment configuration.

## Bring your own library

`library.service` and `POST /api/library` register images under `public/` and
CMS posts into the same pipeline. Domain onboarding is mostly alias map +
threshold eval, not a rewrite. See `docs/MARKET.md`.
