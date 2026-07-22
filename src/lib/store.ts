import { useEffect, useState } from "react";

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

export interface AppState {
  user: { name: string };
  semesters: Semester[];
  courses: Course[];
  assessments: Assessment[];
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
    return JSON.parse(raw) as AppState;
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
};

export function useAppState<T>(selector: (s: AppState) => T): T {
  const [value, setValue] = useState<T>(() => selector(EMPTY_STATE));

  useEffect(() => {
    setValue(selector(ensure()));
    const l = () => setValue(selector(ensure()));
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
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
