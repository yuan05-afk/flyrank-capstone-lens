# CURSOR PROMPT - Image Relevance & Auto-Tagging (Lens)

**Capstone · Backend AI Engineering · Week 10 · ~24h workload**

You are building **Lens**, an Image Relevance & Auto-Tagging Capstone under
`FlyRankAI/Capstones/Image Relevance & Auto-Tagging`.

Look at a library of images, understand what is actually in each one, tag them,
and match each image to the right blog post - so the article about red foxes
gets a red-fox photo, not a generic dog, and never a wolf. Vision and embeddings
run as cost-tracked background jobs. A mismatch guard refuses a bad pairing and
explains why. A tiny review desk lets a human approve or reject suggestions.

**Scope note:** Challenge 2 (relevance gate) is the decision core of this
Capstone. Build the whole system (ingest → classify → match → guard → review)
around that guard. Do the guard early and prove the fox / wolf / dog case.

---

## Non-negotiables (read before writing any code)

1. **Providers behind interfaces.** App code depends on `VisionProvider` and
   `EmbeddingProvider`, never on a concrete vendor SDK class. Ship a
   **deterministic seed provider** for demos and tests (Broadcast's fake-platform
   pattern) so the fox/wolf case always proves without burning API budget. A
   real OpenAI-compatible path is allowed when keys exist in `.env` locally -
   never commit keys.
2. **Skills (mandatory).** Before scaffolding UI or shipping, read and follow:
   - `Capstones/.cursor/skills/capstone-signal-design/SKILL.md` - shared Capstones
     harness (Lenis, Framer Motion, L/R hero, interactivity, scrollbars, pitch
     README, screenshots, staged git commits, public repo, `SUBMISSION.md`,
     no em dashes).
   - `Capstones/.cursor/skills/capstone-lens-design/SKILL.md` - **this product's**
     visual system (Focus Match: amber accent, Outfit + Figtree, focus-ring
     brand mark, match strip, tag marquee, mismatch chapter). Overrides
     palette/mark only. Do **not** reuse Checkpoint Signal teal or Broadcast
     rose as the primary brand color.
   - If present, `~/.cursor/skills/flyrank-assignment/SKILL.md` for submission
     portal field rules.
3. **Every Capstone looks different.** Lens must not read as a teal Checkpoint
   clone or a rose Broadcast clone. Same layout discipline, new colors and
   metaphor.
4. **No placeholder plumbing.** Endpoints against a real local DB. Batch jobs
   must be runnable and resumable. Tests must be runnable.
5. **Never fabricate "it works."** If a test fails, fix it. Do not paper over
   it in the README.
6. **Architecture:** `repository -> service -> route handler` (or equivalent
   clear layers).
7. **Copy:** no em dashes or en dashes in UI, README, or docs.
8. **Low confidence → flag, don't guess.** Structured vision output is validated
   with Zod. Below-threshold confidence marks the image for review; it does not
   invent a subject.

---

## Goal (one sentence)

A reviewer can open a folder of animal photos, watch them auto-tag, pick the
"red fox" post, see the fox photo rank on top with wolf and dog far below, force
a wolf pairing and watch the guard refuse it with a clear why, open a post with
no good image and see "no confident match," then approve a good suggestion on
the review desk - with cost tracking and a stated top-1 precision from the eval
set.

---

## Objectives (you will be able to)

1. **Turn perception into structure** - call a vision model (or seed stand-in)
   and get validated, structured tags out of an image.
2. **Match by meaning, not filename** - embed image descriptions and post text
   into one semantic space and rank relevance. A paraphrase ("vulpes vulpes" vs
   "red fox") still matches.
3. **Build a mismatch guard** - the production-critical part: knowing when the
   best candidate is still wrong, and refusing it.
4. **Run vision/embeddings as cost-tracked background jobs** over many items
   (retries, resumable, ledger rows).

Built from: A11 (structured vision) · A12 (cost) · A15 (embeddings/retrieval) ·
A9 (batch job) · Challenge 2 (matching/guard core).

---

## Stack (prefer this unless blocked - say why if you drift)

- **Runtime:** Node.js + TypeScript
- **App:** Next.js 14 App Router (marketing + review desk in one repo, like
  Checkpoint / Broadcast)
- **DB:** SQLite via Prisma (Postgres-ready one-line datasource swap)
- **Validation:** Zod at every public boundary and on vision structured output
- **Jobs:** durable SQLite-backed queue with resumable workers (mirror A9 /
  Broadcast job patterns). Do not require Redis for core.
