import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { actions, type Assessment, type Course } from "@/lib/store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courses: Course[];
  editing?: Assessment | null;
  defaultCourseId?: string;
};

const empty = (defaultCourseId?: string): Omit<Assessment, "id"> => ({
  courseId: defaultCourseId ?? "",
  title: "",
  type: "Assignment",
  weight: 10,
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  status: "not_started",
  priority: "medium",
  estimatedHours: 4,
  actualHours: 0,
  difficulty: 3,
  progress: 0,
  notes: "",
  grade: null,
});

export function AssessmentDialog({ open, onOpenChange, courses, editing, defaultCourseId }: Props) {
  const [form, setForm] = useState<Omit<Assessment, "id">>(empty(defaultCourseId));

  useEffect(() => {
    if (open) {
      if (editing) {
        const { id: _id, ...rest } = editing;
        setForm({ ...rest, dueDate: rest.dueDate.slice(0, 10) });
      } else {
        setForm(empty(defaultCourseId ?? courses[0]?.id));
      }
    }
  }, [open, editing, defaultCourseId, courses]);

  const save = () => {
    const payload = { ...form, dueDate: new Date(form.dueDate).toISOString() };
    if (editing) actions.updateAssessment(editing.id, payload);
    else actions.addAssessment(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Edit assessment" : "New assessment"}
          </DialogTitle>
          <DialogDescription>
            Track everything that matters: weight, due date, effort, and grade.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 grid gap-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Database Assignment 2"
            />
          </div>

          <div className="grid gap-2">
            <Label>Course</Label>
            <Select
              value={form.courseId}
              onValueChange={(v) => setForm({ ...form, courseId: v })}
            >
              <SelectTrigger><SelectValue placeholder="Pick a course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Assignment", "Quiz", "Exam", "Lab", "Project", "Presentation"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Weight (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm({ ...form, priority: v as Assessment["priority"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as Assessment["status"] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Estimated hours</Label>
            <Input
              type="number"
              min={0}
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Actual hours</Label>
            <Input
              type="number"
              min={0}
              value={form.actualHours}
              onChange={(e) => setForm({ ...form, actualHours: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className="text-sm text-muted-foreground">{form.progress}%</span>
            </div>
            <Slider
              value={[form.progress]}
              onValueChange={(v) => setForm({ ...form, progress: v[0] })}
              max={100}
              step={5}
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Difficulty</Label>
              <span className="text-sm text-muted-foreground">{form.difficulty} / 5</span>
            </div>
            <Slider
              value={[form.difficulty]}
              onValueChange={(v) => setForm({ ...form, difficulty: v[0] })}
              min={1}
              max={5}
              step={1}
            />
          </div>

          {form.status === "graded" && (
            <div className="grid gap-2">
              <Label>Grade (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.grade ?? ""}
                onChange={(e) =>
                  setForm({ ...form, grade: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          )}

          <div className="grid gap-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Rubric, sources, reflections…"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {editing && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={() => {
                actions.deleteAssessment(editing.id);
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.title || !form.courseId}>
            {editing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
