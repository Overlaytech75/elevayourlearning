import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentRow } from "@/components/assessment-row";
import { AssessmentDialog } from "@/components/assessment-dialog";
import { useAppState, daysUntil, type Assessment } from "@/lib/store";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline · Eleva" },
      { name: "description", content: "See every deadline across today, this week, this month and the rest of the semester." },
      { property: "og:title", content: "Timeline · Eleva" },
      { property: "og:description", content: "Deadlines at a glance." },
    ],
  }),
  component: Timeline,
});

type Bucket = { key: string; label: string; description: string; match: (d: number) => boolean };

const buckets: Bucket[] = [
  { key: "overdue", label: "Overdue", description: "Handle first", match: (d) => d < 0 },
  { key: "today", label: "Today", description: "Ship it", match: (d) => d === 0 },
  { key: "tomorrow", label: "Tomorrow", description: "Prep tonight", match: (d) => d === 1 },
  { key: "week", label: "This week", description: "Next 7 days", match: (d) => d >= 2 && d <= 7 },
  { key: "next_week", label: "Next week", description: "Days 8–14", match: (d) => d >= 8 && d <= 14 },
  { key: "month", label: "This month", description: "Days 15–30", match: (d) => d >= 15 && d <= 30 },
  { key: "later", label: "End of semester", description: "31+ days", match: (d) => d > 30 },
];

function Timeline() {
  const assessments = useAppState((s) => s.assessments);
  const courses = useAppState((s) => s.courses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Assessment | null>(null);

  const grouped = useMemo(() => {
    const active = assessments.filter((a) => a.status !== "graded");
    return buckets.map((b) => ({
      ...b,
      items: active
        .filter((a) => {
          const d = daysUntil(a.dueDate);
          if (b.key === "overdue") return d < 0 && a.status !== "submitted";
          return b.match(d);
        })
        .sort((a, b2) => +new Date(a.dueDate) - +new Date(b2.dueDate)),
    }));
  }, [assessments]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">The road ahead</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Timeline</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every deadline, grouped by how much runway you have left.
        </p>
      </header>

      <div className="relative">
        {/* Vertical line */}
        <div aria-hidden className="pointer-events-none absolute left-4 top-2 bottom-2 w-px bg-border/70 sm:left-6" />

        <div className="space-y-8">
          {grouped.map((b) => (
            <section key={b.key} className="relative pl-10 sm:pl-14">
              <span
                aria-hidden
                className="absolute left-2.5 top-1.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-background ring-2 ring-primary sm:left-6"
              />
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">{b.label}</h2>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {b.items.length} item{b.items.length === 1 ? "" : "s"}
                </span>
              </div>
              {b.items.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-transparent shadow-none">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Nothing here — enjoy the breathing room.
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/60 shadow-[var(--shadow-soft)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="sr-only">{b.label} assessments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {b.items.map((a) => (
                      <AssessmentRow
                        key={a.id}
                        assessment={a}
                        course={courses.find((c) => c.id === a.courseId)}
                        onClick={() => {
                          setEditing(a);
                          setDialogOpen(true);
                        }}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>
          ))}
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
