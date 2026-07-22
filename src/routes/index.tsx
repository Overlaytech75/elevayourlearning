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
      { property: "og:description", content: "Your calm command center for a great study day." },
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
  const today = now.toLocaleDateString(undefined, {
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

  // Simple AI-flavored recommendation
  const recommendation = useMemo(() => {
    if (overdue.length) {
      const a = overdue[0];
      const c = courses.find((x) => x.id === a.courseId);
      return {
        title: "Catch up on overdue work",
        body: `“${a.title}” for ${c?.code ?? "your course"} is overdue. Block 1 focused hour today to reset the trajectory.`,
      };
    }
    if (dueToday.length) {
      const a = dueToday[0];
      return {
        title: "Finish today's priority",
        body: `“${a.title}” is due today (${a.weight}% weight). Aim for a first pass before noon so the afternoon is polish, not panic.`,
      };
    }
    if (upcoming[0]) {
      const a = upcoming[0];
      const d = daysUntil(a.dueDate);
      return {
        title: `Start "${a.title}" today`,
        body: `It's due in ${d} day${d === 1 ? "" : "s"} and worth ${a.weight}%. Working ${Math.max(1, Math.round(a.estimatedHours / Math.max(1, d)))}h/day gets you there without a crunch.`,
      };
    }
    return { title: "You're all clear", body: "No pressing deadlines — great time to review notes or start a stretch project." };
  }, [overdue, dueToday, upcoming, courses]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (a: Assessment) => {
    setEditing(a);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero greeting */}
      <section className="mb-8">
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {greetingFor()}, <span className="text-primary">{user.name}</span>.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {activeAssessments.length
            ? `You have ${activeAssessments.length} open assessment${activeAssessments.length === 1 ? "" : "s"}. ${dueThisWeek.length} due this week.`
            : "Nothing on the board — a great day to get ahead."}
        </p>
      </section>

      {/* Stat strip */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Due today"
          value={String(dueToday.length)}
          icon={<Flame className="h-4 w-4" />}
          tone={dueToday.length ? "warning" : "default"}
          hint={dueToday.length ? "Ship these first" : "Nothing due today"}
        />
        <StatCard
          label="This week"
          value={String(dueThisWeek.length)}
          icon={<CalendarClock className="h-4 w-4" />}
          hint={overdue.length ? `${overdue.length} overdue` : "On schedule"}
          tone={overdue.length ? "danger" : "default"}
        />
        <StatCard
          label="Active courses"
          value={String(courses.length)}
          icon={<BookOpen className="h-4 w-4" />}
          hint="This semester"
        />
        <StatCard
          label="Avg. progress"
          value={`${avgProgress}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          hint={gpaAvg != null ? `Grade avg ${gpaAvg}%` : "Across open work"}
        />
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
              <AssessmentRow
                key={a.id}
                assessment={a}
                course={courses.find((c) => c.id === a.courseId)}
                onClick={() => openEdit(a)}
              />
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link to="/academics">
                  See all in Academics <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden border-border/60 shadow-[var(--shadow-soft)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-70"
              style={{ background: "radial-gradient(closest-side, oklch(0.60 0.19 258 / 0.18), transparent)" }}
            />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">AI recommendation</CardTitle>
                  <p className="text-xs text-muted-foreground">Personalized for today</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-foreground">{recommendation.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.body}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base">Semester progress</CardTitle>
              <p className="text-xs text-muted-foreground">Weighted by assessments</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((c) => {
                const list = assessments.filter((a) => a.courseId === c.id);
                const done = list.filter((a) => a.status === "graded" || a.status === "submitted").length;
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
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {courses.length === 0 && (
                <p className="text-sm text-muted-foreground">No courses yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Focus today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FocusLine label="Deep work blocks" value="2 × 90m" />
              <FocusLine label="Estimated study" value={`${dueThisWeek.reduce((s, a) => s + Math.max(a.estimatedHours - a.actualHours, 0), 0)}h remaining this week`} />
              <FocusLine label="Streak" value="5 days" />
              <div className="pt-2">
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" /> On track this semester
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssessmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courses={courses}
        editing={editing}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning/10 text-warning-foreground"
      : tone === "danger"
      ? "bg-destructive/10 text-destructive"
      : "bg-primary/10 text-primary";

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
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

function FocusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
