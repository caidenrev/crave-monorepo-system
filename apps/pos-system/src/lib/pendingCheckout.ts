import type { CartLine } from "./pos-data";

/**
 * Transaksi QRIS yang SUDAH DIBAYAR pelanggan tapi belum berhasil tersimpan ke
 * database. Disimpan di HP kasir (per akun) agar tidak hilang saat halaman di-refresh
 * atau aplikasi ditutup; dihapus setelah transaksi tersimpan.
 */
export type PendingCheckout = {
  transactionId: string;
  cart: CartLine[];
  method: "QRIS";
  /** total yang dibayar pelanggan (termasuk pajak), untuk ditampilkan ke kasir */
  paidAmount: number;
  paidAt: string;
};

const keyFor = (userId: string) => `crave_pending_checkout_${userId}`;

export function readPendingCheckout(userId: string): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingCheckout;
    if (!p?.transactionId || !Array.isArray(p.cart) || p.cart.length === 0) return null;
    return p;
  } catch {
    return null;
  }
}

export function writePendingCheckout(userId: string, p: PendingCheckout) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(p));
  } catch {
    // storage diblokir → tetap ada di memori selama halaman terbuka
  }
}

export function clearPendingCheckout(userId: string) {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // abaikan
  }
}
