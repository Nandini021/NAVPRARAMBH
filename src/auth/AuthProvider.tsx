import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type Profile } from "../lib/supabase";
import { getProfile } from "../lib/db";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId: string) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const nextProfile = await getProfile(userId);
        if (mounted) setProfile(nextProfile);
      } catch {
        if (mounted) {
          setProfile(null);
          setProfileError("We couldn't load your profile. Please try again.");
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        setProfile(null);
        window.setTimeout(() => {
          void loadProfile(nextSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!session?.user) return null;
    const nextProfile = await getProfile(session.user.id);
    setProfile(nextProfile);
    setProfileError(null);
    return nextProfile;
  }, [session?.user]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      profileLoading,
      profileError,
      refreshProfile,
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, profile, loading, profileLoading, profileError, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This module intentionally exports the provider and its companion hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
