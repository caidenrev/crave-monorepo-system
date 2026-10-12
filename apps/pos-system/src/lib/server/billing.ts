/**
 * Penagihan langganan — HANYA untuk server (dipakai route /api/billing/*).
 *
 * Kunci rahasia dibaca dari environment saat dijalankan (Vercel → Settings →
 * Environment Variables), tidak pernah ditulis di kode atau dikirim ke browser:
 *   MIDTRANS_SERVER_KEY        Server Key Midtrans (Sandbox atau Production)
 *   MIDTRANS_IS_PRODUCTION     "true" untuk Production, selain itu Sandbox
 *   SUPABASE_SERVICE_ROLE_KEY  service role key Supabase (melewati RLS)
 *   VITE_SUPABASE_URL          URL project Supabase (sama dengan yang dipakai aplikasi)
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = (key: string): string | undefined => {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return fromProcess ?? (import.meta.env as Record<string, string | undefined>)?.[key];
};

export class BillingError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/** Bungkus handler agar error selalu jadi JSON yang rapi (tanpa membocorkan detail internal). */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof BillingError) return json({ error: err.message }, err.status);
    console.error("[billing]", err);
    return json({ error: "Terjadi kesalahan di server penagihan" }, 500);
  }
}

function config() {
  const serverKey = env("MIDTRANS_SERVER_KEY");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = env("VITE_SUPABASE_URL") ?? env("SUPABASE_URL");
  if (!serverKey || !serviceKey || !supabaseUrl) {
    throw new BillingError(
      "Pembayaran online belum dikonfigurasi. Hubungi admin Crave.",
      503,
    );
  }
  const isProduction = env("MIDTRANS_IS_PRODUCTION") === "true";
  return {
    serverKey,
    serviceKey,
    supabaseUrl,
    snapUrl: isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions",
    apiBase: isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com",
  };
}

/** Status konfigurasi untuk halaman founder: hanya ya/tidak, tidak pernah nilai kuncinya. */
export function billingHealth() {
  const midtrans = !!env("MIDTRANS_SERVER_KEY");
  const supabase = !!env("SUPABASE_SERVICE_ROLE_KEY") && !!(env("VITE_SUPABASE_URL") ?? env("SUPABASE_URL"));
  return {
    configured: midtrans && supabase,
    midtrans,
    supabase,
    production: env("MIDTRANS_IS_PRODUCTION") === "true",
  };
}

export function adminClient(): SupabaseClient {
  const { supabaseUrl, serviceKey } = config();
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Pengguna yang login, dari header Authorization: Bearer <access token Supabase>. */
export async function requireUser(request: Request, admin: SupabaseClient) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new BillingError("Silakan login ulang", 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new BillingError("Sesi login tidak valid, silakan login ulang", 401);
  return data.user;
}

/**
 * Alamat notifikasi pembayaran untuk tagihan Crave POS. Bisa dipaksa lewat env
 * BILLING_NOTIFY_URL; kalau tidak, diturunkan dari alamat aplikasi. Alamat lokal
 * dilewati karena Midtrans tidak bisa menjangkaunya (status tetap dicek lewat /sync).
 */
export function notifyUrlFor(origin: string): string | undefined {
  const fixed = env("BILLING_NOTIFY_URL");
  if (fixed) return fixed;
  if (!/^https:\/\//.test(origin) || /localhost|127\.0\.0\.1/.test(origin)) return undefined;
  return `${origin}/pos-system/api/billing/notify`;
}

const basicAuth = (serverKey: string) => "Basic " + btoa(serverKey + ":");

export type InvoiceRow = {
  id: string;
  user_id: string;
  order_id: string;
  months: number;
  amount: number;
  status: "pending" | "paid" | "expired" | "cancelled";
  snap_redirect_url: string | null;
};

/** Buat halaman pembayaran Snap untuk satu tagihan. */
export async function createSnapTransaction(opts: {
  invoice: InvoiceRow;
  email: string;
  name: string;
  finishUrl: string;
  /** alamat notifikasi khusus tagihan ini (lihat notifyUrlFor) */
  notifyUrl?: string | undefined;
}): Promise<{ token: string; redirect_url: string }> {
  const { serverKey, snapUrl } = config();
  const res = await fetch(snapUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: basicAuth(serverKey),
      // Akun Midtrans ini juga dipakai aplikasi lain, jadi Notification URL di dashboard
      // Midtrans tidak diubah: tagihan Crave POS membawa alamat notifikasinya sendiri.
      ...(opts.notifyUrl ? { "X-Override-Notification": opts.notifyUrl } : {}),
    },
    body: JSON.stringify({
      transaction_details: { order_id: opts.invoice.order_id, gross_amount: opts.invoice.amount },
      item_details: [
        {
          id: `crave-pos-${opts.invoice.months}m`,
          price: opts.invoice.amount,
          quantity: 1,
          name: `Langganan Crave POS ${opts.invoice.months} bulan`,
        },
      ],
      customer_details: { email: opts.email, first_name: opts.name.slice(0, 50) || "Pelanggan" },
      callbacks: { finish: opts.finishUrl },
      expiry: { unit: "hours", duration: 24 },
    }),
  });
  const body = (await res.json().catch(() => null)) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  } | null;
  if (!res.ok || !body?.token || !body.redirect_url) {
    console.error("[billing] Snap gagal", res.status, body?.error_messages);
    throw new BillingError("Gagal membuat halaman pembayaran. Coba lagi beberapa saat.", 502);
  }
  return { token: body.token, redirect_url: body.redirect_url };
}

