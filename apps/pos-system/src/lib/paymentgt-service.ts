/**
 * ============================================================================
 * CRAVE POS — PAYMENTGT CLIENT SERVICE ADAPTER (MULTI-TENANT)
 * ============================================================================
 * Menghubungkan Crave POS dengan gateway QRIS dinamis & real-time settlement
 * Crave Payment Services (Vercel Serverless Go backend).
 */

export const PAYMENTGT_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.["VITE_PAYMENTGT_URL"]) ||
  "https://crave-payment-services-57oz.vercel.app";

export type PaymentGTHealthResponse = {
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

export type ShopeeOtpChallenge = {
  version: number;
  phoneNumber: string;
  channel: number;
  availableChannels?: number[];
  deviceFingerprint: string;
  riskToken: string;
  hasPassword?: boolean;
  cookies?: Record<string, string>;
  requestedAt: number;
};

export type ShopeeMerchantSummary = {
  id: string;
  name: string;
  staffUserId: number;
  isActive: boolean;
  isBanned: boolean;
  currency?: string;
};

export type ShopeeStore = {
  id: string;
  name: string;
  merchantId: string;
  address?: string;
};

export type ShopeeOtpVerifyResponse = {
  success: boolean;
  status: "CONNECTED" | "MERCHANT_SELECTION_NEEDED";
  session?: any;
  merchant?: ShopeeMerchantSummary;
  store_id?: string;
  stores?: ShopeeStore[];
  merchants?: ShopeeMerchantSummary[];
  verification?: any;
  error?: string;
};

/**
 * Memeriksa apakah gateway server PaymentGT aktif dan terhubung
 */
export async function checkPaymentGTHealth(): Promise<{
  active: boolean;
  merchant?: string;
  storeId?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${PAYMENTGT_BASE_URL}/api`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: PaymentGTHealthResponse = await res.json();
      return {
        active: data.status === "ok",
        ...(data.merchant !== undefined && { merchant: data.merchant }),
        ...(data.store_id !== undefined && { storeId: data.store_id }),
      };
    }
  } catch {
    // Gateway unreachable
  }
  return { active: false };
}

/**
 * Meminta OTP login Shopee Merchant langsung dari browser via PaymentGT API
 */
export async function requestShopeeOtp(params: {
  phone: string;
  password?: string | undefined;
  channel?: number | undefined;
}): Promise<{
  success: boolean;
  challenge: ShopeeOtpChallenge;
  channel_name?: string;
  message: string;
}> {
  const res = await fetch(`${PAYMENTGT_BASE_URL}/api/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: params.phone,
      password: params.password || "",
      channel: params.channel || 3, // 3 = WhatsApp, 1 = SMS
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Gagal meminta kode OTP Shopee");
  }

  return data;
}

/**
 * Memverifikasi kode OTP Shopee Merchant dan mendapatkan Session JSON
 */
export async function verifyShopeeOtp(params: {
  challenge: ShopeeOtpChallenge;
  otp: string;
  merchantId?: string | undefined;
  storeId?: string | undefined;
}): Promise<ShopeeOtpVerifyResponse> {
  const res = await fetch(`${PAYMENTGT_BASE_URL}/api/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challenge: params.challenge,
      otp: params.otp,
      merchant_id: params.merchantId || "",
      store_id: params.storeId || "",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Verifikasi OTP Shopee gagal");
  }

  return data;
}

/**
 * Menyelesaikan login jika ada pemilihan multi-merchant
 */
export async function completeShopeeLogin(params: {
  verification: any;
  merchantId: string;
  storeId?: string | undefined;
}): Promise<ShopeeOtpVerifyResponse> {
  const res = await fetch(`${PAYMENTGT_BASE_URL}/api/auth/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      verification: params.verification,
      merchant_id: params.merchantId,
      store_id: params.storeId || "",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Penyelesaian login merchant gagal");
  }

  return data;
}

/**
 * Mengecek keaktifan Session Shopee Merchant dan mengambil info akun
 */
export async function checkShopeeMerchantInfo(sessionJson: string | object): Promise<{
  active: boolean;
  merchant?: ShopeeMerchantSummary | undefined;
  storeId?: string | undefined;
  stores?: ShopeeStore[] | undefined;
  /**
   * Session hasil silent renewal dari gateway (cookie Shopee dirotasi).
   * Wajib disimpan balik ke DB — session lama bisa ditolak Shopee setelah renewal.
   */
  renewedSession?: string | undefined;
  /** Kode error gateway, mis. "AUTH_REQUIRED" → wajib login OTP ulang. */
  errorCode?: string | undefined;
  /** true jika gateway tidak bisa dihubungi — status session tidak diketahui. */
  networkError?: boolean | undefined;
  error?: string | undefined;
}> {
  try {
    const raw = typeof sessionJson === "string" ? sessionJson : JSON.stringify(sessionJson);
    const res = await fetch(`${PAYMENTGT_BASE_URL}/api/merchant/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_json: raw }),
    });

    const data = await res.json();
    // Gateway tetap mengirim `active: true` walau session ditolak Shopee; error
    // sebenarnya ada di field `err` (mis. AUTH_REQUIRED) dan merchant.id kosong.
    const gatewayErr = data.err as { Code?: string; Message?: string } | null | undefined;
    if (res.ok && data.success && data.active && !gatewayErr && data.merchant?.id) {
      let renewedSession: string | undefined;
      if (data.session?.cookies && data.session?.accountId) {
        let oldCookies: unknown = null;
        try {
          oldCookies = JSON.parse(raw)?.cookies ?? null;
        } catch {
          // session lama tidak valid JSON → anggap berubah
        }
        if (JSON.stringify(oldCookies) !== JSON.stringify(data.session.cookies)) {
          renewedSession = JSON.stringify(data.session);
        }
      }
      return {
        active: true,
        merchant: data.merchant,
        storeId: data.store_id,
        stores: data.stores || [],
        renewedSession,
      };
    }
    return {
      active: false,
      errorCode: gatewayErr?.Code,
      error: gatewayErr?.Message || data.error || "Sesi tidak aktif",
    };
  } catch (err: any) {
    return { active: false, networkError: true, error: err.message };
  }
}

/**
 * Membuat invoice tagihan QRIS dinamis dengan nominal pas (Clean Pricing)
 */
export async function createPaymentGTInvoice(params: {
  orderId: string;
  amount: number;
  expiresInMinutes?: number | undefined;
  staticQris?: string | undefined;
  sessionJson?: string | undefined;
}): Promise<PaymentGTCreateResponse> {
  const res = await fetch(`${PAYMENTGT_BASE_URL}/api/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params.staticQris ? { "X-Static-Qris": params.staticQris } : {}),
    },
    body: JSON.stringify({
      order_id: params.orderId,
      amount: params.amount,
      expires_in_minutes: params.expiresInMinutes || 10,
      static_qris: params.staticQris || "",
      session_json: params.sessionJson || "",
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
 * Mengecek status pembayaran terkini secara real-time ke Shopee feed
 */
export async function getPaymentGTStatus(
  paymentId: string,
  amount?: number | undefined,
  sessionJson?: string | undefined,
): Promise<PaymentGTStatusResponse> {
  let res: Response;

  if (sessionJson) {
    // Gunakan POST jika session json disertakan untuk multi-tenant query
    res = await fetch(`${PAYMENTGT_BASE_URL}/api/payment/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount || 0,
        session_json: sessionJson,
      }),
    });
  } else {
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
