import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Trash2, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, actions, daysUntil, type ChatMessage } from "@/lib/store";
import { askMentor } from "@/lib/mentor.functions";
import { AI_ENABLED } from "@/lib/env";
import { AiUnavailable } from "@/components/ai-unavailable";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/mentor")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AI Mentor · Eleva" },
      { name: "description", content: "A calm, context-aware study coach that knows your semester." },
      { property: "og:title", content: "AI Mentor · Eleva" },
      { property: "og:description", content: "Ask, plan, reflect — your Eleva mentor." },
    ],
  }),
  component: MentorPage,
});

const SUGGESTIONS = [
  "What should I focus on today?",
  "Explain integration by parts with an example",
  "Give me a 5-day plan for my nearest deadline",
  "Tips for revising when I'm burned out",
  "How should I budget on a student income?",
];

function MentorPage() {
  const { q } = useSearch({ from: "/mentor" });
  const user = useAppState((s) => s.user);
  const chat = useAppState((s) => s.chat);
  const assessments = useAppState((s) => s.assessments);
  const courses = useAppState((s) => s.courses);
  const goals = useAppState((s) => s.goals);
  const transactions = useAppState((s) => s.transactions);
  const tasks = useAppState((s) => s.tasks);
  const habits = useAppState((s) => s.habits);

  const ask = useServerFn(askMentor);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, thinking]);

  const buildContext = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTx = transactions.filter((t) => new Date(t.date) >= monthStart);
    const monthSpent = -monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
    const monthIncome = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const byCat = new Map<string, number>();
    monthTx.filter((t) => t.amount < 0).forEach((t) => {
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + -t.amount);
    });
    const topCategories = [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, spent]) => ({ category, spent: Math.round(spent) }));

    const today = new Date().toDateString();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });

    return {
      userName: user.name,
      today,
      courses: courses.map((c) => ({ code: c.code, name: c.name })),
      assessments: assessments
        .filter((a) => a.status !== "graded")
        .slice(0, 40)
        .map((a) => ({
          title: a.title,
          courseCode: courses.find((c) => c.id === a.courseId)?.code,
          type: a.type,
          weight: a.weight,
          dueDate: a.dueDate.slice(0, 10),
          daysUntil: daysUntil(a.dueDate),
          status: a.status,
          progress: a.progress,
          grade: a.grade ?? null,
        })),
      goals: goals.slice(0, 20).map((g) => ({
        title: g.title,
        category: g.category,
        current: g.current,
        target: g.target,
        unit: g.unit,
        deadline: g.deadline?.slice(0, 10),
      })),
      openTasks: tasks.filter((t) => !t.done).slice(0, 20).map((t) => t.title),
      habits: habits.slice(0, 10).map((h) => ({
        name: h.name,
        last7: last7Days.filter((d) => h.completions.includes(d)).length,
      })),
      finance: { monthIncome: Math.round(monthIncome), monthSpent: Math.round(monthSpent), topCategories },
    };
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking || !AI_ENABLED) return;
    actions.addChatMessage({ role: "user", content: trimmed });
    setInput("");
    setThinking(true);
    try {
      const priorMessages = chat.map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await ask({
        data: {
          messages: [...priorMessages, { role: "user" as const, content: trimmed }],
          context: buildContext(),
        },
      });
      actions.addChatMessage({ role: "assistant", content: reply });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const unauthorized = /unauthor|401/i.test(msg);
      actions.addChatMessage({
        role: "assistant",
        content: unauthorized
          ? "You need to be signed in to use the AI mentor. Create a free account and I'll pick up right here."
          : `Sorry — something broke: ${msg}`,
      });
    } finally {
      setThinking(false);
    }
  };

  // Auto-send ?q= deep link once per value
  useEffect(() => {
    if (q && autoSentRef.current !== q) {
      autoSentRef.current = q;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const heading = useMemo(() => `Hi ${user.name}, I'm your Eleva mentor.`, [user.name]);

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm text-muted-foreground">Personal coach · powered by Lovable AI</p>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-wider sm:text-4xl">AI Mentor</h1>
        </div>
        {chat.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => actions.clearChat()} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-[var(--shadow-soft)]">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
          {!AI_ENABLED && <AiUnavailable className="m-4 mb-0" />}
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
            {chat.length === 0 && AI_ENABLED && (
              <div className="mx-auto max-w-lg py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold">{heading}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  I know your semester, your deadlines, your goals and your spending — and I can help with study techniques,
                  subject explanations, and life advice beyond that. Ask me anything.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border/60 bg-background text-foreground px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
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
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={AI_ENABLED ? "Ask your mentor anything…" : "AI mentor is unavailable in local development"}
                className="flex-1"
                disabled={thinking || !AI_ENABLED}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || thinking || !AI_ENABLED}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {AI_ENABLED && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Uses your live Eleva data plus general knowledge. Powered by Lovable AI (Gemini 3.6 Flash).
              </p>
            )}
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
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{m.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-3 prose-headings:mb-1 prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-background text-foreground/70 prose-code:px-1 prose-code:py-0.5">
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        )}
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
