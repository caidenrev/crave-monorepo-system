import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "./useAuth";

export type SupabaseExpense = {
  id: string;
  created_at: string;
  title: string;
  amount: number;
  category: string;
  notes: string | null;
  user_id: string;
};

export function useExpenses() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const channelId = `realtime_expenses_${Math.random()}`;
    const channel: RealtimeChannel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  const query = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupabaseExpense[];
    },
    enabled: !!user,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: Omit<SupabaseExpense, "id" | "created_at" | "user_id">) => {
      const { data, error } = await supabase.from("expenses").insert([expense]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return {
    ...query,
    addExpenseMutation,
    deleteExpenseMutation,
  };
}
