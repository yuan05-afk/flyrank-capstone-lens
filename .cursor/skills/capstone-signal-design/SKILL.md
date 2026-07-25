---
name: capstone-signal-design
description: >-
  Full CheckMyDevice-style build harness for FlyRankAI Capstones: light teal
  Signal UI, Lenis smooth scroll, custom Signal scrollbars (vertical + horizontal),
  Framer Motion pitch landings, balanced L/R hero art, full landing hover/focus
  interactivity, product favicons, no em dashes, matching dashboards, pitch README
  with real screenshots, and the git/GitHub staged-commit publishing harness. Use
  when building, restyling, documenting, or shipping any FlyRankAI Capstones
  project, landing page, dashboard, README, or repo, or when the user asks for
  CheckMyDevice-style design, Lenis scrolling, custom scrollbars, screenshots for
  docs, or the Capstones template. Always apply for Capstone one-shot prompts.
---

# Capstone Signal Design (CheckMyDevice template)

This is the **shared build harness** for every project under
`FlyRankAI/Capstones`: visuals, motion, docs, and shipping. Source of truth for
feel: **CheckMyDevice** (`Documents/CheckMyDevice/artifacts/check-my-device`),
for docs: `Documents/CheckMyDevice/README.md`, for git conventions:
`FlyRankAI/Backend AI Engineering/*`.

A Capstone is not done when the code runs. It is done when the landing pitches,
the README proves, the screenshots exist, and the public repo is pushed with
staged commits.

Apply this skill **before** inventing a new look for a Capstone.
One-shot / greenfield Capstone prompts that include a landing page **must**
read and follow this file end to end.

**Product-specific visual skills** may override palette, typography, and brand
mark so each Capstone feels like its own product. Examples:
`capstone-broadcast-design` (Social Media Studio / Broadcast rose),
`capstone-lens-design` (Image Relevance / Lens amber). They do **not** replace
this harness: Lenis, motion, hero L/R rules, interactivity, scrollbars, README,
git, screenshots, and `SUBMISSION.md` still come from here.

## Design intent

Pitch-quality product sites that feel:

- Light, cool, presentable (not dark terminal, not purple AI glass, not cream/terracotta)
- Animated and intentional (Lenis + Framer Motion)
- Brand-first heroes with **visible, balanced left + right** hero art
- **Every landing block interactive** on hover/focus (CheckMyDevice privacy/feature pattern)
- Same language on marketing **and** authenticated dashboards

## Copy rule: no em dashes

**Never use em dashes (`—`) or en dashes (`–`) in UI copy, metadata titles, README marketing text, or skill/rule docs.**

Use instead:

- Hyphen with spaces: `Embed once - capture safely`
- Comma or period for pauses
- Colon for labels: `Status: accepted`
- Pipe only in rare technical titles if needed: `Checkpoint | Widgets`

Scan and strip em/en dashes before shipping.

## Palette (Signal teal)

| Token | Hex | Use |
|-------|-----|-----|
| Canvas | `#F4F7FB` or HSL `220 17% 98%` | Page background |
| Surface | `#FFFFFF` | Cards / panels |
| Ink | `#0C1222` / near `#14171C` | Text |
| Muted | `#5B6578` | Secondary copy |
| Line | `#E2E8F2` | Borders |
| Primary / Signal | `#0F766E` to `#0F8B8D` | Brand + CTAs |
| Signal bright | `#14B8A6` / `#16A9AB` | Hover / pulse |
| Fog | `#E8F5F3` | Soft teal chips |
| OK / Warn / Danger | `#15803D` / `#B45309` / `#DC2626` | Status only |

Banned: purple-indigo gradients, brass/typewriter customs desk, warm cream + terracotta, Inter/Roboto/Geist as the display voice.

## Typography

- **Display / brand:** Space Grotesk *or* Sora (pick one per product; stay consistent)
- **Body:** Figtree (preferred for new Capstones)
- **Mono micro-labels / code:** IBM Plex Mono for section chips, IDs, typewriter pitch lines - never as the whole UI voice

## Brand mark + favicon (required process)

Every Capstone product needs a **purpose-built mark** that reads the product name/job at 16px - not a generic check, star, or nested box.

### Process

