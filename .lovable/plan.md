# Run Eleva on localhost (no Lovable Cloud)

All database migrations already live in `supabase/migrations`, so your backend (tables, RLS, triggers, auth) can be rebuilt on your machine. The local setup runs Postgres + auth in Docker; AI features are optional and simply switch off when no AI key exists. The hosted Lovable Cloud app is untouched by every change below.

## Guarantees

- The published cloud app keeps working exactly as today — all changes are additive and default to current behaviour.
- No migrations, tables, RLS policies, triggers, or production functionality are modified.
- No API keys, secrets, URLs, or Lovable credentials are hardcoded.
- The browser only ever receives the Supabase URL and publishable/anon key. `SUPABASE_SERVICE_ROLE_KEY` is never exposed through a `VITE_` variable or any client code.
- `supabase db reset` is documented only as an intentional rebuild step, not part of the normal run loop.

## What I'll change

1. **`src/lib/env.ts` (new)** — client-safe feature flags `VITE_AI_ENABLED` and `VITE_GOOGLE_AUTH_ENABLED`, both defaulting to **enabled** so cloud behaviour is identical. Only `.env.local` turns them off.
2. **Optional AI** — `src/lib/ai-gateway.server.ts` resolves a provider from env (Lovable key first, otherwise an optional generic OpenAI-compatible endpoint) and returns "none configured" instead of throwing. `mentor.functions.ts` and `study.functions.ts` return a clean unavailable response in that case.
3. **`src/components/ai-unavailable.tsx` (new)** — a calm notice ("AI features are unavailable in local development"). Shown on the Mentor, AI Tools, and Study AI panels when AI is off, with those inputs/buttons disabled — no errors, no crashes.
4. **Google sign-in flag** — `src/routes/auth.tsx` hides the Google button only when `VITE_GOOGLE_AUTH_ENABLED=false`. The existing cloud Google OAuth implementation stays fully intact.
5. **`.env.example` (new)** — template with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`, and the optional flags. Placeholders only, no real values.
6. **`.gitignore`** — add `.env.local`.
7. **`LOCAL_SETUP.md` (new)** — exact setup instructions (summarized below).
8. **`roadmap.md`** — track this work.

## Local run instructions (contents of LOCAL_SETUP.md)

```text
One-time
  1. Install Node.js LTS            (nodejs.org)
  2. Install Docker Desktop         (docker.com) - needed for the local database
  3. Install the Supabase CLI       (supabase.com/docs/guides/cli)
  4. Get the code: Export to GitHub from the editor, then git clone

First time in the project folder
  5. npm install
  6. supabase start                 # boots Postgres + auth, applies supabase/migrations
  7. cp .env.example .env.local     # paste the API URL + anon key that step 6 printed
                                    # and set VITE_AI_ENABLED=false
                                    #         VITE_GOOGLE_AUTH_ENABLED=false

Everyday
  8. supabase start                 # if it isn't already running
  9. npm run dev                    # http://localhost:8080

Only when you intentionally rebuild the database
     supabase db reset              # wipes local data, re-applies migrations
```

Then sign up with email + password on `http://localhost:8080` — existing database triggers create your profile, settings, and subscription rows automatically.