- **Vision / embeddings:** `VisionProvider` + `EmbeddingProvider` interfaces.
  Seed/deterministic provider for demos + tests. Optional live provider when
  `OPENAI_API_KEY` (or documented equivalent) is set locally.
- **Tests:** Vitest
- **Package manager:** pnpm

---

## Skills + design direction

### Shared harness (`capstone-signal-design`)

Apply end to end: pitch landing, Lenis, motion, L/R hero, hover/focus,
scrollbars, README pitch style, `docs/images/` (or `docs/images/shots/`)
screenshots, phase commits, `gh repo create`, `SUBMISSION.md`.

### Product look (`capstone-lens-design`)

Product name: **Lens**. Metaphor: focus ring + lock notch.

| Token | Hex |
|-------|-----|
| Canvas | `#F2F3F7` |
| Surface | `#FFFFFF` |
| Ink | `#101828` |
| Muted | `#667085` |
| Line | `#E4E7EC` |
| Primary | `#D97706` |
| Bright | `#F59E0B` |
| Fog | `#FEF3C7` |

Fonts: **Outfit** (display) + **Figtree** (body) + **IBM Plex Mono** (chips).

Landing chapters stay Capstones-shaped. Required Lens-only hooks (see skill):

- Focus-ring L/R hero art
- Match strip under CTAs (fox ranks, wolf refused)
- Tag orbit / species marquee
- Mismatch chapter (guard is the product center)
- Review desk: pairing table, focus meter, cost chips, batch strip

Hero stays brand-first - no stats dump in the first viewport.

Pitch line: **One library. The right image. Never the wrong one.**

Write `docs/DESIGN.md` and `.cursor/rules/design.mdc` pointing at
`capstone-lens-design` (and the harness skill).

---

## What you will build

Given a set of images and a set of posts, a service that:

1. **Ingests & classifies** each image with a vision path → structured tags
   `{ subject, category, attributes[], caption, confidence }` as a **batch job**
   (vision is slow/bulk; retries + cost tracking).
2. **Embeds** each image's description (caption / tag summary) and each post's
   text into a shared space.
3. **Matches:** for a post, ranks the most relevant images; flags when even the
   best is weak (`no_match` / "no good image for this post").
4. **Guards against mismatches:** detects and refuses a bad pairing (the
   wolf-on-a-fox-post case) using **tags + a similarity threshold**, and returns
   an explanation.
5. **Exposes a validated API + a tiny review surface** (approve/reject a
   suggested pairing). One-page Lens desk is enough.

### Realistic corpus

Gather ~50 images across a few animal (or clearly separable) categories -
enough to be real, small enough to classify cheaply. Prefer reusing Challenge 2
eval assets if present on disk; otherwise ship:

- `fixtures/corpus/` - images (or generated SVG/PNG stand-ins with known subjects)
- `fixtures/posts.json` - posts including a red-fox post and a weak/no-match post
- `fixtures/eval-set.json` - labeled pairs for top-1 precision

Seed provider labels must be honest for the demo subjects (fox, wolf, dog, …).

---

## Architecture sketch

```
[images] ─(job)─► VisionProvider ─► {tags, caption, confidence} ─► image_tags
                 └─► EmbeddingProvider(caption) ───────────────► image_vectors

[posts] ───────► EmbeddingProvider(post text) ─────────────────► post_vectors

GET /posts/:id/images
   └─► rank by similarity
   └─► mismatch guard (tags + threshold)
   └─► { suggested | no_match + reason }
   └─► review: approve / reject
```

### Suggested layout

```
app/
  api/                 route handlers (Zod in, JSON out)
  review/              authenticated Lens desk
  (marketing)/         landing (or app/page + landing-page.tsx)
services/              classify, embed, match, guard, review, cost
providers/             VisionProvider + EmbeddingProvider (+ seed + live)
repositories/          Prisma access only
workers/               batch classify / embed jobs
lib/
  validation/          tag schema, match response schemas
  similarity/          cosine / rank helpers
config/
  pricing.config.ts    model cost estimates
  guard.config.ts      similarity threshold + tag disagreement rules
prisma/
tests/
docs/
fixtures/
  corpus/
  posts.json
  eval-set.json
public/
storage/               optional local image copies
```

---

## Data model (minimum)

- `Image` - path/url, checksum?, status (`pending | tagged | failed`), createdAt
- `ImageTag` - imageId, subject, category, attributes (JSON), caption,
  confidence, flaggedLowConfidence, provider, raw? 
- `Embedding` - ownerType (`image` | `post`), ownerId, model, dims, vector
  (JSON or blob), updatedAt
