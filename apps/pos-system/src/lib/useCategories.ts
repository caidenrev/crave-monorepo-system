import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type SupabaseCategory = {
  id: string;
  user_id?: string;
  name: string;
  type: string; // 'product' atau 'supplier' atau 'all'
};

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as SupabaseCategory[];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<SupabaseCategory, "id" | "user_id">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            user_id: userData.user.id,
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
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  useEffect(() => {
    const channelId = `realtime_categories_${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { ...query, addCategoryMutation, deleteCategoryMutation };
}
