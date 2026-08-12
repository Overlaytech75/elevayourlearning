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

export const STORAGE_KEY = "eleva:app:v2";

const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): AppState {
  return {
    user: { name: "" },
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
  user: { name: "" },
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
