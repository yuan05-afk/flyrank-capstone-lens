---
name: capstone-lens-design
description: >-
  Product-specific visual system for the FlyRank Capstone "Image Relevance &
  Auto-Tagging" (Lens / Focus Match): cool graphite canvas, amber focus accent,
  Outfit + Figtree, focus-ring brand mark, specimen match + mismatch-guard UI.
  Use when building or restyling Image Relevance, Lens, auto-tagging, semantic
  image-to-post matching, or review desks for suggested pairings, or when the
  user asks for a Capstone look deliberately different from Checkpoint Signal
  teal and Broadcast rose. Pair with capstone-signal-design for the shared
  harness (Lenis, README, git, screenshots, SUBMISSION.md).
---

# Capstone Lens Design (Image Relevance & Auto-Tagging)

This skill is **only** for the Capstone project
`Capstones/Image Relevance & Auto-Tagging` (product name: **Lens**).

It overrides palette, type, brand mark, and section motifs.
It does **not** replace the shipping harness. Always also apply
`capstone-signal-design` for:

- Lenis + Framer Motion pitch landings
- Balanced L/R hero art + center text safe zone
- Full landing hover/focus interactivity
- Custom scrollbars
- Pitch README, screenshots, staged git commits, public repo, `SUBMISSION.md`
- No em dashes

Why a separate skill: every Capstone should feel like its own product.
Checkpoint is Clear Signal (teal / security boundary). Broadcast is a
campaign studio (rose / crop frames). Lens is a **vision match desk**
(amber / focus rings / tags + mismatch guard). Same layout discipline,
different color and metaphor.

## Product metaphor

**Focus Match** - look at an image, lock onto what is actually in it, then
pair it only with a post that means the same thing. Refuse a near-miss.

- Focus rings / lock notches as decoration (subtle, never cluttered)
- Structured tag chips: `subject`, `category`, attributes
- Match score as a quiet focus meter (not a neon gauge cluster)
- Status as quiet pills: `tagged` / `matched` / `guarded` / `approved` /
  `rejected` / `no_match`
- Brand mark: a focus ring with an amber "lock" notch (reads at 16px)

Pitch line: **One library. The right image. Never the wrong one.**

Demo spine the UI must make obvious: red-fox post → fox on top; wolf and dog
rank low; the guard refuses the wolf even if forced; weak post →
"no confident match" with a short why.

## Palette (Lens amber)

| Token | Hex | Use |
|-------|-----|-----|
| Canvas | `#F2F3F7` | Page background (cool graphite, not teal mist, not Broadcast stone-pink) |
| Surface | `#FFFFFF` | Cards / panels |
| Ink | `#101828` | Text |
| Muted | `#667085` | Secondary copy |
| Line | `#E4E7EC` | Borders |
| Primary / Lens | `#D97706` | Brand + CTAs (amber focus) |
| Lens bright | `#F59E0B` | Hover / pulse |
| Fog | `#FEF3C7` | Soft amber chips |
| Slate tip | `#E8ECF4` | Optional secondary wash for tag chips only |
| OK / Warn / Danger | `#15803D` / `#B45309` / `#DC2626` | Status only |

Banned (same as Capstones harness, plus product-specific):

- Checkpoint Signal teal as the primary brand color
- Broadcast rose as the primary brand color
- Purple-indigo glass gradients
- Warm cream + terracotta paper look
- Dark terminal / typewriter customs desk
- Inter / Roboto / Geist as display voice
- Syne as display (stretches at hero size)

## Typography

- **Display / brand:** Outfit (keeps normal letter proportions at hero size;
  deliberately different from Checkpoint/Broadcast Sora)
- **Body:** Figtree
- **Mono / chips:** IBM Plex Mono for image ids, job ids, similarity scores,
  confidence, cost rows, guard reasons

## Layout (keep the Capstones chapter shape)

Same structure as CheckMyDevice / Checkpoint / Broadcast landings so the
product feels familiar to navigate, even with a new palette:

