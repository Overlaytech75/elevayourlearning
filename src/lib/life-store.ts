import { useEffect, useRef, useState } from "react";

export interface VisaInfo {
  country: string;
  subclass: string;
  expiry: string; // ISO date
  coeProvider: string;
  coeEnd: string; // ISO date
  oshcProvider: string;
  oshcExpiry: string; // ISO date
  tfn: string; // masked/last digits or note
  workLimitHoursPerFortnight: number;
}

export interface WorkShift {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  employer: string;
}

export interface TuitionPayment {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

export interface DocItem {
  id: string;
  name: string;
  category: "Visa" | "Enrolment" | "Health" | "Finance" | "Identity" | "Other";
  have: boolean;
  expiry?: string;
  note?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  status: "researching" | "applied" | "shortlisted" | "awarded" | "rejected";
  link?: string;
}

export interface JobApplication {
  id: string;
  role: string;
  company: string;
  type: "internship" | "graduate" | "part_time" | "casual";
  appliedOn: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  link?: string;
  notes?: string;
}

export interface CareerAsset {
  id: string;
  kind: "resume" | "portfolio" | "certificate" | "linkedin";
  title: string;
  detail: string;
  url?: string;
  updatedAt: string;
}

export interface LifeState {
  visa: VisaInfo;
  shifts: WorkShift[];
  tuition: TuitionPayment[];
  documents: DocItem[];
  scholarships: Scholarship[];
  jobs: JobApplication[];
  career: CareerAsset[];
}

const KEY = "eleva:life:v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

function seed(): LifeState {
  return {
    visa: {
      country: "Australia",
      subclass: "500 — Student",
      expiry: iso(420),
      coeProvider: "University of Melbourne",
      coeEnd: iso(400),
      oshcProvider: "Medibank OSHC",
      oshcExpiry: iso(180),
      tfn: "Registered",
      workLimitHoursPerFortnight: 48,
    },
    shifts: [
      { id: uid(), date: iso(-2), hours: 6, employer: "Campus Cafe" },
      { id: uid(), date: iso(-5), hours: 8, employer: "Campus Cafe" },
      { id: uid(), date: iso(-9), hours: 7.5, employer: "Retail Co" },
    ],
    tuition: [
      { id: uid(), label: "Semester 2 — instalment 1", amount: 8200, dueDate: iso(21), paid: false },
      { id: uid(), label: "Semester 2 — instalment 2", amount: 8200, dueDate: iso(120), paid: false },
      { id: uid(), label: "Semester 1 — final", amount: 7900, dueDate: iso(-95), paid: true },
    ],
    documents: [
      { id: uid(), name: "Passport", category: "Identity", have: true, expiry: iso(900) },
      { id: uid(), name: "Visa grant notice", category: "Visa", have: true, expiry: iso(420) },
      { id: uid(), name: "Confirmation of Enrolment (CoE)", category: "Enrolment", have: true, expiry: iso(400) },
      { id: uid(), name: "OSHC policy card", category: "Health", have: true, expiry: iso(180) },
      { id: uid(), name: "Tax File Number letter", category: "Finance", have: false },
      { id: uid(), name: "Bank statement (last 3 months)", category: "Finance", have: false },
      { id: uid(), name: "Academic transcript", category: "Enrolment", have: true },
    ],
    scholarships: [
      { id: uid(), name: "Global Excellence Award", provider: "University", amount: 5000, deadline: iso(25), status: "researching" },
      { id: uid(), name: "STEM Futures Grant", provider: "Industry body", amount: 3000, deadline: iso(48), status: "applied" },
    ],
    jobs: [
      { id: uid(), role: "Software Engineering Intern", company: "Atlassian", type: "internship", appliedOn: iso(-10), status: "applied" },
      { id: uid(), role: "Graduate Data Analyst", company: "Telstra", type: "graduate", appliedOn: iso(-3), status: "saved" },
    ],
    career: [
      { id: uid(), kind: "resume", title: "Master resume", detail: "1 page, tailored per role. Quantify every bullet.", updatedAt: new Date().toISOString() },
      { id: uid(), kind: "linkedin", title: "LinkedIn headline", detail: "CS student · Building data tools · Seeking 2027 internships", updatedAt: new Date().toISOString() },
    ],
  };
}

const EMPTY: LifeState = {
  visa: {
    country: "",
    subclass: "",
    expiry: "",
    coeProvider: "",
    coeEnd: "",
    oshcProvider: "",
    oshcExpiry: "",
    tfn: "",
    workLimitHoursPerFortnight: 48,
  },
  shifts: [],
  tuition: [],
  documents: [],
  scholarships: [],
  jobs: [],
  career: [],
};

let state: LifeState | null = null;
const listeners = new Set<() => void>();

function load(): LifeState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return { ...seed(), ...(JSON.parse(raw) as Partial<LifeState>) } as LifeState;
  } catch {
    return seed();
  }
}

