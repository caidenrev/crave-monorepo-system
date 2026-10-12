import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Test untuk paymentgt-service: verifikasi URL composition dan error handling.
 * fetch di-mock agar tidak benar-benar memanggil gateway.
 */

const PAYMENTGT_URL = "https://crave-payment-services-57oz.vercel.app";

describe("paymentgt-service URL dan fetch behavior", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("createPaymentGTInvoice mengirim POST ke /api/payments dengan body yang benar", async () => {
    const mockResponse = {
      success: true,
      payment_id: "pay-1",
      order_id: "order-1",
      amount: 18000,
      unique_amount: 18000,
      unique_offset: 0,
      status: "PENDING",
      qris_string: "000201...",
      qris_image_base64: "data:image/png;base64,...",
      expires_at: "2024-01-15T10:10:00Z",
      created_at: "2024-01-15T10:00:00Z",
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(""),
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { createPaymentGTInvoice } = await import("../paymentgt-service");

    const result = await createPaymentGTInvoice({
      orderId: "order-1",
      amount: 18000,
      expiresInMinutes: 10,
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${PAYMENTGT_URL}/api/payments`);
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(opts.body);
    expect(body.order_id).toBe("order-1");
    expect(body.amount).toBe(18000);
    expect(body.expires_in_minutes).toBe(10);

    expect(result.payment_id).toBe("pay-1");
    expect(result.status).toBe("PENDING");
  });

  it("getPaymentGTStatus (tanpa sessionJson) mengirim GET ke /api/payments/:id", async () => {
    const mockResponse = {
      success: true,
      payment_id: "pay-1",
      unique_amount: 18000,
      status: "PAID",
      transaction_id: "tx-123",
      paid_at: "2024-01-15T10:01:00Z",
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { getPaymentGTStatus } = await import("../paymentgt-service");

    await getPaymentGTStatus("pay-1", 18000);

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain(`${PAYMENTGT_URL}/api/payments/pay-1`);
    expect(url).toContain("amount=18000");
    expect(opts.method).toBe("GET");
  });

  it("getPaymentGTStatus (dengan sessionJson) mengirim POST ke /api/payment/status", async () => {
    const mockResponse = {
      success: true,
      payment_id: "pay-1",
      unique_amount: 18000,
      status: "PENDING",
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { getPaymentGTStatus } = await import("../paymentgt-service");

    await getPaymentGTStatus("pay-1", 18000, '{"token":"abc"}');

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${PAYMENTGT_URL}/api/payment/status`);
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.payment_id).toBe("pay-1");
    expect(body.session_json).toBe('{"token":"abc"}');
  });

  it("createPaymentGTInvoice melempar error bila response tidak ok", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { createPaymentGTInvoice } = await import("../paymentgt-service");

    await expect(
      createPaymentGTInvoice({ orderId: "order-x", amount: 1000 }),
    ).rejects.toThrow("Gagal membuat QRIS PaymentGT");
  });

  it("checkPaymentGTHealth mengembalikan active=false bila fetch gagal", async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error("network error"));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { checkPaymentGTHealth } = await import("../paymentgt-service");

    const result = await checkPaymentGTHealth();
    expect(result.active).toBe(false);
  });

  it("checkPaymentGTHealth mengembalikan active=true bila status ok", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "ok",
          merchant: "Test Merchant",
          store_id: "store-1",
        }),
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    const { checkPaymentGTHealth } = await import("../paymentgt-service");

    const result = await checkPaymentGTHealth();
    expect(result.active).toBe(true);
    expect(result.merchant).toBe("Test Merchant");
    expect(result.storeId).toBe("store-1");
  });
});
