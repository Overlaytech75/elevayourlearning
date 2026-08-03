import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AssessmentRow } from "@/components/assessment-row";
import { AssessmentDialog } from "@/components/assessment-dialog";
import { CourseDialog } from "@/components/course-dialog";
import { useAppState, actions, type Assessment } from "@/lib/store";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics · Eleva" },
      { name: "description", content: "Semesters, courses, and assessments in one clean workspace." },
      { property: "og:title", content: "Academics · Eleva" },
      { property: "og:description", content: "Track every assessment across every course, beautifully." },
    ],
  }),
  component: Academics,
});

function Academics() {
  const semesters = useAppState((s) => s.semesters);
  const courses = useAppState((s) => s.courses);
  const assessments = useAppState((s) => s.assessments);

  const [semesterId, setSemesterId] = useState<string>(semesters[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Assessment | null>(null);
  const [defaultCourseId, setDefaultCourseId] = useState<string | undefined>();

  const semesterCourses = useMemo(
    () => courses.filter((c) => (semesterId ? c.semesterId === semesterId : true)),
    [courses, semesterId],
  );
  const semesterCourseIds = new Set(semesterCourses.map((c) => c.id));
  const list = assessments
    .filter((a) => semesterCourseIds.has(a.courseId))
    .filter((a) => (q ? a.title.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  const openNew = (courseId?: string) => {
    setEditing(null);
    setDefaultCourseId(courseId);
    setDialogOpen(true);
  };
  const openEdit = (a: Assessment) => {
    setEditing(a);
    setDefaultCourseId(a.courseId);
    setDialogOpen(true);
  };

  const openStats = {
    total: list.length,
    graded: list.filter((a) => a.status === "graded").length,
    inProgress: list.filter((a) => a.status === "in_progress").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Academic workspace</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Academics</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Semesters, courses, and assessments — organized the way your mind actually works.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCourseDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Course
          </Button>
          <Button onClick={() => openNew()} className="gap-1.5">
            <Plus className="h-4 w-4" /> Assessment
          </Button>
        </div>
      </header>

      <Tabs value={semesterId} onValueChange={setSemesterId} className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList>
            {semesters.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="font-medium">
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span><b className="text-foreground">{openStats.total}</b> assessments</span>
            <span><b className="text-foreground">{openStats.inProgress}</b> in progress</span>
            <span><b className="text-foreground">{openStats.graded}</b> graded</span>
          </div>
        </div>

        {semesters.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Courses column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Courses
                  </h2>
                  <button
                    onClick={() => setCourseDialogOpen(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Add
                  </button>
                </div>
                {semesterCourses.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    No courses yet.
                  </div>
                )}
                {semesterCourses.map((c) => {
                  const count = assessments.filter((a) => a.courseId === c.id).length;
                  return (
                    <Card key={c.id} className="border-border/60 shadow-[var(--shadow-soft)]">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm font-semibold">{c.code}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.name}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">
                                {count} assessment{count === 1 ? "" : "s"}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openNew(c.id)}
                                  className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                                >
                                  + Add
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${c.code}? Its assessments will be removed.`))
                                      actions.deleteCourse(c.id);
                                  }}
                                  className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  aria-label="Delete course"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Assessments column */}
              <div>
                <Card className="border-border/60 shadow-[var(--shadow-soft)]">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <CardTitle className="font-display text-lg">Assessments</CardTitle>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search…"
                      className="ml-auto h-9 max-w-xs"
                    />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {list.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                        {q ? "No results." : "No assessments yet — add your first one."}
                      </div>
                    )}
                    {list.map((a) => (
                      <AssessmentRow
                        key={a.id}
                        assessment={a}
                        course={courses.find((c) => c.id === a.courseId)}
                        onClick={() => openEdit(a)}
                      />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <AssessmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courses={courses}
        editing={editing}
        defaultCourseId={defaultCourseId}
      />
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        semesters={semesters}
        defaultSemesterId={semesterId}
      />
    </div>
  );
}