1. **Inspect the CheckMyDevice favicon first.** Its reusable grammar is a dark
   instrument plate, a subtle inset rim, one bold product-specific signal, and
   one bright live-status light. Reuse that discipline, not its waveform.
2. **Name one metaphor** from the product (e.g. Checkpoint = a lead signal
   crossing two scanner posts; CheckMyDevice = a diagnostic pulse). Do not
   stack two generic symbols such as code brackets plus a check.
3. **Draw an SVG mark** (prefer hand-authored SVG over a vague AI icon). Use
   one dominant stroke system, high contrast, and geometry that survives at
   16px. A dark instrument plate is allowed even when the app canvas is light.
4. **Render and inspect at 16px, 32px, and 64px.** If inner symbols collide,
   disappear, or read as decoration at 16px, simplify before shipping.
5. Ship as:
   - `components/BrandMark.tsx` (inline SVG used in nav/footer/dashboard)
   - `public/favicon.svg` (same paths, for the tab icon)
6. Wire in `app/layout.tsx` / metadata:
   - `icons.icon` -> `/favicon.svg`
   - `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`
7. Avoid relying on stale PNG favicons that fight the SVG. If you ship PNG, regenerate it from the final SVG.
8. Hard-refresh / clear tab cache when swapping marks.

### Favicon anti-patterns

- Generic lone checkmark with no product metaphor
- Overlapping metaphors (for example brackets + check) that become visual noise
- Nested box-inside-box / checkbox-in-app-icon clutter
- Text-heavy marks that blur at 16px
- Mismatched nav logo vs favicon

## Required landing structure (pitch style)

Mirror CheckMyDevice chaptered landing:

1. **Sticky topbar** - brand, primary CTA, backdrop blur
2. **Full-viewport hero** (see Hero imagery rules below)
   - Balanced **left + right** hero art, center text safe zone
   - Soft wash overlay so text stays crisp
   - Animated headline (blur/fade lines)
   - Live typewriter / diagnostic-style support copy (optional but preferred)
   - Dual CTAs (primary filled + secondary outlined) with hover/focus
   - Scrolling **signal trace** SVG at hero bottom
3. **Scroll chapters** with section intro badges (eyebrow + icon + title + short description)
4. **Feature / module / step grids** - numbered cards, hover lift, icon color shift, staggered enter
5. **Trust / guarantees strip** - itemized promises with the same hover/focus treatment as CheckMyDevice privacy items
6. **Closing CTA panel** + footer with brand scroll-to-top

## Hero imagery (balanced L/R, center clear)

Every Capstone landing must include a dedicated hero asset under `public/`
(e.g. `public/<product>-hero-light.png`).

### Composition rules (non-negotiable)

1. **Left and right both carry art.** Never ship a left-only or right-only
   silhouette. If one image is asymmetric, use **dual side panels** that crop
   `object-position: left` and `object-position: right` so both flanks read.
2. **Center stays readable.** Keep ~35-45% of the horizontal middle as mist /
   wash / content safe zone. Headline, typewriter, and CTAs must never sit
   behind dense illustration.
3. **Visible, not ghosted.** Side art opacity should land around **0.75-0.95**.
   Do not bury the image under a heavy full-bleed wash (avoid washing the
   whole hero to ~0.4 opacity). Wash the **center** harder than the sides.
4. **CheckMyDevice mask pattern:** dual radial masks at ~12% and ~88%
   horizontally (bottom-weighted ellipses), plus an optional explicit
   `.hero-sides` / `.cp-hero-sides` two-column overlay for stronger L/R weight.
5. **Asset brief when generating:** product scene on **both** sides, empty soft
   mist in the center band, Capstone palette, no baked-in text/logos/people.

### Anti-patterns

- Single left-heavy PNG with empty right half
- Opacity so low the art disappears on light canvas
- Art bleeding through the headline (missing center wash / content `::before`)
- Inset hero cards or side-panel screenshots instead of full-bleed masked art

## Landing interactivity (non-negotiable)

Landing pages are pitch surfaces: **static-looking cards that do nothing on
hover feel unfinished.** Match CheckMyDevice (`privacy-item`, feature cards,
trust-flow steps).

### Required on every interactive block

Apply to: feature cards, step cards, trust/guarantee cells, CTA buttons,
nav links, brand scroll control, and any grid tile the user can rest on.

