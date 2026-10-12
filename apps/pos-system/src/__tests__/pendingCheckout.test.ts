import { describe, it, expect, beforeEach } from "vitest";
import {
  readPendingCheckout,
  writePendingCheckout,
  clearPendingCheckout,
  type PendingCheckout,
} from "../pendingCheckout";

const userId = "user-abc-123";

function makeCheckout(overrides: Partial<PendingCheckout> = {}): PendingCheckout {
  return {
    transactionId: "tx-001",
    cart: [
      { product: { id: "p1", name: "Es Kopi Susu", sku: "8991001", category: "Minuman", price: 18000, stock: 42, minStock: 10 }, qty: 2 },
    ],
    method: "QRIS",
    paidAmount: 39600,
    paidAt: new Date("2024-01-15T10:05:00Z").toISOString(),
    ...overrides,
  };
}

describe("readPendingCheckout", () => {
  it("mengembalikan null bila tidak ada data", () => {
    expect(readPendingCheckout(userId)).toBe(null);
  });

  it("mengembalikan null bila data rusak / bukan JSON valid", () => {
    localStorage.setItem(`crave_pending_checkout_${userId}`, "bukan-json");
    expect(readPendingCheckout(userId)).toBe(null);
  });

  it("mengembalikan null bila transactionId hilang", () => {
    const bad = makeCheckout({ transactionId: "" });
    localStorage.setItem(
      `crave_pending_checkout_${userId}`,
      JSON.stringify(bad),
    );
    expect(readPendingCheckout(userId)).toBe(null);
  });

  it("mengembalikan null bila cart kosong", () => {
    const bad = makeCheckout({ cart: [] });
    localStorage.setItem(
      `crave_pending_checkout_${userId}`,
      JSON.stringify(bad),
    );
    expect(readPendingCheckout(userId)).toBe(null);
  });

  it("mengembalikan data valid yang tersimpan", () => {
    const data = makeCheckout();
    localStorage.setItem(
      `crave_pending_checkout_${userId}`,
      JSON.stringify(data),
    );
    const result = readPendingCheckout(userId);
    expect(result).not.toBeNull();
    expect(result!.transactionId).toBe("tx-001");
    expect(result!.cart).toHaveLength(1);
    expect(result!.cart[0].qty).toBe(2);
    expect(result!.paidAmount).toBe(39600);
  });

  it("menggunakan key per-user (akun lain tidak melihat)", () => {
    const data = makeCheckout();
    writePendingCheckout(userId, data);
    expect(readPendingCheckout("user-lain")).toBe(null);
    expect(readPendingCheckout(userId)).not.toBe(null);
  });
});

describe("writePendingCheckout", () => {
  it("menyimpan data ke localStorage dengan key yang benar", () => {
    const data = makeCheckout();
    writePendingCheckout(userId, data);
    const raw = localStorage.getItem(`crave_pending_checkout_${userId}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.transactionId).toBe("tx-001");
  });
});

describe("clearPendingCheckout", () => {
  it("menghapus data dari localStorage", () => {
    writePendingCheckout(userId, makeCheckout());
    expect(readPendingCheckout(userId)).not.toBe(null);
    clearPendingCheckout(userId);
    expect(readPendingCheckout(userId)).toBe(null);
  });

  it("tidak throw bila data tidak ada", () => {
    expect(() => clearPendingCheckout(userId)).not.toThrow();
  });
});
