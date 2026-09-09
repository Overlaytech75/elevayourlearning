import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Rocket, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/lib/store";

const DISMISS_KEY = "eleva:onboarding:dismissed";

export function OnboardingChecklist() {
  const courses = useAppState((s) => s.courses);
  const assessments = useAppState((s) => s.assessments);
  const transactions = useAppState((s) => s.transactions);
  const tasks = useAppState((s) => s.tasks);
  const goals = useAppState((s) => s.goals);

  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const steps = [
    {
      id: "course",
      label: "Add your first course",
      hint: "Code, name and credit points",
      to: "/academics",
      done: courses.length > 0,
    },
    {
      id: "assessment",
      label: "Add an assessment",
      hint: "Weight and due date drive everything",
      to: "/academics",
      done: assessments.length > 0,
    },
    {
      id: "task",
      label: "Create a task",
      hint: "Anything on your mind right now",
      to: "/productivity",
      done: tasks.length > 0,
    },
    {
      id: "expense",
      label: "Log an expense",
      hint: "Start the spending picture",
      to: "/finance",
      done: transactions.length > 0,
    },
    {
      id: "goal",
      label: "Set a goal",
      hint: "Something to aim at this semester",
      to: "/goals",
      done: goals.length > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const complete = doneCount === steps.length;

  if (dismissed || complete) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <Card className="mb-8 border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="font-display text-base">Set up your workspace</CardTitle>
            <p className="text-xs text-muted-foreground">
              {doneCount} of {steps.length} done · your account starts completely empty by design
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss setup checklist"
          className="rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={(doneCount / steps.length) * 100} className="h-1.5" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <Link
              key={s.id}
              to={s.to as "/"}
              className={`group flex items-center gap-3 rounded-xl border border-border/60 bg-background text-foreground/50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 ${
                s.done ? "opacity-60" : ""
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  s.done
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border/70 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm font-medium ${s.done ? "line-through" : ""}`}
                >
                  {s.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{s.hint}</span>
              </span>
              {!s.done && (
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