export type MidtransStatus = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
};

async function sha512Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Notifikasi asli dari Midtrans? signature = sha512(order_id + status_code + gross_amount + server key) */
export async function isValidNotification(n: MidtransStatus): Promise<boolean> {
  const { serverKey } = config();
  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) return false;
  const expected = await sha512Hex(n.order_id + n.status_code + n.gross_amount + serverKey);
  // perbandingan waktu-konstan sederhana
  if (expected.length !== n.signature_key.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ n.signature_key.charCodeAt(i);
  return diff === 0;
}

/** Tanya status terbaru langsung ke Midtrans (dipakai saat pengguna kembali dari halaman bayar). */
export async function fetchMidtransStatus(orderId: string): Promise<MidtransStatus | null> {
  const { serverKey, apiBase } = config();
  const res = await fetch(`${apiBase}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { accept: "application/json", authorization: basicAuth(serverKey) },
  });
  const body = (await res.json().catch(() => null)) as MidtransStatus | null;
  // 404 = transaksi belum dibuat di Midtrans (pengguna belum memilih metode bayar)
  if (!body || body.status_code === "404") return null;
  return body;
}

/**
 * Terapkan status dari Midtrans ke tagihan kita.
 * Lunas → perpanjang masa aktif (idempoten di database); batal/kedaluwarsa → tandai tagihan.
 */
export async function applyMidtransStatus(
  admin: SupabaseClient,
  s: MidtransStatus,
): Promise<"paid" | "pending" | "expired" | "cancelled"> {
  if (!s.order_id) throw new BillingError("order_id kosong");
  const paid =
    s.transaction_status === "settlement" ||
    (s.transaction_status === "capture" && (s.fraud_status ?? "accept") === "accept");

  if (paid) {
    const { error } = await admin.rpc("apply_subscription_payment", {
      p_order_id: s.order_id,
      p_payment_type: s.payment_type ?? "unknown",
      p_gross_amount: Math.round(Number(s.gross_amount)),
      p_source: "midtrans",
    });
    if (error) {
      console.error("[billing] apply_subscription_payment", error.message);
      throw new BillingError("Pembayaran diterima tetapi gagal dicatat. Hubungi admin Crave.", 500);
    }
    return "paid";
  }

  const next =
    s.transaction_status === "expire"
      ? "expired"
      : s.transaction_status === "cancel" || s.transaction_status === "deny"
        ? "cancelled"
        : "pending";
  if (next !== "pending") {
    // hanya tagihan yang masih pending; tagihan lunas tidak pernah diturunkan statusnya
    await admin
      .from("subscription_invoices")
      .update({ status: next })
      .eq("order_id", s.order_id)
      .eq("status", "pending");
  }
  return next;
}
