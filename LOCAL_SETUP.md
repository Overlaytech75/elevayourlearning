# Running Eleva locally

Eleva can run entirely on your own machine: the frontend on Vite, and the
database + authentication on a local Supabase stack built from the migrations
already in `supabase/migrations`. Nothing here affects the hosted version.

## 1. One-time installs

| Tool | Why | Where |
| --- | --- | --- |
| Node.js (LTS) | runs the app | https://nodejs.org |
| Docker Desktop | runs the local database + auth | https://docker.com |
| Supabase CLI | applies migrations, starts the stack | https://supabase.com/docs/guides/cli |

Get the code onto your machine by exporting the project to GitHub from the
editor, then `git clone` your repository.

## 2. First-time setup

```bash
npm install

# Boots Postgres, auth and the API in Docker and applies every migration
# in supabase/migrations. Note the "API URL" and "anon key" it prints.
supabase start

cp .env.example .env.local
```

Open `.env.local` and:

1. Paste the API URL (usually `http://127.0.0.1:54321`) into both
   `VITE_SUPABASE_URL` and `SUPABASE_URL`.
2. Paste the anon key into both `VITE_SUPABASE_PUBLISHABLE_KEY` and
   `SUPABASE_PUBLISHABLE_KEY`.
3. Keep `VITE_AI_ENABLED="false"` and `VITE_GOOGLE_AUTH_ENABLED="false"`.

> Only the URL and the anon/publishable key are ever exposed to the browser.
> Never put a service-role key behind a `VITE_` variable.

## 3. Every day

```bash
supabase start   # if it isn't already running
npm run dev      # http://localhost:8080
```

Sign up with email and password at `http://localhost:8080`. The existing
database triggers create your profile, settings, subscription and starter rows
automatically.

## 4. Rebuilding the database (only when you mean it)

```bash
supabase db reset   # wipes local data and re-applies all migrations
```

This is **not** part of the normal run loop — use it only when you deliberately
want a clean database or after pulling new migrations.

## What is different locally

- **AI features are off.** The Mentor, AI study tools and AI flashcards show a
  quiet "AI features are unavailable in local development" notice instead of
  failing. Everything else — academics, finance, tasks, habits, notes, visa,
  career, analytics — works fully.
- **Google sign-in is hidden.** Google OAuth is brokered by Lovable and cannot
  reach a local database; use email + password locally. The cloud
  implementation is untouched and still works when deployed.

## Optional: enable AI locally

Bring your own OpenAI-compatible endpoint by adding to `.env.local`:

```bash
VITE_AI_ENABLED="true"
AI_GATEWAY_URL="https://api.openai.com/v1"
AI_API_KEY="your-own-key"
AI_MODEL="gpt-4o-mini"
```

Restart `npm run dev` afterwards. Never commit these values.

## Troubleshooting

- **`supabase start` fails** — Docker Desktop is not running.
- **Blank page with a Supabase env error** — `.env.local` is missing or the URL
  and key were not copied in; restart `npm run dev` after editing it.
- **Port already in use** — stop the previous run, or `supabase stop`.