1. **Hover + keyboard focus** (`tabIndex={0}` where the block is not a link/button)
2. **Visual feedback within ~200ms:**
   - Background wash (`primary / ~0.045`) or border tint (`border-signal/40`)
   - Soft shadow lift and/or `translateY(-2px to -4px)`
   - Icon color to signal + slight `-translate-y-0.5`
   - Title color to signal
3. **`outline-none` + visible `focus-visible` ring** (never remove focus without a replacement)
4. Respect `prefers-reduced-motion` (skip lifts/transforms when reduced)

### Trust / guarantees specifically

Mirror CheckMyDevice privacy grid:

- `whileHover` / `whileFocus` teal wash
- Icon + value text shift to primary on `group-hover` / `group-focus-visible`
- Do **not** ship a flat 2x2 / 4-up guarantee strip with zero hover state

### Anti-patterns

- Decorative-only cards with enter animation but no hover
- Hover-only feedback with no focus-visible path
- Interactivity only on primary CTAs while the rest of the page is dead

## Motion stack (non-negotiable)

### Lenis smooth scrolling

Install `lenis` and wire like CheckMyDevice:

```ts
const lenis = new Lenis({
  autoRaf: true,
  duration: 1.6,
  smoothWheel: true,
  wheelMultiplier: 0.85,
  touchMultiplier: 1.2,
});
```

- Disable when `prefers-reduced-motion`
- Brand click -> `lenis.scrollTo(0, { duration: 1.2 })`

### Framer Motion

- Hero lines: blur + y reveal
- Sections: `whileInView` with **`once: true`** (do not leave chapters stuck at partial opacity via scroll-linked transforms)
- Cards: stagger children + hover `translateY(-4px)` / color shifts
- Dashboard: staggered stats, count-up numbers, row cascade

### Continuous accents

- Signal status LED pulse
- Hero orbs (soft teal/sky blur)
- Scrolling signal trace
- Geo pings with SVG `<animate>` (never CSS `::after` on SVG; never nested SVG `<title>` - use `aria-label`)

## Custom scrollbars (Signal system)

Default OS scrollbars break the Signal look. Every Capstone must ship **custom
scrollbars** that use the same tokens as the rest of the UI: soft track, teal-tint
thumb on hover, thin geometry. Cover **vertical page scroll**, **horizontal
overflow** (tables, code, carousels), and **nested panel scroll**.

### Design rules

| Part | Token / value | Notes |
|------|---------------|-------|
| Width / height | `10px` (page), `8px` (nested panels) | Thin, not chunky |
| Track | transparent or `canvas` / `fog` at low alpha | Never a hard grey gutter |
| Thumb | `#C5D0DE` resting, `#0F766E` / signal on hover/active | Matches line -> signal |
| Thumb radius | `999px` | Pill, not square blocks |
| Corner | same as track | Avoid mismatched OS corner tiles |
| Firefox | `scrollbar-width: thin` + `scrollbar-color: thumb track` | Required, not optional |

### Required CSS pattern

Put this in the product `globals.css` / root stylesheet. Document scrollbars on
`html`, and reuse a utility for nested overflow regions.

```css
:root {
  --scroll-size: 10px;
  --scroll-size-nested: 8px;
  --scroll-track: transparent;
  --scroll-thumb: #c5d0de;
  --scroll-thumb-hover: #0f766e;
}

/* Firefox */
html {
  scrollbar-width: thin;
  scrollbar-color: var(--scroll-thumb) var(--scroll-track);
}

/* Chromium / Safari / Edge */
html::-webkit-scrollbar {
  width: var(--scroll-size);
  height: var(--scroll-size); /* horizontal too */
}
html::-webkit-scrollbar-track {
  background: var(--scroll-track);
}
html::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
html::-webkit-scrollbar-thumb:hover,
html::-webkit-scrollbar-thumb:active {
  background: var(--scroll-thumb-hover);
  border: 2px solid transparent;
  background-clip: padding-box;
}
html::-webkit-scrollbar-corner {
  background: transparent;
}

/* Nested panels, tables, code blocks, side drawers */
.signal-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--scroll-thumb) var(--scroll-track);
  overflow: auto;
}
.signal-scroll::-webkit-scrollbar {
  width: var(--scroll-size-nested);
  height: var(--scroll-size-nested);
}
.signal-scroll::-webkit-scrollbar-track {
  background: var(--scroll-track);
}
.signal-scroll::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.signal-scroll::-webkit-scrollbar-thumb:hover,
.signal-scroll::-webkit-scrollbar-thumb:active {
  background: var(--scroll-thumb-hover);
  background-clip: padding-box;
}
.signal-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
```

