import {
  Check,
  Globe,
  Palette,
  Trash2,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Cloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadMediaFile } from "../../lib/storage";

export const DEFAULT_PRESET_BANNERS = [
  {
    label: "Ocean Blue",
    value: "linear-gradient(135deg, #0a84ff 0%, #4c9beb 100%)",
  },
  {
    label: "Deep Navy",
    value: "linear-gradient(135deg, #0056b3 0%, #0a84ff 100%)",
  },
  {
    label: "Soft Frost",
    value: "linear-gradient(135deg, #4c9beb 0%, #e6eef9 100%)",
  },
  {
    label: "Cyber Violet",
    value: "linear-gradient(135deg, #7928ca 0%, #ff0080 100%)",
  },
  {
    label: "Emerald Dusk",
    value: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  },
  {
    label: "Sunset Amber",
    value: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  },
  {
    label: "Midnight Tech",
    value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  },
  {
    label: "Clean Minimalist",
    value: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
  },
];

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  previewTitle?: string;
  previewBadge?: string;
  folder?: "events" | "blogs" | "avatars" | string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Thumbnail / Banner",
  helperText = "Pilih preset gradien modern, upload file gambar langsung ke Cloud Storage, atau tempelkan URL gambar.",
  previewTitle = "Judul Konten Anda",
  previewBadge = "#Webinar",
  folder = "events",
}: ImageUploaderProps) {
  const [tab, setTab] = useState<"preset" | "upload" | "url">("preset");
  const [customUrl, setCustomUrl] = useState(
    value.startsWith("http") || value.startsWith("https") ? value : "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageSrc =
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("/");

  const isCloudStorage = value.includes("supabase.co/storage") || value.includes("/crave-media/");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Mengunggah ke Cloud Storage...");

    try {
      const result = await uploadMediaFile(file, folder);
      onChange(result.url);
      setTab("upload");

      if (result.isCloud) {
        toast.success("Foto Berhasil Diunggah!", {
          description: "Gambar tersimpan permanen di Supabase Cloud Storage.",
        });
      } else {
        toast.info("Mode Offline Aktif", {
          description: "Gambar disimpan dalam memori lokal untuk pratinjau.",
        });
      }
    } catch (err: any) {
      toast.error("Gagal mengunggah gambar", {
        description: err.message || "Pastikan koneksi internet stabil dan ukuran file maks 5MB.",
      });
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlApply = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      toast.success("URL Gambar Diterapkan!");
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Helper */}
      <div className="flex items-center justify-between">
        <div>
          <label className="aether-meta block text-ink-tertiary">{label}</label>
          {helperText && <p className="text-[12px] text-ink-secondary mt-0.5">{helperText}</p>}
        </div>
        {isCloudStorage && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200">
            <Cloud className="size-3" />
            Tersimpan di Cloud
          </span>
        )}
      </div>

      {/* Main Container with Preview & Controls */}
      <div className="glass rounded-2xl p-4 sm:p-5 border border-hairline space-y-4">
        {/* Live Preview Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
            <span>Pratinjau Banner Langsung (16:9)</span>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(DEFAULT_PRESET_BANNERS[0]!.value);
                  setCustomUrl("");
                }}
                className="flex items-center gap-1 text-danger hover:underline text-[11px] cursor-pointer"
              >
                <Trash2 className="size-3" />
                Reset Default
              </button>
            )}
          </div>

          <div
            className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden shadow-md flex flex-col justify-between p-4 transition-all duration-300"
            style={
              isImageSrc
                ? {
                    backgroundImage: `url("${value}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: value }
            }
          >
            {/* Dark gradient overlay for text readability if it's an image */}
            {isImageSrc && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />
            )}

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-pill bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-accent shadow-xs">
                {previewBadge}
              </span>
              <div className="flex items-center gap-1.5">
                {isCloudStorage && (
                  <span className="rounded-pill bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Cloud Hosted
                  </span>
                )}
                <span className="rounded-pill bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-white/90">
                  16:9 HD
                </span>
              </div>
            </div>

            {/* Bottom Title Preview */}
            <div className="relative z-10">
              <h4 className="text-base sm:text-lg font-bold text-white drop-shadow-md line-clamp-1">
                {previewTitle}
              </h4>
              <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                Crave Event · Pembelajaran Interaktif &amp; Sertifikat Resmi
              </p>
            </div>
          </div>
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-surface/80 p-1 border border-hairline">
          <button
            type="button"
            onClick={() => setTab("preset")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "preset"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Palette className="size-3.5" />
            <span>Preset Gradien</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "upload"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <UploadCloud className="size-3.5" />
            <span>Upload File Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
              tab === "url"
                ? "bg-accent text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            <Globe className="size-3.5" />
            <span>URL Gambar</span>
          </button>
        </div>

        {/* Tab 1: Preset Colors & Gradients */}
        {tab === "preset" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {DEFAULT_PRESET_BANNERS.map((preset) => {
              const isSelected = value === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.value)}
                  className={`group relative h-16 rounded-xl p-2 flex flex-col justify-end text-left shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-accent scale-102"
                      : "hover:scale-102 hover:shadow-md"
                  }`}
                  style={{ background: preset.value }}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-white text-accent shadow-xs">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-white drop-shadow-sm truncate">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Upload Image to Supabase Cloud */}
        {tab === "upload" && (
          <div className="pt-1">
            <input
              ref={fileInputRef}
              type="file"
              disabled={isUploading}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => {
                if (!isUploading) fileInputRef.current?.click();
              }}
              className={`group rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                isUploading
                  ? "border-accent/60 bg-accent-tint/30 cursor-wait"
                  : "border-accent/40 bg-surface/60 hover:bg-accent-tint/20 hover:border-accent cursor-pointer"
              }`}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="size-8 mx-auto text-accent animate-spin" />
                  <p className="text-[13px] font-semibold text-accent-strong">
                    {uploadStatus || "Sedang mengunggah gambar..."}
                  </p>
                  <p className="text-[11px] text-ink-tertiary">
                    Mohon tunggu beberapa saat hingga upload selesai
                  </p>
                </div>
              ) : (
                <>
                  <UploadCloud className="size-8 mx-auto text-accent group-hover:scale-110 transition-transform" />
                  <p className="mt-2 text-[13px] font-semibold text-ink">
                    Pilih file gambar untuk diunggah ke Supabase Storage
                  </p>
                  <p className="text-[11px] text-ink-tertiary mt-1">
                    Format didukung: PNG, JPG, WEBP, GIF, SVG (Maksimal 5MB)
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <Cloud className="size-3.5" />
                    <span>Tersimpan otomatis ke bucket: crave-media/{folder}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Direct URL Input */}
        {tab === "url" && (
          <div className="pt-1 space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 rounded-xl border border-hairline bg-surface/90 px-3.5 py-2 text-[13px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="neu-btn-blue px-4 py-2 text-[12px] font-semibold text-white shrink-0 cursor-pointer"
              >
                Terapkan
              </button>
            </div>
            <p className="text-[11px] text-ink-tertiary">
              💡 Rekomendasi: Gunakan link gambar beresolusi minimal 1280x720 dari Unsplash, Pexels, atau hosting pribadimu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
