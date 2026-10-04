import { supabase, isSupabaseConfigured } from "./supabase";

export const STORAGE_BUCKET = "crave-media";

export interface UploadMediaResult {
  url: string;
  path: string;
  isCloud: boolean;
  error?: string;
}

/**
 * Mengunggah file media (gambar thumbnail, banner event, blog cover) ke Supabase Storage.
 * Jika Supabase belum dikonfigurasi (.env kosong), fungsi ini akan fallback secara graceful
 * ke Data URL lokal sehingga aplikasi tetap dapat diuji coba tanpa error.
 */
export async function uploadMediaFile(
  file: File,
  folder: string = "thumbnails",
): Promise<UploadMediaResult> {
  // 1. Validasi tipe file (gambar)
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP, GIF, SVG).");
  }

  // 2. Validasi batas ukuran (5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran file melebihi batas 5MB. Silakan kompres atau pilih file yang lebih kecil.");
  }

  // 3. Jika Supabase Cloud aktif, upload langsung ke bucket
  if (isSupabaseConfigured) {
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 30);
      const randomSuffix = Math.random().toString(36).slice(2, 8);
      const filePath = `${folder}/${Date.now()}-${sanitizedName}-${randomSuffix}.${ext}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "31536000", // 1 tahun cache
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.warn("[Supabase Storage] Upload error, falling back to local data URL:", error.message);
        throw error;
      }

      // Ambil Public URL permanen
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
        isCloud: true,
      };
    } catch (err: any) {
      console.warn("[Supabase Storage] Gagal upload cloud:", err.message);
      // Fallback ke local data URL jika cloud gagal
    }
  }

  // 4. Local fallback menggunakan FileReader (jika offline/mock mode)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        resolve({
          url: e.target.result,
          path: `local/${file.name}`,
          isCloud: false,
        });
      } else {
        reject(new Error("Gagal membaca file gambar lokal."));
      }
    };
    reader.onerror = () => reject(new Error("Terjadi kesalahan saat memproses file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Menghapus file media dari Supabase Storage berdasarkan path.
 */
export async function deleteMediaFile(path: string): Promise<boolean> {
  if (!isSupabaseConfigured || !path || path.startsWith("local/")) {
    return false;
  }

  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
