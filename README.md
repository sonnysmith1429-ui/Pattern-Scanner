# FPL Analyst AI

Upload a screenshot of your Fantasy Premier League squad and get an instant, AI-powered analysis: a team rating out of 100, a category breakdown, identified weaknesses, and data-driven transfer recommendations — built on official FPL data where available, with a clearly-labelled demo dataset as a fallback.

**Not affiliated with, endorsed by, or connected to the Premier League or Fantasy Premier League.**

## What it does

1. Upload a screenshot of your squad (or import by FPL manager ID, or try the demo squad).
2. In-browser OCR reads player names off the screenshot and fuzzy-matches them against the live FPL player database.
3. You confirm/correct the detected squad (captain, vice-captain, bench).
4. A statistics engine scores every player and the squad as a whole across six weighted categories.
5. A recommendation engine ranks realistic, budget-aware replacements for your weakest picks.
6. An AI layer turns the numbers into plain-English analysis — grounded strictly in the computed data, never inventing stats.
7. You get an interactive dashboard: score breakdown, weaknesses, captaincy/bench analysis, squad pitch view, transfers, player comparison, and fixtures.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, lucide-react
- **OCR:** [tesseract.js](https://github.com/naptha/tesseract.js) (runs entirely client-side, loaded lazily)
- **Backend:** a small Node HTTP layer (`server/`) shared between a Vite dev-server middleware plugin and `/api` serverless functions, so the same code path runs in `npm run dev` and in production (e.g. Vercel)
- **AI:** a provider abstraction (`src/lib/ai/`) — Anthropic, OpenAI, or a deterministic built-in "mock" analyst used automatically when no API key is configured

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. Click **Try Demo** to see the full dashboard immediately without uploading anything — no API keys required for this.

To type-check and build for production:

```bash
npm run build
```

## Environment variables

See [`.env.example`](./.env.example). Copy it to `.env.local` and fill in what you need:

| Variable | Required? | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Enables Anthropic-generated AI analysis. Falls back to the built-in mock analyst if unset. |
| `OPENAI_API_KEY` | No | Enables OpenAI-generated AI analysis (used if Anthropic isn't configured). |
| `AI_MODEL` / `OPENAI_MODEL` | No | Override the default model for each provider. |

All of these are read **server-side only** (never `VITE_`-prefixed), so they are never bundled into the browser. The frontend only ever talks to your own `/api/analyse` and `/api/fpl/*` routes.

## How the FPL data layer works

```
Official FPL API (fantasy.premierleague.com)
  → /api/fpl/* (server-side proxy — avoids the browser CORS block, never exposes secrets)
  → normalise.ts (raw snake_case JSON → typed camelCase domain objects)
  → FplDataset (players, teams, fixtures, gameweeks)
  → analytics engine → recommendation engine → AI layer → UI
```

`src/lib/fpl/provider.ts` is the single `FPLDataProvider` entry point (`getDataset()`). It caches in memory + `localStorage` for 5 minutes, and if the live API is unreachable it falls back — in order — to the last cached data, then to a deterministic, procedurally-generated **demo dataset** (`src/lib/fpl/mockData.ts`). Every screen shows a `DEMO DATA` / `Cached` / `Live` badge so it's never ambiguous which one you're looking at. If the upstream API's shape ever changes, `rawTypes.ts` and `normalise.ts` are the only files that need updating.

You can also import a squad directly by **FPL manager ID** (via `/api/fpl/entry/{id}/event/{gw}/picks`), which is exact — no OCR guessing involved.

## How image recognition works

Screenshots are processed **entirely in your browser** — they are never uploaded to a server.

```
Image → tesseract.js OCR (lazy-loaded) → candidate text tokens
      → fuzzy name matching (Levenshtein) against the live player database
      → confidence-scored matches
      → confirmation screen (correct/replace any low-confidence picks)
```

Row position on the screenshot is used to distinguish starting XI from bench, and any `(C)` / `(V)` badge text found is matched to the nearest player to infer captain/vice-captain — all best-effort, which is exactly why the confirmation step exists.

## How AI integration works

```
computed TeamAnalysis (scores, weaknesses, recommendations)
  → buildAiRequest() — a structured JSON payload, nothing free-text
  → POST /api/analyse (server-side)
  → AnthropicProvider | OpenAIProvider | MockAIProvider
  → validated, structured AIAnalysisResponse
  → AI Analysis card on the dashboard
```

The system prompt (`src/lib/ai/prompt.ts`) explicitly instructs the model to only state what's supported by the supplied numbers and to say so when data is unavailable. Responses are validated (`src/lib/ai/validate.ts`) before rendering; anything malformed silently falls back to the mock analyst rather than breaking the page.

## The scoring algorithm

**Team Rating (0–100)** is a weighted sum of six category scores (weights live in `src/lib/analytics/weights.ts` — change a number there to retune the whole model):

| Category | Weight | What it measures |
| --- | --- | --- |
| Player Quality | 25% | Position-weighted attacking/defensive output |
| Form | 20% | Recent points-per-game vs. the same position |
| Fixtures | 20% | Blended next-3/5/8 fixture difficulty |
| Value | 15% | Points per £m vs. similarly-priced players |
| Squad Balance | 10% | Club concentration, positional spend, premium count, bench spend |
| Availability | 10% | Injury/suspension status + minutes consistency |

Every player is scored with **position-specific** metrics (goalkeepers and defenders are judged mostly on defensive output; midfielders and forwards mostly on attacking output), and rate stats are only compared against players who clear a minimum-minutes threshold, so a couple of good sub appearances can't inflate a rating.

**Projected points** use a transparent, disclosed model:

```
Expected Points = Base Performance × Form Modifier × Fixture Modifier × Minutes Probability × Availability Modifier
```

This is a statistical estimate, not a prediction — every "Projected points" label in the UI is paired with that disclaimer.

**Transfer recommendations** rank same-position, price-eligible candidates by a **Replacement Score** (`src/lib/recommendations/replacementScore.ts`): projected points + fixture score + form + value + minutes security − rotation risk. The "Fix My Team" optimiser greedily applies the highest-gain affordable swaps up to your free transfer count.

## Demo mode

Click **Try Demo** on the landing page (or the upload screen) at any time. This loads a deterministic, procedurally-generated 300-player dataset — real player and club names (so screenshot OCR has something genuine to match against), but every statistic (price, points, form, fixtures, injuries) is synthetic — plus a pre-built squad with real, intentional weaknesses to analyse. Labelled `DEMO DATA` everywhere it appears, never presented as live stats; any injury/news text is itself labelled as simulated.

## Deploying

Any platform that can run a Node build and serve `/api/*.ts` as serverless functions works (e.g. Vercel). `api/fpl/[...path].ts` and `api/analyse.ts` mirror the dev-time behaviour in `server/devMiddleware.ts` exactly — both call the same shared `server/fplProxy.ts` and `server/ai/` code, so there's nothing to keep in sync by hand.

```bash
npm run build   # outputs static assets to dist/
```

## Known limitations

- OCR accuracy depends entirely on screenshot quality/cropping; the confirmation screen exists specifically to catch and correct misreads.
- Captain/vice-captain OCR detection relies on finding literal "C"/"V" badge text near a player, which not every FPL app screenshot renders as real text — you can always set them manually on the confirmation screen.
- The "Fix My Team" optimiser is a greedy heuristic (best affordable swap per weak starter, taken in priority order), not an exhaustive search of every possible squad combination.
- Transfer affordability assumes sale price ≈ purchase price (FPL's real sell-price rules — which factor in profit taken on price rises — aren't modelled). Entering your actual bank balance improves accuracy but is always an estimate.
- The live FPL API has no official CORS support and no publicly documented SLA; if it's unreachable, the app transparently falls back to cached or demo data rather than breaking.

## Disclaimer

FPL Analyst AI provides statistical estimates and recommendations for informational purposes. Player performance and projected points are not guaranteed. FPL Analyst AI is an independent project and is not affiliated with, endorsed by, or connected to the Premier League or Fantasy Premier League.
