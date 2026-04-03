# JobRadar.ma

ADHD-friendly Moroccan jobs aggregator built with Next.js 15 App Router.  
Core idea: **discover jobs fast, keep metadata structured, redirect users to original source**.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui-style components + lucide-react
- No database
  - Data files in `/data/*.json`
  - User preferences in `localStorage`
- Ingestion: Node 20 + native `fetch` + `cheerio`
- Tests: Vitest

## Quick start

```bash
npm i
npm run ingest
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev`: run Next.js dev server
- `npm run build`: production build
- `npm run start`: production server
- `npm run ingest`: fetch/parse sources and write `/data/jobs.latest.json`
- `npm run ingest:daily`: write `/data/YYYY-MM-DD.json` and update latest + index
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Data model

Primary model: `src/lib/types.ts` (`Job` type).

Stored fields are limited to safe metadata:
- `title`, `company`, `city`, `contract`, `experience`, `salary`, `postedAt`
- `source`, `sourceUrl`, `tags`
- generated `ourSnippet` (deterministic; not copied description)
- `trust` score/badge
- dedupe fields (`id`, `dedupeKey`, `createdAt`)

## Ingestion pipeline

Entry: `scripts/ingest.ts`

Source adapters:
- `src/ingest/sources/anapec.ts`
- `src/ingest/sources/emploi-public.ts`
- `src/ingest/sources/emploi-ma.ts`
- `src/ingest/sources/rekrute.ts`
- `src/ingest/sources/emploi-maroc.ts` (Emplois.co RSS)
- `src/ingest/sources/offres-emploi.ts` (Offres-emploi.ma RSS)
- `src/ingest/sources/novojob.ts` (Novojob RSS, filtered Morocco)

Pipeline behavior:
1. Fetch source pages.
2. Parse cards with `cheerio`.
3. Normalize city/contract/experience/category.
4. Generate `ourSnippet`.
5. Compute trust score (Official / Verified / LowInfo).
6. Dedupe by normalized `title + company + city` within 14 days.
7. Write:
   - `data/jobs.latest.json`
   - `data/index.latest.json`
   - `data/YYYY-MM-DD.json` (daily mode)

Failure behavior:
- If one source fails, warning is logged and previous data for that source is kept.
- If all sources fail, previous `jobs.latest.json` is preserved.

URL safety:
- entity-encoded paths (e.g. `&#45;`) are decoded during ingestion.
- tracking params/fragments are stripped for cleaner stable links.

## Seed data fallback

- `data/jobs.seed.json` is included.
- App reads `jobs.latest.json`; if missing/empty, it falls back to seed automatically.

## Product features implemented

- Home:
  - quick search entry
  - trending intents
  - new today count
  - concours to watch
  - city chips
- Search:
  - filters (keyword, city, category, experience, contract, remote, source)
  - sort (newest, easiest, relevant)
  - shareable URL query
  - save intent to localStorage
- Job details:
  - structured metadata
  - snippet
  - trust badge/score
  - source card + `View & Apply`
- Saved:
  - saved intents
  - new since last visit
- Tracker:
  - `Applied / Maybe / Ignore` per job (localStorage)
- Language:
  - French default + Darija (Arabic script) toggle
  - RTL enabled in Arabic mode

## Scheduling in production

### Option A: GitHub Actions (recommended)

Workflow file: `.github/workflows/ingest-daily.yml`

It runs daily, executes `npm run ingest:daily`, and commits changes in `/data`.

### Option B: Vercel Cron

`vercel.json` schedules `/api/cron/dispatch-ingest`.

This endpoint triggers the GitHub workflow dispatch API (set env vars from `.env.example`):
- `CRON_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- optional: `GITHUB_WORKFLOW_ID`, `GITHUB_WORKFLOW_REF`

This gives you Vercel-triggered scheduling while keeping durable data updates via GitHub commits.

## SEO

- metadata + OG in `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`

## Legal note

JobRadar.ma does not copy full source descriptions.  
Users are redirected to the original source to view full details and apply.
