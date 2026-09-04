import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { isToday, isPast, parseISO } from "date-fns";

export type AppNotification = {
  id: string;
  type: "stok" | "pesanan" | "utang";
  title: string;
  description: string;
  time: string;
  timestamp: number;
};

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const notifs: AppNotification[] = [];

      const { data: products } = await supabase.from("products").select("*");
      if (products) {
        products.forEach((p) => {
          if (p.stock <= p.min_stock) {
            notifs.push({
              id: `stok-${p.id}`,
              type: "stok",
              title: "Stok Menipis",
              description: `Stok ${p.name} tersisa ${p.stock}. Segera lakukan restok.`,
              time: p.updated_at || p.created_at,
              timestamp: new Date(p.updated_at || p.created_at).getTime(),
            });
          }
        });
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", startOfToday.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (txs) {
        txs.forEach((t) => {
          notifs.push({
            id: `tx-${t.id}`,
            type: "pesanan",
            title: `Pesanan Baru #${t.id.substring(0, 5).toUpperCase()}`,
            description: `Pembayaran ${t.payment_method} berhasil senilai Rp${t.total_amount.toLocaleString("id-ID")}.`,
            time: t.created_at,
            timestamp: new Date(t.created_at).getTime(),
          });
        });
      }

      notifs.sort((a, b) => b.timestamp - a.timestamp);

      return notifs;
    },
    refetchInterval: 15000,
  });
}
