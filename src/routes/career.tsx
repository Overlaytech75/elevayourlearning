import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, FileUser, Link2, Plus, Trash2, Sparkles, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lifeActions, useLifeState, type CareerAsset } from "@/lib/life-store";

const title = "Career Hub · Eleva";
const description =
  "Track internships and graduate applications, build your resume and portfolio, log certificates and prep for interviews.";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareerHub,
});

const STATUSES = ["saved", "applied", "interview", "offer", "rejected"] as const;
const KINDS: { value: CareerAsset["kind"]; label: string }[] = [
  { value: "resume", label: "Resume" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certificate", label: "Certificate" },
  { value: "linkedin", label: "LinkedIn" },
];

const INTERVIEW_PREP = [
  { q: "Tell me about yourself", hint: "Present → past → future, 90 seconds, aimed at the role." },
  { q: "Behavioural (STAR)", hint: "Situation, Task, Action, Result — always end with a number." },
  { q: "Why this company?", hint: "Name a product decision you actually admire, and why." },
  { q: "Technical deep dive", hint: "Narrate trade-offs out loud; a wrong answer explained well still scores." },
  { q: "Your questions for us", hint: "Ask about how success is measured in the first 90 days." },
];

const LINKEDIN_TIPS = [
  "Headline = who you are + what you build + what you want next.",
  "About section: 3 short paragraphs, first person, no buzzwords.",
  "Turn every project into an entry with a metric and a link.",
  "Ask two lecturers or managers for a recommendation each semester.",
  "Follow 10 target companies and comment thoughtfully once a week.",
];

function CareerHub() {
  const jobs = useLifeState((s) => s.jobs);
  const assets = useLifeState((s) => s.career);
  const [job, setJob] = useState({ role: "", company: "", type: "internship" });
  const [asset, setAsset] = useState({ kind: "resume", title: "", detail: "" });

  const active = jobs.filter((j) => j.status !== "rejected").length;
  const interviews = jobs.filter((j) => j.status === "interview" || j.status === "offer").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" /> Career
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-wider sm:text-3xl">Career Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          From first application to signed offer — tracked in one pipeline.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Applications" value={jobs.length} />
        <Stat label="Active" value={active} />
        <Stat label="Interviews / offers" value={interviews} />
      </section>

      <Tabs defaultValue="pipeline">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="assets">Resume & portfolio</TabsTrigger>
          <TabsTrigger value="interview">Interview prep</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-2 sm:grid-cols-4">
                <Input placeholder="Role" value={job.role} onChange={(e) => setJob({ ...job, role: e.target.value })} />
                <Input placeholder="Company" value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} />
                <Select value={job.type} onValueChange={(v) => setJob({ ...job, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["internship", "graduate", "part_time", "casual"].map((t) => (
                      <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (!job.role || !job.company) return;
                    lifeActions.addJob({
                      role: job.role,
                      company: job.company,
                      type: job.type as never,
                      appliedOn: new Date().toISOString().slice(0, 10),
                      status: "saved",
                    });
                    setJob({ role: "", company: "", type: "internship" });
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              <ul className="mt-4 space-y-2">
                {jobs.map((j) => (
                  <li key={j.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 p-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="min-w-0 flex-1 truncate font-medium">{j.role}</span>
                    <span className="truncate text-muted-foreground">{j.company}</span>
                    <Badge variant="outline">{j.type.replace("_", " ")}</Badge>
                    <span className="text-xs text-muted-foreground">{j.appliedOn}</span>
                    <Select value={j.status} onValueChange={(v) => lifeActions.updateJob(j.id, { status: v as never })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={() => lifeActions.deleteJob(j.id)} aria-label="Delete application">
                      <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                    </button>
                  </li>
                ))}
                {jobs.length === 0 ? (
                  <li className="py-6 text-center text-sm text-muted-foreground">No applications tracked yet.</li>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                <Select value={asset.kind} onValueChange={(v) => setAsset({ ...asset, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Title" value={asset.title} onChange={(e) => setAsset({ ...asset, title: e.target.value })} />
                <Button
                  onClick={() => {
                    if (!asset.title) return;
                    lifeActions.addCareerAsset({
                      kind: asset.kind as CareerAsset["kind"],
                      title: asset.title,
                      detail: asset.detail,
                    });
                    setAsset({ kind: "resume", title: "", detail: "" });
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <Textarea
                className="mt-2"
                placeholder="Notes, bullet points, or a link…"
                value={asset.detail}
                onChange={(e) => setAsset({ ...asset, detail: e.target.value })}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {assets.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center gap-2">
                      <FileUser className="h-4 w-4 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.title}</span>
                      <Badge variant="secondary">{a.kind}</Badge>
                      <button onClick={() => lifeActions.deleteCareerAsset(a.id)} aria-label="Delete item">
                        <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                      </button>
                    </div>
                    <Textarea
                      className="mt-2 min-h-20 text-xs"
                      value={a.detail}
                      onChange={(e) => lifeActions.updateCareerAsset(a.id, { detail: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Prep checklist
              </div>
              <ul className="mt-3 space-y-3">
                {INTERVIEW_PREP.map((p) => (
                  <li key={p.q} className="rounded-lg border border-border/60 p-3">
                    <div className="text-sm font-medium">{p.q}</div>
                    <div className="text-xs text-muted-foreground">{p.hint}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Want a mock interview? Ask the AI Mentor to role-play the interviewer for a specific company.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" /> Profile guidance
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {LINKEDIN_TIPS.map((t) => (
                  <li key={t} className="rounded-lg border border-border/60 p-3">{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-[var(--shadow-soft)]">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
