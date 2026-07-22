import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { daysUntil, type Assessment, type Course } from "@/lib/store";

const statusLabel: Record<Assessment["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  graded: "Graded",
};

const priorityRing: Record<Assessment["priority"], string> = {
  low: "bg-muted-foreground/40",
  medium: "bg-warning",
  high: "bg-destructive",
};

export function AssessmentRow({
  assessment,
  course,
  onClick,
}: {
  assessment: Assessment;
  course?: Course;
  onClick?: () => void;
}) {
  const d = daysUntil(assessment.dueDate);
  const overdue = d < 0 && assessment.status !== "graded" && assessment.status !== "submitted";
  const dueLabel =
    d === 0 ? "Today" : d === 1 ? "Tomorrow" : d < 0 ? `${-d}d overdue` : `in ${d}d`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-left transition hover:border-border hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: course?.color ?? "var(--muted)" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", priorityRing[assessment.priority])} aria-hidden />
                <p className="truncate font-medium text-foreground">{assessment.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {course ? `${course.code} · ` : ""}{assessment.type} · {assessment.weight}%
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent bg-secondary text-secondary-foreground text-[11px] font-medium",
                  overdue && "bg-destructive/10 text-destructive",
                  d >= 0 && d <= 2 && !overdue && "bg-warning/15 text-warning-foreground",
                )}
              >
                {assessment.status === "graded" && assessment.grade != null
                  ? `${assessment.grade}%`
                  : dueLabel}
              </Badge>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={assessment.progress} className="h-1.5 flex-1" />
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {statusLabel[assessment.status]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
