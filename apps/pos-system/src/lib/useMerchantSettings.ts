import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
import { checkShopeeMerchantInfo } from "./paymentgt-service";
import { toast } from "sonner";

export type MerchantSettings = {
  id?: string;
  user_id?: string;
  phone?: string | null;
  merchant_name?: string | null;
  merchant_id?: string | null;
  store_id?: string | null;
  store_name?: string | null;
  static_qris?: string | null;
  session_json?: string | null;
  is_active?: boolean;
  updated_at?: string;
};

export function useMerchantSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query 1: Ambil data merchant_settings dari DB
  const query = useQuery({
    queryKey: ["merchant-settings", user?.id],
    queryFn: async (): Promise<MerchantSettings | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("merchant_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching merchant settings:", error);
      }

      return data || null;
    },
    enabled: !!user,
    // Refresh otomatis setiap 5 menit agar session_json terbaru dari DB selalu
    // dipakai (berguna saat user re-login OTP di device lain → DB ter-update).
    refetchInterval: 5 * 60 * 1000,
    // Saat user kembali ke tab/window, refresh data merchant settings.
    refetchOnWindowFocus: true,
    staleTime: 30_000, // 30 detik dianggap fresh, setelah itu perlu refetch
  });

  // Query 2: Validasi session ke gateway — apakah session_json masih aktif?
  // Ini penting karena session Shopee bisa expired walau string masih ada di DB
  // (mis. setelah pindah device atau cookie Shopee kedaluwarsa). Tanpa cek ini,
  // UI salah menganggap session aktif → pembayaran gagal deteksi PAID.
  //
  // Gateway melakukan silent renewal (rotasi cookie Shopee) dan mengembalikan
  // session baru. Session baru itu WAJIB disimpan balik ke DB, karena setelah
  // renewal session lama bisa ditolak Shopee. Dengan menyimpannya di DB, device
  // mana pun yang login ke akun yang sama otomatis memakai session terbaru.
  //
  // queryKey sengaja tidak memuat session_json: menyimpan session hasil renewal
  // tidak boleh memicu cek ulang (bisa jadi loop renewal tanpa henti).
  const sessionCheckQuery = useQuery({
    queryKey: ["merchant-session-valid", user?.id],
    queryFn: async (): Promise<boolean | null> => {
      if (!user) return null;
      // Baca dari cache (bukan closure render) agar selalu memakai session terbaru.
      const sessionJson = queryClient.getQueryData<MerchantSettings | null>([
        "merchant-settings",
        user.id,
      ])?.session_json;
      if (!sessionJson) return null;

      const res = await checkShopeeMerchantInfo(sessionJson);
      if (res.active) {
        const renewed = res.renewedSession;
        if (renewed) {
          const { error } = await supabase
            .from("merchant_settings")
            .update({ session_json: renewed, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
          if (error) {
            console.warn(
              "[MerchantSettings] Gagal menyimpan session hasil renewal:",
              error.message,
            );
          } else {
            queryClient.setQueryData<MerchantSettings | null>(
              ["merchant-settings", user.id],
              (prev) => (prev ? { ...prev, session_json: renewed } : prev),
            );
          }
        }
        return true;
      }
      // Hanya AUTH_REQUIRED / merchant kosong yang berarti session benar-benar mati.
      // Error jaringan (gateway down) → null, jangan blok pembayaran.
      if (res.networkError) {
        console.warn("[MerchantSettings] Gagal validasi session ke gateway:", res.error);
        return null;
      }
      return false;
    },
    enabled: !!query.data?.session_json,
    // Cek ulang setiap 5 menit — session bisa expired saat aplikasi terbuka.
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  });

  // Toast sekali saat status berubah menjadi expired (bukan setiap refetch).
  const sessionValid = sessionCheckQuery.data ?? null;
  const prevSessionValid = useRef<boolean | null>(null);
  useEffect(() => {
    if (sessionValid === false && prevSessionValid.current !== false) {
      toast.error("Sesi Merchant ShopeePay Kedaluwarsa", {
        description:
          "Silakan sambungkan ulang akun Shopee Merchant di menu Pengaturan > QRIS Merchant.",
      });
    }
    prevSessionValid.current = sessionValid;
  }, [sessionValid]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<MerchantSettings>) => {
      if (!user) throw new Error("Pengguna belum login");

      const payload = {
        ...settings,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("merchant_settings")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["merchant-settings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["merchant-session-valid", user?.id] });
      toast.success("Pengaturan Merchant & QRIS berhasil disimpan!");
    },
    onError: (err: any) => {
      toast.error(`Gagal menyimpan pengaturan: ${err.message}`);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Pengguna belum login");

      const payload = {
        user_id: user.id,
        session_json: null,
        merchant_name: null,
        merchant_id: null,
        store_id: null,
        store_name: null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("merchant_settings")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["merchant-settings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["merchant-session-valid", user?.id] });
      toast.success("Akun Shopee Merchant berhasil diputuskan");
    },
    onError: (err: any) => {
      toast.error(`Gagal memutuskan akun: ${err.message}`);
    },
  });

  return {
    settings: query.data,
    // Status validitas session menurut gateway (true/false/null)
    sessionValid,
    recheckSession: sessionCheckQuery.refetch,
    isCheckingSession: sessionCheckQuery.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    saveSettings: saveSettingsMutation.mutateAsync,
    isSaving: saveSettingsMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
}
