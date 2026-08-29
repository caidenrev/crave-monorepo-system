import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { CartLine } from "./pos-data";
import { toast } from "sonner";

type CheckoutPayload = {
  cart: CartLine[];
  method: "QRIS" | "Kartu" | "Tunai" | "Utang";
  cashierName: string;
};

export function useTransactions() {
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async ({ cart, method, cashierName }: CheckoutPayload) => {
      const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
      const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

      const { data: trxData, error: trxError } = await supabase
        .from("transactions")
        .insert({
          payment_method: method,
          total_amount: totalAmount,
          total_items: totalItems,
          cashier_name: cashierName,
        })
        .select()
        .single();

      if (trxError) throw new Error(trxError.message);

      for (const line of cart) {
        const { error: itemError } = await supabase.from("transaction_items").insert({
          transaction_id: trxData.id,
          product_id: line.product.id,
          qty: line.qty,
          price: line.product.price,
        });
        if (itemError) throw new Error("Gagal menyimpan item transaksi: " + itemError.message);

        const { data: pData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", line.product.id)
          .single();

        if (pData) {
          await supabase
            .from("products")
            .update({ stock: pData.stock - line.qty })
            .eq("id", line.product.id);

          await supabase.from("stock_movements").insert([
            {
              product_id: line.product.id,
              type: "OUT",
              qty: line.qty,
              description: `Terjual (Struk: ${trxData.id.substring(0, 8).toUpperCase()})`,
            },
          ]);
        }
      }

      return trxData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Transaksi berhasil dan stok dipotong!");
    },
    onError: (error) => {
      toast.error(`Transaksi gagal: ${error.message}`);
    },
  });

  return { checkoutMutation };
}
