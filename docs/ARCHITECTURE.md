# Lens architecture

## Layers

`repository -> service -> route handler`

- Repositories contain Prisma access only.
- Services own classification, embedding, ranking, guard, review, and cost logic.
- Providers implement `VisionProvider` and `EmbeddingProvider`.
- Route handlers authenticate, validate, call one service, and serialize.

## Pipeline

```text
images -> durable classify job -> structured tags -> image embeddings
posts  -> durable embed job ---------------------> post embeddings
post + candidates -> cosine rank -> mismatch guard -> suggestion or no_match
suggestion -> human approve/reject
```

## Mismatch guard

1. Score below the configured similarity floor returns `no_match`.
2. Explicit post subject and image subject disagreement returns `guarded`.
3. Image confidence below the confidence floor is guarded for review.

The fox/wolf/dog fixture is the acceptance case. The guard decision is
deterministic and tested separately from UI rendering.

## Provider safety

The seed providers are the default, work with zero cloud keys, and write
zero-dollar cost events. A live OpenAI-compatible implementation is isolated
behind the same interfaces and is activated only with explicit environment
configuration.
