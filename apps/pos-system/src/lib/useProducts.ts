import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
import type { Product } from "./pos-data";

export type SupabaseProduct = {
  id: string;
  user_id?: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  supplier_id?: string | null;
};

const mapProduct = (p: SupabaseProduct): Product => ({
  ...p,
  minStock: p.min_stock,
});

export function useProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data as SupabaseProduct[]).map(mapProduct);
    },
    enabled: !!user,
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Omit<SupabaseProduct, "id" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            user_id: user.id,
            name: newProduct.name,
            sku: newProduct.sku,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            min_stock: newProduct.min_stock,
            supplier_id: newProduct.supplier_id || null,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (newProduct.stock > 0 && data) {
        await supabase.from("stock_movements").insert([
          {
            user_id: user.id,
            product_id: data.id,
            type: "IN",
            qty: newProduct.stock,
            description: "Stok awal (produk baru)",
          },
        ]);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: SupabaseProduct) => {
      if (!user) throw new Error("Not authenticated");

      const { data: oldData } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product.id)
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("products")
        .update({
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: product.price,
          stock: product.stock,
          min_stock: product.min_stock,
          supplier_id: product.supplier_id || null,
        })
        .eq("id", product.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (oldData && oldData.stock !== product.stock) {
        const diff = product.stock - oldData.stock;
        await supabase.from("stock_movements").insert([
          {
            user_id: user.id,
            product_id: product.id,
            type: diff > 0 ? "IN" : "OUT",
            qty: Math.abs(diff),
            description: diff > 0 ? "Penambahan manual (Restok/Edit)" : "Pengurangan manual (Edit)",
          },
        ]);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  useEffect(() => {
    if (!user) return;
    const channelId = `realtime_products_${user.id}_${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  return { ...query, addProductMutation, updateProductMutation, deleteProductMutation };
}
