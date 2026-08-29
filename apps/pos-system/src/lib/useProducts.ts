import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Product } from "./pos-data";

export type SupabaseProduct = {
  id: string;
  name: string;
  sku: string;
  category: "Minuman" | "Makanan" | "Snack" | "Lainnya";
  price: number;
  stock: number;
  min_stock: number;
};

const mapProduct = (p: SupabaseProduct): Product => ({
  ...p,
  minStock: p.min_stock,
});

export function useProducts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data as SupabaseProduct[]).map(mapProduct);
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct: Omit<SupabaseProduct, "id">) => {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: newProduct.name,
            sku: newProduct.sku,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            min_stock: newProduct.min_stock,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (newProduct.stock > 0 && data) {
        await supabase.from("stock_movements").insert([
          {
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
      const { data: oldData } = await supabase
        .from("products")
        .select("stock")
        .eq("id", product.id)
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
        })
        .eq("id", product.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (oldData && oldData.stock !== product.stock) {
        const diff = product.stock - oldData.stock;
        await supabase.from("stock_movements").insert([
          {
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

  return { ...query, addProductMutation, updateProductMutation };
}
