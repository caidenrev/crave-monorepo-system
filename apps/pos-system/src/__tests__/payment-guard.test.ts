import { describe, it, expect, beforeEach } from "vitest";
import {
  createPaymentGuard,
  isPaidStatus,
  type PaymentVerdict,
} from "../payment-guard";
import type { PaymentGTStatusResponse } from "../paymentgt-service";

function makeStatus(
  overrides: Partial<PaymentGTStatusResponse> = {},
): PaymentGTStatusResponse {
  return {
    success: true,
    payment_id: "pay-1",
    unique_amount: 18000,
    status: "PENDING",
    ...overrides,
  };
}

describe("isPaidStatus", () => {
  it("mengembalikan true untuk PAID, SETTLED, SUCCESS (case-insensitive)", () => {
    expect(isPaidStatus("PAID")).toBe(true);
    expect(isPaidStatus("paid")).toBe(true);
    expect(isPaidStatus("SETTLED")).toBe(true);
    expect(isPaidStatus("settled")).toBe(true);
    expect(isPaidStatus("SUCCESS")).toBe(true);
  });

  it("mengembalikan false untuk status belum dibayar", () => {
    expect(isPaidStatus("PENDING")).toBe(false);
    expect(isPaidStatus("EXPIRED")).toBe(false);
    expect(isPaidStatus("")).toBe(false);
    expect(isPaidStatus(undefined)).toBe(false);
  });
});

describe("createPaymentGuard — evaluasi pembayaran", () => {
  const createdAt = new Date("2024-01-15T10:00:00Z").toISOString();

  it("mengembalikan 'pending' untuk status PENDING", () => {
    const guard = createPaymentGuard(createdAt);
    const verdict = guard.evaluate(makeStatus({ status: "PENDING" }));
    expect(verdict.kind).toBe("pending");
  });

  it("mengembalikan 'paid' untuk pembayaran valid dengan transaction_id baru", () => {
    const guard = createPaymentGuard(createdAt);
    // cek pertama: PENDING (baseline)
    guard.evaluate(makeStatus({ status: "PENDING" }));
    // cek kedua: PAID dengan tx_id baru
    const verdict = guard.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-new-123",
        paid_at: new Date("2024-01-15T10:01:00Z").toISOString(),
      }),
    );
    expect(verdict.kind).toBe("paid");
  });

  it("mengembalikan 'stale' bila transaction_id sudah pernah dipakai", () => {
    const guard = createPaymentGuard(createdAt);
    // Transaksi pertama sukses dengan tx_id tertentu
    guard.evaluate(makeStatus({ status: "PENDING" }));
    guard.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-reused",
        paid_at: new Date("2024-01-15T10:02:00Z").toISOString(),
      }),
    );
    // Transaksi kedua memakai tx_id yang sama → harus stale
    const guard2 = createPaymentGuard(new Date("2024-01-15T10:05:00Z").toISOString());
    guard2.evaluate(makeStatus({ status: "PENDING" }));
    const verdict = guard2.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-reused",
        paid_at: new Date("2024-01-15T10:06:00Z").toISOString(),
      }),
    );
    expect(verdict.kind).toBe("stale");
  });

  it("mengembalikan 'stale' bila paid_at lebih awal dari invoice dibuat", () => {
    const guard = createPaymentGuard(new Date("2024-01-15T10:00:00Z").toISOString());
    guard.evaluate(makeStatus({ status: "PENDING" }));
    const verdict = guard.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-old-time",
        paid_at: new Date("2024-01-15T09:50:00Z").toISOString(), // 10 menit sebelum invoice
      }),
    );
    expect(verdict.kind).toBe("stale");
  });

  it("mengembalikan 'stale' bila PAID pada cek pertama dengan tx_id (mutasi lama)", () => {
    const guard = createPaymentGuard(createdAt);
    // Cek pertama langsung PAID — mustahil pembeli sudah scan
    const verdict = guard.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-immediate",
      }),
    );
    expect(verdict.kind).toBe("stale");
  });

  it("mengembalikan 'ambiguous' bila PAID pada cek pertama tanpa tx_id dan paid_at", () => {
    const guard = createPaymentGuard(createdAt);
    const verdict = guard.evaluate(
      makeStatus({
        status: "PAID",
        // tidak ada transaction_id atau paid_at
      }),
    );
    expect(verdict.kind).toBe("ambiguous");
  });

  it("setelah ambiguous, tetap ambiguous untuk cek berikutnya tanpa tx_id", () => {
    const guard = createPaymentGuard(createdAt);
    guard.evaluate(makeStatus({ status: "PAID" }));
    const verdict2 = guard.evaluate(makeStatus({ status: "PAID" }));
    expect(verdict2.kind).toBe("ambiguous");
  });

  it("setelah ambiguous, bila tx_id muncul → bisa 'paid'", () => {
    const guard = createPaymentGuard(createdAt);
    guard.evaluate(makeStatus({ status: "PAID" }));
    const verdict2 = guard.evaluate(
      makeStatus({
        status: "PAID",
        transaction_id: "tx-late-arrival",
        paid_at: new Date("2024-01-15T10:03:00Z").toISOString(),
      }),
    );
    expect(verdict2.kind).toBe("paid");
  });
});
