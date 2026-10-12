import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

/**
 * Langganan akun (lihat bagian 10 di supabase_schema.sql).
 * Status dihitung di database; aplikasi hanya menampilkan. Mode hanya-baca juga
 * dijaga di database, jadi tampilan di sini bukan satu-satunya pengaman.
 */
export type SubscriptionState = "trial" | "active" | "grace" | "expired" | "suspended";

export type Subscription = {
  state: SubscriptionState;
  can_write: boolean;
  trial_ends_at: string | null;
  current_period_end: string | null;
  /** akhir trial / masa aktif / masa tenggang yang sedang berjalan */
  ends_at: string | null;
  days_left: number;
  is_admin: boolean;
  /** false = fitur langganan belum dipasang di database (SQL bagian 10 belum dijalankan) */
  available: boolean;
};

export type SubscriptionPlan = { months: 1 | 6 | 12; price: number; label: string };

export type SubscriptionInvoice = {
  id: string;
  order_id: string;
  months: number;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  source: "midtrans" | "manual";
  payment_type: string | null;
  snap_redirect_url: string | null;
  period_end: string | null;
  paid_at: string | null;
  created_at: string;
};

const NOT_INSTALLED: Subscription = {
  state: "active",
  can_write: true,
  trial_ends_at: null,
  current_period_end: null,
  ends_at: null,
  days_left: 0,
  is_admin: false,
  available: false,
};

const isMissing = (err: { code?: string }) =>
  err.code === "PGRST202" || err.code === "42883" || err.code === "PGRST205" || err.code === "42P01";

/**
 * Petunjuk "akun ini founder" dari kunjungan sebelumnya, supaya tampilan kasir tidak
 * sempat berkedip sebelum status dari database datang. Hanya untuk tampilan: hak akses
 * founder tetap diperiksa di database.
 */
const ADMIN_HINT_KEY = "crave_founder_hint";
export const readAdminHint = () => {
  try {
    return localStorage.getItem(ADMIN_HINT_KEY) === "1";
  } catch {
    return false;
  }
};
const writeAdminHint = (value: boolean) => {
  try {
    if (value) localStorage.setItem(ADMIN_HINT_KEY, "1");
    else localStorage.removeItem(ADMIN_HINT_KEY);
  } catch {
    // penyimpanan lokal tidak tersedia: abaikan
  }
};

const apiUrl = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/billing/${path}`;

export async function callBilling<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Silakan login ulang");
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !json) throw new Error(json?.error || "Server penagihan tidak merespons");
  return json;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["subscription", user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<Subscription> => {
      const { data, error } = await supabase.rpc("my_subscription");
      if (error) {
        if (isMissing(error)) return NOT_INSTALLED;
        throw new Error(error.message);
      }
      const sub = { ...(data as Omit<Subscription, "available">), available: true };
      writeAdminHint(sub.is_admin);
      return sub;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: ["subscription-invoices", user?.id] });
  };

  return { subscription: query.data, isLoading: query.isLoading, refresh };
}

export function useSubscriptionBilling() {
  const { user } = useAuth();
  const { subscription, refresh } = useSubscription();
  const enabled = !!user && subscription?.available === true;

  const plans = useQuery({
    queryKey: ["subscription-plans"],
    enabled,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("months, price, label")
        .order("months");
      if (error) throw new Error(error.message);
      return (data ?? []) as SubscriptionPlan[];
    },
  });

  const invoices = useQuery({
    queryKey: ["subscription-invoices", user?.id],
    enabled,
    queryFn: async (): Promise<SubscriptionInvoice[]> => {
      const { data, error } = await supabase
        .from("subscription_invoices")
        .select(
          "id, order_id, months, amount, status, source, payment_type, snap_redirect_url, period_end, paid_at, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return (data ?? []) as SubscriptionInvoice[];
    },
  });

  /** Buat tagihan lalu pindah ke halaman pembayaran Midtrans. */
  const pay = useMutation({
    mutationFn: async (months: number) => {
      const res = await callBilling<{ order_id: string; redirect_url: string }>("create", { months });
      window.location.href = res.redirect_url;
      return res;
    },
  });

  /** Cek status tagihan ke Midtrans (saat kembali dari halaman bayar). */
  const sync = useMutation({
    mutationFn: (orderId: string) =>
      callBilling<{ status: SubscriptionInvoice["status"] }>("sync", { order_id: orderId }),
    onSettled: refresh,
  });

  /** Batalkan tagihan yang masih menunggu pembayaran. */
  const cancel = useMutation({
    mutationFn: (orderId: string) =>
      callBilling<{ status: SubscriptionInvoice["status"] }>("cancel", { order_id: orderId }),
    onSettled: refresh,
  });

  return { plans: plans.data ?? [], invoices: invoices.data ?? [], pay, sync, cancel, refresh };
}