- `Post` - title, body, url?, createdAt
- `Pairing` - postId, imageId, score, status
  (`suggested | approved | rejected | guarded`), guardReason?, createdAt,
  decidedAt?
- `Job` - type (`classify` | `embed`), payload, runAt, attempts, lockedAt,
  doneAt, lastError?
- `CostEvent` - kind (`vision` | `embedding`), model, units, unitCostUsd,
  totalUsd, refType, refId, createdAt

Indexes: image status, pairing (postId, status), embedding (ownerType, ownerId),
job due claims.

---

## Provider interfaces (design in Phase 0)

```ts
export type ImageTags = {
  subject: string;
  category: string;
  attributes: string[];
  caption: string;
  confidence: number; // 0..1
};

export interface VisionProvider {
  readonly id: string;
  classify(input: { imagePath: string; mimeType?: string }): Promise<ImageTags>;
}

export interface EmbeddingProvider {
  readonly id: string;
  embed(text: string): Promise<number[]>;
}
```

App services accept these interfaces (or a registry), never a concrete SDK.

Cost: every live (and seed, with zero/estimated) call writes a `CostEvent`.
Document pricing assumptions in `config/pricing.config.ts`.

---

## Mismatch guard (Challenge 2 core)

Clear, testable rule - implement exactly and document in `docs/ARCHITECTURE.md`:

1. **Similarity floor:** if best score < `SIM_THRESHOLD`, return `no_match`
   with reason (weak similarity).
2. **Tag disagreement:** if post subject cues (from title/body keywords or a
   post subject field) conflict with image `subject` / category (e.g. fox post
   vs wolf image), **refuse** even if similarity is high - status `guarded`
   with explanation.
3. **Low confidence image:** if `confidence < CONF_THRESHOLD`, do not treat as
   a confident suggestion; flag for review.

Prove in tests: fox post rejects wolf. Paraphrase match: "vulpes vulpes" post
still ranks red fox highly when captions/tags align.

---

## Definition of done (core)

- [ ] **Vision tagging** as structured output with a validated Zod schema;
      low confidence → flag, don't guess. (M6)
- [ ] **Batch classification job** with retries + cost tracking (model on
      FlyRank blog-existence batch + image job patterns). (M5)
- [ ] **Semantic matching:** embed captions + post text; rank images per post;
      paraphrase still matches. (M8)
- [ ] **Mismatch guard:** tags disagree or similarity below threshold → reject
      wrong pairing and explain why. Prove fox/wolf/dog. (M8)
- [ ] **Data model:** images, tags, embeddings, posts, pairings, indexes. (M2)
- [ ] **Validated API + minimal approve/reject surface** (Lens desk). (M3)
- [ ] **Cost tracking** per vision/embedding call. (M6)
- [ ] **Tests:** schema-validation path; mismatch guard (fox rejects wolf);
      eval on small labeled set (top-1 precision reported). (M10)
- [ ] **README + diagram** (pitch style from harness).
- [ ] **Lens UI** from `capstone-lens-design` + harness motion/docs.
- [ ] Public GitHub repo, phase commits, screenshots, `SUBMISSION.md`.

---

## Build phases (commit after each)

Name commits `Phase N: …` like other Capstones.

### Phase 0 - Contracts & design (~2-3h)

- Scaffold Next.js app, Prisma schema, `.env.example`, `.gitignore`
- `docs/DESIGN.md`, `docs/ARCHITECTURE.md`,
  `.cursor/rules/{architecture,security,design}.mdc`
- Tag Zod schema, provider interfaces, guard config, pricing config
- Wire Lens tokens / Outfit + Figtree / BrandMark stub (focus ring)
- Landing shell with Capstones chapters (art can be SVG stubs)
- Checkpoint: schema pushes; design docs exist; `pnpm typecheck` clean

### Phase 1 - Corpus + batch classify (~5h)

- Ship ~50-image corpus (or honest generated stand-ins) + seed posts
- Seed `VisionProvider` that returns validated tags for known fixtures
- Optional live vision provider behind env flag
- Batch job: claim → classify → persist tags → cost row → retries
- Low confidence flagged
- Checkpoint: run job over corpus; tags in DB; cost events present

### Phase 2 - Embeddings + match + guard (~5-6h)

- Seed (and optional live) `EmbeddingProvider`
- Embed image captions and post text; store vectors
- `GET /posts/:id/images` ranks by similarity
- Mismatch guard applied; fox/wolf/dog tests green
- Paraphrase case covered
- Checkpoint: fox post top-1 is fox; forced wolf pairing returns `guarded`

### Phase 3 - Review API + desk + eval + ship (~5-6h)

