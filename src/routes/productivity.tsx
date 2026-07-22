import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Flame, CheckSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState, actions, type Priority } from "@/lib/store";

export const Route = createFileRoute("/productivity")({
  head: () => ({
    meta: [
      { title: "Productivity · Atlas" },
      { name: "description", content: "Tasks, habits, and focus in one calm workspace." },
      { property: "og:title", content: "Productivity · Atlas" },
      { property: "og:description", content: "Ship tasks and build habits, gently." },
    ],
  }),
  component: ProductivityPage,
});

function ProductivityPage() {
  const tasks = useAppState((s) => s.tasks);
  const habits = useAppState((s) => s.habits);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tag, setTag] = useState("");

  const [habitName, setHabitName] = useState("");
  const [emoji, setEmoji] = useState("✨");

  const today = new Date().toISOString().slice(0, 10);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const openTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  const submitTask = () => {
    if (!title.trim()) return;
    actions.addTask({ title: title.trim(), done: false, priority, tag: tag.trim() || undefined });
    setTitle("");
    setTag("");
  };

  const submitHabit = () => {
    if (!habitName.trim()) return;
    actions.addHabit({ name: habitName.trim(), emoji: emoji || "✨" });
    setHabitName("");
    setEmoji("✨");
  };

  const streakOf = (comps: string[]) => {
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (comps.includes(d.toISOString().slice(0, 10))) s++;
      else break;
    }
    return s;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Focus workspace</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Productivity</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Tasks to ship today and habits to compound.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" /> Tasks
            </CardTitle>
            <p className="text-sm text-muted-foreground">{openTasks.length} open · {doneTasks.length} done</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex-1 min-w-[200px] grid gap-1.5">
                <Label className="text-xs">New task</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to happen?" onKeyDown={(e) => e.key === "Enter" && submitTask()} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Tag</Label>
                <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Study" className="w-[110px]" />
              </div>
              <Button onClick={submitTask} className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
            </div>

            <div className="space-y-1">
              {openTasks.map((t) => (
                <TaskRow key={t.id} t={t} />
              ))}
              {openTasks.length === 0 && (
                <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">All clear. Nice.</p>
              )}
            </div>

            {doneTasks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recently done</p>
                <div className="space-y-1">
                  {doneTasks.slice(-5).reverse().map((t) => <TaskRow key={t.id} t={t} />)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" /> Habits
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tap today's cell to complete</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="w-14 grid gap-1.5">
                <Label className="text-xs">Icon</Label>
                <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
              </div>
              <div className="flex-1 grid gap-1.5">
                <Label className="text-xs">Habit</Label>
                <Input value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="Meditate 10m" onKeyDown={(e) => e.key === "Enter" && submitHabit()} />
              </div>
              <Button size="icon" onClick={submitHabit}><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-3">
              {habits.map((h) => {
                const streak = streakOf(h.completions);
                return (
                  <div key={h.id} className="group rounded-xl border border-border/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{h.emoji}</span>
                        <span className="text-sm font-medium">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">🔥 {streak}d</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => actions.deleteHabit(h.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {last7.map((d) => {
                        const done = h.completions.includes(d);
                        const isToday = d === today;
                        return (
                          <button
                            key={d}
                            onClick={() => isToday && actions.toggleHabitToday(h.id)}
                            disabled={!isToday}
                            title={d}
                            className={`h-7 rounded-md border text-[10px] font-medium transition-colors ${
                              done
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/40 border-border/60 text-muted-foreground"
                            } ${isToday ? "ring-2 ring-primary/30 cursor-pointer" : "cursor-default opacity-70"}`}
                          >
                            {new Date(d).getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {habits.length === 0 && <p className="text-sm text-muted-foreground">Add your first habit above.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({ t }: { t: ReturnType<typeof useAppState<any>> extends never ? never : any }) {
  const priorityColor = t.priority === "high" ? "text-destructive" : t.priority === "medium" ? "text-warning-foreground" : "text-muted-foreground";
  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50">
      <Checkbox checked={t.done} onCheckedChange={() => actions.toggleTask(t.id)} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className={priorityColor}>● {t.priority}</span>
          {t.tag && <Badge variant="secondary" className="text-[10px]">{t.tag}</Badge>}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => actions.deleteTask(t.id)}>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
