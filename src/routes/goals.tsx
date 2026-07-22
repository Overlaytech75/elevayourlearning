import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Trash2, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState, actions, daysUntil, type Goal } from "@/lib/store";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals · Atlas" },
      { name: "description", content: "Set direction with meaningful goals and milestones." },
      { property: "og:title", content: "Goals · Atlas" },
      { property: "og:description", content: "North stars and next milestones." },
    ],
  }),
  component: GoalsPage,
});

const CATEGORIES: Goal["category"][] = ["academic", "finance", "health", "personal", "career"];
const CATEGORY_TONE: Record<Goal["category"], string> = {
  academic: "bg-chart-1/15 text-chart-1",
  finance: "bg-chart-2/15 text-chart-2",
  health: "bg-chart-3/15 text-chart-3",
  personal: "bg-chart-4/15 text-chart-4",
  career: "bg-chart-5/15 text-chart-5",
};

function GoalsPage() {
  const goals = useAppState((s) => s.goals);
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Direction</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Goals</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Your compass, quantified.</p>
        </div>
        <GoalDialog open={open} onOpenChange={setOpen} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100));
          const d = daysUntil(g.deadline);
          const doneMs = g.milestones.filter((m) => m.done).length;
          return (
            <Card key={g.id} className="border-border/60 shadow-[var(--shadow-soft)]">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${CATEGORY_TONE[g.category]}`}>
                      {g.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {d >= 0 ? `${d}d left` : `${-d}d overdue`}
                    </span>
                  </div>
                  <CardTitle className="font-display text-lg truncate">{g.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => actions.deleteGoal(g.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="tabular-nums font-medium">
                      {g.current} <span className="text-muted-foreground">/ {g.target} {g.unit}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={g.current}
                    className="h-8 w-24"
                    onBlur={(e) => {
                      const n = parseFloat(e.target.value);
                      if (!isNaN(n) && n !== g.current) actions.updateGoal(g.id, { current: n });
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Update progress</span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Milestones</p>
                    <Badge variant="secondary" className="text-[10px]">{doneMs}/{g.milestones.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {g.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => actions.toggleMilestone(g.id, m.id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/50"
                      >
                        <span className={`flex h-4 w-4 items-center justify-center rounded border ${m.done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                          {m.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className={m.done ? "line-through text-muted-foreground" : "text-foreground"}>{m.title}</span>
                      </button>
                    ))}
                    <AddMilestone goalId={g.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No goals yet. Set one to point somewhere.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddMilestone({ goalId }: { goalId: string }) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center gap-1 pt-1">
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Add milestone"
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            actions.addMilestone(goalId, v.trim());
            setV("");
          }
        }}
      />
    </div>
  );
}

function GoalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("academic");
  const [target, setTarget] = useState("100");
  const [unit, setUnit] = useState("%");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  const submit = () => {
    const n = parseFloat(target);
    if (!title.trim() || isNaN(n)) return;
    actions.addGoal({
      title: title.trim(),
      category,
      target: n,
      current: 0,
      unit,
      deadline: new Date(deadline).toISOString(),
    });
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><Plus className="h-4 w-4" /> New goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">New goal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Run a half-marathon" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Goal["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Target</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Unit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="km / $ / %" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
