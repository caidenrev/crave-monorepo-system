import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { isToday, isPast, parseISO } from "date-fns";

export type SupabaseDebt = {
  id: string;
  customer: string;
  phone: string | null;
  amount: number;
  paid: number;
  due_date: string | null;
  type: "utang" | "piutang";
  created_at: string;
};

export type DebtWithStatus = SupabaseDebt & {
  status: "Berjalan" | "Terlambat" | "Lunas" | "Jatuh tempo hari ini";
};

function getDebtStatus(debt: SupabaseDebt): DebtWithStatus["status"] {
  if (debt.paid >= debt.amount) return "Lunas";
  if (!debt.due_date) return "Berjalan";

  const dueDate = parseISO(debt.due_date);
  if (isNaN(dueDate.getTime())) return "Berjalan";

  if (isToday(dueDate)) return "Jatuh tempo hari ini";
  if (isPast(dueDate)) return "Terlambat";
  return "Berjalan";
}

export function useDebts(type: "utang" | "piutang" = "utang") {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["debts", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") throw new Error(error.message);

      const debts: SupabaseDebt[] = data || [];
      return debts.map((d) => ({
        ...d,
        status: getDebtStatus(d),
      }));
    },
  });

  const addDebtMutation = useMutation({
    mutationFn: async (
      newDebt: Omit<SupabaseDebt, "id" | "created_at" | "paid" | "type"> & {
        type?: "utang" | "piutang";
      },
    ) => {
      const { data, error } = await supabase
        .from("debts")
        .insert([
          {
            customer: newDebt.customer,
            phone: newDebt.phone,
            amount: newDebt.amount,
            due_date: newDebt.due_date,
            type: newDebt.type || type,
            paid: 0,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", type] });
    },
  });

  const payDebtMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: currentData } = await supabase
        .from("debts")
        .select("paid")
        .eq("id", id)
        .single();

      const newPaid = (currentData?.paid || 0) + amount;

      const { data, error } = await supabase
        .from("debts")
        .update({ paid: newPaid })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", type] });
    },
  });

  return { ...query, addDebtMutation, payDebtMutation };
}
