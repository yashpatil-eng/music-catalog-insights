# Music Catalog Insights Platform

A full-stack app that lets a user search the iTunes catalog, save albums to a
personal library, explore analytics on that library, and get AI-generated
insights about their taste.

Built for the LedgersCFO Software Development Intern take-home assignment.

- **Backend:** Java 17 / Spring Boot 3, PostgreSQL, Spring Data JPA, Spring Security (JWT)
- **Frontend:** React 18 + Vite, TypeScript, React Router, Tailwind CSS, Recharts
- **Third-party API:** [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) (no key required)

---

## 1. Entity choice: Albums

I chose **Albums** as the focus entity (`entity=album` on the iTunes API) because:
- Albums have the richest, most stable metadata for analytics (genre, release date,
  track count) compared to individual songs, which are noisier and often duplicated
  across singles/compilations.
- Album-level data supports more meaningful charts — release-year trends and
  track-count distributions are more interesting at album granularity than song
  granularity.
- Artists alone don't have enough per-item metadata (no release date, no track
  count) to drive 5 distinct chart types.

The code is written so `type` can be switched to `song` or `artist` per search
query, but the library schema and analytics logic assume album-shaped data.

## 2. Architecture

```
┌─────────────┐        JWT-authenticated REST         ┌──────────────────┐
│  React +    │ ─────────────────────────────────────▶│   Spring Boot    │
│  Vite SPA   │◀───────────────────────────────────── │     Backend      │
└─────────────┘                                        └──────────────────┘
                                                               │  │
                                                   ┌───────────┘  └───────────┐
                                                   ▼                          ▼
                                          ┌──────────────────┐      ┌──────────────────┐
                                          │  iTunes Search    │      │   PostgreSQL     │
                                          │  API (proxied)    │      │ (user's library) │
                                          └──────────────────┘      └──────────────────┘
                                                   ▲
                                                   │ (recommendations)
                                          ┌──────────────────┐
                                          │  Anthropic API    │
                                          │ (optional, for    │
                                          │  LLM summaries)   │
                                          └──────────────────┘
```

The backend never stores iTunes catalog data wholesale — it only proxies search
results live, and persists the subset of fields the user explicitly chooses to
save into their own library.

## 3. Database & Schema

**Choice: PostgreSQL (relational).**

Justification: the data is naturally tabular and well-structured (fixed fields
per library item), relationships are simple (one user → many library items), and
we need reliable uniqueness constraints (one save per catalog item per user) and
ACID guarantees for a per-user CRUD library. A NoSQL document store would add
complexity here without a clear benefit — there's no deeply nested or
schema-flexible data in this domain.

### `app_user`
| Column | Type | Notes |
|---|---|---|
| id | bigint, PK | |
| email | varchar, unique | |
| password_hash | varchar | BCrypt |
| created_at | timestamp | |

### `library_item`
| Column | Type | Notes |
|---|---|---|
| id | bigint, PK | |
| user_id | bigint, FK → app_user | |
| apple_catalog_id | bigint | iTunes `collectionId`; unique per user |
| title | varchar | |
| artist_name | varchar | |
| genre | varchar | nullable |
| release_date | date | nullable |
| track_count | int | nullable |
| artwork_url | varchar | nullable |
| user_rating | int | 1–5, nullable |
| user_notes | varchar(2000) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

`(user_id, apple_catalog_id)` has a unique constraint so the same album can't be
saved twice by the same user, enforced both at the DB level and in
`LibraryService` (returns a friendly 409 instead of a raw constraint violation).

## 4. REST API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, returns JWT |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/search?query=&type=&limit=` | No | Proxies iTunes search (`type`: album/song/artist) |
| GET | `/api/library` | Yes | List the current user's saved items |
| POST | `/api/library` | Yes | Save an item to the library |
| PUT | `/api/library/{id}` | Yes | Update rating/notes/metadata |
| DELETE | `/api/library/{id}` | Yes | Remove an item |
| GET | `/api/analytics` | Yes | Aggregated stats for charts |
| GET | `/api/ai/insights` | Yes | AI-generated summary + recommendations |

Auth: `Authorization: Bearer <token>` header. `/api/auth/**` and `/api/search`
are public; everything else requires a valid JWT (see `SecurityConfig`).

Validation is done via `jakarta.validation` annotations on request DTOs;
`GlobalExceptionHandler` centralizes error responses into a consistent JSON
shape (`{timestamp, status, error, message, fieldErrors}`).

