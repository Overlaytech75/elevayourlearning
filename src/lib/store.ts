import { useEffect, useRef, useState } from "react";

export type Priority = "low" | "medium" | "high";
export type AssessmentStatus = "not_started" | "in_progress" | "submitted" | "graded";

export interface Semester {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  active: boolean;
}

export interface Course {
  id: string;
  semesterId: string;
  code: string;
  name: string;
  color: string; // token or hex
  credits?: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  type: string; // Assignment, Exam, Quiz, Project...
  weight: number; // %
  dueDate: string; // ISO
  status: AssessmentStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  difficulty: number; // 1-5
  progress: number; // 0-100
  notes: string;
  grade?: number | null;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number; // + income, - expense
  category: string;
  note: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate?: string;
  tag?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  completions: string[]; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  category: "academic" | "finance" | "health" | "personal" | "career";
  target: number;
  current: number;
  unit: string;
  deadline: string;
  milestones: { id: string; title: string; done: boolean }[];
}

export interface StudySession {
  id: string;
  courseId?: string;
  date: string;
  minutes: number;
  focusScore: number; // 1-5
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AppState {
  user: { name: string };
  semesters: Semester[];
  courses: Course[];
  assessments: Assessment[];
  transactions: Transaction[];
  budgets: Budget[];
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  sessions: StudySession[];
  chat: ChatMessage[];
}

const STORAGE_KEY = "sakif-os:v1";

const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): AppState {
  const today = new Date();
  const in3 = (d: number) => {
    const t = new Date(today);
    t.setDate(t.getDate() + d);
    return t.toISOString();
  };
  const semId = uid();
  const c1 = uid();
  const c2 = uid();
  const c3 = uid();
  const c4 = uid();
  return {
    user: { name: "Sakif" },
    semesters: [
      {
        id: semId,
        name: "Semester 2, 2026",
        startDate: new Date(today.getFullYear(), 6, 21).toISOString(),
        endDate: new Date(today.getFullYear(), 10, 15).toISOString(),
        active: true,
      },
    ],
    courses: [
      { id: c1, semesterId: semId, code: "COMP101", name: "Intro to Programming", color: "var(--chart-1)", credits: 6 },
      { id: c2, semesterId: semId, code: "COMP206", name: "Databases", color: "var(--chart-2)", credits: 6 },
      { id: c3, semesterId: semId, code: "COMP310", name: "Networking", color: "var(--chart-3)", credits: 6 },
      { id: c4, semesterId: semId, code: "MATH220", name: "Discrete Math", color: "var(--chart-4)", credits: 6 },
    ],
    assessments: [
      { id: uid(), courseId: c2, title: "Assignment 2 — Schema Design", type: "Assignment", weight: 20, dueDate: in3(2), status: "in_progress", priority: "high", estimatedHours: 8, actualHours: 3, difficulty: 4, progress: 40, notes: "Normalize the retail schema." },
      { id: uid(), courseId: c1, title: "Lab 5 — Recursion", type: "Lab", weight: 5, dueDate: in3(1), status: "not_started", priority: "medium", estimatedHours: 3, actualHours: 0, difficulty: 3, progress: 0, notes: "" },
      { id: uid(), courseId: c3, title: "Networking Quiz 3", type: "Quiz", weight: 10, dueDate: in3(5), status: "not_started", priority: "medium", estimatedHours: 4, actualHours: 0, difficulty: 3, progress: 0, notes: "TCP/UDP, subnetting" },
      { id: uid(), courseId: c4, title: "Midterm Exam", type: "Exam", weight: 30, dueDate: in3(12), status: "not_started", priority: "high", estimatedHours: 15, actualHours: 2, difficulty: 5, progress: 15, notes: "Chapters 1–6" },
      { id: uid(), courseId: c1, title: "Assignment 1 — Loops", type: "Assignment", weight: 15, dueDate: in3(-4), status: "graded", priority: "medium", estimatedHours: 6, actualHours: 7, difficulty: 2, progress: 100, notes: "", grade: 88 },
      { id: uid(), courseId: c2, title: "Final Project Proposal", type: "Project", weight: 10, dueDate: in3(20), status: "not_started", priority: "low", estimatedHours: 5, actualHours: 0, difficulty: 3, progress: 0, notes: "" },
    ],
    transactions: [
      { id: uid(), date: in3(-1), amount: 1200, category: "Income", note: "Part-time job" },
      { id: uid(), date: in3(-2), amount: -18.5, category: "Food", note: "Lunch — campus cafe" },
      { id: uid(), date: in3(-3), amount: -42, category: "Transport", note: "Weekly bus pass" },
      { id: uid(), date: in3(-4), amount: -120, category: "Books", note: "Networking textbook" },
      { id: uid(), date: in3(-6), amount: -65, category: "Food", note: "Groceries" },
      { id: uid(), date: in3(-8), amount: -14.99, category: "Subscriptions", note: "Streaming" },
      { id: uid(), date: in3(-10), amount: -60, category: "Social", note: "Movie + dinner" },
    ],
    budgets: [
      { id: uid(), category: "Food", monthlyLimit: 350 },
      { id: uid(), category: "Transport", monthlyLimit: 180 },
      { id: uid(), category: "Books", monthlyLimit: 150 },
      { id: uid(), category: "Subscriptions", monthlyLimit: 60 },
      { id: uid(), category: "Social", monthlyLimit: 200 },
    ],
    tasks: [
      { id: uid(), title: "Read Chapter 4 — Databases", done: false, priority: "high", dueDate: in3(1), tag: "Study", createdAt: in3(-1) },
      { id: uid(), title: "Email advisor about internship", done: false, priority: "medium", tag: "Career", createdAt: in3(-1) },
      { id: uid(), title: "Renew student ID", done: false, priority: "low", tag: "Admin", createdAt: in3(-2) },
      { id: uid(), title: "Gym session", done: true, priority: "medium", tag: "Health", createdAt: in3(-1) },
    ],
    habits: [
      { id: uid(), name: "Deep work", emoji: "🎯", completions: [] },
      { id: uid(), name: "Read 20 pages", emoji: "📚", completions: [] },
      { id: uid(), name: "Exercise", emoji: "🏃", completions: [] },
      { id: uid(), name: "Sleep by 11pm", emoji: "🌙", completions: [] },
    ],
    goals: [
      { id: uid(), title: "GPA ≥ 3.7 this semester", category: "academic", target: 3.7, current: 3.55, unit: "GPA", deadline: in3(90), milestones: [
        { id: uid(), title: "Ace midterms", done: false },
        { id: uid(), title: "Finish all labs on time", done: true },
      ] },
      { id: uid(), title: "Save $2,000 buffer", category: "finance", target: 2000, current: 620, unit: "$", deadline: in3(180), milestones: [
        { id: uid(), title: "Automate transfer", done: true },
      ] },
      { id: uid(), title: "Land summer internship", category: "career", target: 10, current: 4, unit: "applications", deadline: in3(60), milestones: [
        { id: uid(), title: "Polish resume", done: true },
        { id: uid(), title: "Ship portfolio project", done: false },
      ] },
    ],
    sessions: [
      { id: uid(), courseId: c2, date: in3(-1), minutes: 90, focusScore: 4 },
      { id: uid(), courseId: c4, date: in3(-1), minutes: 60, focusScore: 3 },
      { id: uid(), courseId: c1, date: in3(-2), minutes: 45, focusScore: 5 },
      { id: uid(), courseId: c3, date: in3(-3), minutes: 75, focusScore: 4 },
      { id: uid(), courseId: c2, date: in3(-4), minutes: 120, focusScore: 5 },
      { id: uid(), courseId: c4, date: in3(-6), minutes: 30, focusScore: 2 },
    ],
    chat: [],
  };
}

