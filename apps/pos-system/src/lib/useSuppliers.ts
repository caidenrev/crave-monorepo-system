import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

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

  const query = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as SupabaseSupplier[];
    },
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (newSupplier: Omit<SupabaseSupplier, "id" | "user_id">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("suppliers")
        .insert([
          {
            user_id: userData.user.id,
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
      const { data, error } = await supabase
        .from("suppliers")
        .update({
          name: supplier.name,
          phone: supplier.phone,
          category: supplier.category,
          address: supplier.address || null,
        })
        .eq("id", supplier.id)
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
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  useEffect(() => {
    const channelId = `realtime_suppliers_${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "suppliers" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { ...query, addSupplierMutation, updateSupplierMutation, deleteSupplierMutation };
}
