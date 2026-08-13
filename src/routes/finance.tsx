import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
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
import { useAppState, actions } from "@/lib/store";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance · Eleva" },
      { name: "description", content: "Track spending, budgets, and cash flow as a student." },
      { property: "og:title", content: "Finance · Eleva" },
      { property: "og:description", content: "Budget, spend, and save with clarity." },
    ],
  }),
  component: FinancePage,
});

const CATEGORIES = ["Food", "Transport", "Books", "Subscriptions", "Social", "Rent", "Health", "Other", "Income"];

function FinancePage() {
  const transactions = useAppState((s) => s.transactions);
  const budgets = useAppState((s) => s.budgets);
  const [open, setOpen] = useState(false);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTxns = transactions.filter((t) => new Date(t.date) >= monthStart);
  const income = monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = -monthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const net = income - spent;

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    monthTxns.filter((t) => t.amount < 0).forEach((t) => {
      m.set(t.category, (m.get(t.category) ?? 0) + -t.amount);
    });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthTxns]);

  const sortedTxns = [...transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">This month</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Finance</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Cash flow, budgets, and where the money's going.</p>
        </div>
        <TxnDialog open={open} onOpenChange={setOpen} />
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <MoneyCard label="Income" value={income} tone="good" icon={<TrendingUp className="h-4 w-4" />} />
        <MoneyCard label="Spent" value={spent} tone="warn" icon={<TrendingDown className="h-4 w-4" />} />
        <MoneyCard label="Net" value={net} tone={net >= 0 ? "good" : "bad"} icon={<Wallet className="h-4 w-4" />} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Newest first</p>
          </CardHeader>
          <CardContent className="space-y-1">
            {sortedTxns.length === 0 && (
              <EmptyState
                title="No transactions yet"
                body="Log an expense or income above — categories power your budgets and the spending charts."
              />
            )}

            {sortedTxns.slice(0, 20).map((t) => (
              <div key={t.id} className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                    <p className="truncate text-sm font-medium text-foreground">{t.note || t.category}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-display tabular-nums text-sm font-semibold ${t.amount >= 0 ? "text-emerald-600" : "text-foreground"}`}>
                    {t.amount >= 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => actions.deleteTransaction(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base">Budgets</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly limits</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.map((b) => {
                const usedMap = new Map(byCategory);
                const used = usedMap.get(b.category) ?? 0;
                const pct = Math.min(100, Math.round((used / b.monthlyLimit) * 100));
                const over = used > b.monthlyLimit;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{b.category}</span>
                      <span className={`tabular-nums ${over ? "text-destructive" : "text-muted-foreground"}`}>
                        ${used.toFixed(0)} / ${b.monthlyLimit}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
              {budgets.length === 0 && <p className="text-sm text-muted-foreground">No budgets yet.</p>}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="font-display text-base">Top categories</CardTitle>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {byCategory.slice(0, 5).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="font-medium tabular-nums">${amt.toFixed(2)}</span>
                </div>
              ))}
              {byCategory.length === 0 && <p className="text-sm text-muted-foreground">No spend yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MoneyCard({ label, value, tone, icon }: { label: string; value: number; tone: "good" | "warn" | "bad"; icon: React.ReactNode }) {
  const toneClass = tone === "good" ? "bg-emerald-500/10 text-emerald-600" : tone === "bad" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning-foreground";
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClass}`}>{icon}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums">
          {value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}

function TxnDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || isNaN(n)) return;
    actions.addTransaction({
      date: new Date().toISOString(),
      amount: kind === "income" ? Math.abs(n) : -Math.abs(n),
      category: kind === "income" ? "Income" : category,
      note,
    });
    setAmount("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><Plus className="h-4 w-4" /> Add transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">New transaction</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={kind === "expense" ? "default" : "outline"} onClick={() => setKind("expense")}>Expense</Button>
            <Button variant={kind === "income" ? "default" : "outline"} onClick={() => setKind("income")}>Income</Button>
          </div>
          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          {kind === "expense" && (
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== "Income").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional description" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
