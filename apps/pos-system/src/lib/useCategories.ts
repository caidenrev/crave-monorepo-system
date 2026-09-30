import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

export type SupabaseCategory = {
  id: string;
  user_id?: string;
  name: string;
  type: string; // 'product' atau 'supplier' atau 'all'
};

export function useCategories() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data as SupabaseCategory[]) || [];
    },
    enabled: !!user,
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<SupabaseCategory, "id" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            user_id: user.id,
            name: newCategory.name,
            type: newCategory.type,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  useEffect(() => {
    if (!user) return;
    const channelId = `realtime_categories_${user.id}_${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  return { ...query, addCategoryMutation, deleteCategoryMutation };
}
