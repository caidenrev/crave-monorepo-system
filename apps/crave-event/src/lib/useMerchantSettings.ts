import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * ============================================================================
 * MERCHANT SETTINGS HOOK — CRAVE EVENT
 * ============================================================================
 * Mengambil session_json & static_qris merchant ShopeePay dari Supabase
 * tabel `merchant_settings` untuk mendeteksi mutasi pembayaran QRIS realtime.
 *
 * Konteks: session_json merchant di-generate via flow OTP Shopee di pos-system
 * (Pengaturan > QRIS Merchant) dan disimpan ke tabel merchant_settings.
 *
 * Karena crave-event adalah app untuk PESERTA webinar, user yang membeli tiket
 * biasanya BUKAN merchant pemilik ShopeePay. Jadi:
 *  1. Jika user kebetulan adalah merchant (akun yang sama dengan pos-system),
 *     query ambil session_json miliknya dari tabel merchant_settings.
 *  2. Jika user adalah peserta biasa, fallback ke env `VITE_PAYMENTGT_SESSION_JSON`
 *     yang di-set admin dari session merchant penyelenggara.
 *
 * Tanpa session_json, gateway tidak bisa cek mutasi ShopeePay → status payment
 * tidak akan pernah realtime PAID (bug krusial setelah merge crave-event).
 */

export type CraveEventMerchantSettings = {
  id?: string;
  user_id?: string;
  static_qris?: string | null;
  session_json?: string | null;
  merchant_name?: string | null;
  store_name?: string | null;
};

export function useMerchantSettings() {
  const query = useQuery({
    queryKey: ["crave-event-merchant-settings"],
    queryFn: async (): Promise<CraveEventMerchantSettings | null> => {
      if (!isSupabaseConfigured) return null;

      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) return null;

        const { data, error } = await supabase
          .from("merchant_settings")
          .select("id, user_id, static_qris, session_json, merchant_name, store_name")
          .eq("user_id", userId)
          .eq("is_active", true)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.warn("[Crave Event] Gagal mengambil merchant settings:", error.message);
        }

        return data || null;
      } catch (err: any) {
        console.warn("[Crave Event] merchant settings query error:", err?.message);
        return null;
      }
    },
    staleTime: 60_000, // cache 1 menit — session jarang berubah
    retry: 1,
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
  };
}
