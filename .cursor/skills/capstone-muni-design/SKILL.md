---
name: capstone-muni-design
description: >-
  Product-specific visual system for the FlyRank Capstone "General AI Fluency -
  Impact Project" (Muni): Lens-inspired graphite canvas + amber accent, Outfit +
  Figtree, cute interactive Filipino-inspired mascot, grounded personal agent UI,
  citation chips, and grounding-guard refusal states. Use when building or
  restyling Muni, personal brand + agent Capstones, grounded chat desks, or when
  the user asks for a Capstone look that reuses Lens amber while centering a
  mascot identity. Pair with capstone-signal-design for the shared harness
  (Lenis, README, git, screenshots, SUBMISSION.md).
---

# Capstone Muni Design (General AI Fluency - Impact Project)

This skill is **only** for the Capstone project
`Capstones/General AI Fluency - Impact Project/` (product name: **Muni**).

It overrides palette, type, brand mark, mascot, and section motifs.
It does **not** replace the shipping harness. Always also apply
`capstone-signal-design` for:

- Lenis + Framer Motion pitch landings
- Balanced L/R hero art + center text safe zone
- Full landing hover/focus interactivity
- Custom scrollbars
- Pitch README, screenshots, staged git commits, public repo, `SUBMISSION.md`
- No em dashes

Why a separate skill: every Capstone should feel like its own product.
Checkpoint is Clear Signal (teal). Broadcast is a campaign studio (rose).
Lens is a vision match desk (amber / focus rings). **Muni** is a
**grounded personal agent** (amber companion + citation trust + honest refusal).
Same layout discipline as Lens, new metaphor: thoughtful reflection.

## Product metaphor

**Muni-muni** - Filipino for thoughtful reflection and careful consideration.
Muni thinks before it answers, speaks only from verified knowledge, and
honestly admits when it lacks evidence. Trust, humility, grounded intelligence.