1. Sticky topbar + brand lockup
2. Full-viewport hero (L/R art, center safe)
3. Scroll chapters with section badges
4. Feature / pipeline grid
5. Trust / prove (structured tags, semantic rank, mismatch guard, cost ledger)
6. Closing CTA + footer

Review desk must match Lens tokens (not Signal teal, not Broadcast rose).

### Unique harness additions (Lens-only, still Capstones-aligned)

Keep the chapter shape. Add these hooks so the first impression is not a
generic AI tagging page:

1. **Focus-ring L/R hero art** - specimen image frames with animated focus
   rings locking onto a subject. Not Broadcast crop boxes. Not Checkpoint
   shields.
2. **Match strip under CTAs** - one short composition: fox post cue → ranked
   thumbs with a wolf crossed out by the guard. Not a dashboard. Not stats.
3. **Tag orbit / species marquee** - horizontal band of structured tags
   (`subject`, `category`, attributes) filling the hero gap (same role as
   Broadcast's marquee, different vocabulary).
4. **Mismatch chapter** - the product hook: side-by-side "would match" vs
   "guard refuses" with a short why. This is Challenge 2 made visible.
5. **Review desk** (authenticated) - one-page pairing table: post, suggested
   image, score, guard reason, Approve / Reject, cost chips. Mirrors the
   campaign-desk *role* of Broadcast without copying crop rails or aspect
   previews.

Do not turn the first viewport into a dashboard. Hero stays brand + one
headline + one sentence + dual CTAs + art + optional match strip.

### Review-desk surfaces (allowed)

Minimalist, one job per section:

- **Pairing table** - post title, candidate thumb, similarity, tag summary,
  guard verdict, Approve / Reject
- **Focus meter** - single score bar per suggested pairing
- **Cost strip** - quiet chips for vision/embedding spend (model, tokens, USD)
- **Batch job strip** - classify progress + retry state, not a dense ops console

## Brand mark + favicon

Metaphor: **focus ring + lock notch**.

1. Hand-author an SVG: circular focus ring, one solid amber notch or tick at
   a compass point (reads as "locked").
2. Ship identical paths in `components/BrandMark.tsx` and `public/favicon.svg`.
3. Verify at 16 / 32 / 64 px.
4. Wire metadata icons. Cache-bust (`?v=`) when swapping marks.

Anti-patterns: generic camera glyph, eye emoji, nested box-in-box,
Checkpoint scanner posts, Broadcast crop-frame reused here.

## Motion + scrollbars

Follow `capstone-signal-design` motion and scrollbar rules, but swap CSS
variables to Lens tokens:

```css
--scroll-thumb: #c5cdd8;
--scroll-thumb-hover: #d97706;
```

Lenis on marketing. Framer Motion with `once: true`. Full hover/focus on cards.
Focus-ring lock animation: short spring into place, respect
`prefers-reduced-motion`.

## Copy rule

No em dashes (`—`) or en dashes (`–`). Prefer hyphen with spaces, commas, or
periods.

## Implementation checklist (Lens)

- [ ] Tokens use Lens amber, not Signal teal, not Broadcast rose
- [ ] Outfit + Figtree + IBM Plex Mono
- [ ] BrandMark / favicon = focus ring + lock notch
- [ ] Landing chapter structure from Capstones harness
- [ ] Unique additions present: focus-ring hero art, match strip, tag marquee,
      mismatch chapter
- [ ] Review desk uses same palette as marketing
- [ ] `capstone-signal-design` harness items still completed (README, git,
      screenshots, SUBMISSION.md)

## Anti-patterns

- Shipping Lens UI that is just Checkpoint or Broadcast with a find-replace
  color swap and no new metaphor
- Crowding the hero with eval metrics, cost charts, or job consoles
- Treating the mismatch guard as a footnote instead of the product center
- Coupling the brand to a stock "AI eye" or camera icon pack
- Real vision/embedding API keys committed to the repo
- Guessing tags when confidence is low (flag, don't invent)
