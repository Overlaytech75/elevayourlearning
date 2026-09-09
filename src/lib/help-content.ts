export interface HelpTopic {
  id: string;
  group: string;
  question: string;
  /** Short written answer. Plain text, rendered as paragraphs split on blank lines. */
  answer: string;
  /** Optional in-app destination for a "Take me there" button. */
  link?: { to: string; label: string };
  /** Ids of related topics offered as follow-up chips. */
  related?: string[];
  keywords?: string[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "empty-account",
    group: "Getting started",
    question: "Why is my account completely empty?",
    answer:
      "That's intentional. Every Eleva account starts at zero — no demo courses, transactions or tasks — so what you see is only ever your own data.\n\nStart with a course in Academics, then add its assessments. The dashboard, timeline and analytics fill themselves in from there.",
    link: { to: "/academics", label: "Open Academics" },
    related: ["add-course", "add-assessment"],
    keywords: ["blank", "no data", "zero", "empty"],
  },
  {
    id: "add-course",
    group: "Academics",
    question: "How do I add a course?",
    answer:
      "Go to Academics and use the \"New course\" button. Give it a code (e.g. COMP1010), a name, a colour and its credit points.\n\nCourses are the container for everything academic — assessments, GPA and progress all hang off them.",
    link: { to: "/academics", label: "Open Academics" },
    related: ["add-assessment", "gpa"],
    keywords: ["subject", "unit", "class"],
  },
  {
    id: "add-assessment",
    group: "Academics",
    question: "How do I add an assessment or deadline?",
    answer:
      "From Academics (or the \"New assessment\" button on the dashboard), pick the course, then set the title, type, weight, due date and estimated hours.\n\nOnce saved it appears in Up next, the Timeline buckets and your reminders. Click any row to edit it — every field, including dates and dropdowns, is editable inline.",
    link: { to: "/academics", label: "Open Academics" },
    related: ["weights", "timeline"],
    keywords: ["exam", "assignment", "due date", "deadline"],
  },
  {
    id: "weights",
    group: "Academics",
    question: "How do weights and progress work?",
    answer:
      "Weight is the share of the final course grade an assessment is worth, as a percentage. Progress is your own 0–100% estimate of how far through the work you are.\n\nEleva uses weight to decide what matters most, and progress to show how much of your open workload is actually done.",
    related: ["gpa", "add-assessment"],
    keywords: ["percentage", "worth", "marks"],
  },
  {
    id: "gpa",
    group: "Academics",
    question: "How is my GPA calculated?",
    answer:
      "The GPA calculator in Study tools converts each course's letter grade to grade points, multiplies by credit points, and divides by total credits — the standard weighted GPA.\n\nOn the dashboard you'll also see a plain average of your graded assessment percentages, which is a quicker sanity check.",
    link: { to: "/study", label: "Open Study tools" },
    related: ["weights"],
    keywords: ["grade", "average", "wam"],
  },
  {
    id: "saving",
    group: "Your data",
    question: "Nothing saves — where is my data stored?",
    answer:
      "Your workspace data is stored locally in this browser, so it survives refreshes but lives on the device you created it on. Your account (email / Google) is what identifies you.\n\nIf something looks like it didn't save: make sure you're not in a private window, and don't clear site data. Signing out deliberately wipes the local workspace on that device.",
    related: ["signout", "empty-account"],
    keywords: ["storage", "lost", "disappeared", "sync"],
  },
  {
    id: "signin",
    group: "Account",
    question: "How do I sign in, and can I use Google?",
    answer:
      "Yes. On the landing page use \"Continue with Google\", or create an account with email and a password of at least 6 characters.\n\nIf you signed up with email you may need to confirm it from your inbox before signing in.",
    link: { to: "/auth", label: "Go to sign in" },
    related: ["tour", "signout"],
    keywords: ["login", "google", "password", "sign up"],
  },
  {
    id: "tour",
    group: "Account",
    question: "What is the 5-minute tour?",
    answer:
      "It lets you walk through the app without an account. A countdown runs for five minutes, after which Eleva asks you to sign up to keep going.\n\nAnything you enter during the tour stays in this browser and carries over once you create an account on the same device.",
    related: ["signin"],
    keywords: ["preview", "trial", "look around"],
  },
  {
    id: "signout",
    group: "Account",
    question: "How do I sign out?",
    answer:
      "The Sign out button sits at the bottom of the sidebar, under your name. Signing out ends your session and clears the local workspace data on that device, so shared computers stay private.",
    related: ["saving"],
    keywords: ["log out", "leave"],
  },

  {
    id: "ai-mentor",
    group: "AI",
    question: "What can the AI Mentor do?",
    answer:
      "The mentor sees a summary of your live Eleva data — courses, deadlines, goals, tasks, habits and spending — and combines it with general knowledge to give specific advice.\n\nAsk it things like \"plan my next three days\" or \"explain gradient descent simply\". It won't invent data you haven't entered.",
    link: { to: "/mentor", label: "Open AI Mentor" },
    related: ["ai-signin", "ai-tools"],
    keywords: ["chat", "assistant", "advice"],
  },
  {
    id: "ai-tools",
    group: "AI",
    question: "What are the AI tools?",
    answer:
      "A set of focused assistants: flashcards, quizzes, summaries, concept explainer, citation generator, essay feedback, study plans and practice exams.\n\nPaste your material, pick the tool, and you get a ready-to-use result you can copy into your notes.",
    link: { to: "/ai-tools", label: "Open AI tools" },
    related: ["ai-signin", "ai-mentor"],
    keywords: ["flashcards", "quiz", "summary", "citation", "essay"],
  },
  {
    id: "ai-signin",
    group: "AI",
    question: "Why do the AI features ask me to sign in?",
    answer:
      "AI requests cost money to run, so they're only available to signed-in accounts. That keeps the service free of abuse and available for real users.\n\nIf you see a rate-limit message instead, wait a few seconds and try again.",
    related: ["signin"],
    keywords: ["401", "unauthorized", "blocked", "rate limit"],
  },
  {
    id: "tasks",
    group: "Productivity",
    question: "How do tasks and habits work?",
    answer:
      "In Productivity, add a task with a priority, optional tag and due date, then tick it off when it's done. Overdue and due-today tasks show up in your reminders.\n\nHabits are a simple 7-day grid: tap today's square to mark it done and keep the streak alive.",
    link: { to: "/productivity", label: "Open Productivity" },
    related: ["reminders"],
    keywords: ["todo", "streak", "habit"],
  },
  {
    id: "finance",
    group: "Money",
    question: "How do I track spending and budgets?",
    answer:
      "In Finance, log transactions as income or expenses with a category. Then set a monthly limit per category as a budget.\n\nEleva warns you in reminders when a category goes over its limit, and Analytics shows where the money actually went.",
    link: { to: "/finance", label: "Open Finance" },
    related: ["reminders"],
    keywords: ["budget", "expense", "money", "spending"],
  },
  {
    id: "timeline",
    group: "Planning",
    question: "What does the Timeline show?",
    answer:
      "Everything with a due date, bucketed into overdue, today, this week and later — so you can see the shape of the next fortnight in one screen.",
    link: { to: "/timeline", label: "Open Timeline" },
    related: ["add-assessment"],
    keywords: ["calendar", "schedule", "upcoming"],
  },
  {
    id: "reminders",
    group: "Planning",
    question: "How do reminders and the bell work?",
    answer:
      "The bell in the top bar counts anything that needs attention: overdue or due-soon assessments, tasks due today, goals past their deadline and budgets over limit.\n\nIt's generated live from your data — nothing to configure. Clicking an item takes you to the right page, and \"Mark all read\" quiets the badge until something new appears.",
    keywords: ["notification", "alert", "bell"],
  },
  {
    id: "international",
    group: "International & career",
    question: "What's in the International hub?",
    answer:
      "Visa and CoE expiry countdowns, OSHC health cover, fortnightly work-hour tracking against your visa limit, tuition instalments, a document checklist and official government links for Australia, Canada, the UK and the US.",
    link: { to: "/international", label: "Open International" },
    related: ["career"],
    keywords: ["visa", "coe", "oshc", "work hours", "tuition"],
  },
  {
    id: "career",
    group: "International & career",
    question: "What's in the Career hub?",
    answer:
      "An application pipeline for internships and jobs (saved → applied → interview → offer), plus a place to keep your resume, portfolio, certificates and LinkedIn links up to date.",
    link: { to: "/career", label: "Open Career" },
    related: ["international"],
    keywords: ["job", "internship", "resume", "interview"],
  },
  {
    id: "notes",
    group: "Study",
    question: "How do notes and the Pomodoro timer work?",
    answer:
      "Notes are markdown — write on the left, see the formatted version as you go. Use them for lecture notes, summaries or anything you paste out of the AI tools.\n\nThe Pomodoro timer in Study tools runs focus and break intervals, and logs finished sessions so your study time shows up in Analytics.",
    link: { to: "/notes", label: "Open Notes" },
    related: ["ai-tools"],
    keywords: ["markdown", "pomodoro", "focus", "timer"],
  },
  {
    id: "bug",
    group: "Still stuck",
    question: "Something is broken — what do I do?",
    answer:
      "First try a hard refresh; most glitches clear immediately. If a value looks wrong, reopen the item and re-save it.\n\nIf it persists, email us with the page you were on and what you clicked, and we'll take a look.",
    keywords: ["bug", "error", "broken", "issue", "not working"],
  },
];

export const HELP_GROUPS = Array.from(new Set(HELP_TOPICS.map((t) => t.group)));

export const SUGGESTED_TOPIC_IDS = [
  "empty-account",
  "add-course",
  "saving",
  "ai-signin",
  "reminders",
  "signout",
];

export function searchTopics(query: string): HelpTopic[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP_TOPICS;
  return HELP_TOPICS.filter((t) =>
    [t.question, t.answer, t.group, ...(t.keywords ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function topicById(id: string) {
  return HELP_TOPICS.find((t) => t.id === id);
}