### Where to apply

1. **Page / document** - style `html` (vertical marketing + dashboard scroll).
2. **Horizontal tables** - wrap `overflow-x-auto` regions with `signal-scroll`
   so the bottom scrollbar matches the brand when the ledger is wide.
3. **Nested panels** - any `max-h-* overflow-y-auto` list, drawer, code snippet,
   or embed probe panel uses `signal-scroll`.
4. **Both axes** - always set `width` **and** `height` on `::-webkit-scrollbar`
   so horizontal and vertical share one look.

### Lenis note

Lenis smooth-scrolls the page; it does **not** remove the native scrollbar.
Custom scrollbar CSS still applies on top. Never `scrollbar-width: none` or
`display: none` on page scrollbars just to "clean" the UI - that breaks discoverability
and keyboard/trackpad affordance. Hide scrollbars only on decorative overflow
containers that are not the primary reading surface (and still keep keyboard access).

### Anti-patterns

- Leaving default Windows/macOS chrome scrollbars on an otherwise Signal UI
- Fat 16px+ thumbs or neon glowing thumbs
- Styling only `::-webkit-scrollbar` and skipping Firefox `scrollbar-color`
- Styling vertical only and forgetting horizontal table scroll
- `overflow: hidden` on `body` that traps focus or clips content without an
  alternate scroll container

## Dashboard alignment

Dashboards must feel like the same product as the landing:

- Same canvas/mesh/orbs, section badges, mono chips, teal CTAs
- Animated stats, hover-lift cards, polished tables
- Sticky blurred header with live status pill

## README harness (CheckMyDevice pitch README)

The README is the second landing page. Reviewers open the repo before they run
anything, so it must pitch, prove, and stay honest. Reference:
`Documents/CheckMyDevice/README.md`.

### Required order

1. **`# Product`** - the name alone, no tagline glued on
2. **`### Three-beat promise`** as an H3 directly under it
   (CheckMyDevice: `Nine hardware checks. One browser tab. Nothing uploaded.`).
   Three short clauses: what it does, where it runs, what it refuses to do.
3. **Two context paragraphs.** First: the real-world problem and who feels it.
   Second: how the product answers it, naming the actual mechanism. No
   "revolutionary", no feature list yet.
4. **Bold nav line:** `**Deployed domain:** [url](url) | [Anchor](#anchor) | [Anchor](#anchor)`.
   When there is no deployment, use `**Run locally:**` and link to Quick start
   plus the two most convincing sections.
5. **Hero screenshot** immediately after, with descriptive alt text.
6. **`## Why <Product>`** - 6 to 8 bullets, each `**Bold claim:**` then one
   sentence of mechanism. Claims must be checkable, not adjectives.
7. **Capability section with its own screenshot + table.** CheckMyDevice uses
   `ID | Test | What it verifies`. Pick the axis that matters for the product
   (`# | Check | Behavior`, `Route | Auth | Notes`).
8. **Model / guarantees table** - the thing reviewers doubt, itemized
   (CheckMyDevice: data or capability -> handling).
9. **Prove it yourself** - one runnable command or DevTools observation per
   guarantee. This is the section that separates a real build from a demo.
10. **Run locally / Quick start** - must start with clone. Required shape:

    - `## Quick start`
    - `### Prerequisites` - Node version, package manager, Git
    - `### Clone, install, and run` - open with the sentence
      `Clone the repository first, then install and start the app:` then a
      single bash block in this fixed order:

      `git clone https://github.com/<user>/<repo>.git`
      `cd <repo>`
      install command
      any migrate / db push / seed steps
      start command (`pnpm dev`, `uvicorn`, etc.)

    - Tell the reader the default port and how to open it
    - Document port overrides for both POSIX (`PORT=...`) and PowerShell
      (`$env:PORT = '...'`) when the stack respects `PORT`
    - Second terminals (fixtures, workers, consumers) come **after** the main
      start, never before clone

    Order is fixed: **clone -> cd -> install -> (migrate/seed) -> start**.
    Never jump straight to `pnpm install` as if the reviewer already has the
    repo on disk. Use the real public GitHub URL from `gh repo view` / remote.
