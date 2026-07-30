import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export function displayNameOf(user: User | null, fallback = "Student") {
  if (!user) return fallback;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (meta?.display_name as string | undefined) ??
    (meta?.full_name as string | undefined) ??
    user.email?.split("@")[0];
  return name || fallback;
}

export async function signOut() {
  await supabase.auth.signOut();
}
