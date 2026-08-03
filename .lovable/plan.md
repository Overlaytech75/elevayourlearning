# Fix editing, auth landing, live greeting, and real name

## 1. Nothing saves or updates when you edit (the big one)

Confirmed root cause: all three data stores (`store.ts`, `study-store.ts`, `life-store.ts`) change data *in place* — they push into the same array or overwrite a field on the same object. The React hook then compares the new value to the old one, sees the exact same object, and decides nothing changed, so the screen never re-renders. The value is often written to storage, but the UI never reflects it — which reads as "changing a date, number, text or dropdown does nothing".

Fix: make every update produce a new object/array instead of mutating, and switch the hooks to React's official external-store subscription so any change reliably re-renders. This covers assessments, courses, semesters, tasks, habits, goals, transactions, budgets, notes, flashcards, GPA rows, visa/work/tuition/documents, scholarships, and job applications.

After the fix I'll click through each screen in a real browser and verify an edit of each kind (text, number, date, dropdown, checkbox, delete) actually sticks and survives a reload.

## 2. Land on sign in / sign up first

- Visiting the app while signed out sends you to the sign-in page instead of the dashboard.
- The "Continue without an account" link stays — it starts a 5-minute preview.
- During the preview a small dismissible bar shows the remaining time.
- When 5 minutes are up, a sign-up prompt appears over the app; browsing resumes only after signing in (or the preview can be restarted).
- Signed-in users skip all of this and go straight to the dashboard.

## 3. Live greeting

The greeting is currently calculated once when the page loads. It will update on a timer so morning/afternoon/evening (and the date line) stay correct while the tab is open.

## 4. Real first name

Replace the hardcoded "Sakif" with the signed-in user's first name — taken from their profile display name, Google account name, or the part before the @ in their email, in that order. Signed-out preview shows a neutral "there".

## Technical notes

- Stores: replace the mutate-and-notify pattern with immutable state updates plus `useSyncExternalStore` (keeping a stable server snapshot so there's no hydration mismatch).
- Preview gate: a small client-only provider that records the preview start timestamp in `sessionStorage`; the root layout renders the gate overlay when it expires. Route protection stays client-side so shareable links and SEO metadata still work.
- Greeting: `useEffect` interval (60s) updating a state clock; guarded to avoid hydration mismatch.
- Name: derived from `useAuth()` + `displayNameOf()`; store's `user.name` stops being the source of truth on the dashboard.
