import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
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
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", user?.id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-settings", user?.id] });
      toast.success("Akun Shopee Merchant berhasil diputuskan");
    },
    onError: (err: any) => {
      toast.error(`Gagal memutuskan akun: ${err.message}`);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    saveSettings: saveSettingsMutation.mutateAsync,
    isSaving: saveSettingsMutation.isPending,
    disconnect: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
}