## 5. AI Feature: Trend Summary + Recommendations

I implemented a **hybrid** approach rather than a single feature, because a
purely LLM-based feature is a black box with no fallback if the API key is
missing or the call fails, and a purely rule-based feature undersells what
"AI-generated insight" should mean. So:

1. **Rule-based layer (always runs, deterministic, free):**
   - Computes the user's most-saved genre, most-saved artist, and average
     release year across their library.
   - Calls the iTunes API for more albums by the user's top artist and filters
     out anything already saved, to produce a simple "you might also like" list.
2. **Optional LLM layer:** if `ANTHROPIC_API_KEY` is set, those same rule-based
   stats are handed to Claude to generate a warmer, natural-language 2–3
   sentence summary (the prompt explicitly forbids inventing facts not in the
   stats, to avoid hallucinated details about someone's library). If the key is
   absent or the call fails for any reason, the endpoint falls back to a
   template-based summary — the feature always works end-to-end, with or
   without an LLM key.

The API response includes a `source` field (`"llm"` or `"rule-based"`) so the
frontend (and a grader) can see exactly which path produced the summary. This
is shown as a small badge in the Analytics dashboard.

**Trade-off:** a more sophisticated recommender (collaborative filtering,
audio-feature similarity via a dedicated ML model) would give better
recommendations, but is out of scope for a 3-day assignment and would need a
much larger training dataset than one user's small library can provide.
Artist-based "more from this artist" is a reasonable, explainable baseline.

## 6. Analytics Dashboard

Five charts, covering all the suggested types:
1. **Bar** — genre distribution
2. **Pie / Donut** — genre share
3. **Line** — releases by year
4. **Histogram** — track-count distribution (fixed buckets of 5)
5. **Horizontal Bar** — top 10 artists by count

All charts handle the empty/sparse-data case gracefully (shown as "Not enough
data yet" rather than a broken chart).

## 7. Setup

### Prerequisites
- Java 17+, Maven 3.9+
- Node.js 18+
- PostgreSQL 14+ (or use the Docker Compose file below)

### Backend
```bash
cd backend
# Point at your own Postgres, or run: docker run -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=music_catalog -p 5432:5432 -d postgres:16
export DB_URL=jdbc:postgresql://localhost:5432/music_catalog
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=$(openssl rand -base64 32)
# Optional, enables the LLM summary layer:
export ANTHROPIC_API_KEY=sk-ant-...

mvn spring-boot:run
# Backend now running on http://localhost:8080
```

Run tests: `mvn test`

### Frontend
```bash
cd frontend
cp .env.local.example .env.local   # set VITE_API_BASE_URL if backend isn't on localhost:8080
npm install
npm run dev
# Frontend now running on http://localhost:3000
```

## 8. Deployment

- **Backend:** Render or Railway, using the included `Dockerfile`. Set env vars
  `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`
  (your Vercel URL), and optionally `ANTHROPIC_API_KEY`.
- **Database:** a managed Postgres instance (Render Postgres, Railway Postgres,
  Neon, or Supabase all work — the app just needs a JDBC URL).
- **Frontend:** Vercel (or Netlify) as a static build — build command `npm run build`,
  output directory `dist`. Set `VITE_API_BASE_URL` to the deployed backend URL as
  an environment variable.

## 9. Trade-offs & what I'd add with more time

- **JWT storage:** the token is stored in `localStorage` on the frontend for
  simplicity. An httpOnly cookie would be more resistant to XSS, at the cost of
  needing CSRF protection and a same-site backend/frontend deployment.
- **No refresh tokens:** tokens expire after 24h with no silent refresh; a
  production app would add a refresh-token flow.
- **No pagination:** `/api/library` returns the full list. Fine for a personal
  library (dozens–low hundreds of items), but would need pagination at scale.
- **No caching layer:** iTunes search calls hit the live API every time. A
  short-lived cache (e.g. Caffeine, keyed by query+type) would reduce latency
  and avoid rate-limit issues under heavier use.
- **Search is debounced but not cancelled:** rapid typing debounces at 400ms,
  but an in-flight request isn't aborted if a newer one starts; an `AbortController`
  would tidy this up.
- **Recommendation quality:** as noted above, the recommender is a simple,
  explainable "more from your top artist" — not a trained model.
