import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const twentyEightDaysAgo = startOfDay(subDays(today, 27)).toISOString();

      const { data: txs, error: txError } = await supabase
        .from("transactions")
        .select(
          `
          id,
          created_at,
          total_amount,
          total_items,
          cashier_name,
          payment_method,
          transaction_items (
            qty,
            price,
            products (
              category
            )
          )
        `,
        )
        .gte("created_at", twentyEightDaysAgo)
        .order("created_at", { ascending: false });

      if (txError) throw new Error(txError.message);

      const todayTxs = txs.filter((t) => isSameDay(new Date(t.created_at), today));

      const pendapatanHariIni = todayTxs.reduce((sum, t) => sum + Number(t.total_amount), 0);
      const totalTransaksi = todayTxs.length;
      const rataRataBelanja =
        totalTransaksi > 0 ? Math.round(pendapatanHariIni / totalTransaksi) : 0;

      const categoryTotals: Record<string, number> = {
        Minuman: 0,
        Makanan: 0,
        Snack: 0,
        Lainnya: 0,
      };

      todayTxs.forEach((t) => {
        t.transaction_items.forEach((item: any) => {
          const cat = item.products?.category || "Lainnya";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.qty) * Number(item.price);
        });
      });

      const totalCategorySales = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
      const categoryShare =
        totalCategorySales === 0
          ? [{ name: "Belum ada", value: 100 }]
          : Object.entries(categoryTotals)
              .filter(([_, val]) => val > 0)
              .map(([name, val]) => ({
                name,
                value: Math.round((val / totalCategorySales) * 100),
              }));

      const hours = Array.from({ length: 15 }, (_, i) => i + 8);
      const salesByHour = hours.map((h) => {
        const hStr = h.toString().padStart(2, "0") + ":00";
        const sum = todayTxs
          .filter((t) => new Date(t.created_at).getHours() === h)
          .reduce((acc, t) => acc + Number(t.total_amount), 0);
        return { label: hStr, penjualan: sum };
      });

      const salesByDay = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dayTxs = txs.filter((t) => isSameDay(new Date(t.created_at), d));
        const sum = dayTxs.reduce((acc, t) => acc + Number(t.total_amount), 0);
        salesByDay.push({ label: format(d, "EEE"), penjualan: sum });
      }

      const salesByWeek = [];
      for (let i = 3; i >= 0; i--) {
        const endD = subDays(today, i * 7);
        const startD = subDays(endD, 6);
        const weekTxs = txs.filter((t) => {
          const tDate = new Date(t.created_at);
          return tDate >= startOfDay(startD) && tDate <= endD;
        });
        const sum = weekTxs.reduce((acc, t) => acc + Number(t.total_amount), 0);
        salesByWeek.push({ label: `M${4 - i}`, penjualan: sum });
      }

      const weeklySales = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dStr = format(d, "EEE");
        const dayTxs = txs.filter((t) => isSameDay(new Date(t.created_at), d));

        const dayCats: Record<string, number> = { Minuman: 0, Makanan: 0, Snack: 0, Lainnya: 0 };
        dayTxs.forEach((t) => {
          t.transaction_items.forEach((item: any) => {
            const cat = item.products?.category || "Lainnya";
            dayCats[cat] = (dayCats[cat] || 0) + Number(item.qty) * Number(item.price);
          });
        });

        weeklySales.push({
          label: dStr,
          ...dayCats,
        });
      }

      const recentTransactions = txs.slice(0, 10).map((t) => ({
        id: t.id.substring(0, 8).toUpperCase(),
        time: format(new Date(t.created_at), "HH:mm"),
        cashier: t.cashier_name || "Kasir",
        items: t.total_items,
        total: Number(t.total_amount),
        method: t.payment_method,
      }));

      return {
        pendapatanHariIni,
        totalTransaksi,
        rataRataBelanja,
        categoryShare,
        salesByHour,
        salesByDay,
        salesByWeek,
        weeklySales,
        recentTransactions,
      };
    },
  });
}