- Small amber-glowing companion with a soft focus-ring halo (Lens heritage)
- Citation / source chips under every grounded answer
- Quiet status pills: `grounded` / `guarded` / `refused` / `thinking`
- Brand mark: focus ring + warm spark (Muni's face, readable at 16px)
- Honest shrug / dimmed glow when the Grounding Guard refuses

Pitch line: **Meet Muni. The personal AI that only speaks from verified knowledge.**

Demo spine the UI must make obvious: ask an in-scope question about the owner
→ cited answer with source chips; ask something outside the knowledge base →
Muni's grounded-refuse state + honest "I don't have that" + offer contact;
owner inbox shows grounded vs guarded and a knowledge-gap suggestion.

## Palette (Lens graphite + amber, Muni identity)

Reuse Lens tokens so the Capstone feels familiar, but brand copy and mascot
make it unmistakably Muni (not a Lens clone with a chatbot bolted on).

| Token | Hex | Use |
|-------|-----|-----|
| Canvas | `#F2F3F7` | Page background (cool graphite) |
| Surface | `#FFFFFF` | Cards / panels / chat bubbles |
| Ink | `#101828` | Text |
| Muted | `#667085` | Secondary copy |
| Line | `#E4E7EC` | Borders |
| Primary / Muni | `#D97706` | Brand + CTAs (amber) |
| Muni bright | `#F59E0B` | Hover / pulse / thinking halo |
| Fog | `#FEF3C7` | Soft amber chips, citation pills |
| Slate tip | `#E8ECF4` | Optional secondary wash |
| OK / Warn / Danger | `#15803D` / `#B45309` / `#DC2626` | Status only |

CSS variables prefer `--muni` naming (`--muni`, `--muni-bright`, `--fog`).

Banned:

- Checkpoint Signal teal as the primary brand color
- Broadcast rose as the primary brand color
- Purple-indigo glass gradients
- Warm cream + terracotta paper look
- Dark terminal / typewriter customs desk
- Inter / Roboto / Geist as display voice
- Syne as display (stretches at hero size)
- Generic robot / chatbot stock avatars as the hero identity

## Typography

- **Display / brand:** Outfit
- **Body:** Figtree
- **Mono / chips:** IBM Plex Mono for card ids, scores, confidence, cost rows,
  citation ids, guard reasons

## Layout (keep the Capstones chapter shape)

Same structure as Lens / Checkpoint / Broadcast landings:

1. Sticky topbar + brand lockup (Muni mark + wordmark)
2. Full-viewport hero (L/R art: Muni companion + citation strip, center safe)
3. Scroll chapters with section badges
4. Feature / pipeline grid (retrieve → ground → cite → refuse)
5. Trust / prove (Grounding Guard, citations, cost ledger, eval)
6. Closing CTA + footer

Owner inbox desk must match Muni tokens (not Signal teal, not Broadcast rose).

### Unique harness additions (Muni-only, still Capstones-aligned)

1. **Muni companion hero art** - interactive amber mascot on one side, soft
   knowledge / citation cards on the other. Not Lens specimen photos. Not
   Broadcast crop frames. Not Checkpoint shields.
2. **Grounding strip under CTAs** - one short composition: question cue →
   cited answer chips → refused out-of-scope example. Not a dashboard.
3. **Knowledge / citation marquee** - horizontal band of card kinds
   (`bio`, `project`, `skill`, `faq`) and source chips.
4. **Grounding Guard chapter** - side-by-side "grounded + cited" vs
   "honest refuse" with Muni's refuse animation. This is the product center.
5. **Chat + owner inbox** - public chat with Muni; authenticated inbox of
   grounded/guarded answers, gap suggestions, knowledge editor. Desk role
   mirrors Lens/Broadcast without copying their widgets.

Do not turn the first viewport into a dashboard. Hero stays brand + one
headline + one sentence + dual CTAs + Muni art + optional grounding strip.

### Chat and desk surfaces (allowed)

Minimalist, one job per section:

- **Chat panel** - messages, citation chips, confidence, grounded/guarded badge
- **Muni stage** - mascot with animated states beside or above the chat
- **Owner inbox table** - question, status, citations, gap suggestion
- **Knowledge editor** - add/edit cards (kind, title, body, source)
- **Cost strip** - quiet chips for chat/embedding spend
- **Audience opener** - recruiter / investor / client / peer preset

## Mascot: Muni (cute + interactive)

**Character:** small, round, amber-glowing companion (spark / soft lantern body
with a focus-ring halo). Warm, friendly, Filipino-inspired personality:
thinks before speaking.

**Implementation:**

1. Hand-author an SVG character in `components/MuniMascot.tsx` (Framer Motion
   states). Ship a simplified face for `BrandMark` / `public/favicon.svg`.
2. Generate one polished illustration for hero/README under `docs/images/`
   (and optional `public/muni/hero.png`) during the build phase.
3. Respect `prefers-reduced-motion` (static pose, no bounce).

**Required animation states:**

| State | Behavior |
|-------|----------|
| `idle` | Gentle bob + soft blink |
| `wave` | Hello wave on first visit / opener |
| `listening` | Leans in while the visitor types or waits |
| `thinking` | Halo ring spins / soft dots (the "muni-muni" beat) |
| `answering` | Brightens; source chips appear near Muni |
| `grounded-refuse` | Honest shrug; glow dims slightly |

Anti-patterns: scary robot, generic chatbot bubble-only avatar, emoji-only
mascot, purple neon creature, reusing Lens fox/wolf specimen art as the brand.

## Brand mark + favicon

Metaphor: **focus ring + warm spark** (Muni's face).

1. Hand-author SVG paths shared by BrandMark and favicon.
2. Verify at 16 / 32 / 64 px.
3. Wire metadata icons. Cache-bust (`?v=`) when swapping marks.

## Motion + scrollbars

Follow `capstone-signal-design` motion and scrollbar rules, swap to Muni tokens:

```css
--scroll-thumb: #c5cdd8;
--scroll-thumb-hover: #d97706;
```

Lenis on marketing. Framer Motion with `once: true` for chapters. Full
hover/focus on cards. Mascot state transitions: short springs, reduced-motion
safe.

## Copy rule

No em dashes (`—`) or en dashes (`–`). Prefer hyphen with spaces, commas, or
periods.

When explaining the name, prefer: `Muni comes from "muni-muni," Filipino for
thoughtful reflection.` Avoid lecturing; one warm sentence is enough.

## Implementation checklist (Muni)

- [ ] Tokens use Muni amber / Lens graphite base, not Signal teal, not Broadcast rose
- [ ] Outfit + Figtree + IBM Plex Mono
- [ ] BrandMark / favicon = focus ring + spark (Muni face)
- [ ] Interactive Muni mascot with idle, wave, listening, thinking, answering,
      grounded-refuse
- [ ] Landing chapter structure from Capstones harness
- [ ] Unique additions: companion hero, grounding strip, citation marquee,
      Grounding Guard chapter, chat + owner inbox
- [ ] Desk uses same palette as marketing
- [ ] `capstone-signal-design` harness items still completed (README, git,
      screenshots, SUBMISSION.md)

## Anti-patterns

- Shipping Muni UI that is just Lens with a chat box and no mascot personality
- Crowding the hero with eval metrics, cost charts, or job consoles
- Treating the Grounding Guard as a footnote instead of the product center
- Inventing answers when retrieval is weak (refuse, never guess)
- Committing `GEMINI_API_KEY` or other live secrets
- Naming the product Ember anywhere in UI, README, or docs
