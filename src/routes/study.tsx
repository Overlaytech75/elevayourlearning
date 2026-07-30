import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  Calculator,
  Check,
  Layers,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GRADE_POINTS,
  computeGpa,
  studyActions,
  useStudyState,
} from "@/lib/study-store";
import { runStudyTool } from "@/lib/study.functions";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study tools · Atlas" },
      { name: "description", content: "Pomodoro focus timer, GPA calculator, AI flashcard generator and quiz mode — all in one study workspace." },
      { property: "og:title", content: "Study tools · Atlas" },
      { property: "og:description", content: "Pomodoro focus timer, GPA calculator, AI flashcards and quiz mode in one workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Study tools</h1>
        <p className="mt-1 text-muted-foreground">Focus, measure, and drill — without leaving Atlas.</p>
      </header>

      <Tabs defaultValue="timer">
        <TabsList className="mb-6 grid w-full grid-cols-3 sm:max-w-md">
          <TabsTrigger value="timer" className="gap-1.5"><Timer className="h-4 w-4" /> Timer</TabsTrigger>
          <TabsTrigger value="gpa" className="gap-1.5"><Calculator className="h-4 w-4" /> GPA</TabsTrigger>
          <TabsTrigger value="cards" className="gap-1.5"><Layers className="h-4 w-4" /> Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="timer"><Pomodoro /></TabsContent>
        <TabsContent value="gpa"><GpaCalculator /></TabsContent>
        <TabsContent value="cards"><Flashcards /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Pomodoro ---------------- */

const MODES = {
  focus: { label: "Focus", minutes: 25 },
  short: { label: "Short break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
} as const;
type Mode = keyof typeof MODES;

function Pomodoro() {
  const [mode, setMode] = useState<Mode>("focus");
  const [seconds, setSeconds] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const done = useStudyState((s) => s.game.pomodorosToday);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (seconds > 0) return;
    setRunning(false);
    if (mode === "focus") {
      studyActions.completePomodoro();
      toast.success("Session complete — +25 XP");
      setMode("short");
      setSeconds(MODES.short.minutes * 60);
    } else {
      toast("Break over — back to it.");
      setMode("focus");
      setSeconds(MODES.focus.minutes * 60);
    }
  }, [seconds, mode]);

  const switchMode = (m: Mode) => {
    setRunning(false);
    setMode(m);
    setSeconds(MODES[m].minutes * 60);
  };

  const total = MODES[mode].minutes * 60;
  const pct = ((total - seconds) / total) * 100;
  const mm = String(Math.max(0, Math.floor(seconds / 60))).padStart(2, "0");
  const ss = String(Math.max(0, seconds % 60)).padStart(2, "0");

  const size = 240;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex gap-2">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={m === mode ? "default" : "ghost"}
                className="transition-all duration-200"
                onClick={() => switchMode(m)}
              >
                {MODES[m].label}
              </Button>
            ))}
          </div>

          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c - (pct / 100) * c}
                className="fill-none stroke-primary transition-[stroke-dashoffset] duration-200"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-6xl font-semibold tabular-nums tracking-tight">
                {mm}:{ss}
              </span>
              <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {MODES[mode].label}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="lg" className="gap-2 transition-all duration-200" onClick={() => setRunning((v) => !v)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => switchMode(mode)}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="font-display text-base">Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-display text-4xl font-semibold tabular-nums">{done}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sessions completed</p>
          </div>
          <Progress value={Math.min(100, (done / 8) * 100)} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            Target: 8 focus sessions (~3h20m of deep work). Each finished session earns 25 XP.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- GPA ---------------- */