11. **Tests / quality checks** - the exact commands.
12. **Architecture** - layer rules plus an annotated directory tree.
13. **Limitations** - honest constraints (single instance, mocks, no hosted
    deploy). Never hide these; they read as engineering maturity.
14. **Technology** - flat bullet list, no versions you have not verified.
15. **Definition of done** checklist against the brief.
16. `<sub>Built by <name> ...</sub>` credit line.

### README rules

- Tables over paragraphs for anything enumerable
- Fenced code blocks for every command, copy-paste runnable, with expected output
  as a comment (`# 404`, `# 201`)
- Claim -> proof pairing: any guarantee stated in prose has a command, test, or
  screenshot behind it
- Quick start always begins with `git clone` of the public repo, never install-only
- No em dashes, no emoji headers, no "🚀 Features"
- Never claim green tests or a working demo you did not just run

## Screenshots for docs

Screenshots are required, not optional. Store under `docs/images/`.

### Capture method (no heavy tooling)

Use `puppeteer-core` against the **already installed Chrome** so nothing large is
downloaded and nothing is added to the project dependencies:

```js
// run from a temp dir: npm i puppeteer-core
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--hide-scrollbars"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
```

- `deviceScaleFactor: 2` so images stay crisp on GitHub
- Wait 2.5 to 4s after `networkidle2` so Framer Motion enters have settled
- For authenticated pages, log in with a same-origin `fetch` inside
  `page.evaluate` to set the session cookie, then navigate
- Scroll to a section by measuring its heading and subtracting ~170px so the
  section title stays in frame
- Seed realistic demo data first; empty states make a real product look broken

### Shot list per Capstone

- Landing hero
- The core proof (product doing its actual job, ideally mid-flow)
- Result / success state
- Guarantees or feature section
- Authenticated dashboard
- Data table / ledger view

Alt text describes what the reader sees, e.g.
`![Checkpoint widget rendered on a foreign origin customer site](docs/images/checkpoint-embed.png)`.

## Git and GitHub harness (do this without being asked)

Every FlyRank project ships as a **public GitHub repo with staged history**.
Reference conventions: `FlyRankAI/Backend AI Engineering/*` repos
(`Stage 0: setup server and supabase client`, `Stage 1-2: ...`).

### Steps

1. `.gitignore` first: `node_modules`, build output (`.next`, `dist`), `.env`
   and `.env.*.local`, local databases (`prisma/*.db`), coverage, OS/IDE files.
   Ship a committed `.env.example`.
2. `git init` and `git branch -M main`.
3. **Commit per phase / stage, not one giant commit.** Stage only that phase's
   paths, and name the commit after the brief's phase:
   - `Phase 0: scaffold, Prisma schema, architecture and design contracts, cursor rules`
   - `Phase 3: hardened public submission endpoint (CORS allowlist, Zod, size limit, rate limit, honeytrap)`
   - `Phase 8: pitch README with screenshots, mermaid diagram, reusable hardening skills`
   Backend track uses `Stage N: ...`. Match whatever the brief calls them.
4. Run the test suite and confirm green **before** publishing.
5. Publish:

```bash
gh repo create <repo-name> --public --source . --remote origin \
  --description "<one line: track, product, and the hard part>" --push
```

6. Repo naming: `flyrank-<track-or-week>-<product>`
   (`flyrank-a4-auth`, `flyrank-pdf-report-generator`, `flyrank-capstone-checkpoint`).
7. Later fixes get their own honest commits (`Docs: ...`, `Fix: ...`), never a
   rewritten history.
8. Verify the pushed README renders: images must use repo-relative paths
   (`docs/images/x.png`), not absolute local paths.

### Submission block + `SUBMISSION.md` (required)

Finish every Capstone by creating a project-root file named **`SUBMISSION.md`**.
This is the copy-paste source for the FlyRank **Add submission** portal form.
Do not stop at a chat message only - the file must live in the repo.

#### Portal field rules

