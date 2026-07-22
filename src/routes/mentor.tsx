import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Trash2, Bot, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppState, actions, daysUntil, type ChatMessage } from "@/lib/store";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "AI Mentor · Atlas" },
      { name: "description", content: "A calm, context-aware study coach that knows your semester." },
      { property: "og:title", content: "AI Mentor · Atlas" },
      { property: "og:description", content: "Ask, plan, reflect — your Atlas mentor." },
    ],
  }),
  component: MentorPage,
});

const SUGGESTIONS = [
  "What should I focus on today?",
  "Plan my week around deadlines",
  "How am I tracking on my goals?",
  "Where is my money going this month?",
];

function MentorPage() {
  const user = useAppState((s) => s.user);
  const chat = useAppState((s) => s.chat);
  const assessments = useAppState((s) => s.assessments);
  const courses = useAppState((s) => s.courses);
  const goals = useAppState((s) => s.goals);
  const transactions = useAppState((s) => s.transactions);
  const tasks = useAppState((s) => s.tasks);
  const habits = useAppState((s) => s.habits);

  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, thinking]);

  const context = useMemo(() => ({
    assessments,
    courses,
    goals,
    transactions,
    tasks,
    habits,
    userName: user.name,
  }), [assessments, courses, goals, transactions, tasks, habits, user.name]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    actions.addChatMessage({ role: "user", content: text.trim() });
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateReply(text, context);
      actions.addChatMessage({ role: "assistant", content: reply });
      setThinking(false);
    }, 500 + Math.random() * 400);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm text-muted-foreground">Personal coach</p>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">AI Mentor</h1>
        </div>
        {chat.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => actions.clearChat()} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-[var(--shadow-soft)]">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            {chat.length === 0 && (
              <div className="mx-auto max-w-lg py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold">Hi {user.name}, I'm your Atlas mentor.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  I know your semester, your deadlines, your goals and your spending. Ask me anything, or start with a suggestion below.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chat.map((m) => <Message key={m.id} m={m} />)}
            {thinking && (
              <div className="flex items-start gap-3">
                <Avatar role="assistant" />
                <div className="flex items-center gap-1.5 rounded-2xl bg-muted/60 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border/60 p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); ask(input); }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your mentor…"
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || thinking}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Prototype mentor · uses local context, no external calls.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Message({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={m.role} />
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"
        }`}
      >
        {m.content}
      </div>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
      role === "assistant" ? "bg-primary/10 text-primary" : "bg-gradient-to-br from-primary to-chart-4 text-primary-foreground"
    }`}>
      {role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  );
}

// Simple local heuristic "mentor" — no external calls.
type Ctx = {
  userName: string;
  assessments: ReturnType<typeof useAppState<any>> extends never ? never : any;
  courses: any;
  goals: any;
  transactions: any;
  tasks: any;
  habits: any;
};

function generateReply(q: string, ctx: Ctx): string {
  const lower = q.toLowerCase();
  const openAssess = ctx.assessments.filter((a: any) => a.status !== "graded");
  const soon = [...openAssess].sort((a: any, b: any) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const overdue = openAssess.filter((a: any) => daysUntil(a.dueDate) < 0);
  const dueThisWeek = openAssess.filter((a: any) => { const d = daysUntil(a.dueDate); return d >= 0 && d <= 7; });

  if (/(today|focus|priorit)/.test(lower)) {
    if (overdue.length) {
      const a = overdue[0];
      return `Start with "${a.title}" — it's ${-daysUntil(a.dueDate)} day(s) overdue and worth ${a.weight}%. Block one focused hour first thing to reset the trajectory, then move on to lighter work.`;
    }
    if (soon[0]) {
      const a = soon[0];
      const d = daysUntil(a.dueDate);
      const perDay = Math.max(1, Math.round(Math.max(a.estimatedHours - a.actualHours, 1) / Math.max(1, d || 1)));
      return `Today, focus on "${a.title}" (${a.weight}%, due in ${d} day${d === 1 ? "" : "s"}). Aim for ~${perDay}h of deep work — one uninterrupted block beats three fragmented ones.`;
    }
    return `Nothing urgent on the board, ${ctx.userName} — a rare gift. Spend the day reviewing older material or getting ahead on a stretch project.`;
  }

  if (/(week|plan|schedule)/.test(lower)) {
    if (dueThisWeek.length === 0) return `Your week is calm — no assessments due in the next 7 days. Good time to knock out habits and long-term goals.`;
    const lines = dueThisWeek.slice(0, 5).map((a: any) => {
      const c = ctx.courses.find((c: any) => c.id === a.courseId);
      return `• ${c?.code ?? ""} — ${a.title} (${a.weight}%, ${daysUntil(a.dueDate)}d)`;
    });
    return `Here's the week at a glance:\n${lines.join("\n")}\n\nSuggestion: tackle the highest-weight item early in the week, and leave the last day for polish, not first drafts.`;
  }

  if (/(goal|track)/.test(lower)) {
    if (ctx.goals.length === 0) return `You haven't set any goals yet. Even one clear north star (e.g. GPA target, savings buffer) will make everything else easier to prioritize.`;
    const lines = ctx.goals.map((g: any) => {
      const pct = Math.round((g.current / Math.max(1, g.target)) * 100);
      return `• ${g.title} — ${pct}% (${g.current}/${g.target} ${g.unit})`;
    });
    return `Goal status:\n${lines.join("\n")}\n\nPick one to nudge forward this week. Progress compounds.`;
  }

  if (/(money|spend|budget|finance)/.test(lower)) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const spent = -ctx.transactions.filter((t: any) => t.amount < 0 && new Date(t.date) >= monthStart).reduce((s: number, t: any) => s + t.amount, 0);
    const income = ctx.transactions.filter((t: any) => t.amount > 0 && new Date(t.date) >= monthStart).reduce((s: number, t: any) => s + t.amount, 0);
    return `This month: $${income.toFixed(0)} in, $${spent.toFixed(0)} out — net $${(income - spent).toFixed(0)}. Check Finance for the category breakdown; usually one category quietly eats most of the discretionary budget.`;
  }

  if (/(task|todo|to-do)/.test(lower)) {
    const open = ctx.tasks.filter((t: any) => !t.done).length;
    return `You have ${open} open task${open === 1 ? "" : "s"}. Keep the visible list under 7 — anything beyond that lives in a "someday" bucket, not on today's board.`;
  }

  if (/(habit|streak)/.test(lower)) {
    if (ctx.habits.length === 0) return `Habits aren't set up yet. Start with one keystone habit (like "deep work" or "read 20 pages") and let it anchor the rest.`;
    return `You're tracking ${ctx.habits.length} habit${ctx.habits.length === 1 ? "" : "s"}. Aim for 5/7 days weekly — that's the sweet spot between momentum and grace.`;
  }

  return `Good question, ${ctx.userName}. Based on what I see in Atlas: ${openAssess.length} open assessments, ${ctx.goals.length} goals in flight, and ${ctx.tasks.filter((t: any) => !t.done).length} open tasks. Ask me about your day, your week, your goals, your habits, or your money and I'll dig in.`;
}
