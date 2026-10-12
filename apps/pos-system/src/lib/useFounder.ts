import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { callBilling, type SubscriptionState } from "./useSubscription";

/**
 * Data dashboard founder (bagian 10 & 11 di supabase_schema.sql).
 * Semua fungsi di database menolak akun yang bukan app_admins.
 */
export type Merchant = {
  user_id: string;
  email: string;
  name: string;
  store_name: string;
  registered_at: string;
  last_sign_in_at: string | null;
  state: SubscriptionState;
  trial_ends_at: string | null;
  current_period_end: string | null;
  note: string | null;
  tx_30d: number;
  sales_30d: number;
  tx_total: number;
  paid_total: number;
  is_admin: boolean;
};

export type InvoiceStatus = "pending" | "paid" | "expired" | "cancelled";

export type AdminInvoice = {
  order_id: string;
  email: string;
  months: number;
  amount: number;
  status: InvoiceStatus;
  source: "midtrans" | "manual";
  payment_type: string | null;
  created_at: string;
  paid_at: string | null;
};

export type Analytics = {
  days: number;
  kpi: {
    merchants: number;
    trial: number;
    active: number;
    grace: number;
    expired: number;
    suspended: number;
    signups: number;
    signups_prev: number;
    gmv: number;
    gmv_prev: number;
    tx: number;
    tx_prev: number;
    active_merchants: number;
    active_merchants_prev: number;
    revenue_total: number;
    revenue: number;
    revenue_prev: number;
    paid_merchants: number;
    mrr: number;
    pending_invoices: number;
  };
  daily: { date: string; signups: number; tx: number; gmv: number; active: number; revenue: number }[];
  monthly: { month: string; revenue: number; invoices: number }[];
  plans: { months: number; count: number; amount: number }[];
  methods: { method: string; count: number; amount: number }[];
  expiring: {
    user_id: string;
    email: string;
    store_name: string;
    state: SubscriptionState;
    ends_at: string;
  }[];
  top: { user_id: string; email: string; store_name: string; gmv: number; tx: number }[];
};

export type Live = {
  now: string;
  tx_hour: number;
  gmv_hour: number;
  tx_today: number;
  gmv_today: number;
  merchants_today: number;
  active_now: number;
  online: number;
  minutes: { ago: number; tx: number; gmv: number }[];
  feed: {
    type: "transaction" | "signup" | "payment";
    at: string;
    who: string;
    amount: number | null;
    detail: string | null;
  }[];
};

export type MerchantDetail = {
  products: number;
  employees: number;
  tx_total: number;
  gmv_total: number;
  last_tx_at: string | null;
  devices: number;
  qris_connected: boolean;
  daily: { date: string; tx: number; gmv: number }[];
  invoices: {
    order_id: string;
    months: number;
    amount: number;
    status: InvoiceStatus;
    source: "midtrans" | "manual";
    payment_type: string | null;
    created_at: string;
    paid_at: string | null;
    period_end: string | null;
  }[];
};

export type FounderAction = "extend_trial" | "add_months" | "suspend" | "unsuspend" | "set_note";

/** true = SQL bagian 11 belum dijalankan */
const isMissing = (err: { code?: string }) => err.code === "PGRST202" || err.code === "42883";
export class NotInstalledError extends Error {
  constructor() {
    super("Analitik founder belum dipasang. Jalankan supabase_founder.sql di Supabase SQL Editor.");
  }
}

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) {
    if (isMissing(error)) throw new NotInstalledError();
    throw new Error(error.message);
  }
  return data as T;
}

const num = <T extends Record<string, unknown>>(row: T, keys: (keyof T)[]): T => {
  const out = { ...row };
  for (const k of keys) out[k] = Number(row[k] ?? 0) as T[keyof T];
  return out;
};