- Approve / reject pairing endpoints + Lens review desk UI
- Eval script/test on `fixtures/eval-set.json` → top-1 precision
- Marketing landing complete (focus-ring art, match strip, tag marquee,
  mismatch chapter) + desk parity
- Pitch README (`git clone` first), mermaid diagram, real screenshots
- Public repo push, `SUBMISSION.md`

### Stretch (only after core DoD)

- Auto alt-text from tags (real FlyRank concern)
- Near-duplicate detection (perceptual hash / embedding distance)
- "Best image" generation fallback when nothing matches (ties to
  `generateImageForContent.ts` ideas)
- Run as a node on Capstone 1 if that stack exists
- Human-in-the-loop agent QA for low-confidence pairings

---

## API sketch (adjust names, keep behaviors)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/login` | public | demo API key → session cookie |
| POST | `/api/jobs/classify` | session | enqueue / run classify batch |
| POST | `/api/jobs/embed` | session | enqueue / run embed batch |
| POST | `/api/worker/tick` | session | claim one due job (desk + tests) |
| GET | `/api/images` | session | list images + tags |
| GET | `/api/posts` | session | list posts |
| GET | `/api/posts/:id/images` | session | ranked candidates + guard verdicts |
| POST | `/api/pairings` | session | create/force suggest (for guard demos) |
| POST | `/api/pairings/:id/approve` | session | approve |
| POST | `/api/pairings/:id/reject` | session | reject |
| GET | `/api/costs` | session | cost ledger summary |
| GET | `/api/eval` | session | optional: run eval set summary |

Demo auth: seeded API key (same pattern as Checkpoint / Broadcast).

Suggested demo key: `lens_demo_key_001`.

---

## Tests (minimum)

1. Tag schema: valid structured output parses; invalid / low-confidence path
   flags instead of inventing
2. Mismatch guard: fox post + wolf image → rejected / `guarded` with reason
3. Ranking: fox post top-1 is fox image; dog/wolf rank lower
4. Paraphrase: "vulpes vulpes" (or equivalent fixture) still matches red fox
5. Eval: top-1 precision on `fixtures/eval-set.json` (assert floor, e.g. ≥ 0.8
   on the tiny labeled set - document the number in README)
6. Cost: classify/embed writes `CostEvent` rows
7. Optional: job retry after simulated failure does not double-write tags

---

## Study these FlyRank parts (when available on disk)

- Image generation + variants: `inngest/generateImageForContent.ts`,
  `lib/dynamic-image-variants/`
- Agent-based image QA idea: `config/agent-flows.config.ts`
- Batch-classification pattern:
  `inngest/blog-existence-check/checkBlogExistenceBatch.ts`
- Structured output + cost: `lib/agents/schema/builder.ts`,
  `config/chat-pricing.config.ts`
- Challenge 2 relevance gate / eval set (if present under starters)

If a path is missing, recreate the **behavior** and document the stand-in. Do
not block the Capstone on monorepo access.

---

## Demo script (README should enable this)

1. Start classify job over the animal corpus → show tags on a few images
2. Pick the **red fox** post → fox photo surfaces on top; wolf and dog far below
3. Force a wolf pairing → guard refuses and explains why
4. Open a post with no good image → "no confident match, here's why"
5. Approve one good suggestion on the review desk
6. Show cost ledger chips / summary
7. Close with the precision number from the eval set

---

## Shipping checklist (from skills)

- [ ] `capstone-lens-design` applied (amber, Outfit, focus-ring mark, unique
      landing hooks)
- [ ] `capstone-signal-design` harness applied (Lenis, hero L/R, interactivity,
      scrollbars, pitch README with `git clone` first, screenshots, phase
      commits)
- [ ] Public GitHub repo (`flyrank-capstone-lens` or similar)
- [ ] `SUBMISSION.md` with Deliverable links + Notes
- [ ] No live API keys in git history
- [ ] Seed provider path works with zero cloud keys for the graded demo

---

## How to start (agent)

1. Read both skills fully (`capstone-signal-design` + `capstone-lens-design`).
2. Work inside `Capstones/Image Relevance & Auto-Tagging/`; `git init` early;
   ignore secrets/DB.
3. Execute Phase 0 → 3 in order; commit after each phase (`Phase N: …`).
4. Prefer working software and honest tests over decorative stretch features.
5. End with `SUBMISSION.md` + pasteable form fields for the user.

---

## Stop condition for prompt authors

This file and `capstone-lens-design` are the Capstone contract. Do **not**
scaffold the Next.js app until the human reviewing this prompt says to proceed
with the build.
