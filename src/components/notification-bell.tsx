import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, CalendarClock, CheckCircle2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppState, daysUntil } from "@/lib/store";
import { useLifeState } from "@/lib/life-store";

const READ_KEY = "eleva:notifications:read";

type Bucket = "overdue" | "today" | "week";

interface Item {
  id: string;
  bucket: Bucket;
  title: string;
  detail: string;
  to: string;
  kind: "assessment" | "task" | "goal" | "budget" | "money";
}

const BUCKET_LABEL: Record<Bucket, string> = {
  overdue: "Needs attention",
  today: "Today",
  week: "This week",
};

const ICONS = {
  assessment: CalendarClock,
  task: CheckCircle2,
  goal: AlertTriangle,
  budget: Wallet,
  money: Wallet,
} as const;

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function NotificationBell() {
  const assessments = useAppState((s) => s.assessments);
  const courses = useAppState((s) => s.courses);
  const tasks = useAppState((s) => s.tasks);
  const goals = useAppState((s) => s.goals);
  const budgets = useAppState((s) => s.budgets);
  const transactions = useAppState((s) => s.transactions);
  const tuition = useLifeState((s) => s.tuition);

  const [read, setRead] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(READ_KEY);
      if (raw) setRead(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];

    for (const a of assessments) {
      if (a.status === "graded" || a.status === "submitted") continue;
      const d = daysUntil(a.dueDate);
      const code = courses.find((c) => c.id === a.courseId)?.code;
      const label = [code, `${a.weight}%`].filter(Boolean).join(" · ");
      if (d < 0) {
        out.push({
          id: `a-${a.id}-overdue`,
          bucket: "overdue",
          title: a.title,
          detail: `${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} overdue${label ? ` · ${label}` : ""}`,
          to: "/academics",
          kind: "assessment",
        });
      } else if (d === 0) {
        out.push({
          id: `a-${a.id}-today`,
          bucket: "today",
          title: a.title,
          detail: `Due today${label ? ` · ${label}` : ""}`,
          to: "/academics",
          kind: "assessment",
        });
      } else if (d <= 7) {
        out.push({
          id: `a-${a.id}-week`,
          bucket: "week",
          title: a.title,
          detail: `Due in ${d} day${d === 1 ? "" : "s"}${label ? ` · ${label}` : ""}`,
          to: "/academics",
          kind: "assessment",
        });
      }
    }

    for (const t of tasks) {
      if (t.done || !t.dueDate) continue;
      const d = daysUntil(t.dueDate);
      if (d < 0) {
        out.push({
          id: `t-${t.id}-overdue`,
          bucket: "overdue",
          title: t.title,
          detail: `Task ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} overdue`,
          to: "/productivity",
          kind: "task",
        });
      } else if (d === 0) {
        out.push({
          id: `t-${t.id}-today`,
          bucket: "today",
          title: t.title,
          detail: "Task due today",
          to: "/productivity",
          kind: "task",
        });
      }
    }

    for (const g of goals) {
      if (!g.deadline) continue;
      const d = daysUntil(g.deadline);
      if (d < 0 && g.current < g.target) {
        out.push({
          id: `g-${g.id}-late`,
          bucket: "overdue",
          title: g.title,
          detail: `Goal deadline passed · ${g.current}/${g.target} ${g.unit}`,
          to: "/goals",
          kind: "goal",
        });
      } else if (d >= 0 && d <= 7 && g.current < g.target) {
        out.push({
          id: `g-${g.id}-soon`,
          bucket: "week",
          title: g.title,
          detail: `Goal due in ${d} day${d === 1 ? "" : "s"} · ${g.current}/${g.target} ${g.unit}`,
          to: "/goals",
          kind: "goal",
        });
      }
    }

    const thisMonth = new Date().toISOString().slice(0, 7);
    for (const b of budgets) {
      const spent = transactions
        .filter((t) => t.amount < 0 && t.category === b.category && monthKey(t.date) === thisMonth)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      if (b.monthlyLimit > 0 && spent > b.monthlyLimit) {
        out.push({
          id: `b-${b.id}-${thisMonth}`,
          bucket: "overdue",
          title: `${b.category} over budget`,
          detail: `${Math.round(spent)} spent of ${b.monthlyLimit} limit`,
          to: "/finance",
          kind: "budget",
        });
      }
    }

    for (const p of tuition) {
      if (p.paid) continue;
      const d = daysUntil(p.dueDate);
      if (d < 0) {
        out.push({
          id: `tu-${p.id}-late`,
          bucket: "overdue",
          title: p.label,
          detail: `Tuition payment ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} late`,
          to: "/international",
          kind: "money",
        });
      } else if (d <= 7) {
        out.push({
          id: `tu-${p.id}-soon`,
          bucket: d === 0 ? "today" : "week",
          title: p.label,
          detail: d === 0 ? "Tuition payment due today" : `Tuition payment due in ${d} days`,
          to: "/international",
          kind: "money",
        });
      }
    }

    const order: Bucket[] = ["overdue", "today", "week"];
    return out.sort((a, b) => order.indexOf(a.bucket) - order.indexOf(b.bucket));
  }, [assessments, courses, tasks, goals, budgets, transactions, tuition]);

  const unread = items.filter((i) => !read.includes(i.id));

  const markAllRead = () => {
    const ids = items.map((i) => i.id);
    setRead(ids);
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  const groups = (["overdue", "today", "week"] as Bucket[])
    .map((b) => ({ bucket: b, list: items.filter((i) => i.bucket === b) }))
    .filter((g) => g.list.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread.length ? ` (${unread.length} unread)` : ""}`}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="font-display text-sm font-semibold">Reminders</p>
            <p className="text-xs text-muted-foreground">
              {items.length ? `${items.length} item${items.length === 1 ? "" : "s"}` : "All clear"}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {groups.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing needs your attention right now.
            </p>
          )}
          {groups.map(({ bucket, list }) => (
            <div key={bucket} className="mb-2">
              <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {BUCKET_LABEL[bucket]}
              </p>
              {list.map((i) => {
                const Icon = ICONS[i.kind];
                const isUnread = !read.includes(i.id);
                return (
                  <Link
                    key={i.id}
                    to={i.to as "/"}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-accent"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        bucket === "overdue"
                          ? "bg-destructive/10 text-destructive"
                          : bucket === "today"
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {i.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {i.detail}
                      </span>
                    </span>
                    {isUnread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
