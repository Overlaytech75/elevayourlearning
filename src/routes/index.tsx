import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AssessmentRow } from "@/components/assessment-row";
import { AssessmentDialog } from "@/components/assessment-dialog";
import { useAppState, daysUntil, type Assessment } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today · Atlas" },
      { name: "description", content: "Your calm command center: today's classes, deadlines, and what to focus on next." },
      { property: "og:title", content: "Today · Atlas" },
      { property: "og:description", content: "Your calm command center: today's classes, deadlines, and what to focus on next." },
    ],
  }),
  component: Dashboard,
});

function greetingFor(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const user = useAppState((s) => s.user);
  const courses = useAppState((s) => s.courses);
  const assessments = useAppState((s) => s.assessments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Assessment | null>(null);

  const now = useMemo(() => new Date(), []);
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });


  const upcoming = useMemo(
    () =>
      [...assessments]
        .filter((a) => a.status !== "graded")
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
        .slice(0, 5),
    [assessments],
  );

  const dueToday = assessments.filter(
    (a) => daysUntil(a.dueDate) === 0 && a.status !== "graded",
  );
  const dueThisWeek = assessments.filter((a) => {
    const d = daysUntil(a.dueDate);
    return d >= 0 && d <= 7 && a.status !== "graded";
  });
  const overdue = assessments.filter(
    (a) => daysUntil(a.dueDate) < 0 && a.status !== "graded" && a.status !== "submitted",
  );

  const activeAssessments = assessments.filter((a) => a.status !== "graded");
  const avgProgress = activeAssessments.length
    ? Math.round(activeAssessments.reduce((s, a) => s + a.progress, 0) / activeAssessments.length)
    : 0;

  const gradedList = assessments.filter((a) => a.status === "graded" && a.grade != null);
  const gpaAvg = gradedList.length
    ? Math.round(gradedList.reduce((s, a) => s + (a.grade ?? 0), 0) / gradedList.length)
    : null;

  const nextUp = upcoming[0];
  const nextUpCourse = nextUp ? courses.find((c) => c.id === nextUp.courseId) : undefined;
  const nextUpDays = nextUp ? daysUntil(nextUp.dueDate) : null;

  const recommendation = useMemo(() => {
    if (overdue.length) {
      const a = overdue[0];
      const c = courses.find((x) => x.id === a.courseId);
      return {
        title: "Catch up on overdue work",
        body: `"${a.title}" for ${c?.code ?? "your course"} is overdue. Block 1 focused hour today to reset the trajectory.`,
        prompt: `I'm behind on "${a.title}" for ${c?.code ?? "my course"}. Help me build a recovery plan for the next 3 days.`,
      };
    }
    if (dueToday.length) {
      const a = dueToday[0];
      return {
        title: "Finish today's priority",
        body: `"${a.title}" is due today (${a.weight}% weight). Aim for a first pass before noon so the afternoon is polish, not panic.`,
        prompt: `"${a.title}" is due today. Coach me through finishing it well without burning out.`,
      };
    }
    if (upcoming[0]) {
      const a = upcoming[0];
      const d = daysUntil(a.dueDate);
      return {
        title: `Start "${a.title}" today`,
        body: `It's due in ${d} day${d === 1 ? "" : "s"} and worth ${a.weight}%. Working ${Math.max(1, Math.round(a.estimatedHours / Math.max(1, d)))}h/day gets you there without a crunch.`,
        prompt: `Plan the next ${Math.max(1, d)} days for "${a.title}" — what should I do each day?`,
      };
    }
    return {
      title: "You're all clear",
      body: "No pressing deadlines — great time to review notes or start a stretch project.",
      prompt: "I'm caught up. Suggest one high-leverage thing I could do today.",
    };
  }, [overdue, dueToday, upcoming, courses]);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a: Assessment) => { setEditing(a); setDialogOpen(true); };

  const totalWeekHours = dueThisWeek.reduce((s, a) => s + Math.max(a.estimatedHours - a.actualHours, 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          {/* Decorative glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-70"
            style={{ background: "radial-gradient(closest-side, oklch(0.60 0.19 258 / 0.18), transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full opacity-60"
            style={{ background: "radial-gradient(closest-side, oklch(0.65 0.20 320 / 0.16), transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(to right, oklch(0.60 0.19 258 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.60 0.19 258 / 0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {today}
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {greetingFor()},{" "}
                <span
                  className="bg-gradient-to-r from-primary via-chart-4 to-chart-3 bg-clip-text text-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                >
                  {user.name}
                </span>
                .
              </h1>
              <p className="mt-3 max-w-xl text-muted-foreground">
                {activeAssessments.length
                  ? `${activeAssessments.length} open assessment${activeAssessments.length === 1 ? "" : "s"} · ${dueThisWeek.length} due this week${overdue.length ? ` · ${overdue.length} overdue` : ""}.`
                  : "Nothing on the board — a great day to get ahead."}
              </p>
            </div>

            {nextUp && (
              <Link
                to="/academics"
                className="group relative flex min-w-[240px] shrink-0 items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Next up</p>
                  <p className="mt-1 truncate font-medium text-foreground">{nextUp.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {nextUpCourse?.code ?? ""} · {nextUp.weight}%
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`font-display text-2xl font-semibold tabular-nums ${
                      nextUpDays! < 0
                        ? "text-destructive"
                        : nextUpDays! <= 2
                        ? "text-warning"
                        : "text-foreground"
                    }`}
                  >
                    {nextUpDays! < 0 ? `${Math.abs(nextUpDays!)}` : nextUpDays}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {nextUpDays! < 0 ? "days late" : nextUpDays === 0 ? "today" : "days"}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Due today" value={String(dueToday.length)} icon={<Flame className="h-4 w-4" />}
          tone={dueToday.length ? "warning" : "default"}
          hint={dueToday.length ? "Ship these first" : "Nothing due today"} />
        <StatCard label="This week" value={String(dueThisWeek.length)} icon={<CalendarClock className="h-4 w-4" />}
          hint={overdue.length ? `${overdue.length} overdue` : "On schedule"}
          tone={overdue.length ? "danger" : "default"} />
        <StatCard label="Active courses" value={String(courses.length)} icon={<BookOpen className="h-4 w-4" />}
          hint="This semester" />
        <RingStatCard label="Avg. progress" value={avgProgress} hint={gpaAvg != null ? `Grade avg ${gpaAvg}%` : "Across open work"} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming */}
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-lg">Up next</CardTitle>
              <p className="text-sm text-muted-foreground">Ordered by due date</p>
            </div>
            <Button size="sm" onClick={openNew} className="gap-1.5">
              <Sparkles className="h-4 w-4" /> New assessment
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                Nothing on deck. Add an assessment to see it here.
              </div>
            )}
            {upcoming.map((a) => (
              <AssessmentRow key={a.id} assessment={a} course={courses.find((c) => c.id === a.courseId)} onClick={() => openEdit(a)} />
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link to="/academics">See all in Academics <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Featured AI recommendation */}
          <Card
            className="relative overflow-hidden border-0 text-primary-foreground shadow-[var(--shadow-elevated)]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.19 258), oklch(0.60 0.20 300) 55%, oklch(0.65 0.20 320))",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60"
              style={{ background: "radial-gradient(closest-side, white, transparent)" }}
            />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="font-display text-base text-white">AI recommendation</CardTitle>
                  <p className="text-xs text-white/80">Personalized for today</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-semibold text-white">{recommendation.title}</p>
              <p className="text-sm leading-relaxed text-white/90">{recommendation.body}</p>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="mt-1 bg-white/95 text-foreground hover:bg-white"
              >
                <Link to="/mentor" search={{ q: recommendation.prompt }}>
                  Ask mentor about this <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base">Semester progress</CardTitle>
              <p className="text-xs text-muted-foreground">Done · in progress · not started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((c) => {
                const list = assessments.filter((a) => a.courseId === c.id);
                const total = list.length || 1;
                const done = list.filter((a) => a.status === "graded" || a.status === "submitted").length;
                const inProg = list.filter((a) => a.status === "in_progress").length;
                const notStarted = Math.max(total - done - inProg, 0);
                const pct = list.length ? Math.round((done / list.length) * 100) : 0;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-foreground">{c.code}</span>
                        <span className="truncate text-muted-foreground">{c.name}</span>
                      </div>
                      <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted">
                      <div style={{ width: `${(done / total) * 100}%`, backgroundColor: c.color }} />
                      <div style={{ width: `${(inProg / total) * 100}%`, backgroundColor: c.color, opacity: 0.45 }} />
                      <div style={{ width: `${(notStarted / total) * 100}%` }} className="bg-transparent" />
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Focus today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <FocusTile icon={<Flame className="h-4 w-4" />} label="Streak" value="5d" tone="warning" />
                <FocusTile icon={<CalendarClock className="h-4 w-4" />} label="Deep work" value="2×90" />
                <FocusTile icon={<TrendingUp className="h-4 w-4" />} label="Left" value={`${totalWeekHours}h`} />
              </div>
              <div className="pt-4">
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" /> On track this semester
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssessmentDialog open={dialogOpen} onOpenChange={setDialogOpen} courses={courses} editing={editing} />
    </div>
  );
}

function StatCard({
  label, value, hint, icon, tone = "default",
}: {
  label: string; value: string; hint?: string; icon: React.ReactNode; tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning/10 text-warning-foreground"
      : tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : "bg-primary/10 text-primary";
  const accent =
    tone === "warning" ? "before:bg-warning" : tone === "danger" ? "before:bg-destructive" : "before:bg-primary";
  return (
    <Card
      className={`relative overflow-hidden border-border/60 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 ${accent}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClass}`}>{icon}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function RingStatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <Card className="relative overflow-hidden border-border/60 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-chart-4">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
            <circle
              cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700"
              strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-semibold tabular-nums">
            {value}%
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FocusTile({
  icon, label, value, tone = "default",
}: { icon: React.ReactNode; label: string; value: string; tone?: "default" | "warning" }) {
  const toneClass = tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${toneClass}`}>{icon}</span>
      <p className="mt-2 font-display text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
