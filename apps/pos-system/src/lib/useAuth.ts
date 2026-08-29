import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isUnlocked =
    typeof window !== "undefined" ? localStorage.getItem("app_unlocked") === "true" : false;

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("app_unlocked");
  };

  const lockApp = () => {
    localStorage.removeItem("app_unlocked");
    window.location.href = "/pin";
  };

  return { session, user, loading, isUnlocked, signOut, lockApp };
}