function load(): AppState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = seed();
    // Merge: keep existing keys, fill missing ones from seed so upgrades don't wipe data.
    return { ...base, ...parsed } as AppState;
  } catch {
    return seed();
  }
}

let state: AppState | null = null;
const listeners = new Set<() => void>();

function ensure(): AppState {
  if (!state) state = load();
  return state;
}

function persist() {
  if (typeof window !== "undefined" && state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return ensure();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Stable empty snapshot used for SSR and first client render to avoid
// hydration mismatches (localStorage is only available after mount).
const EMPTY_STATE: AppState = {
  user: { name: "Sakif" },
  semesters: [],
  courses: [],
  assessments: [],
  transactions: [],
  budgets: [],
  tasks: [],
  habits: [],
  goals: [],
  sessions: [],
  chat: [],
};

export function useAppState<T>(selector: (s: AppState) => T): T {
  const [snap, setSnap] = useState<{ v: number; value: T }>(() => ({
    v: 0,
    value: selector(EMPTY_STATE),
  }));
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    // Always produce a new wrapper object so React re-renders even when the
    // selected value is the same (mutated) array/object reference.
    const update = () => setSnap((prev) => ({ v: prev.v + 1, value: selectorRef.current(ensure()) }));
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return snap.value;
}


// --- actions ---

export const actions = {
  setUserName(name: string) {
    ensure().user.name = name;
    persist();
  },
  addSemester(partial: Omit<Semester, "id">) {
    ensure().semesters.push({ ...partial, id: uid() });
    persist();
  },
  addCourse(partial: Omit<Course, "id">) {
    ensure().courses.push({ ...partial, id: uid() });
    persist();
  },
  deleteCourse(id: string) {
    const s = ensure();
    s.courses = s.courses.filter((c) => c.id !== id);
    s.assessments = s.assessments.filter((a) => a.courseId !== id);
    persist();
  },
  addAssessment(partial: Omit<Assessment, "id">) {
    ensure().assessments.push({ ...partial, id: uid() });
    persist();
  },
  updateAssessment(id: string, patch: Partial<Assessment>) {
    const s = ensure();
    const a = s.assessments.find((x) => x.id === id);
    if (a) Object.assign(a, patch);
    persist();
  },
  deleteAssessment(id: string) {
    const s = ensure();
    s.assessments = s.assessments.filter((a) => a.id !== id);
    persist();
  },
  // finance
  addTransaction(t: Omit<Transaction, "id">) {
    ensure().transactions.push({ ...t, id: uid() });
    persist();
  },
  deleteTransaction(id: string) {
    const s = ensure();
    s.transactions = s.transactions.filter((t) => t.id !== id);
    persist();
  },
  addBudget(b: Omit<Budget, "id">) {
    ensure().budgets.push({ ...b, id: uid() });
    persist();
  },
  updateBudget(id: string, patch: Partial<Budget>) {
    const b = ensure().budgets.find((x) => x.id === id);
    if (b) Object.assign(b, patch);
    persist();
  },
  deleteBudget(id: string) {
    const s = ensure();
    s.budgets = s.budgets.filter((b) => b.id !== id);
    persist();
  },
  // tasks
  addTask(t: Omit<Task, "id" | "createdAt">) {
    ensure().tasks.push({ ...t, id: uid(), createdAt: new Date().toISOString() });
    persist();
  },
  toggleTask(id: string) {
    const t = ensure().tasks.find((x) => x.id === id);
    if (t) t.done = !t.done;
    persist();
  },
  deleteTask(id: string) {
    const s = ensure();
    s.tasks = s.tasks.filter((t) => t.id !== id);
    persist();
  },
  // habits
  addHabit(h: Omit<Habit, "id" | "completions">) {
    ensure().habits.push({ ...h, id: uid(), completions: [] });
    persist();
  },
  toggleHabitToday(id: string) {
    const h = ensure().habits.find((x) => x.id === id);
    if (!h) return;
    const today = new Date().toISOString().slice(0, 10);
    h.completions = h.completions.includes(today)
      ? h.completions.filter((d) => d !== today)
      : [...h.completions, today];
    persist();
  },
  deleteHabit(id: string) {
    const s = ensure();
    s.habits = s.habits.filter((h) => h.id !== id);
    persist();
  },
  // goals
  addGoal(g: Omit<Goal, "id" | "milestones"> & { milestones?: Goal["milestones"] }) {
    ensure().goals.push({ ...g, id: uid(), milestones: g.milestones ?? [] });
    persist();
  },
  updateGoal(id: string, patch: Partial<Goal>) {
    const g = ensure().goals.find((x) => x.id === id);
    if (g) Object.assign(g, patch);
    persist();
  },
  deleteGoal(id: string) {
    const s = ensure();
    s.goals = s.goals.filter((g) => g.id !== id);
    persist();
  },
  toggleMilestone(goalId: string, milestoneId: string) {
    const g = ensure().goals.find((x) => x.id === goalId);
    const m = g?.milestones.find((x) => x.id === milestoneId);
    if (m) m.done = !m.done;
    persist();
  },
  addMilestone(goalId: string, title: string) {
    const g = ensure().goals.find((x) => x.id === goalId);
    if (g) g.milestones.push({ id: uid(), title, done: false });
    persist();
  },
  // sessions
  addSession(s: Omit<StudySession, "id">) {
    ensure().sessions.push({ ...s, id: uid() });
    persist();
  },
  // chat
  addChatMessage(m: Omit<ChatMessage, "id" | "createdAt">) {
    ensure().chat.push({ ...m, id: uid(), createdAt: new Date().toISOString() });
    persist();
  },
  clearChat() {
    ensure().chat = [];
    persist();
  },
  resetDemo() {
    state = seed();
    persist();
  },
};

// --- selectors / helpers ---

export function courseById(id: string) {
  return ensure().courses.find((c) => c.id === id);
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  return Math.round((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function greetingFor(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
