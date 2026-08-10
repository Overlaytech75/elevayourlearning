import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plane,
  ShieldCheck,
  Clock,
  Wallet,
  FolderCheck,
  Award,
  Globe2,
  Plus,
  Trash2,
  ExternalLink,

} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRY_RESOURCES,
  daysLeft,
  fortnightHours,
  lifeActions,
  useLifeState,
} from "@/lib/life-store";

const title = "International Student Hub · Eleva";
const description =
  "Track visa expiry, CoE, OSHC, work-hour limits, tuition instalments, documents, tax and scholarships in one place.";

export const Route = createFileRoute("/international")({
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
  component: InternationalHub,
});

function Countdown({
  icon: Icon,
  label,
  value,
  date,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
  date: string;
}) {
  const d = daysLeft(date);
  const tone =
    d < 0 ? "text-destructive" : d < 60 ? "text-chart-4" : "text-foreground";
  return (
    <Card className="transition-all duration-200 hover:shadow-[var(--shadow-soft)]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className={`mt-2 font-display text-2xl font-semibold ${tone}`}>
          {date ? (d < 0 ? `${Math.abs(d)}d overdue` : `${d} days`) : "—"}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{value || "Not set"}</div>
      </CardContent>
    </Card>
  );
}

function InternationalHub() {
  const visa = useLifeState((s) => s.visa);
  const shifts = useLifeState((s) => s.shifts);
  const tuition = useLifeState((s) => s.tuition);
  const documents = useLifeState((s) => s.documents);
  const scholarships = useLifeState((s) => s.scholarships);

  const [shift, setShift] = useState({ date: "", hours: "", employer: "" });
  const [pay, setPay] = useState({ label: "", amount: "", dueDate: "" });
  const [doc, setDoc] = useState("");
  const [sch, setSch] = useState({ name: "", provider: "", amount: "", deadline: "" });

  const worked = useMemo(() => fortnightHours(shifts), [shifts]);
  const limit = visa.workLimitHoursPerFortnight || 48;
  const workPct = Math.min(100, Math.round((worked / limit) * 100));

  const outstanding = tuition.filter((t) => !t.paid);
  const owed = outstanding.reduce((s, t) => s + t.amount, 0);
  const docsHave = documents.filter((d) => d.have).length;
  const resources = COUNTRY_RESOURCES[visa.country] ?? COUNTRY_RESOURCES.Australia;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Globe2 className="h-3.5 w-3.5" /> International
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          International Student Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compliance, money and paperwork — all the things that quietly go wrong.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Countdown icon={Plane} label="Visa expires in" value={visa.subclass} date={visa.expiry} />
        <Countdown icon={ShieldCheck} label="CoE ends in" value={visa.coeProvider} date={visa.coeEnd} />
        <Countdown icon={ShieldCheck} label="OSHC expires in" value={visa.oshcProvider} date={visa.oshcExpiry} />
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Work this fortnight
            </div>
            <div className="mt-2 font-display text-2xl font-semibold">
              {worked}
              <span className="text-sm text-muted-foreground"> / {limit}h</span>
            </div>
            <Progress value={workPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="status">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="work">Work hours</TabsTrigger>
          <TabsTrigger value="tuition">Tuition & tax</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-4 space-y-4">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Country">
                <Select
                  value={visa.country || "Australia"}
                  onValueChange={(v) => lifeActions.updateVisa({ country: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(COUNTRY_RESOURCES).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Visa subclass">
                <Input value={visa.subclass} onChange={(e) => lifeActions.updateVisa({ subclass: e.target.value })} />
              </Field>
              <Field label="Visa expiry">
                <Input type="date" value={visa.expiry} onChange={(e) => lifeActions.updateVisa({ expiry: e.target.value })} />
              </Field>
              <Field label="Institution (CoE)">
                <Input value={visa.coeProvider} onChange={(e) => lifeActions.updateVisa({ coeProvider: e.target.value })} />
              </Field>
              <Field label="CoE end date">
                <Input type="date" value={visa.coeEnd} onChange={(e) => lifeActions.updateVisa({ coeEnd: e.target.value })} />
              </Field>
              <Field label="OSHC provider">
                <Input value={visa.oshcProvider} onChange={(e) => lifeActions.updateVisa({ oshcProvider: e.target.value })} />
              </Field>
              <Field label="OSHC expiry">
                <Input type="date" value={visa.oshcExpiry} onChange={(e) => lifeActions.updateVisa({ oshcExpiry: e.target.value })} />
              </Field>
              <Field label="Tax file number status">
                <Input value={visa.tfn} onChange={(e) => lifeActions.updateVisa({ tfn: e.target.value })} />
              </Field>
              <Field label="Work limit (hours / fortnight)">
                <Input
                  type="number"
                  value={visa.workLimitHoursPerFortnight}
                  onChange={(e) => lifeActions.updateVisa({ workLimitHoursPerFortnight: Number(e.target.value) })}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-display text-sm font-semibold">Resources for {visa.country || "Australia"}</h2>
              <ul className="mt-3 space-y-2">
                {resources.map((r) => (
                  <li key={r.label}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg border border-border/60 p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/60 hover:shadow-[var(--shadow-soft)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium group-hover:text-primary">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.note}</div>
                      </div>
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </a>
                  </li>
                ))}
              </ul>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-2 sm:grid-cols-4">
                <Input type="date" value={shift.date} onChange={(e) => setShift({ ...shift, date: e.target.value })} />
                <Input type="number" step="0.5" placeholder="Hours" value={shift.hours} onChange={(e) => setShift({ ...shift, hours: e.target.value })} />
                <Input placeholder="Employer" value={shift.employer} onChange={(e) => setShift({ ...shift, employer: e.target.value })} />
                <Button
                  onClick={() => {
                    if (!shift.date || !shift.hours) return;
                    lifeActions.addShift({ date: shift.date, hours: Number(shift.hours), employer: shift.employer || "Work" });
                    setShift({ date: "", hours: "", employer: "" });
                  }}
                >
                  <Plus className="h-4 w-4" /> Log shift
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {worked > limit
                  ? `You are ${worked - limit}h over the fortnightly limit — check your visa conditions.`
                  : `${limit - worked}h remaining this fortnight.`}
              </p>
              <ul className="mt-4 divide-y divide-border/60">
                {shifts.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="truncate">{s.date} · {s.employer}</span>
                    <span className="flex items-center gap-3">
                      <Badge variant="secondary">{s.hours}h</Badge>
                      <button onClick={() => lifeActions.deleteShift(s.id)} aria-label="Delete shift">
                        <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tuition" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" /> Outstanding tuition
              </div>
              <div className="font-display text-2xl font-semibold">${owed.toLocaleString()}</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                <Input placeholder="Instalment label" value={pay.label} onChange={(e) => setPay({ ...pay, label: e.target.value })} />
                <Input type="number" placeholder="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                <Input type="date" value={pay.dueDate} onChange={(e) => setPay({ ...pay, dueDate: e.target.value })} />
                <Button
                  onClick={() => {
                    if (!pay.label || !pay.amount || !pay.dueDate) return;
                    lifeActions.addTuition({ label: pay.label, amount: Number(pay.amount), dueDate: pay.dueDate, paid: false });
                    setPay({ label: "", amount: "", dueDate: "" });
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <ul className="mt-4 divide-y divide-border/60">
                {tuition.map((t) => {
                  const d = daysLeft(t.dueDate);
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                      <Checkbox checked={t.paid} onCheckedChange={() => lifeActions.toggleTuition(t.id)} />
                      <span className={`min-w-0 flex-1 truncate ${t.paid ? "text-muted-foreground line-through" : ""}`}>
                        {t.label}
                      </span>
                      <Badge variant={!t.paid && d < 14 ? "destructive" : "secondary"}>
                        {t.paid ? "Paid" : `${d}d`}
                      </Badge>
                      <span className="w-20 text-right">${t.amount.toLocaleString()}</span>
                      <button onClick={() => lifeActions.deleteTuition(t.id)} aria-label="Delete instalment">
                        <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-display text-sm font-semibold">Tax reminders</h2>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• TFN status: <span className="text-foreground">{visa.tfn || "Not set"}</span></li>
                <li>• Keep every payslip and group certificate — you may be owed a refund.</li>
                <li>• Lodge your return in the window your country sets (AU: 1 Jul – 31 Oct).</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FolderCheck className="h-3.5 w-3.5" /> Document checklist
                </div>
                <Badge variant="secondary">{docsHave}/{documents.length} ready</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Add a document…" value={doc} onChange={(e) => setDoc(e.target.value)} />
                <Button
                  onClick={() => {
                    if (!doc.trim()) return;
                    lifeActions.addDocument({ name: doc.trim(), category: "Other", have: false });
                    setDoc("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-4 divide-y divide-border/60">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2 text-sm">
                    <Checkbox checked={d.have} onCheckedChange={() => lifeActions.toggleDocument(d.id)} />
                    <span className={`min-w-0 flex-1 truncate ${d.have ? "" : "text-muted-foreground"}`}>{d.name}</span>
                    <Badge variant="outline">{d.category}</Badge>
                    {d.expiry ? <span className="text-xs text-muted-foreground">{daysLeft(d.expiry)}d</span> : null}
                    <button onClick={() => lifeActions.deleteDocument(d.id)} aria-label="Delete document">
                      <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-2 sm:grid-cols-5">
                <Input placeholder="Scholarship" value={sch.name} onChange={(e) => setSch({ ...sch, name: e.target.value })} />
                <Input placeholder="Provider" value={sch.provider} onChange={(e) => setSch({ ...sch, provider: e.target.value })} />
                <Input type="number" placeholder="Amount" value={sch.amount} onChange={(e) => setSch({ ...sch, amount: e.target.value })} />
                <Input type="date" value={sch.deadline} onChange={(e) => setSch({ ...sch, deadline: e.target.value })} />
                <Button
                  onClick={() => {
                    if (!sch.name) return;
                    lifeActions.addScholarship({
                      name: sch.name,
                      provider: sch.provider || "—",
                      amount: Number(sch.amount || 0),
                      deadline: sch.deadline || new Date().toISOString().slice(0, 10),
                      status: "researching",
                    });
                    setSch({ name: "", provider: "", amount: "", deadline: "" });
                  }}
                >
                  <Plus className="h-4 w-4" /> Track
                </Button>
              </div>
              <ul className="mt-4 space-y-2">
                {scholarships.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 p-3 text-sm">
                    <Award className="h-4 w-4 text-chart-4" />
                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.provider}</span>
                    <span>${s.amount.toLocaleString()}</span>
                    <Badge variant="secondary">{daysLeft(s.deadline)}d left</Badge>
                    <Select value={s.status} onValueChange={(v) => lifeActions.updateScholarship(s.id, { status: v as never })}>
                      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["researching", "applied", "shortlisted", "awarded", "rejected"].map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={() => lifeActions.deleteScholarship(s.id)} aria-label="Delete scholarship">
                      <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
