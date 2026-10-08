import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "./useAuth";
import type { CartLine } from "./pos-data";

/**
 * Keranjang kasir yang bertahan saat kasir pindah menu atau me-refresh halaman.
 * Hanya kosong bila kasir menekan "Kosongkan" atau transaksi selesai.
 *
 * Disimpan di localStorage per akun (kunci memuat user id), jadi akun lain yang login
 * di HP yang sama tidak melihat keranjang ini. Tab lain ikut tersinkron lewat event `storage`.
 */

const EMPTY: CartLine[] = [];
const cache = new Map<string, CartLine[]>();
const listeners = new Set<() => void>();

const keyFor = (userId: string) => `crave_cart_${userId}`;

const isCartLine = (l: unknown): l is CartLine => {
  const line = l as CartLine | null;
  return (
    !!line &&
    typeof line.qty === "number" &&
    line.qty > 0 &&
    !!line.product &&
    typeof line.product.id === "string" &&
    typeof line.product.price === "number"
  );
};

function read(key: string): CartLine[] {
  const cached = cache.get(key);
  if (cached) return cached;
  let lines = EMPTY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) lines = parsed.filter(isCartLine);
    }
  } catch {
    // storage tidak tersedia / data rusak → mulai dari keranjang kosong
  }
  cache.set(key, lines);
  return lines;
}

function write(key: string, lines: CartLine[]) {
  cache.set(key, lines);
  try {
    if (lines.length) localStorage.setItem(key, JSON.stringify(lines));
    else localStorage.removeItem(key);
  } catch {
    // storage penuh / diblokir → keranjang tetap jalan di memori
  }
  listeners.forEach((l) => l());
}

export function useCart() {
  const { user } = useAuth();
  const key = user ? keyFor(user.id) : null;

  const subscribe = useCallback(
    (onChange: () => void) => {
      listeners.add(onChange);
      const onStorage = (e: StorageEvent) => {
        if (key && e.key === key) {
          cache.delete(key);
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const cart = useSyncExternalStore(
    subscribe,
    () => (key ? read(key) : EMPTY),
    () => EMPTY,
  );

  const setCart = useCallback(
    (next: CartLine[] | ((current: CartLine[]) => CartLine[])) => {
      if (!key) return;
      const current = read(key);
      const value = typeof next === "function" ? next(current) : next;
      if (value !== current) write(key, value);
    },
    [key],
  );

  return [cart, setCart] as const;
}
