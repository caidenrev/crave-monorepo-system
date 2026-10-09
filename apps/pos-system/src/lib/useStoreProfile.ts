import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

/**
 * Profil toko yang tercetak di struk (nama, alamat, telepon, pesan bawah struk).
 * Disimpan di tabel `store_profiles` per akun agar sama di semua device.
 *
 * Data lama di localStorage (versi sebelumnya) dipindahkan otomatis ke database
 * saat pertama kali dibuka. Selama tabel belum dibuat di database (SQL bagian 8
 * di supabase_schema.sql belum dijalankan), hook ini tetap memakai localStorage.
 */

export type StoreProfile = {
  name: string;
  address: string;
  phone: string;
  receipt_footer: string;
};

export type StoreProfileResult = StoreProfile & {
  /** "db" = tersimpan di database, "local" = masih di HP ini (tabel belum ada) */
  source: "db" | "local";
};

const EMPTY: StoreProfile = { name: "", address: "", phone: "", receipt_footer: "" };

// kunci localStorage dari versi lama
const LOCAL_KEYS: Record<keyof StoreProfile, string> = {
  name: "store_name",
  address: "store_address",
  phone: "store_phone",
  receipt_footer: "store_footer",
};

function readLocal(): StoreProfile | null {
  try {
    const p = { ...EMPTY };
    let found = false;
    for (const [field, key] of Object.entries(LOCAL_KEYS) as [keyof StoreProfile, string][]) {
      const v = localStorage.getItem(key);
      if (v !== null) {
        p[field] = v;
        found = true;
      }
    }
    return found ? p : null;
  } catch {
    return null;
  }
}

function writeLocal(p: StoreProfile) {
  try {
    for (const [field, key] of Object.entries(LOCAL_KEYS) as [keyof StoreProfile, string][]) {
      localStorage.setItem(key, p[field]);
    }
  } catch {
    // storage diblokir
  }
}

function clearLocal() {
  try {
    Object.values(LOCAL_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    // abaikan
  }
}

/** Tabel store_profiles belum dibuat di database. */
const isMissingTable = (err: { code?: string; message?: string }) =>
  err.code === "42P01" ||
  err.code === "PGRST205" ||
  /could not find the table|relation .* does not exist/i.test(err.message ?? "");

const pick = (row: Partial<StoreProfile> | null | undefined): StoreProfile => ({
  name: row?.name ?? "",
  address: row?.address ?? "",
  phone: row?.phone ?? "",
  receipt_footer: row?.receipt_footer ?? "",
});

export function useStoreProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ["store-profile", user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<StoreProfileResult> => {
      const { data, error } = await supabase
        .from("store_profiles")
        .select("name, address, phone, receipt_footer")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) {
        if (isMissingTable(error)) return { ...(readLocal() ?? EMPTY), source: "local" };
        throw new Error(error.message);
      }
      if (data) return { ...pick(data), source: "db" };

      // Belum ada di database: pindahkan data lama dari HP ini (sekali saja)
      const local = readLocal();
      if (!local) return { ...EMPTY, source: "db" };
      const { error: upsertError } = await supabase
        .from("store_profiles")
        .upsert({ user_id: user!.id, ...local, updated_at: new Date().toISOString() });
      if (upsertError) return { ...local, source: "local" };
      clearLocal();
      return { ...local, source: "db" };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (profile: StoreProfile): Promise<StoreProfileResult> => {
      if (!user) throw new Error("Pengguna belum login");
      const clean = pick({
        name: profile.name.trim(),
        address: profile.address.trim(),
        phone: profile.phone.trim(),
        receipt_footer: profile.receipt_footer.trim(),
      });
      const { error } = await supabase
        .from("store_profiles")
        .upsert({ user_id: user.id, ...clean, updated_at: new Date().toISOString() });
      if (error) {
        if (isMissingTable(error)) {
          writeLocal(clean);
          return { ...clean, source: "local" };
        }
        throw new Error(error.message);
      }
      clearLocal();
      return { ...clean, source: "db" };
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKey, saved);
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
