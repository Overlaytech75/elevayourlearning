# Run Eleva on localhost (no Lovable Cloud)

Everything the app needs already exists in the repo: all database migrations are in `supabase/migrations`, so your entire backend (database, auth, RLS) can be reproduced on your machine. Per your choices, the database runs locally in Docker, and AI Mentor features are skipped locally (everything else works with zero API keys).

## What I'll change in the project

1. **`.env.example`** — a template file listing the environment variables a local run needs (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and optional `SUPABASE_SERVICE_ROLE_KEY`), so you just copy it to `.env.local` and fill in your local values.
2. **Graceful AI degradation** — the AI gateway (currently hard-wired to Lovable's hosted AI at `ai.gateway.lovable.dev`) becomes env-configurable. When no key is set locally, AI Mentor and AI study tools show a friendly "AI features are unavailable in this local setup" state instead of erroring. Every other feature works untouched.
3. **Google sign-in guard** — Google OAuth is brokered by Lovable and won't work against a local database. The Google button hides locally (env-flagged) and email/password sign-up works out of the box.
4. **`LOCAL_SETUP.md`** — a step-by-step guide you can follow on your own machine (contents summarized below).

## How you'll run it on your machine

```text
One-time setup
  1. Install Node.js LTS (nodejs.org)
  2. Install Docker Desktop (docker.com) — required for the local database
  3. Install the Supabase CLI (supabase.com/docs/guides/cli)
  4. Get the code onto your machine:
       GitHub export: Code (top right) -> Export to GitHub, then `git clone` your repo
       ...or download the project zip from the editor

Every run (from the project folder)
  5. supabase start        # boots Postgres + auth in Docker; applies supabase/migrations
  6. supabase db reset     # re-applies migrations if needed
  7. Copy the API URL (http://127.0.0.1:54321) and anon key it prints into .env.local
  8. npm install
  9. npm run dev           # app at http://localhost:8080
```

Notes:
- `supabase start` prints the local URL and anon key — those are your `.env.local` values (never commit `.env.local`).
- First run: open `http://localhost:8080`, sign up with email/password — this creates your profile, settings, subscription, and starter records via the existing database triggers.
- Google sign-in and the AI Mentor are cloud-only features; locally they're hidden/disabled as described above.
- Your cloud (published) version keeps working exactly as it does today — these changes are additive and don't affect the deployed app.

## Technical details

- Env config touches `src/lib/ai-gateway.server.ts` (gateway URL + key from `process.env`), `mentor.functions.ts` / `study.functions.ts` (skip calls when no key), and the mentor/study route UIs (unavailable state).
- Google button visibility reads a `VITE_` env flag in `src/routes/auth.tsx`.
- `.gitignore` gains `.env.local` if not already ignored.
- The Lovable preview keeps using its managed cloud session — nothing changes there.