function ensure(): LifeState {
  if (!state) state = load();
  return state;
}

function persist() {
  if (typeof window !== "undefined" && state) {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export function useLifeState<T>(selector: (s: LifeState) => T): T {
  const [value, setValue] = useState<T>(() => selector(EMPTY));
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

export function daysLeft(isoDate: string): number {
  if (!isoDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const then = new Date(isoDate);
  then.setHours(0, 0, 0, 0);
  return Math.round((+then - +now) / 86400000);
}

/** Hours worked in the current fortnight window (last 14 days including today). */
export function fortnightHours(shifts: WorkShift[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 13);
  return shifts
    .filter((s) => new Date(s.date) >= start)
    .reduce((sum, s) => sum + s.hours, 0);
}

export const COUNTRY_RESOURCES: Record<string, { label: string; note: string }[]> = {
  Australia: [
    { label: "Home Affairs — visa conditions (VEVO)", note: "Check work rights and conditions attached to subclass 500." },
    { label: "ATO — Tax file number & returns", note: "Lodge between 1 July and 31 October each year." },
    { label: "Fair Work Ombudsman", note: "Minimum wage, payslips, and unpaid-work rules for students." },
    { label: "Study Australia", note: "Official support, accommodation, and wellbeing services." },
  ],
  Canada: [
    { label: "IRCC — study permit conditions", note: "Off-campus work hours and co-op work permits." },
    { label: "CRA — international student taxes", note: "File a return even with low income to claim credits." },
  ],
  "United Kingdom": [
    { label: "UKVI — Student route", note: "Term-time work limits and BRP validity." },
    { label: "HMRC — student tax", note: "Personal allowance and reclaiming overpaid tax." },
  ],
  "United States": [
    { label: "SEVP — F-1 status", note: "On-campus work, CPT and OPT eligibility." },
    { label: "IRS — Form 8843", note: "Required each year, even with no income." },
  ],
};

export const lifeActions = {
  updateVisa(patch: Partial<VisaInfo>) {
    Object.assign(ensure().visa, patch);
    persist();
  },
  addShift(s: Omit<WorkShift, "id">) {
    ensure().shifts.unshift({ ...s, id: uid() });
    persist();
  },
  deleteShift(id: string) {
    const s = ensure();
    s.shifts = s.shifts.filter((x) => x.id !== id);
    persist();
  },
  addTuition(t: Omit<TuitionPayment, "id">) {
    ensure().tuition.push({ ...t, id: uid() });
    persist();
  },
  toggleTuition(id: string) {
    const t = ensure().tuition.find((x) => x.id === id);
    if (t) t.paid = !t.paid;
    persist();
  },
  deleteTuition(id: string) {
    const s = ensure();
    s.tuition = s.tuition.filter((x) => x.id !== id);
    persist();
  },
  addDocument(d: Omit<DocItem, "id">) {
    ensure().documents.push({ ...d, id: uid() });
    persist();
  },
  toggleDocument(id: string) {
    const d = ensure().documents.find((x) => x.id === id);
    if (d) d.have = !d.have;
    persist();
  },
  deleteDocument(id: string) {
    const s = ensure();
    s.documents = s.documents.filter((x) => x.id !== id);
    persist();
  },
  addScholarship(s: Omit<Scholarship, "id">) {
    ensure().scholarships.push({ ...s, id: uid() });
    persist();
  },
  updateScholarship(id: string, patch: Partial<Scholarship>) {
    const s = ensure().scholarships.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
    persist();
  },
  deleteScholarship(id: string) {
    const s = ensure();
    s.scholarships = s.scholarships.filter((x) => x.id !== id);
    persist();
  },
  addJob(j: Omit<JobApplication, "id">) {
    ensure().jobs.unshift({ ...j, id: uid() });
    persist();
  },
  updateJob(id: string, patch: Partial<JobApplication>) {
    const j = ensure().jobs.find((x) => x.id === id);
    if (j) Object.assign(j, patch);
    persist();
  },
  deleteJob(id: string) {
    const s = ensure();
    s.jobs = s.jobs.filter((x) => x.id !== id);
    persist();
  },
  addCareerAsset(a: Omit<CareerAsset, "id" | "updatedAt">) {
    ensure().career.unshift({ ...a, id: uid(), updatedAt: new Date().toISOString() });
    persist();
  },
  updateCareerAsset(id: string, patch: Partial<CareerAsset>) {
    const a = ensure().career.find((x) => x.id === id);
    if (a) Object.assign(a, patch, { updatedAt: new Date().toISOString() });
    persist();
  },
  deleteCareerAsset(id: string) {
    const s = ensure();
    s.career = s.career.filter((x) => x.id !== id);
    persist();
  },
};
