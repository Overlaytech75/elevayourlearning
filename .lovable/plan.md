# Help centre, social links, onboarding and reminders

## 1. Help page (`/help`)
A dedicated page linked from the sidebar (and from the sign-in page footer).

- **Search box** that filters the FAQ list as you type.
- **Prefilled FAQ chatbot**: a chat-style panel where the user taps one of the suggested questions and the "Eleva Helper" replies instantly with a written answer. No AI call, no cost, works signed-out. Answers cover:
  - Nothing saves / where is my data stored
  - How to add a course, assessment, task, expense, note
  - How GPA is calculated and how weights work
  - Signing in, Google sign-in, signing out, the 5-minute tour
  - Dark mode and accent colour
  - Why my account is empty (every account starts at zero)
  - Using the AI Mentor and AI tools, and why they need sign-in
  - International and Career hubs
- Each answer can offer follow-up buttons and a direct link to the relevant page.
- Below the chat: grouped FAQ accordion with the same content, so it's readable and skimmable without the chat.
- A short "Still stuck?" block with the contact email and the social icons.

## 2. Social links
- Facebook, Instagram, X and Telegram icon buttons, opening in a new tab.
- Shown in three places: the sidebar footer, the Help page, and the sign-in page.
- Links live in one shared config file so you can change a URL in one spot. I'll wire them to placeholder profile URLs for now — send me the real ones and I'll swap them in (or you can edit the single file).

## 3. Onboarding + empty-state guides
- **First-run checklist** card on the dashboard: add your first course, add an assessment, log an expense, create a task, set a goal. Each item ticks off automatically as the data appears, and the card disappears (dismissible, remembered per browser) once done.
- **Empty states** on Academics, Timeline, Productivity, Finance, Goals, Notes, International and Career: a short line explaining what belongs there plus the button that creates the first item — instead of a blank panel.

## 4. Notifications & reminders
- A **bell menu** in the top bar with an unread count.
- Generated live from existing data, no backend needed: assessments due in the next 7 days, anything overdue, tasks due today or overdue, goals past their deadline, and budget categories over their limit.
- Grouped by urgency (overdue / today / this week), each row clicks through to the right page.
- Read/dismissed state stored locally so the badge stays quiet once reviewed.

## Technical notes
- New: `src/routes/help.tsx`, `src/lib/help-content.ts` (FAQ data), `src/lib/social.ts` (link config), `src/components/social-links.tsx`, `src/components/notification-bell.tsx`, `src/components/onboarding-checklist.tsx`, `src/components/empty-state.tsx`.
- Edits: `src/components/app-sidebar.tsx` (Help link + socials), `src/routes/__root.tsx` (bell in header), `src/routes/auth.tsx` (socials + help link), `src/routes/index.tsx` (checklist), and the module routes for empty states.
- Notifications and checklist derive from the existing local stores; no schema or backend changes.
- The Help page renders with no sidebar chrome when opened while signed out, matching the auth landing treatment.
- Page-level `head()` metadata added for `/help`.