| Field | Rule |
|-------|------|
| **Deliverable links** | Required for credit unless a file is uploaded. One public `http(s)` URL per line. Prefer the **public GitHub repo URL**. |
| **Notes** | Optional context for reviewers. Notes alone do **not** count as progress. |
| **Files** | Required for credit unless a valid link is added. Leave empty when the public repo URL is enough. |

#### Required `SUBMISSION.md` template

Create this at the Capstone project root (next to `README.md`):

```md
# Capstone submission

Copy these fields into the FlyRank **Add submission** form.

## Deliverable links

https://github.com/<user>/<repo>

## Notes

<lane / stack>. Run: <exact install + start commands>. Demo: <key fact, e.g. sign in with tenant_a_key_demo_001>. Cross-origin fixture: <port / command if any>.

## Files

Leave empty - the public repo link covers completion credit.

## Checklist before paste

- [ ] Repo is public
- [ ] README renders with screenshots
- [ ] Tests pass / demo runs from README
- [ ] `SUBMISSION.md` matches the live remote URL
```

#### Agent finish steps

1. Write / update `SUBMISSION.md` with the real public URL and a one-line Notes value.
2. Commit and push it with the rest of the docs (`Docs: add FlyRank submission copy block`).
3. Also print the same Deliverable links + Notes in chat so the user can paste immediately.
4. See the `flyrank-assignment` skill for the full portal form rules.

### Git anti-patterns

- Building the whole project and never running `git init`
- A single `Initial commit` containing everything
- Committing `.env`, `dev.db`, `node_modules`, or `.next`
- Screenshots referenced by local Windows paths so they 404 on GitHub
- Publishing before the tests pass

## Implementation checklist for new Capstones

- [ ] Tokens + fonts match this skill
- [ ] No em dashes (`—` / `–`) in UI or docs
- [ ] `lenis` installed and active on marketing pages
- [ ] Custom Signal scrollbars on `html` plus `.signal-scroll` for nested /
      horizontal overflow (Firefox `scrollbar-color` included)
- [ ] Framer Motion hero + chapter enters (`once: true`)
- [ ] Hero image with **visible left + right** art and **center text safe zone**
- [ ] Hero wash protects center without ghosting the side art
- [ ] Feature, step, and trust cards all have hover + focus interactivity
- [ ] Section intro badges
- [ ] Dashboard visual parity with landing
- [ ] Favicon SVG + BrandMark share one product metaphor and are wired in metadata
- [ ] Reduced-motion respected
- [ ] Project `.cursor/rules/design.mdc` points at this Capstones template
- [ ] `docs/images/` holds real screenshots captured from the running app
- [ ] README follows the pitch harness: three-beat promise, why bullets, proof
      section, limitations, definition of done
- [ ] README Quick start starts with `git clone` of the public repo, then
      install / migrate / seed / start (never install-only)
- [ ] Every README claim has a command, test, or screenshot behind it
- [ ] Git repo initialized with phase-named commits, tests green, public repo
      pushed with `gh repo create`
- [ ] Submission block handed to the user (repo URL, empty files, short note)
- [ ] `SUBMISSION.md` created at project root with Deliverable links + Notes,
      committed, and pushed

## Reference paths

- CheckMyDevice landing: `Documents/CheckMyDevice/artifacts/check-my-device/src/pages/LandingPage.tsx`
- CheckMyDevice motion CSS: `.../src/index.css` (hero-backdrop, signal-trace, trust-flow, privacy-item)
- Working Capstone example: `Capstones/Embeddable Widget & Lead-Capture Platform`

## Anti-patterns

- Shipping a flat unanimated admin shell as the "product"
- Scroll chapters that stay faded (bad scroll-linked opacity)
- Nested SVG `<title>` causing Next hydration errors
- Purple glass / dark typewriter / cream paper AI templates
- Different visual systems for landing vs dashboard
- Em dashes in marketing or UI copy
- Generic favicon that does not encode the product name/job
- Left-only hero art or near-invisible hero imagery
- Landing cards with no hover/focus feedback
- Default OS scrollbars on an otherwise Signal UI, or scrollbars styled for
  vertical only while horizontal table overflow stays native
- Hiding page scrollbars entirely (`scrollbar-width: none`) as a design shortcut
