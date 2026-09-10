import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, BookOpen, Wallet, Globe2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { startPreview, readPreviewStart, PREVIEW_MS } from "@/components/preview-gate";
import { GOOGLE_AUTH_ENABLED } from "@/lib/env";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Eleva Student OS" },
      { name: "description", content: "Sign in to Eleva to sync your courses, deadlines, notes and study streaks across devices." },
      { property: "og:title", content: "Sign in · Eleva Student OS" },
      { property: "og:description", content: "Sign in to Eleva to sync your courses, deadlines, notes and study streaks across devices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const VALUE_POINTS = [
  { icon: BookOpen, title: "Academics", body: "Courses, weighted assessments and a GPA that updates itself." },
  { icon: Wallet, title: "Money", body: "Budgets, spending trends and tuition instalments in one view." },
  { icon: Globe2, title: "Visa & career", body: "Work-hour limits, key dates and your application pipeline." },
];

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [tourExpired, setTourExpired] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    const start = readPreviewStart();
    if (start !== null && Date.now() - start >= PREVIEW_MS) {
      setTourExpired(true);
    }
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your inbox if confirmation is required.");
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) return toast.error("Google sign-in failed. Try again.");
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[var(--gradient-brand)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Eleva logo" className="h-20 w-20 object-contain shadow-[var(--shadow-soft)]" />
            <span className="font-display text-6xl font-bold tracking-widest text-foreground">Eleva</span>
          </div>


          <h1 className="mt-14 max-w-md font-display text-4xl font-semibold leading-tight tracking-wider">
            The calm operating system for student life.
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            One place for your degree, your money and your paperwork — so nothing important
            slips through the cracks.
          </p>

          <ul className="mt-10 max-w-md space-y-4">
            {VALUE_POINTS.map((v) => (
              <li key={v.title} className="flex gap-3 rounded-xl border border-border/60 bg-card text-card-foreground/70 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-[var(--shadow-soft)]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <v.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{v.title}</div>
                  <p className="text-xs text-muted-foreground">{v.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Built for students juggling deadlines, shifts and visas.
          </p>
        </div>

      </aside>

      {/* Sign-in panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Eleva logo" className="h-16 w-16 object-contain" />
              <span className="font-display text-5xl font-bold tracking-widest text-foreground">Eleva</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your degree, money and paperwork in one calm place.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card text-card-foreground p-6 shadow-[var(--shadow-elevated)]">
            <h2 className="font-display text-lg font-semibold tracking-wider">Get started</h2>
            <p className="mt-1 text-sm text-muted-foreground">Free, and takes under a minute.</p>

            <Button variant="outline" className="mt-5 w-full transition-all duration-200 flex items-center justify-center gap-2" onClick={google}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-3 pt-4" onSubmit={signIn}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full transition-all duration-200" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-3 pt-4" onSubmit={signUp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">First name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email2">Email</Label>
                    <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password2">Password</Label>
                    <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full transition-all duration-200" disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {!tourExpired && (
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Prefer to look around first?{" "}
              <button
                type="button"
                onClick={() => {
                  startPreview();
                  navigate({ to: "/" });
                }}
                className="font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline"
              >
                Take a 5-minute tour
              </button>
            </p>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Need a hand?{" "}
            <Link to="/help" className="font-medium text-primary underline-offset-4 hover:underline">
              Visit the help centre
            </Link>
          </p>

        </div>

      </main>
    </div>
  );
}
