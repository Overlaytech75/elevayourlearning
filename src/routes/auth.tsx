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
import { startPreview } from "@/components/preview-gate";
import { SocialLinks } from "@/components/social-links";
import elevaMark from "@/assets/eleva-mark.png.asset.json";


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

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

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
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error("Google sign-in failed. Try again.");
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[var(--gradient-brand)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <img src={elevaMark.url} alt="Eleva logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-semibold tracking-tight">Eleva</span>
          </div>


          <h1 className="mt-14 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
            The calm operating system for student life.
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            One place for your degree, your money and your paperwork — so nothing important
            slips through the cracks.
          </p>

          <ul className="mt-10 max-w-md space-y-4">
            {VALUE_POINTS.map((v) => (
              <li key={v.title} className="flex gap-3 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-[var(--shadow-soft)]">
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
          <SocialLinks size="sm" />
        </div>

      </aside>

      {/* Sign-in panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <img src={elevaMark.url} alt="Eleva logo" className="mx-auto h-14 w-14 object-contain" />

            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Eleva</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your degree, money and paperwork in one calm place.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-elevated)]">
            <h2 className="font-display text-lg font-semibold tracking-tight">Get started</h2>
            <p className="mt-1 text-sm text-muted-foreground">Free, and takes under a minute.</p>

            <Button variant="outline" className="mt-5 w-full transition-all duration-200" onClick={google}>
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

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Need a hand?{" "}
            <Link to="/help" className="font-medium text-primary underline-offset-4 hover:underline">
              Visit the help centre
            </Link>
          </p>

          <div className="mt-5 flex justify-center lg:hidden">
            <SocialLinks size="sm" />
          </div>
        </div>

      </main>
    </div>
  );
}
