import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

export type ReportTransaction = {
  id: string;
  created_at: string;
  cashier_name: string;
  payment_method: string;
  total_amount: number;
  total_items: number;
};

export type StockMovement = {
  id: string;
  product_id: string;
  type: "IN" | "OUT";
  qty: number;
  description: string | null;
  created_at: string;
  products?: {
    name: string;
    sku: string;
    category: string;
    stock: number;
    min_stock: number;
  };
};

export type ReportFilters = {
  period: "hari" | "minggu" | "bulan" | "tahun" | "semua";
  cashier: string;
};

export function useReports(filters: ReportFilters = { period: "bulan", cashier: "semua" }) {
  return useQuery({
    queryKey: ["reports", filters.period, filters.cashier],
    queryFn: async () => {
      let startDate: Date | null = null;
      const now = new Date();
      if (filters.period === "hari") startDate = startOfDay(now);
      else if (filters.period === "minggu") startDate = startOfWeek(now, { weekStartsOn: 1 });
      else if (filters.period === "bulan") startDate = startOfMonth(now);
      else if (filters.period === "tahun") startDate = startOfYear(now);

      let txQuery = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (startDate) txQuery = txQuery.gte("created_at", startDate.toISOString());
      if (filters.cashier !== "semua")
        txQuery = txQuery.ilike("cashier_name", `%${filters.cashier}%`);

      const { data: txs, error: txError } = await txQuery;
      if (txError) throw new Error(txError.message);

      let movQuery = supabase
        .from("stock_movements")
        .select(
          `
        *,
        products (
          name,
          sku,
          category,
          stock,
          min_stock
        )
      `,
        )
        .order("created_at", { ascending: false });

      if (startDate) movQuery = movQuery.gte("created_at", startDate.toISOString());

      const { data: movements, error: movError } = await movQuery;

      if (movError && movError.code !== "42P01") {
        console.error("Error fetching stock movements:", movError);
      }

      return {
        transactions: (txs as ReportTransaction[]) || [],
        stockMovements: (movements as StockMovement[]) || [],
      };
    },
  });
}
