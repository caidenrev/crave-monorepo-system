/**
 * Proxy admin gateway QRIS (crave-payment-services /api/v2/admin/*) — HANYA server.
 *
 * Token admin gateway dibaca dari environment dan tidak pernah dikirim ke browser:
 *   GATEWAY_ADMIN_TOKEN  sama dengan ADMIN_TOKEN di project Vercel gateway
 *   GATEWAY_URL          opsional, default gateway produksi
 */
import { createClient } from "@supabase/supabase-js";

const env = (key: string): string | undefined => {
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return (fromProcess ?? (import.meta.env as Record<string, string | undefined>)?.[key])?.trim() || undefined;
};

export const GATEWAY_DEFAULT_URL = "https://crave-payment-services-57oz.vercel.app";

export class GatewayError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

/** Hanya founder (app_admins) yang boleh memakai proxy ini. */
async function requireFounder(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = env("VITE_SUPABASE_URL") ?? env("SUPABASE_URL");
  const anon = env("VITE_SUPABASE_ANON_KEY") ?? env("SUPABASE_ANON_KEY");
  if (!token) throw new GatewayError("Silakan login ulang", 401);
  if (!url || !anon) throw new GatewayError("Konfigurasi Supabase server belum lengkap", 503);
  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.rpc("my_subscription");
  if (error) throw new GatewayError("Sesi login tidak valid, silakan login ulang", 401);
  if (!(data as { is_admin?: boolean } | null)?.is_admin) throw new GatewayError("Khusus founder", 403);
}

/** Aksi yang diizinkan → endpoint admin gateway. Selain daftar ini ditolak. */
const ACTIONS: Record<string, { method: "GET" | "POST"; path: (p: Record<string, unknown>) => string }> = {
  merchants: { method: "GET", path: () => "/api/v2/admin/merchants" },
  apps: { method: "GET", path: () => "/api/v2/admin/apps" },
  otp_request: { method: "POST", path: () => "/api/v2/admin/otp/request" },
  otp_verify: { method: "POST", path: () => "/api/v2/admin/otp/verify" },
  otp_complete: { method: "POST", path: () => "/api/v2/admin/otp/complete" },
  create_app: { method: "POST", path: () => "/api/v2/admin/apps" },
  set_static_qris: {
    method: "POST",
    path: (p) => `/api/v2/admin/merchants/${encodeURIComponent(String(p["merchant_id"] ?? ""))}/static-qris`,
  },
};

export async function handleGatewayAdmin(request: Request): Promise<Response> {
  try {
    await requireFounder(request);
    const adminToken = env("GATEWAY_ADMIN_TOKEN");
    if (!adminToken) throw new GatewayError("GATEWAY_ADMIN_TOKEN belum dipasang di Vercel project ini", 503);

    const body = (await request.json().catch(() => null)) as { action?: unknown; payload?: unknown } | null;
    const action = typeof body?.action === "string" ? ACTIONS[body.action] : undefined;
    if (!action) throw new GatewayError("Aksi tidak dikenal");
    const payload = (body?.payload && typeof body.payload === "object" ? body.payload : {}) as Record<string, unknown>;

    const base = (env("GATEWAY_URL") ?? GATEWAY_DEFAULT_URL).replace(/\/$/, "");
    const init: RequestInit = {
      method: action.method,
      headers: { authorization: `Bearer ${adminToken}`, "content-type": "application/json" },
    };
    if (action.method === "POST") init.body = JSON.stringify(payload);
    const res = await fetch(base + action.path(payload), init);
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: `Gateway membalas ${res.status}` };
    }
    return json(data, res.status);
  } catch (err) {
    if (err instanceof GatewayError) return json({ success: false, error: err.message }, err.status);
    console.error("[gateway-admin]", err);
    return json({ success: false, error: "Gateway tidak bisa dihubungi" }, 502);
  }
}
