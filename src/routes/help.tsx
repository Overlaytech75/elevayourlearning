import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowRight, LifeBuoy, Mail, Search, Send } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SocialLinks } from "@/components/social-links";
import {
  HELP_GROUPS,
  HELP_TOPICS,
  SUGGESTED_TOPIC_IDS,
  searchTopics,
  topicById,
  type HelpTopic,
} from "@/lib/help-content";
import { SUPPORT_EMAIL } from "@/lib/social";
import elevaMark from "@/assets/eleva-mark.png.asset.json";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help centre · Eleva" },
      {
        name: "description",
        content:
          "Answers to common Eleva questions: adding courses, deadlines, GPA, budgets, AI tools, accounts and data.",
      },
      { property: "og:title", content: "Help centre · Eleva" },
      {
        property: "og:description",
        content:
          "Answers to common Eleva questions: adding courses, deadlines, GPA, budgets, AI tools, accounts and data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

interface Bubble {
  id: string;
  role: "user" | "bot";
  text: string;
  topic?: HelpTopic;
}

let seq = 0;
const nextId = () => `b${++seq}`;

function HelpPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: "intro",
      role: "bot",
      text: "Hi, I'm the Eleva Helper. Pick a question below and I'll answer straight away — no waiting, no AI credits needed.",
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTED_TOPIC_IDS);
  const scrollRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchTopics(query), [query]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const ask = (id: string) => {
    const topic = topicById(id);
    if (!topic) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text: topic.question },
      { id: nextId(), role: "bot", text: topic.answer, topic },
    ]);
    const related = (topic.related ?? []).filter((r) => r !== id);
    const filler = SUGGESTED_TOPIC_IDS.filter((s) => s !== id && !related.includes(s));
    setSuggestions([...related, ...filler].slice(0, 5));
  };

  const grouped = HELP_GROUPS.map((g) => ({
    group: g,
    topics: results.filter((t) => t.group === g),
  })).filter((g) => g.topics.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <LifeBuoy className="h-3.5 w-3.5" /> Help centre
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ask the Eleva Helper, or browse the answers below. Everything here is instant and works
          even before you sign in.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chatbot */}
        <Card className="lg:col-span-3 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <img src={elevaMark.url} alt="" className="h-8 w-8 object-contain" />
            <div>
              <CardTitle className="font-display text-base">Eleva Helper</CardTitle>
              <p className="text-xs text-muted-foreground">Prefilled answers · always online</p>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollRef}
              className="max-h-[420px] space-y-4 overflow-y-auto rounded-xl border border-border/50 bg-background/40 p-4"
            >
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="max-w-[92%] space-y-2">
                    {m.text.split("\n\n").map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground">
                        {p}
                      </p>
                    ))}
                    {m.topic?.link && (
                      <Button asChild size="sm" variant="secondary" className="mt-1 gap-1.5">
                        <Link to={m.topic.link.to as "/"}>
                          {m.topic.link.label} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Send className="h-3 w-3" /> Suggested questions
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((id) => {
                  const t = topicById(id);
                  if (!t) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => ask(id)}
                      className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                    >
                      {t.question}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Still stuck */}
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-base">Still stuck?</CardTitle>
            <p className="text-xs text-muted-foreground">We read every message.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">Email support</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {SUPPORT_EMAIL}
                </span>
              </span>
            </a>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Stay connected
              </p>
              <SocialLinks />
              <p className="mt-2 text-xs text-muted-foreground">
                Product updates, study tips and new features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">All answers</h2>
            <p className="text-sm text-muted-foreground">{HELP_TOPICS.length} topics</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help…"
              className="pl-9"
            />
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
            No answers matched “{query}”. Try a different word, or email {SUPPORT_EMAIL}.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {grouped.map(({ group, topics }) => (
              <Card key={group} className="border-border/60 shadow-[var(--shadow-soft)]">
                <CardHeader>
                  <CardTitle className="font-display text-base">{group}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {topics.map((t) => (
                      <AccordionItem key={t.id} value={t.id}>
                        <AccordionTrigger className="text-left text-sm">
                          {t.question}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                          {t.answer.split("\n\n").map((p, i) => (
                            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                              {p}
                            </p>
                          ))}
                          {t.link && (
                            <Button asChild size="sm" variant="ghost" className="gap-1.5 px-0">
                              <Link to={t.link.to as "/"}>
                                {t.link.label} <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
