import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { storage } from "../lib/storage";

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
  dodo_customer_id?: string;
  dodo_subscription_id?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnonymous: boolean;
  syncStatus: "idle" | "syncing" | "synced" | "error";
  syncMessage: string;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signInWithGoogle: () => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; data: any }>;
  updateProfileName: (newName: string) => Promise<{ error: any }>;
  setAnonymousMode: (isAnon: boolean) => void;
  triggerManualSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");

  // Check if anonymous mode was previously activated or if local data already exists
  const [isAnonymous, setIsAnonymousState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = storage.get("neuraliso_is_anonymous");
    if (stored !== null) return stored === "true";
    // If user has local data already, default to anonymous mode so they aren't locked out
    const moods = storage.get("neuraliso_moods_v2");
    const onboarding = storage.get("neuraliso_onboarding_v2");
    return Boolean(moods || onboarding);
  });

  const setAnonymousMode = useCallback((isAnon: boolean) => {
    setIsAnonymousState(isAnon);
    if (typeof window !== "undefined") {
      storage.set("neuraliso_is_anonymous", isAnon ? "true" : "false");
    }
  }, []);

  // Sync data & manage profile on login
  const handleUserLoginSync = useCallback(async (currentUser: User) => {
    if (!isSupabaseConfigured()) {
      setSyncStatus("idle");
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("Syncing your data...");

    try {
      storage.set("neuraliso_auth_uid", currentUser.id);

      // 1. Ensure profile exists or create default
      const { data: existingProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileErr) {
        console.warn("[Auth] Could not fetch profile (table might be missing):", profileErr.message);
      }

      if (existingProfile) {
        setProfile(existingProfile);
        // Also update local onboarding name if empty
        const ob = storage.getOnboarding();
        if (!ob.name && existingProfile.name) {
          storage.saveOnboarding({ ...ob, name: existingProfile.name });
        }
      } else {
        const defaultName =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split("@")[0] ||
          "Wellness Explorer";

        const newProfile = {
          id: currentUser.id,
          name: defaultName,
          avatar_url: currentUser.user_metadata?.avatar_url || "",
        };

        const { error: insertErr } = await supabase.from("profiles").upsert([newProfile]);
        if (!insertErr) {
          setProfile(newProfile);
          const ob = storage.getOnboarding();
          storage.saveOnboarding({ ...ob, name: defaultName });
        } else {
          setProfile(newProfile);
        }
      }

      // 2. Migrate local storage data to Supabase if any exists
      await storage.syncToSupabase(currentUser.id);

      // 3. Fetch latest data from Supabase to synchronize local cache across devices
      await storage.syncFromSupabase(currentUser.id);

      setSyncStatus("synced");
      setSyncMessage("Your data is backed up");
    } catch (err: any) {
      console.warn("[Auth] Sync error:", err);
      setSyncStatus("error");
      setSyncMessage("Could not connect to sync storage. Using local cache.");
    }
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (user) {
      await handleUserLoginSync(user);
    }
  }, [user, handleUserLoginSync]);

  // Initial Auth Session Check and Listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        setAnonymousMode(false);
        handleUserLoginSync(currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      const newUser = newSession?.user || null;
      setUser(newUser);

      if (newUser) {
        setAnonymousMode(false);
        await handleUserLoginSync(newUser);
      } else {
        setProfile(null);
        storage.remove("neuraliso_auth_uid");
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleUserLoginSync, setAnonymousMode]);

  // Setup Realtime Subscription for active logged-in user
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "moods", filter: `user_id=eq.${user.id}` },
        async () => {
          await storage.syncFromSupabase(user.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "thoughts", filter: `user_id=eq.${user.id}` },
        async () => {
          await storage.syncFromSupabase(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auth Operations
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: "Supabase credentials not configured in environment." }, data: null };
    }
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email.split("@")[0],
          name: name || email.split("@")[0],
        },
      },
    });

    if (res.data.user && name) {
      // Pre-create profile if possible
      await supabase.from("profiles").upsert([
        {
          id: res.data.user.id,
          name: name,
        },
      ]);
      const ob = storage.getOnboarding();
      storage.saveOnboarding({ ...ob, name });
    }

    return res;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: "Supabase credentials not configured in environment." }, data: null };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: "Supabase credentials not configured in environment." }, data: null };
    }
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    storage.remove("neuraliso_auth_uid");
    // Default back to anonymous mode after sign out so app stays functional
    setAnonymousMode(true);
  }, [setAnonymousMode]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: "Supabase credentials not configured in environment." }, data: null };
    }
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "";
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  }, []);

  const updateProfileName = useCallback(
    async (newName: string) => {
      if (!user) return { error: { message: "Not authenticated" } };

      const updated = {
        id: user.id,
        name: newName,
        avatar_url: profile?.avatar_url || "",
      };

      setProfile(updated);
      const ob = storage.getOnboarding();
      storage.saveOnboarding({ ...ob, name: newName });

      if (!isSupabaseConfigured()) return { error: null };

      const { error } = await supabase.from("profiles").upsert([updated]);
      if (!error) {
        await supabase.auth.updateUser({
          data: { full_name: newName, name: newName },
        });
      }
      return { error };
    },
    [user, profile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAnonymous,
        syncStatus,
        syncMessage,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfileName,
        setAnonymousMode,
        triggerManualSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
