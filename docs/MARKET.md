# Who uses Lens, and why it is not only a Capstone demo

Lens is built around one production problem: **content teams keep pairing the
wrong image with the right words**. Filenames lie. Nearest-neighbor scores are
also unsafe when subjects are close (fox / dog / wolf, sneaker / boot, sedan /
SUV).

This Capstone uses a wildlife library because the fox/wolf failure is easy to
prove in a review. The same system is meant for any media library where a
wrong pairing is expensive.

## Market problem

| Buyer | Pain | What Lens changes |
|---|---|---|
| Editorial / CMS teams | Authors pick the first plausible stock photo | Structured tags + ranked candidates + refuse near-misses |
| Ecommerce / catalog ops | Product copy gets a lookalike SKU image | Subject agreement and confidence floors before publish |
| Brand / social desks | Campaign assets drift across posts | Decision ledger with approve/reject audit trail |
| AI platform teams | Raw model calls without cost or policy | Provider seams, durable jobs, budget caps, versioned guard policy |

## Why this is relevant beyond the assignment

1. **Decision > generation.** Most demos show a model answering. Lens shows a
   policy deciding when the best candidate is still wrong.
2. **Operable AI.** Jobs, leases, retries, idempotency keys, and a cost ledger
   are what teams need before they trust a pipeline overnight.
3. **Bring your own library.** The wildlife fixtures are a reproducible eval
   set. Your images and posts can register through the same APIs and worker.
4. **Auditable outcomes.** Every pairing stores score, status, policy id, and
   feature JSON so a reviewer can explain a refusal later.

## How other people can use it

### 1. Run the zero-key demo (prove the guard)

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm corpus:classify
pnpm corpus:embed
pnpm dev
```

Log in with `lens_demo_key_001`, rank the red-fox post, force a wolf image,
and confirm the ledger stores `guarded`.

### 2. Bring your own images and posts

1. Put files under `public/uploads/` (create the folder if needed).
2. Register them:

```bash
pnpm library:import -- --image uploads/hero.jpg --name hero.jpg --slug landing-hero --title "Landing hero brief" --body "Product hero for the spring launch." --subject "running shoe"
```

Or call `POST /api/library` with demo auth:

```json
{ "kind": "image", "name": "hero.jpg", "relativePath": "/uploads/hero.jpg" }
```

```json
{
  "kind": "post",
  "slug": "landing-hero",
  "title": "Landing hero brief",
  "body": "Product hero for the spring launch.",
  "subject": "running shoe"
}
```

3. Extend `SUBJECT_ALIASES` in `config/guard.config.ts` for your domain.
4. Enqueue classify + embed, then rank from the review desk.

### 3. Swap in a live provider when you have budget

Set `VISION_PROVIDER=openai`, `EMBEDDING_PROVIDER=openai`, and
`OPENAI_API_KEY` locally. The same Zod contracts, cost rows, and guard policy
apply. `MAX_BATCH_USD` stops the worker when the batch budget is spent.

### 4. Prove quality with the eval harness

```bash
pnpm test
pnpm eval
pnpm eval:sweep
```

`docs/eval/threshold-curve.md` records precision, no-match recall, false
refuse/accept rates, and a threshold sweep so policy changes are measurable.

## Positioning one-liner

**Lens is a match-and-refuse engine for media libraries:** tag what is in the
image, rank by meaning, refuse the near-miss, and keep cost + decisions
auditable.

That is useful to Capstone graders and to any team that cannot afford a wrong
hero image in production.
