## 1. Dashboard glow-up (`src/routes/index.tsx`)

Keep the Cloud White palette + Space Grotesk / DM Sans. Reshape the presentation only — no data logic changes.

- **Hero band**: replace the plain greeting with a full-width gradient hero card (soft blue → violet radial on white, subtle grid pattern overlay). Left side: date pill, oversized greeting with animated gradient on the name, one-line contextual summary. Right side: compact "next up" chip showing the single most urgent assessment with a countdown.
- **Stat strip**: promote to glassy tiles — larger numbers, subtle top-border accent color per tone, tiny sparkline / progress ring on "Avg. progress", hover lift (`transition-shadow`, `hover:-translate-y-0.5`). Add a 4th tile variant with a mini ring instead of a number.
- **AI recommendation card**: turn into a featured gradient card (primary → chart-4) with a soft glow, animated sparkle icon, and a "Ask mentor about this" button that deep-links to `/mentor` with the prompt prefilled (via query string).
- **Up next**: keep list, but add a colored left border per course color and a small "weight ring" badge.
- **Semester progress**: swap flat bars for stacked segmented bars (done / in-progress / not started) with course color dot.
- **Focus today**: redesign as a compact 3-metric grid with icons, plus a subtle streak flame animation.
- Add gentle entrance animation (fade-up stagger) using existing `tw-animate-css`.

No new dependencies. All colors via existing tokens.

## 2. AI Mentor upgrade (`src/routes/mentor.tsx` + new server function)

Replace the local heuristic with a real Lovable AI call that has both **internal Atlas context** and **outside knowledge** (general study advice, concepts, current best-practices from model training).

**New file** `src/lib/mentor.functions.ts`:
- `createServerFn({ method: "POST" })` named `askMentor`.
- Input (zod): `{ messages: {role, content}[], context: { userName, assessments, courses, goals, tasks, habits, transactionsSummary } }`.
- Handler: builds a system prompt like "You are Atlas, a precise study & life mentor for {name}. You have their live data below (JSON). Use it when relevant, but also draw on general knowledge (study techniques, subject explanations, finance basics, productivity science). Be specific, cite concrete items from their data by name, keep answers concise and structured."
- Calls Lovable AI Gateway via `@ai-sdk/openai-compatible` + `generateText` with `google/gemini-3.6-flash` (default). Reads `LOVABLE_API_KEY` from `process.env`.
- Returns `{ reply: string }`. Handles 429/402 with friendly error strings.

**`src/lib/ai-gateway.server.ts`** (new): shared provider helper per docs (baseURL `https://ai.gateway.lovable.dev/v1`, header `Lovable-API-Key`).

**`src/routes/mentor.tsx`**:
- Replace `generateReply` + `setTimeout` with `useServerFn(askMentor)` inside a mutation.
- Trim context payload (only send fields the model needs; summarize transactions to totals + top categories to keep tokens low).
- Send full chat history (role/content) on every call for memory.
- Render assistant messages with `react-markdown` (add dependency) so lists / bold / code render.
- Keep the existing suggestion chips but broaden them ("Explain integration by parts", "Tips for exam week", "How should I budget on a student income?").
- Show a small "Powered by Lovable AI" hint under the input.
- Preserve local chat persistence in the existing store.
- If the URL has `?q=...` (from dashboard deep link), auto-send that as the first message.

**Cloud / secrets**: `LOVABLE_API_KEY` is auto-provisioned by Lovable AI. No user prompt needed. If missing at runtime, provision via the AI Gateway tool during build.

## Files touched
- edit: `src/routes/index.tsx`, `src/routes/mentor.tsx`
- new: `src/lib/ai-gateway.server.ts`, `src/lib/mentor.functions.ts`
- deps: add `ai`, `@ai-sdk/openai-compatible`, `react-markdown`

## Out of scope
- No changes to store, other routes, sidebar, or auth.
- No streaming (one-shot `generateText` is enough for the mentor UX; can be added later).
