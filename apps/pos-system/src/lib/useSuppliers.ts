import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

export type SupabaseSupplier = {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  category: string;
  address?: string;
};

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["suppliers", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data as SupabaseSupplier[]) || [];
    },
    enabled: !!user,
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (newSupplier: Omit<SupabaseSupplier, "id" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("suppliers")
        .insert([
          {
            user_id: user.id,
            name: newSupplier.name,
            phone: newSupplier.phone,
            category: newSupplier.category,
            address: newSupplier.address || null,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async (supplier: SupabaseSupplier) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("suppliers")
        .update({
          name: supplier.name,
          phone: supplier.phone,
          category: supplier.category,
          address: supplier.address || null,
        })
        .eq("id", supplier.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  useEffect(() => {
    if (!user) return;
    const channelId = `realtime_suppliers_${user.id}_${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suppliers", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  return { ...query, addSupplierMutation, updateSupplierMutation, deleteSupplierMutation };
}
