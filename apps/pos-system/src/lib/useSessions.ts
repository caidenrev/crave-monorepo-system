import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

/** Satu sesi login akun ini (dari fungsi list_my_sessions di supabase_schema.sql bagian 9). */
export type LoginSession = {
  id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
};

/** Fungsi database belum dibuat (SQL bagian 9 belum dijalankan). */
const isMissingFunction = (err: { code?: string }) =>
  err.code === "PGRST202" || err.code === "42883";

export function useSessions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ["login-sessions", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<{ sessions: LoginSession[]; available: boolean }> => {
      const { data, error } = await supabase.rpc("list_my_sessions");
      if (error) {
        if (isMissingFunction(error)) return { sessions: [], available: false };
        throw new Error(error.message);
      }
      return { sessions: (data ?? []) as LoginSession[], available: true };
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.rpc("revoke_my_session", { p_session_id: sessionId });
      if (error) throw new Error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      // bawaan Supabase: akhiri semua sesi akun ini kecuali perangkat sekarang
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw new Error(error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    sessions: query.data?.sessions ?? [],
    available: query.data?.available ?? true,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    revoke: revokeMutation.mutateAsync,
    revokingId: revokeMutation.isPending ? revokeMutation.variables : undefined,
    revokeOthers: revokeOthersMutation.mutateAsync,
    isRevokingOthers: revokeOthersMutation.isPending,
  };
}
