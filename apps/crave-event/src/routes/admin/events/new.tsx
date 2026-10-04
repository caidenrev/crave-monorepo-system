import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, DollarSign, Plus, Sparkles, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { ImageUploader, DEFAULT_PRESET_BANNERS } from "../../../components/aether/image-uploader";
import { MarkdownEditor } from "../../../components/aether/markdown-editor";
import { Button, ButtonLink } from "../../../components/aether/primitives";
import { host } from "../../../lib/mock-data";
import { useApp } from "../../../lib/store";

export const Route = createFileRoute("/admin/events/new")({
  component: AdminNewEventPage,
});

function AdminNewEventPage() {
  const navigate = useNavigate();
  const { playlists, createEvent, currentUser } = useApp();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [playlist, setPlaylist] = useState(playlists[0]?.tag || "#TechTalk");
  const [category, setCategory] = useState("Webinar");
  const [speaker, setSpeaker] = useState(currentUser?.name || host.name);
  const [type, setType] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState("2026-10-25");
  const [time, setTime] = useState("19:30");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [platform, setPlatform] = useState("Zoom");
  const [location, setLocation] = useState("Online · Zoom Webinar");
  const [zoomLink, setZoomLink] = useState("https://zoom.us/j/9922881144");
  const [quota, setQuota] = useState(200);
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState(
    `## Tentang Sesi Ini\n\nWebinar ini dirancang khusus untuk memberikan panduan komprehensif, teknik langsung, dan studi kasus praktis yang siap diterapkan.\n\n### Apa yang Akan Kamu Pelajari:\n- Penguasaan konsep fundamental dan best practices\n- Simulasi studi kasus nyata bersama speaker\n- Sesi tanya jawab interaktif dan live feedback\n\n### Susunan Rundown Acara:\n- **10 Menit**: Pembukaan, Sambutan & Ice Breaking\n- **50 Menit**: Pemaparan Materi Inti & Live Demo\n- **20 Menit**: Diskusi Terbuka & Tanya Jawab Peserta\n- **10 Menit**: Scan Presensi QR & Klaim E-Sertifikat Otomatis`,
  );
  const [thumbnail, setThumbnail] = useState(DEFAULT_PRESET_BANNERS[0]!.value);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startsAt = `${date}T${time}:00+07:00`;

    setLoading(true);
    try {
      const newEvent = await createEvent({
        slug: slug || `event-${Date.now()}`,
        title,
        description,
        longDescription: longDescription || description,
        playlist,
        category,
        type,
        price: type === "free" ? 0 : Number(price),
        startsAt,
        durationMinutes: Number(durationMinutes),
        platform,
        location,
        zoomLink,
        quota: Number(quota),
        thumbnail,
        status: "upcoming",
        speaker: speaker.trim() || currentUser?.name || host.name,
      });

      toast.success("Event Berhasil Dibuat!", {
        description: `"${newEvent.title}" kini telah aktif di katalog publik dan siap menerima pendaftaran.`,
      });

      navigate({ to: "/admin/events" });
    } catch (err: any) {
      toast.error("Gagal membuat event: " + (err?.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <ButtonLink to="/admin/events" variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Event
        </ButtonLink>
      </div>

      <PageHeader
        title="Buat Event Baru"
        description="Lengkapi detail acara webinar untuk membuka pendaftaran terpusat dan presensi otomatis."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          <h3 className="text-[17px] font-bold text-ink">Informasi Utama Event</h3>

          <div>
            <label className="aether-meta block text-ink-tertiary">Judul Event / Webinar</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Tech Talk: Merancang Sistem Otomasi Modern"
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[15px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="aether-meta block text-ink-tertiary">Slug URL</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tech-talk-otomasi-modern"
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 font-mono text-[13px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Playlist Kurasi</label>
              <select
                value={playlist}
                onChange={(e) => setPlaylist(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.tag}>
                    {pl.tag} — {pl.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="aether-meta block text-ink-tertiary">Kategori Format</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                <option value="Webinar">Webinar (Pemaparan)</option>
                <option value="Workshop">Workshop (Praktik)</option>
                <option value="Klinik">Klinik Interaktif</option>
                <option value="Bedah Kasus">Bedah Kasus</option>
              </select>
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Speaker / Host</label>
              <input
                type="text"
                required
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Nama Speaker atau Host"
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Deskripsi Singkat</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan 1-2 kalimat untuk kartu katalog..."
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <MarkdownEditor
            value={longDescription}
            onChange={setLongDescription}
            label="Silabus Materi & Rundown Webinar (Markdown & Hypertext Editor)"
            placeholder="Jelaskan silabus materi, poin-poin yang dipelajari, susunan acara, dan siapa yang cocok ikut..."
            minHeight="240px"
          />
        </div>

        {/* Pricing & Access Details */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          <h3 className="text-[17px] font-bold text-ink">Akses Tiket &amp; Kuota</h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="aether-meta block text-ink-tertiary">Tipe Tiket</label>
              <div className="mt-1.5 flex rounded-xl bg-surface/80 p-1 border border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setType("free");
                    setPrice(0);
                  }}
                  className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                    type === "free" ? "bg-accent text-white" : "text-ink-secondary"
                  }`}
                >
                  Gratis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("paid");
                    if (price === 0) setPrice(49000);
                  }}
                  className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                    type === "paid" ? "bg-accent text-white" : "text-ink-secondary"
                  }`}
                >
                  Berbayar
                </button>
              </div>
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Harga Tiket (Rp)</label>
              <input
                type="number"
                disabled={type === "free"}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-semibold text-ink focus:shadow-[var(--focus-ring)] focus:outline-none disabled:bg-neu"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Kuota Maksimal Peserta</label>
              <input
                type="number"
                required
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Zoom Details */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          <h3 className="text-[17px] font-bold text-ink">Jadwal &amp; Link Zoom Meeting</h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="aether-meta block text-ink-tertiary">Tanggal Pelaksanaan</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Jam Mulai (WIB)</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Durasi Sesi (Menit)</label>
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="aether-meta block text-ink-tertiary">Platform</label>
              <input
                type="text"
                required
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>

            <div>
              <label className="aether-meta block text-ink-tertiary">Link Zoom Meeting</label>
              <input
                type="url"
                required
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 font-mono text-[13px] text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Banner and Thumbnail Uploader */}
        <ImageUploader
          value={thumbnail}
          onChange={setThumbnail}
          label="Thumbnail & Banner Webinar"
          helperText="Pilih preset gradien modern, upload file gambar/poster ke Cloud Storage, atau tempelkan URL gambar."
          previewTitle={title || "Judul Webinar Baru"}
          previewBadge={playlist}
          folder="events"
        />

        {/* Submit Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="primary">
            <Plus className="size-4" />
            Publikasikan Event Sekarang
          </Button>
          <ButtonLink to="/admin/events" variant="glass">
            Batal
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
