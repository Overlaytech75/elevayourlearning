import { Sparkles } from "lucide-react";

import { AI_UNAVAILABLE_MESSAGE } from "@/lib/env";

/** Calm, non-error notice shown when the app runs without an AI provider. */
export function AiUnavailable({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 ${className}`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">AI features are turned off</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{AI_UNAVAILABLE_MESSAGE}</p>
      </div>
    </div>
  );
}
