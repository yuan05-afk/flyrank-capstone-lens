# Deploy Lens on Vercel (manual)

This guide assumes you deploy yourself from [github.com/yuan05-afk/flyrank-capstone-lens](https://github.com/yuan05-afk/flyrank-capstone-lens).

## 1. Neon database

1. Create a project in [Neon](https://neon.tech).
2. Create a database named **lens** (or use the default and note the name).
3. Copy the **pooled** connection string (`?sslmode=require`). Use it as `DATABASE_URL`.

## 2. Vercel project

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. Framework preset: **Next.js**. Package manager: **pnpm** (matches `vercel.json`).
3. Open **Settings → Environment Variables**.
4. Paste the contents of `env.vercel.import` into the bulk import UI, then fill in:
   - `DATABASE_URL`: Neon pooled URL
   - `DEMO_API_KEY`: long random string for production sign-in
   - Leave `VISION_PROVIDER` and `EMBEDDING_PROVIDER` as **seed** for a $0 deterministic demo
   - Leave `OPENAI_API_KEY` empty unless you enable live providers locally or in scripts

Apply variables to **Production** (and Preview if you want).

## 3. Deploy

Deploy from the Vercel dashboard or push to the connected branch. The build runs:

`pnpm prisma generate && pnpm next build`

## 4. Schema and seed (after first deploy)

From your machine (with repo cloned and dependencies installed), point at the **same** Neon URL:

```bash
DATABASE_URL="postgresql://..." pnpm db:push
DATABASE_URL="postgresql://..." pnpm db:seed
```

This creates tables and loads fixture posts/images metadata. Fixture SVGs under `public/` ship with the app and work read-only on Vercel.

## 5. Classify and embed against production (optional but needed for full desk)

Seed providers are recommended for production demo (no API spend). Run against Neon:

```bash
DATABASE_URL="postgresql://..." pnpm corpus:classify
DATABASE_URL="postgresql://..." pnpm corpus:embed
```

These map to `scripts/classify-corpus.ts` and `scripts/embed-corpus.ts`. They enqueue and process jobs; the Vercel cron hits `GET /api/worker/tick` every 5 minutes, or you can drain from the review desk after sign-in (POST with session cookie).

Manual one-shot worker tick (Bearer uses your production `DEMO_API_KEY`):

```bash
curl -s "https://YOUR_DOMAIN.vercel.app/api/worker/tick" \
  -H "Authorization: Bearer YOUR_DEMO_API_KEY"
```

## 6. Sign in

Open the deployed URL and sign in with the `DEMO_API_KEY` value you set in Vercel.

## Cron

`vercel.json` schedules `GET /api/worker/tick` every 5 minutes. Vercel sends the `x-vercel-cron: 1` header; the route also accepts `Authorization: Bearer <DEMO_API_KEY>` for manual ticks.

## Limitations on Vercel

- **Database**: Postgres on Neon (not SQLite). Job leases and claiming are suitable for this demo topology.
- **Uploads**: New image uploads that write to disk are not durable on serverless. The bundled fixture library under `public/` is fine. BYO uploads need object storage (S3, R2, etc.) in a later iteration.
- **Long drains**: Heavy `drain=1` runs belong in local scripts (`pnpm worker:tick`) or short cron ticks, not long serverless requests.

## Local development with the same stack

Copy `.env.example` to `.env`, set `DATABASE_URL` to a Neon branch or local Postgres, then:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm corpus:classify
pnpm corpus:embed
pnpm dev
```
