import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookMarked,
  Brain,
  FileQuestion,
  GraduationCap,
  Loader2,
  PenLine,
  Quote,
  ScrollText,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { runStudyTool } from "@/lib/study.functions";
import { studyActions } from "@/lib/study-store";
import { AI_ENABLED } from "@/lib/env";
import { AiUnavailable } from "@/components/ai-unavailable";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI study tools · Eleva" },
      { name: "description", content: "Summarize notes, generate practice exams, explain hard concepts, build citations and get essay feedback with AI." },
      { property: "og:title", content: "AI study tools · Eleva" },
      { property: "og:description", content: "Summaries, practice exams, concept explainers, citations and essay feedback — powered by AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiToolsPage,
});

type ToolId = "summarize" | "quiz" | "exam" | "explain" | "citation" | "essay" | "plan";

const TOOLS: {
  id: ToolId;
  label: string;
  blurb: string;
  icon: typeof Brain;
  placeholder: string;
}[] = [
  { id: "summarize", label: "Summarize", blurb: "Notes or a PDF's text into revision-ready bullets", icon: ScrollText, placeholder: "Paste the text you want summarized…" },
  { id: "quiz", label: "Quiz me", blurb: "Multiple-choice quiz with answers", icon: FileQuestion, placeholder: "Paste the material to be quizzed on…" },
  { id: "exam", label: "Practice exam", blurb: "Full mock paper with an answer key", icon: GraduationCap, placeholder: "Paste the syllabus or topic list…" },
  { id: "explain", label: "Explain", blurb: "Any concept, at your chosen level", icon: Brain, placeholder: "Which concept is confusing you?" },
  { id: "citation", label: "Citations", blurb: "APA, MLA, Chicago, Harvard, IEEE", icon: Quote, placeholder: "Paste your sources — titles, authors, URLs…" },
  { id: "essay", label: "Essay feedback", blurb: "Rigorous critique, no ghost-writing", icon: PenLine, placeholder: "Paste your draft…" },
  { id: "plan", label: "Study plan", blurb: "Day-by-day plan around your deadlines", icon: BookMarked, placeholder: "e.g. 3 exams in 10 days, 4h/day free…" },
];

function AiToolsPage() {
  const [tool, setTool] = useState<ToolId>("summarize");
  const [content, setContent] = useState("");
  const [level, setLevel] = useState<"child" | "beginner" | "undergrad" | "expert">("undergrad");
  const [style, setStyle] = useState<"APA" | "MLA" | "Chicago" | "Harvard" | "IEEE">("APA");
  const [count, setCount] = useState(8);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("");

  const active = TOOLS.find((t) => t.id === tool)!;

  const run = async () => {
    if (!content.trim()) return toast.error("Add some text first.");
    setBusy(true);
    setOutput("");
    try {
      const { result } = await runStudyTool({ data: { tool, content, level, style, count } });
      setOutput(result);
      studyActions.awardXp(10);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        /unauthor|401/i.test(msg)
          ? "Sign in to use the AI study tools."
          : "That request failed. Try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">AI study tools</h1>
        <p className="mt-1 text-muted-foreground">
          Seven focused assistants for the parts of studying that eat your evenings.
        </p>
      </header>

      {!AI_ENABLED && <AiUnavailable className="mb-6" />}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => {
          const on = t.id === tool;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTool(t.id); setOutput(""); }}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                on
                  ? "border-primary/50 bg-primary/5 shadow-[var(--shadow-soft)]"
                  : "border-border/60 hover:border-border hover:shadow-[var(--shadow-soft)]"
              }`}
            >
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <t.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 font-medium">{t.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.blurb}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <active.icon className="h-4 w-4 text-primary" /> {active.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={AI_ENABLED ? active.placeholder : "AI tools are unavailable in local development"}
              disabled={!AI_ENABLED}
            />

            <div className="flex flex-wrap gap-3">
              {tool === "explain" && (
                <div className="space-y-1.5">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Explain like I'm 10</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="undergrad">Undergraduate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {tool === "citation" && (
                <div className="space-y-1.5">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["APA", "MLA", "Chicago", "Harvard", "IEEE"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {(tool === "quiz" || tool === "exam") && (
                <div className="space-y-1.5">
                  <Label>Questions</Label>
                  <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 8, 10, 15, 20].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button className="w-full gap-1.5" disabled={busy || !AI_ENABLED} onClick={run}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Working…" : `Run ${active.label.toLowerCase()}`}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Result</CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
                {busy ? "Thinking…" : "Output will appear here."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
