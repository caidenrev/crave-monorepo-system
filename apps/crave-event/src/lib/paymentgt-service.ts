/**
 * ============================================================================
 * PAYMENTGT CLIENT SERVICE ADAPTER (MULTI-TENANT)
 * ============================================================================
 * Menghubungkan Crave Event dengan gateway QRIS dinamis & real-time settlement
 * Crave Payment Services (Vercel Serverless Go backend).
 *
 * Catatan: Adapter ini SUDANG SEJALAN dengan versi pos-system (multi-tenant)
 * agar gateway dapat melakukan pengecekan mutasi ShopeePay secara realtime
 * untuk mendeteksi status PAID. Tanpa static_qris & session_json, gateway
 * tidak memiliki konteks merchant → status tidak akan pernah PAID → polling
 * client tidak akan detect pembayaran berhasil.
 */

export const PAYMENTGT_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PAYMENTGT_URL"]) ||
  "https://crave-payment-services-57oz.vercel.app";

/**
 * Session JSON merchant Shopee default untuk pembayaran tiket event.
 * Wajib di-set lewat VITE_PAYMENTGT_SESSION_JSON pada env crave-event.
 * Tanpa ini gateway tidak bisa mengecek mutasi ShopeePay → status tidak realtime.
 */
export const PAYMENTGT_DEFAULT_SESSION_JSON =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PAYMENTGT_SESSION_JSON"]) || "";

/**
 * Static QRIS merchant default untuk pembayaran tiket event.
 * Opsional: hanya dipakai jika gateway butuh QRIS statis fallback.
 */
export const PAYMENTGT_DEFAULT_STATIC_QRIS =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PAYMENTGT_STATIC_QRIS"]) || "";

export type PaymentGTHalthResponse = {
  status: string;
  merchant?: string;
  store_id?: string;
  timestamp?: number;
  runtime?: string;
};

export type PaymentGTCreateResponse = {
  success: boolean;
  payment_id: string;
  order_id: string;
  amount: number;
  unique_amount: number;
  unique_offset: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "pending" | "paid" | "expired" | string;
  qris_string: string;
  qris_image_base64: string;
  expires_at: string;
  created_at: string;
};

export type PaymentGTStatusResponse = {
  success: boolean;
  payment_id: string;
  order_id?: string;
  amount?: number;
  unique_amount: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "pending" | "paid" | "expired" | string;
  expires_at?: string;
  paid_at?: string;
  transaction_id?: string;
  payment_type?: string;
};

/**
 * Memeriksa apakah gateway server PaymentGT aktif dan terhubung dengan merchant
 */
export async function checkPaymentGTHealth(): Promise<{
  active: boolean;
  merchant?: string;
  storeId?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(`${PAYMENTGT_BASE_URL}/api`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: PaymentGTHalthResponse = await res.json();
      return {
        active: data.status === "ok",
        ...(data.merchant !== undefined && { merchant: data.merchant }),
        ...(data.store_id !== undefined && { storeId: data.store_id }),
      };
    }
  } catch {
    // Gateway offline atau unreachable
  }
  return { active: false };
}


/**
 * Membuat invoice tagihan QRIS dinamis dengan nominal pas (Clean Pricing).
 *
 * PENTING: staticQris & sessionJson wajib disertakan agar gateway dapat
 * mengenali merchant Shopee dan melakukan pengecekan mutasi realtime.
 * Tanpa session_json, gateway tidak tahu merchant mana yang harus di-cek
 * mutasinya → status tidak akan pernah berubah jadi PAID.
 */
export async function createPaymentGTInvoice(params: {
  orderId: string;
  amount: number;
  expiresInMinutes?: number;
  callbackUrl?: string;
  staticQris?: string;
  sessionJson?: string;
}): Promise<PaymentGTCreateResponse> {
  // Resolve static_qris & session_json: prioritaskan parameter eksplisit,
  // fallback ke env default crave-event.
  const staticQris = params.staticQris || PAYMENTGT_DEFAULT_STATIC_QRIS;
  const sessionJson = params.sessionJson || PAYMENTGT_DEFAULT_SESSION_JSON;

  const res = await fetch(`${PAYMENTGT_BASE_URL}/api/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(staticQris ? { "X-Static-Qris": staticQris } : {}),
    },
    body: JSON.stringify({
      order_id: params.orderId,
      amount: params.amount,
      expires_in_minutes: params.expiresInMinutes || 10,
      static_qris: staticQris || "",
      session_json: sessionJson || "",
      callback_url: params.callbackUrl || "",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal membuat QRIS PaymentGT: ${errorText}`);
  }

  const data: PaymentGTCreateResponse = await res.json();
  return data;
}

/**
 * Mengecek status pembayaran terkini berdasarkan payment_id.
 *
 * PENTING: Jika session_json tersedia, gunakan POST /api/payment/status
 * (multi-tenant query) supaya gateway mengecek mutasi ShopeePay merchant
 * terkait secara realtime. Tanpa session_json, gateway hanya mengembalikan
 * status cache yang mungkin tidak up-to-date → status tidak realtime PAID.
 */
export async function getPaymentGTStatus(
  paymentId: string,
  amount?: number,
  sessionJson?: string,
): Promise<PaymentGTStatusResponse> {
  // Resolve session_json: prioritaskan parameter eksplisit, fallback env default.
  const session = sessionJson || PAYMENTGT_DEFAULT_SESSION_JSON;

  let res: Response;

  if (session) {
    // Gunakan POST multi-tenant jika session json tersedia — ini trigger
    // pengecekan mutasi ShopeePay realtime di gateway (serverless Go).
    res = await fetch(`${PAYMENTGT_BASE_URL}/api/payment/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount || 0,
        session_json: session,
      }),
    });
  } else {
    // Fallback GET status (tanpa multi-tenant) — gunakan cache gateway.
    const query = amount ? `?amount=${amount}` : "";
    res = await fetch(`${PAYMENTGT_BASE_URL}/api/payments/${paymentId}${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (!res.ok) {
    throw new Error(`Gagal mengecek status pembayaran ${paymentId}`);
  }

  const data: PaymentGTStatusResponse = await res.json();
  return data;
}
