import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingUp, Clock, GraduationCap, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Eleva" },
      { name: "description", content: "Insights into study time, spending, and momentum." },
      { property: "og:title", content: "Analytics · Analytics" },
      { property: "og:description", content: "See where your energy actually goes." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const sessions = useAppState((s) => s.sessions);
  const courses = useAppState((s) => s.courses);
  const assessments = useAppState((s) => s.assessments);
  const transactions = useAppState((s) => s.transactions);
  const tasks = useAppState((s) => s.tasks);
  const habits = useAppState((s) => s.habits);
  const goals = useAppState((s) => s.goals);

  const totalStudyMin = sessions.reduce((s, x) => s + x.minutes, 0);
  const avgFocus = sessions.length
    ? (sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length).toFixed(1)
    : "—";

  const graded = assessments.filter((a) => a.status === "graded" && a.grade != null);
  const gradeAvg = graded.length
    ? Math.round(graded.reduce((s, a) => s + (a.grade ?? 0), 0) / graded.length)
    : null;

  const completedTasks = tasks.filter((t) => t.done).length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Weekly study by day
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const mins = sessions.filter((s) => s.date.slice(0, 10) === key).reduce((s, x) => s + x.minutes, 0);
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }), mins };
    });
  }, [sessions]);
  const maxMin = Math.max(60, ...last7.map((d) => d.mins));

  // Study by course
  const byCourse = useMemo(() => {
    const m = new Map<string, number>();
    sessions.forEach((s) => {
      if (s.courseId) m.set(s.courseId, (m.get(s.courseId) ?? 0) + s.minutes);
    });
    return Array.from(m.entries())
      .map(([id, mins]) => ({ course: courses.find((c) => c.id === id), mins }))
      .filter((x) => x.course)
      .sort((a, b) => b.mins - a.mins);
  }, [sessions, courses]);

  // Spending trend last 4 weeks
  const spendTrend = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      const total = -transactions
        .filter((t) => t.amount < 0 && new Date(t.date) >= start && new Date(t.date) < end)
        .reduce((s, t) => s + t.amount, 0);
      return { label: i === 0 ? "This wk" : `${i}w ago`, total };
    }).reverse();
  }, [transactions]);
  const maxSpend = Math.max(50, ...spendTrend.map((s) => s.total));

  const habitScore = useMemo(() => {
    if (habits.length === 0) return 0;
    const days = 7;
    let hits = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      habits.forEach((h) => {
        if (h.completions.includes(key)) hits++;
      });
    }
    return Math.round((hits / (habits.length * days)) * 100);
  }, [habits]);

  const goalAvg = goals.length
    ? Math.round(goals.reduce((s, g) => s + Math.min(100, (g.current / Math.max(1, g.target)) * 100), 0) / goals.length)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Insights</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Analytics</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">A quiet look at where your energy actually goes.</p>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Study time" value={`${Math.round(totalStudyMin / 60)}h`} hint={`${sessions.length} sessions`} icon={<Clock className="h-4 w-4" />} />
        <Stat label="Avg focus" value={String(avgFocus)} hint="out of 5" icon={<TrendingUp className="h-4 w-4" />} />
        <Stat label="Grade avg" value={gradeAvg != null ? `${gradeAvg}%` : "—"} hint={`${graded.length} graded`} icon={<GraduationCap className="h-4 w-4" />} />
        <Stat label="Goal progress" value={`${goalAvg}%`} hint={`${goals.length} tracked`} icon={<Target className="h-4 w-4" />} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Study time · last 7 days</CardTitle>
            <p className="text-xs text-muted-foreground">Minutes per day</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-2">
              {last7.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-col items-center justify-end" style={{ height: 120 }}>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary transition-all"
                      style={{ height: `${(d.mins / maxMin) * 100}%`, minHeight: d.mins > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  <span className="text-[10px] tabular-nums font-medium">{d.mins}m</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Spending · last 4 weeks</CardTitle>
            <p className="text-xs text-muted-foreground">Weekly totals</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-3">
              {spendTrend.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-col items-center justify-end" style={{ height: 120 }}>
                    <div
                      className="w-full rounded-t-md bg-chart-2/70 transition-all"
                      style={{ height: `${(d.total / maxSpend) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                  <span className="text-[10px] tabular-nums font-medium">${d.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Study time by course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCourse.map(({ course, mins }) => {
              const pct = Math.round((mins / totalStudyMin) * 100);
              return (
                <div key={course!.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: course!.color }} />
                      <span className="font-medium">{course!.code}</span>
                      <span className="text-muted-foreground">{course!.name}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">{Math.round(mins / 60)}h · {pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
            {byCourse.length === 0 && <p className="text-sm text-muted-foreground">Log a study session to see this.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Momentum</CardTitle>
            <p className="text-xs text-muted-foreground">Habits + tasks</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Habit consistency · 7d</span>
                <span className="font-medium tabular-nums">{habitScore}%</span>
              </div>
              <Progress value={habitScore} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Task completion rate</span>
                <span className="font-medium tabular-nums">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. goal progress</span>
                <span className="font-medium tabular-nums">{goalAvg}%</span>
              </div>
              <Progress value={goalAvg} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
