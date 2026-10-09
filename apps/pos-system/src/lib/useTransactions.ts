import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
import type { CartLine } from "./pos-data";
import { toast } from "sonner";

type CheckoutPayload = {
  cart: CartLine[];
  method: "QRIS" | "Kartu" | "Tunai";
  cashierName: string;
  /**
   * ID transaksi dari HP kasir. Kirim ID yang sama saat mengulang checkout yang
   * sama (mis. setelah gagal jaringan) agar tidak tercatat dua kali.
   */
  transactionId?: string;
  /** Atas nama pelanggan (opsional). Kosong = transaksi tanpa nama. */
  customerName?: string;
};

/** UUID v4 untuk ID transaksi; fallback untuk browser tanpa crypto.randomUUID. */
export function newTransactionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Fungsi checkout_transaction belum dibuat di database (SQL belum dijalankan). */
const isMissingFunction = (err: { code?: string; message?: string }) =>
  err.code === "PGRST202" || err.code === "42883";

export function useTransactions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Cara lama: simpan satu per satu dari HP kasir. Hanya dipakai bila fungsi
   * checkout_transaction belum ada di database. Hapus setelah SQL dijalankan di semua env.
   */
  const legacyCheckout = async ({ cart, method, cashierName }: CheckoutPayload, userId: string) => {
    const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

    const { data: trxData, error: trxError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
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
        user_id: userId,
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
        .eq("user_id", userId)
        .single();

      if (pData) {
        await supabase
          .from("products")
          .update({ stock: pData.stock - line.qty })
          .eq("id", line.product.id)
          .eq("user_id", userId);

        await supabase.from("stock_movements").insert([
          {
            user_id: userId,
            product_id: line.product.id,
            type: "OUT",
            qty: line.qty,
            description: `Terjual (Struk: ${trxData.id.substring(0, 8).toUpperCase()})`,
          },
        ]);
      }
    }

    return trxData;
  };

  const checkoutMutation = useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      if (!user) throw new Error("Pengguna belum terautentikasi");

      // Satu panggilan ke database: transaksi, item, stok & riwayat stok tersimpan
      // sekaligus atau batal semua (lihat checkout_transaction di supabase_schema.sql).
      const args = {
        p_transaction_id: payload.transactionId ?? newTransactionId(),
        p_payment_method: payload.method,
        p_cashier_name: payload.cashierName,
        p_items: payload.cart.map((l) => ({ product_id: l.product.id, qty: l.qty })),
      };
      let { data, error } = await supabase.rpc("checkout_transaction", {
        ...args,
        p_customer_name: payload.customerName?.trim() || null,
      });

      // Database masih memakai fungsi lama (tanpa nama pelanggan): simpan tanpa nama
      if (error && isMissingFunction(error)) {
        ({ data, error } = await supabase.rpc("checkout_transaction", args));
      }

      if (error) {
        if (isMissingFunction(error)) {
          console.warn(
            "[checkout] Fungsi checkout_transaction belum ada di database — memakai cara lama. Jalankan SQL bagian 7 di supabase_schema.sql.",
          );
          return legacyCheckout(payload, user.id);
        }
        throw new Error(error.message);
      }
      return data;
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
