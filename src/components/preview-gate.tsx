import { useEffect, useState } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { Clock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const PREVIEW_KEY = "eleva:preview:start";
export const PREVIEW_MS = 5 * 60 * 1000;

export function startPreview() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PREVIEW_KEY, String(Date.now()));
}

function readPreviewStart(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PREVIEW_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

function clearPreview() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(PREVIEW_KEY);
}

/**
 * Signed-out visitors land on /auth. They can choose "look around" which starts
 * a 5-minute preview; when it expires they're asked to sign up to continue.
 */
export function PreviewGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // /auth and the help centre are always reachable without a session.
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/help");


  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (user) {
      clearPreview();
      setRemaining(null);
      return;
    }
    if (isAuthRoute) return;

    const start = readPreviewStart();
    if (start === null) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    const tick = () => setRemaining(Math.max(0, start + PREVIEW_MS - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [mounted, loading, user, isAuthRoute, navigate]);

  const showBar = mounted && !loading && !user && !isAuthRoute && remaining !== null && remaining > 0;
  const expired = mounted && !loading && !user && !isAuthRoute && remaining === 0;

  const mins = remaining !== null ? Math.floor(remaining / 60000) : 0;
  const secs = remaining !== null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <>
      {showBar && (
        <div className="sticky top-14 z-30 flex flex-wrap items-center justify-center gap-3 border-b border-border/60 bg-primary/10 px-4 py-2 text-xs text-foreground backdrop-blur">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Preview mode — {mins}:{String(secs).padStart(2, "0")} left
          </span>
          <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign up to keep your data
          </Link>
        </div>
      )}

      {children}

      {expired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 text-center shadow-[var(--shadow-elevated)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
              Your 5-minute look around is up
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a free Eleva account to keep your courses, deadlines, notes and progress synced.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  clearPreview();
                  navigate({ to: "/auth" });
                }}
              >
                Sign up — it's free
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  startPreview();
                  setRemaining(PREVIEW_MS);
                }}
              >
                Give me 5 more minutes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
