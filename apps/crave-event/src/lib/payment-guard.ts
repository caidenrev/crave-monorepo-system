/**
 * ============================================================================
 * PAYMENT GUARD — cegah PAID palsu dari mutasi transaksi sebelumnya
 * ============================================================================
 * Gateway memakai "clean pricing" (unique_offset selalu 0) dan endpoint status
 * bersifat stateless: ia hanya mencocokkan NOMINAL dengan mutasi ShopeePay.
 * Akibatnya transaksi kedua dengan nominal sama langsung dianggap PAID memakai
 * mutasi dari transaksi pertama, padahal pembeli belum scan.
 *
 * Guard ini menolak hasil PAID yang:
 *  1. transaction_id-nya sudah pernah dipakai untuk melunasi invoice lain;
 *  2. paid_at-nya lebih awal dari waktu invoice dibuat;
 *  3. sudah PAID pada cek pertama sesaat setelah invoice dibuat (baseline) —
 *     pembeli mustahil sudah membayar QR yang baru saja tampil.
 */

import type { PaymentGTStatusResponse } from "./paymentgt-service";

const USED_TX_KEY = "paymentgt_used_tx_ids";
const MAX_USED_TX = 300;
// Toleransi selisih jam antara server Shopee & gateway
const CLOCK_SKEW_MS = 5_000;

export const isPaidStatus = (status?: string) => {
  const s = (status || "").toUpperCase();
  return s === "PAID" || s === "SETTLED" || s === "SUCCESS";
};

function readUsedTx(): string[] {
  try {
    const raw = localStorage.getItem(USED_TX_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function markTxUsed(txId: string) {
  try {
    const next = [txId, ...readUsedTx().filter((t) => t !== txId)].slice(0, MAX_USED_TX);
    localStorage.setItem(USED_TX_KEY, JSON.stringify(next));
  } catch {
    // storage tidak tersedia (private mode) — guard waktu & baseline tetap berlaku
  }
}

export type PaymentVerdict =
  | { kind: "pending" }
  | { kind: "paid" }
  /** Ada mutasi PAID, tapi milik transaksi lama → abaikan & tetap menunggu. */
  | { kind: "stale" }
  /**
   * Mutasi lama bernominal sama terdeteksi tanpa transaction_id/paid_at,
   * sehingga pembayaran baru tidak bisa dibedakan secara otomatis.
   */
  | { kind: "ambiguous" };

export function createPaymentGuard(invoiceCreatedAt: string | undefined) {
  const parsedCreated = invoiceCreatedAt ? Date.parse(invoiceCreatedAt) : NaN;
  const createdAt = Number.isNaN(parsedCreated) ? Date.now() : parsedCreated;
  const baselineTx = new Set<string>();
  let primed = false;
  let ambiguous = false;

  return {
    /** Panggil dengan setiap respons status; hanya "paid" yang boleh melunasi. */
    evaluate(res: PaymentGTStatusResponse): PaymentVerdict {
      const firstCheck = !primed;
      primed = true;

      if (!isPaidStatus(res.status)) return { kind: "pending" };

      const txId = res.transaction_id || "";
      const paidAt = res.paid_at ? Date.parse(res.paid_at) : NaN;

      if (txId && (baselineTx.has(txId) || readUsedTx().includes(txId))) return { kind: "stale" };
      if (!Number.isNaN(paidAt) && paidAt < createdAt - CLOCK_SKEW_MS) return { kind: "stale" };

      if (firstCheck && Number.isNaN(paidAt)) {
        // PAID tepat setelah invoice dibuat → pasti mutasi lama
        if (txId) {
          baselineTx.add(txId);
          return { kind: "stale" };
        }
        ambiguous = true;
      }
      if (ambiguous && !txId && Number.isNaN(paidAt)) return { kind: "ambiguous" };

      if (txId) markTxUsed(txId);
      return { kind: "paid" };
    },
  };
}