export function useAnalytics(days: number) {
  return useQuery({
    queryKey: ["founder-analytics", days],
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: (count, err) => !(err instanceof NotInstalledError) && count < 2,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<Analytics> => {
      const a = await rpc<Analytics>("admin_analytics", { p_days: days });
      return {
        ...a,
        kpi: num(a.kpi, Object.keys(a.kpi) as (keyof Analytics["kpi"])[]),
        daily: a.daily.map((d) => num(d, ["signups", "tx", "gmv", "active", "revenue"])),
        monthly: a.monthly.map((m) => num(m, ["revenue", "invoices"])),
        plans: a.plans.map((p) => num(p, ["count", "amount"])),
        methods: a.methods.map((m) => num(m, ["count", "amount"])),
        top: a.top.map((t) => num(t, ["gmv", "tx"])),
      };
    },
  });
}

/** Pemantauan langsung: diperbarui tiap 10 detik selama tab terbuka. */
export function useLive() {
  return useQuery({
    queryKey: ["founder-live"],
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    retry: (count, err) => !(err instanceof NotInstalledError) && count < 2,
    queryFn: async (): Promise<Live> => {
      const l = await rpc<Live>("admin_live");
      return {
        ...num(l, ["tx_hour", "gmv_hour", "tx_today", "gmv_today", "merchants_today", "active_now", "online"]),
        minutes: l.minutes.map((m) => num(m, ["tx", "gmv"])),
        feed: l.feed.map((f) => ({ ...f, amount: f.amount === null ? null : Number(f.amount) })),
      };
    },
  });
}

export function useMerchants() {
  return useQuery({
    queryKey: ["founder-merchants"],
    refetchInterval: 60_000,
    queryFn: async (): Promise<Merchant[]> => {
      const rows = await rpc<Merchant[]>("admin_list_merchants");
      return (rows ?? [])
        .filter((m) => !m.is_admin)
        .map((m) => num(m, ["tx_30d", "sales_30d", "tx_total", "paid_total"]));
    },
  });
}

export function useMerchantDetail(userId: string | null) {
  return useQuery({
    queryKey: ["founder-merchant", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async (): Promise<MerchantDetail> => {
      const d = await rpc<MerchantDetail>("admin_merchant_detail", { p_user: userId });
      return {
        ...num(d, ["products", "employees", "tx_total", "gmv_total", "devices"]),
        daily: d.daily.map((x) => num(x, ["tx", "gmv"])),
      };
    },
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ["founder-invoices"],
    refetchInterval: 30_000,
    queryFn: async () => (await rpc<AdminInvoice[]>("admin_list_invoices", { p_limit: 500 })) ?? [],
  });
}

export function useFounderActions() {
  const queryClient = useQueryClient();
  const refreshAll = () => {
    for (const key of ["founder-merchants", "founder-invoices", "founder-analytics", "founder-live", "founder-merchant"]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const update = useMutation({
    mutationFn: (input: {
      userId: string;
      action: FounderAction;
      value?: number | undefined;
      note?: string | undefined;
    }) =>
      rpc<SubscriptionState>("admin_update_subscription", {
        p_user: input.userId,
        p_action: input.action,
        p_value: input.value ?? null,
        p_note: input.note ?? null,
      }),
    onSuccess: refreshAll,
  });

  /** Tanyakan status tagihan pending langsung ke Midtrans. */
  const syncInvoice = useMutation({
    mutationFn: (orderId: string) => callBilling<{ status: InvoiceStatus }>("sync", { order_id: orderId }),
    onSettled: refreshAll,
  });

  const updatePlan = useMutation({
    mutationFn: (input: { months: number; price: number }) =>
      rpc<null>("admin_update_plan", { p_months: input.months, p_price: input.price }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["subscription-plans"] }),
  });

  return { update, syncInvoice, updatePlan };
}

/** Unduh baris sebagai CSV (dibuka rapi di Excel: pemisah titik koma + BOM). */
export function downloadCsv(filename: string, header: string[], rows: (string | number | null)[][]) {
  const cell = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    // awalan = + - @ bisa dijalankan sebagai rumus oleh Excel → netralkan
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const body = [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