function GpaCalculator() {
  const rows = useStudyState((s) => s.gpa);
  const { gpa, credits } = useMemo(() => computeGpa(rows), [rows]);

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-lg">GPA calculator</CardTitle>
          <p className="text-sm text-muted-foreground">4.0 scale, credit weighted</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => studyActions.addGpaRow()}>
          <Plus className="h-4 w-4" /> Course
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-4 rounded-xl border border-border/60 bg-secondary/50 px-4 py-3">
          <span className="font-display text-4xl font-semibold tabular-nums">{gpa.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">across {credits} credits</span>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 p-3">
            <Input
              className="min-w-[10rem] flex-1"
              value={r.name}
              onChange={(e) => studyActions.updateGpaRow(r.id, { name: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              className="w-24"
              value={r.credits}
              onChange={(e) => studyActions.updateGpaRow(r.id, { credits: Number(e.target.value) })}
            />
            <Select value={r.grade} onValueChange={(v) => studyActions.updateGpaRow(r.id, { grade: v })}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(GRADE_POINTS).map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => studyActions.deleteGpaRow(r.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            Add your courses to project your GPA.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Flashcards + quiz ---------------- */

function Flashcards() {
  const decks = useStudyState((s) => s.decks);
  const [source, setSource] = useState("");
  const [deckName, setDeckName] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeDeck, setActiveDeck] = useState<string | null>(null);

  const generate = async () => {
    if (!source.trim()) return toast.error("Paste some notes first.");
    setBusy(true);
    try {
      const { result } = await runStudyTool({
        data: { tool: "flashcards", content: source, count: 10, level: "undergrad", style: "APA" },
      });
      const json = result.replace(/```json|```/g, "").trim();
      const cards = JSON.parse(json) as { front: string; back: string }[];
      if (!Array.isArray(cards) || !cards.length) throw new Error("empty");
      studyActions.addDeck(deckName.trim() || "Generated deck", cards.slice(0, 20));
      studyActions.awardXp(20);
      setSource("");
      setDeckName("");
      toast.success(`Created ${cards.length} cards — +20 XP`);
    } catch {
      toast.error("Couldn't build cards from that. Try shorter, cleaner notes.");
    } finally {
      setBusy(false);
    }
  };

  const deck = decks.find((d) => d.id === activeDeck);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border/60 shadow-[var(--shadow-soft)] lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Generate a deck
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Deck name</Label>
            <Input value={deckName} onChange={(e) => setDeckName(e.target.value)} placeholder="Networking week 4" />
          </div>
          <div className="space-y-1.5">
            <Label>Your notes</Label>
            <Textarea
              rows={8}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste lecture notes, a textbook section, or a summary…"
            />
          </div>
          <Button className="w-full" disabled={busy} onClick={generate}>
            {busy ? "Generating…" : "Create flashcards"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        {deck ? (
          <DeckDrill deckId={deck.id} onExit={() => setActiveDeck(null)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {decks.map((d) => {
              const known = d.cards.filter((c) => c.known).length;
              return (
                <Card key={d.id} className="border-border/60 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{d.name}</p>
                      <Button size="icon" variant="ghost" onClick={() => studyActions.deleteDeck(d.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.cards.length} cards · {known} known
                    </p>
                    <Progress value={(known / Math.max(1, d.cards.length)) * 100} className="mt-3 h-1.5" />
                    <Button size="sm" className="mt-4 w-full gap-1.5" onClick={() => setActiveDeck(d.id)}>
                      <Brain className="h-4 w-4" /> Quiz mode
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {decks.length === 0 && (
              <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground sm:col-span-2">
                No decks yet — generate one from your notes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DeckDrill({ deckId, onExit }: { deckId: string; onExit: () => void }) {
  const deck = useStudyState((s) => s.decks.find((d) => d.id === deckId));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!deck) return null;
  const card = deck.cards[index];
  if (!card) return null;

  const next = (known: boolean) => {
    if (known !== card.known) studyActions.toggleCardKnown(deck.id, card.id);
    if (known) studyActions.awardXp(5);
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.cards.length);
  };

  return (
    <Card className="border-border/60 shadow-[var(--shadow-elevated)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-display text-base">{deck.name}</CardTitle>
          <p className="text-xs text-muted-foreground">Card {index + 1} of {deck.cards.length}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onExit}>Close</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-[180px] w-full items-center justify-center rounded-2xl border border-border/60 bg-secondary/40 p-8 text-center transition-all duration-200 hover:border-primary/40"
        >
          <div>
            <Badge variant="secondary" className="mb-3">{flipped ? "Answer" : "Question"}</Badge>
            <p className="font-display text-xl font-medium leading-snug">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && <p className="mt-3 text-xs text-muted-foreground">Tap to reveal</p>}
          </div>
        </button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-1.5" onClick={() => next(false)}>
            <X className="h-4 w-4" /> Still learning
          </Button>
          <Button className="flex-1 gap-1.5" onClick={() => next(true)}>
            <Check className="h-4 w-4" /> Got it (+5 XP)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
