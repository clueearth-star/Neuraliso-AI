import { useState, useEffect, useCallback } from "react";
import { ReframeEntry } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase, supabaseRetry, isSupabaseConfigured } from "../lib/supabase";
import { storage } from "../lib/storage";

export function useThoughts() {
  const { user, session, loading: authLoading } = useAuth();
  const [data, setData] = useState<ReframeEntry[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchThoughts = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    // Priority 1: Try Supabase if authenticated & configured
    if (user && isSupabaseConfigured() && !storage.get("neuraliso_is_anonymous")) {
      const { data: remoteData, error: remoteErr } = await supabaseRetry(async () => {
        return await supabase
          .from("thoughts")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });
      });

      if (!remoteErr && remoteData) {
        const mapped: ReframeEntry[] = remoteData.map((t: any) => ({
          id: t.id,
          date: t.date,
          timestamp: new Date(t.created_at || t.date).getTime() || Date.now(),
          situation: t.situation,
          automaticThought: t.thought,
          beliefPercent: t.belief_percent || 50,
          balancedThought: t.balanced_thought,
        }));
        storage.set("neuraliso_reframes_v2", JSON.stringify(mapped));
        setData(mapped);
        setLoading(false);
        return;
      }
    }

    // Priority 2 & 3: Fallback to localStorage or empty array
    try {
      const local = storage.getReframes();
      setData(local);
    } catch (err: any) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchThoughts();
    const handleStorageUpdate = () => {
      setData(storage.getReframes());
    };
    if (typeof window !== "undefined") {
      window.addEventListener("neuraliso-storage-updated", handleStorageUpdate);
      return () => window.removeEventListener("neuraliso-storage-updated", handleStorageUpdate);
    }
  }, [fetchThoughts]);

  return { data: authLoading ? null : data, loading: authLoading || loading, error, refetch: fetchThoughts };
}
