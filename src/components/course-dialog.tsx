import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { actions, type Course, type Semester } from "@/lib/store";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const palette = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

export function CourseDialog({
  open, onOpenChange, semesters, defaultSemesterId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  semesters: Semester[];
  defaultSemesterId?: string;
}) {
  const [semesterName, setSemesterName] = useState("");
  const [form, setForm] = useState<Omit<Course, "id" | "semesterId">>({
    code: "",
    name: "",
    color: palette[0],
    credits: 6,
  });

  useEffect(() => {
    if (open) {
      const defaultName = defaultSemesterId ? semesters.find(s => s.id === defaultSemesterId)?.name : semesters[0]?.name;
      setSemesterName(defaultName ?? "");
      setForm({
        code: "", name: "", color: palette[Math.floor(Math.random() * palette.length)], credits: 6,
      });
    }
  }, [open, defaultSemesterId, semesters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">New course</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label>Semester</Label>
            <Input 
              list="semesters-list" 
              value={semesterName} 
              onChange={(e) => setSemesterName(e.target.value)} 
              placeholder="e.g. Fall 2026" 
            />
            <datalist id="semesters-list">
              {semesters.map((s) => (<option key={s.id} value={s.name} />))}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="COMP101" />
          </div>
          <div className="grid gap-2">
            <Label>Credits</Label>
            <Input type="number" value={form.credits ?? 0} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Intro to Programming" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="h-8 w-8 rounded-full ring-2 ring-transparent transition data-[active=true]:ring-ring"
                  data-active={form.color === c}
                  style={{ backgroundColor: c }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const name = semesterName.trim();
              let targetSemesterId = semesters.find(s => s.name.toLowerCase() === name.toLowerCase())?.id;
              
              if (!targetSemesterId) {
                targetSemesterId = actions.addSemester({
                  name,
                  startDate: new Date().toISOString(),
                  endDate: new Date().toISOString(),
                  active: true,
                });
              }

              actions.addCourse({ ...form, semesterId: targetSemesterId });
              onOpenChange(false);
            }}
            disabled={!form.code || !form.name || !semesterName.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
