import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

/**
 * Profil toko yang tercetak di struk (logo, nama, alamat, telepon, pesan bawah struk,
 * lebar kertas). Disimpan di tabel `store_profiles` per akun agar sama di semua device.
 *
 * Data lama di localStorage (versi sebelumnya) dipindahkan otomatis ke database
 * saat pertama kali dibuka. Selama tabel belum dibuat di database (SQL bagian 8
 * di supabase_schema.sql belum dijalankan), hook ini tetap memakai localStorage.
 */

export type PaperWidth = 58 | 80;

export type StoreProfile = {
  name: string;
  address: string;
  phone: string;
  receipt_footer: string;
  /** logo outlet sebagai data URL (sudah dikecilkan), null = tanpa logo */
  logo_data: string | null;
  paper_width: PaperWidth;
};

export type StoreProfileResult = StoreProfile & {
  /** "db" = tersimpan di database, "local" = masih di HP ini (tabel belum ada) */
  source: "db" | "local";
  /** false bila database belum punya kolom logo/lebar kertas (SQL bagian 8 versi lama) */
  supportsLogo: boolean;
};

const EMPTY: StoreProfile = {
  name: "",
  address: "",
  phone: "",
  receipt_footer: "",
  logo_data: null,
  paper_width: 58,
};

// kunci localStorage (4 pertama dari versi lama)
const LOCAL_KEYS: Record<keyof StoreProfile, string> = {
  name: "store_name",
  address: "store_address",
  phone: "store_phone",
  receipt_footer: "store_footer",
  logo_data: "store_logo",
  paper_width: "store_paper_width",
};

const toPaper = (v: unknown): PaperWidth => (Number(v) === 80 ? 80 : 58);

const pick = (
  row: Partial<Record<keyof StoreProfile, unknown>> | null | undefined,
): StoreProfile => ({
  name: String(row?.name ?? ""),
  address: String(row?.address ?? ""),
  phone: String(row?.phone ?? ""),
  receipt_footer: String(row?.receipt_footer ?? ""),
  logo_data: typeof row?.logo_data === "string" && row.logo_data ? row.logo_data : null,
  paper_width: toPaper(row?.paper_width),
});

function readLocal(): StoreProfile | null {
  try {
    const raw: Partial<Record<keyof StoreProfile, string>> = {};
    let found = false;
    for (const [field, key] of Object.entries(LOCAL_KEYS) as [keyof StoreProfile, string][]) {
      const v = localStorage.getItem(key);
      if (v !== null) {
        raw[field] = v;
        found = true;
      }
    }
    return found ? pick(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(p: StoreProfile) {
  try {
    for (const [field, key] of Object.entries(LOCAL_KEYS) as [keyof StoreProfile, string][]) {
      const v = p[field];
      if (v === null || v === "") localStorage.removeItem(key);
      else localStorage.setItem(key, String(v));
    }
  } catch {
    // storage diblokir / penuh
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

/** Kolom logo_data / paper_width belum ada (SQL bagian 8 versi lama). */
const isMissingColumn = (err: { code?: string; message?: string }) =>
  err.code === "PGRST204" ||
  err.code === "42703" ||
  /(logo_data|paper_width)/.test(err.message ?? "");

export function useStoreProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = ["store-profile", user?.id];

  /** Simpan ke database; bila kolom baru belum ada, simpan tanpa logo/lebar kertas. */
  const upsert = async (userId: string, p: StoreProfile) => {
    const base = {
      user_id: userId,
      name: p.name,
      address: p.address,
      phone: p.phone,
      receipt_footer: p.receipt_footer,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("store_profiles")
      .upsert({ ...base, logo_data: p.logo_data, paper_width: p.paper_width });
    if (error && isMissingColumn(error)) {
      const retry = await supabase.from("store_profiles").upsert(base);
      return { error: retry.error, supportsLogo: false };
    }
    return { error, supportsLogo: true };
  };

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<StoreProfileResult> => {
      // select("*") agar tetap jalan walau kolom logo/lebar kertas belum dibuat
      const { data, error } = await supabase
        .from("store_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) {
        if (isMissingTable(error))
          return { ...(readLocal() ?? EMPTY), source: "local", supportsLogo: true };
        throw new Error(error.message);
      }
      if (data) return { ...pick(data), source: "db", supportsLogo: "logo_data" in data };

      // Belum ada di database: pindahkan data lama dari HP ini (sekali saja)
      const local = readLocal();
      if (!local) return { ...EMPTY, source: "db", supportsLogo: true };
      const { error: upsertError, supportsLogo } = await upsert(user!.id, local);
      if (upsertError) return { ...local, source: "local", supportsLogo: true };
      clearLocal();
      return { ...local, source: "db", supportsLogo };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (profile: StoreProfile): Promise<StoreProfileResult> => {
      if (!user) throw new Error("Pengguna belum login");
      const clean = pick({
        ...profile,
        name: profile.name.trim(),
        address: profile.address.trim(),
        phone: profile.phone.trim(),
        receipt_footer: profile.receipt_footer.trim(),
      });
      const { error, supportsLogo } = await upsert(user.id, clean);
      if (error) {
        if (isMissingTable(error)) {
          writeLocal(clean);
          return { ...clean, source: "local", supportsLogo: true };
        }
        throw new Error(error.message);
      }
      clearLocal();
      return supportsLogo
        ? { ...clean, source: "db", supportsLogo }
        : { ...clean, logo_data: null, paper_width: 58, source: "db", supportsLogo };
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
