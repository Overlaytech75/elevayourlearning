import { useEffect, useRef, useState } from "react";

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface GpaCourse {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Gamification {
  xp: number;
  pomodorosToday: number;
  pomodoroDate: string; // YYYY-MM-DD
  studyDays: string[]; // YYYY-MM-DD
  badges: string[];
}

export interface StudyState {
  notes: Note[];
  decks: Deck[];
  gpa: GpaCourse[];
  game: Gamification;
}

const KEY = "atlas:study:v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);

export const BADGES: { id: string; label: string; hint: string; at: number }[] = [
  { id: "spark", label: "First Spark", hint: "Earn 50 XP", at: 50 },
  { id: "focused", label: "Focused", hint: "Earn 250 XP", at: 250 },
  { id: "scholar", label: "Scholar", hint: "Earn 750 XP", at: 750 },
  { id: "relentless", label: "Relentless", hint: "Earn 2000 XP", at: 2000 },
];

function seed(): StudyState {
  return {
    notes: [
      {
        id: uid(),
        title: "Databases — normalization",
        body: "## 3NF checklist\n\n- No repeating groups\n- Every non-key column depends on **the key**\n- No transitive dependencies\n\n> Rule of thumb: the key, the whole key, and nothing but the key.",
        tag: "COMP206",
        updatedAt: new Date().toISOString(),
      },
    ],
    decks: [
      {
        id: uid(),
        name: "Networking basics",
        createdAt: new Date().toISOString(),
        cards: [
          { id: uid(), front: "What does TCP guarantee?", back: "Ordered, reliable, error-checked delivery via acknowledgements and retransmission.", known: false },
          { id: uid(), front: "Default subnet mask for /24", back: "255.255.255.0 — 254 usable hosts.", known: false },
          { id: uid(), front: "UDP vs TCP in one line", back: "UDP is fire-and-forget and fast; TCP is connection-oriented and reliable.", known: false },
        ],
      },
    ],
    gpa: [
      { id: uid(), name: "COMP101", credits: 6, grade: "A" },
      { id: uid(), name: "COMP206", credits: 6, grade: "B+" },
    ],
    game: { xp: 120, pomodorosToday: 0, pomodoroDate: todayKey(), studyDays: [], badges: [] },
  };
}

let state: StudyState | null = null;
const listeners = new Set<() => void>();

const EMPTY: StudyState = {
  notes: [],
  decks: [],
  gpa: [],
  game: { xp: 0, pomodorosToday: 0, pomodoroDate: todayKey(), studyDays: [], badges: [] },
};

function load(): StudyState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    return { ...seed(), ...parsed } as StudyState;
  } catch {
    return seed();
  }
}

function ensure(): StudyState {
  if (!state) state = load();
  if (state.game.pomodoroDate !== todayKey()) {
    state.game.pomodoroDate = todayKey();
    state.game.pomodorosToday = 0;
  }
  return state;
}

function persist() {
  if (typeof window !== "undefined" && state) {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function useStudyState<T>(selector: (s: StudyState) => T): T {
  const [snap, setSnap] = useState<{ v: number; value: T }>(() => ({ v: 0, value: selector(EMPTY) }));
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  useEffect(() => {
    const update = () => setSnap((prev) => ({ v: prev.v + 1, value: selectorRef.current(ensure()) }));
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);
  return snap.value;
}


export const GRADE_POINTS: Record<string, number> = {
  "A+": 4, A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7,
  "C+": 2.3, C: 2, "C-": 1.7, "D+": 1.3, D: 1, F: 0,
};

export function computeGpa(rows: GpaCourse[]) {
  const valid = rows.filter((r) => r.credits > 0 && r.grade in GRADE_POINTS);
  const credits = valid.reduce((s, r) => s + r.credits, 0);
  if (!credits) return { gpa: 0, credits: 0 };
  const points = valid.reduce((s, r) => s + GRADE_POINTS[r.grade] * r.credits, 0);
  return { gpa: Math.round((points / credits) * 100) / 100, credits };
}

export function currentStreak(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  // allow today to be missing without breaking a streak built yesterday
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  const into = xp % 250;
  return { level, into, next: 250, pct: Math.round((into / 250) * 100) };
}

export const studyActions = {
  awardXp(amount: number) {
    const s = ensure();
    s.game.xp += amount;
    const day = todayKey();
    if (!s.game.studyDays.includes(day)) s.game.studyDays.push(day);
    for (const b of BADGES) {
      if (s.game.xp >= b.at && !s.game.badges.includes(b.id)) s.game.badges.push(b.id);
    }
    persist();
  },
  completePomodoro() {
    const s = ensure();
    s.game.pomodorosToday += 1;
    persist();
    studyActions.awardXp(25);
  },
  addNote(note: Omit<Note, "id" | "updatedAt">) {
    ensure().notes.unshift({ ...note, id: uid(), updatedAt: new Date().toISOString() });
    persist();
  },
  updateNote(id: string, patch: Partial<Note>) {
    const n = ensure().notes.find((x) => x.id === id);
    if (n) Object.assign(n, patch, { updatedAt: new Date().toISOString() });
    persist();
  },
  deleteNote(id: string) {
    const s = ensure();
    s.notes = s.notes.filter((n) => n.id !== id);
    persist();
  },
  addDeck(name: string, cards: { front: string; back: string }[]) {
    ensure().decks.unshift({
      id: uid(),
      name,
      createdAt: new Date().toISOString(),
      cards: cards.map((c) => ({ ...c, id: uid(), known: false })),
    });
    persist();
  },
  deleteDeck(id: string) {
    const s = ensure();
    s.decks = s.decks.filter((d) => d.id !== id);
    persist();
  },
  toggleCardKnown(deckId: string, cardId: string) {
    const c = ensure().decks.find((d) => d.id === deckId)?.cards.find((x) => x.id === cardId);
    if (c) c.known = !c.known;
    persist();
  },
  addGpaRow() {
    ensure().gpa.push({ id: uid(), name: "New course", credits: 3, grade: "A" });
    persist();
  },
  updateGpaRow(id: string, patch: Partial<GpaCourse>) {
    const r = ensure().gpa.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
    persist();
  },
  deleteGpaRow(id: string) {
    const s = ensure();
    s.gpa = s.gpa.filter((r) => r.id !== id);
    persist();
  },
};
