# Eleva: cloud sync, premium tiers, and PWA installability

## Goal
Turn Eleva from a local-only student OS into a real cloud-synced, installable app with a free tier and an optional premium upgrade. Signed-in users keep their data across devices; free users get full core features with a capped AI budget; premium users get unlimited AI and early access.

## Phase 1 — Cloud data model

Move every local entity into Supabase with strict RLS so users can only see and edit their own rows.

Tables to add:
- `semesters`, `courses`, `assessments`
- `transactions`, `budgets`
- `tasks`, `habits`, `goals`, `study_sessions`
- `notes` (markdown body)
- `life_state` (single row per user for visa/documents/shifts/tuition/career/scholarships), or split into `visa_info`, `work_shifts`, `tuition_payments`, `documents`, `scholarships`, `job_applications`, `career_assets` if a single row becomes unwieldy
- `user_settings` (theme, onboarding done, etc.)
- `ai_usage` (daily/monthly counters for rate limiting)
- `subscriptions` (status, tier, current_period_end)

Rules for each new table:
1. `CREATE TABLE` in the public schema.
2. `GRANT SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `ALL` to `service_role`.
3. `ENABLE ROW LEVEL SECURITY`.
4. Add policies that scope every row to `auth.uid()`.

The existing `profiles` table stays as the source of `display_name`.

## Phase 2 — Sync layer

Replace the local-only `store.ts` / `life-store.ts` / `study-store.ts` persistence with a hybrid model:

- **Signed-in users:** read and write through `createServerFn` to Supabase. Keep a lightweight local cache for offline resilience, but treat the server as the source of truth.
- **Tour / signed-out users:** keep the existing localStorage stores so the 5-minute preview still works without an account.
- **Migration path:** on first sign-in after this launch, if the browser has local Eleva data, show a one-time "Sync this device to your account?" prompt and upload it to the cloud.

Implementation:
- `src/lib/sync.ts` — a small sync engine that batches mutations and handles conflicts with last-write-wins per row.
- `src/lib/*.functions.ts` — one server function per module for create/update/delete/list.
- Update `src/lib/auth.tsx` to trigger the initial sync after sign-in.

## Phase 3 — Free + premium model

Use Stripe for billing (Lovable's default recommendation). Add a `payments` integration with a `subscriptions` table.

Tiers:
- **Free:** cloud sync, unlimited courses/tasks/finance, 10 AI messages/week, 3 AI tool generations/week.
- **Premium:** unlimited AI mentor and AI tools, document uploads, calendar export, and priority support.

Feature gates:
- Add `useSubscription()` hook that reads `subscriptions` row.
- Show an upgrade prompt when a free user hits an AI limit.
- Add a `PremiumBadge` component and a `/settings/billing` route.

## Phase 4 — PWA installability

Make Eleva installable from a phone home screen without adding offline caching (manifest-only).

- Add `public/manifest.webmanifest` with `display: "standalone"`, the Eleva name, theme colors, and icon entries.
- Generate square PNG icons in required sizes (192x192, 512x512) from the existing logo.
- Add `<link rel="manifest">`, `theme-color`, and `apple-touch-icon` tags in `src/routes/__root.tsx`.
- Do not register a service worker unless offline support is explicitly requested later; manifest-only keeps previews clean.

## Phase 5 — Settings & account page

Create `/settings` with:
- Profile name update
- Theme/accent preference (stored in `user_settings`)
- Subscription status and billing portal link
- Data export (download all user data as JSON)
- Data delete / sign out
- Push notification opt-in (future; not in this scope)

## Phase 6 — Verification

- Confirm signed-in data survives a sign-out + sign-in on a second device.
- Confirm the 5-minute tour still works signed-out and does not touch cloud tables.
- Confirm premium limits block free users and upgrade flow works end-to-end.
- Confirm the manifest is served and the install prompt appears on a real phone.

## Open questions

1. **Data model detail:** Should the international/career module be one JSON row per user or normalized tables? Normalized is better for queries and RLS; JSON is faster to ship. Recommendation: start normalized.
2. **Payments provider:** Should we use Stripe or Paddle? Stripe is the Lovable default for subscriptions; Paddle is simpler for global tax handling. Unless you sell internationally from day one, Stripe is the safer first choice.
3. **Offline support:** Do you want the app to work without internet after install? This requires a service worker and a more complex sync queue. The current scope is installability only, not offline.

## What stays the same

- The existing UI, colour theme, and sidebar structure.
- The 5-minute tour and localStorage fallback for signed-out users.
- The AI Mentor and AI Tools features, but with rate limits on the free tier.
