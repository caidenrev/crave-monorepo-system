import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { ImageUploader, DEFAULT_PRESET_BANNERS } from "../../../components/aether/image-uploader";
import { MarkdownEditor } from "../../../components/aether/markdown-editor";
import { Button, ButtonLink } from "../../../components/aether/primitives";
import { host } from "../../../lib/mock-data";
import { useApp } from "../../../lib/store";
import { DeleteConfirmModal } from "../../../components/aether/delete-confirm-modal";

export const Route = createFileRoute("/admin/events/$id")({
  component: AdminEditEventPage,
});

function AdminEditEventPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { events, updateEvent, deleteEvent, playlists } = useApp();

  const event = events.find((e) => e.id === id);

  const [title, setTitle] = useState(event?.title || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [playlist, setPlaylist] = useState(event?.playlist || playlists[0]?.tag || "");
  const [category, setCategory] = useState(event?.category || "Webinar");
  const [speaker, setSpeaker] = useState(event?.speaker || host.name);
  const [type, setType] = useState<"free" | "paid">(event?.type || "free");
  const [price, setPrice] = useState(event?.price || 0);
  const [date, setDate] = useState(() => {
    if (!event?.startsAt) return "2026-10-25";
    return event.startsAt.includes("T") ? event.startsAt.split("T")[0]! : event.startsAt;
  });
  const [time, setTime] = useState(() => {
    if (!event?.startsAt || !event.startsAt.includes("T")) return "19:00";
    return event.startsAt.split("T")[1]?.slice(0, 5) || "19:00";
  });
  const [durationMinutes, setDurationMinutes] = useState(event?.durationMinutes || 90);
  const [platform, setPlatform] = useState(event?.platform || "Zoom");
  const [location, setLocation] = useState(event?.location || "Online · Zoom Meeting");
  const [zoomLink, setZoomLink] = useState(event?.zoomLink || "");
  const [quota, setQuota] = useState(event?.quota || 200);
  const [description, setDescription] = useState(event?.description || "");
  const [longDescription, setLongDescription] = useState(event?.longDescription || "");
  const [thumbnail, setThumbnail] = useState(
    event?.thumbnail || DEFAULT_PRESET_BANNERS[0]!.value,
  );
  const [status, setStatus] = useState<"upcoming" | "live" | "past">(event?.status || "upcoming");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSlug(event.slug);
      setPlaylist(event.playlist);
      setCategory(event.category);
      setSpeaker(event.speaker || host.name);
      setType(event.type);
      setPrice(event.price);
      if (event.startsAt) {
        setDate(event.startsAt.includes("T") ? event.startsAt.split("T")[0]! : event.startsAt);
        setTime(
          event.startsAt.includes("T")
            ? event.startsAt.split("T")[1]?.slice(0, 5) || "19:00"
            : "19:00",
        );
      }
      setDurationMinutes(event.durationMinutes);
      setPlatform(event.platform);
      setLocation(event.location);
      setZoomLink(event.zoomLink);
      setQuota(event.quota);
      setDescription(event.description);
      setLongDescription(event.longDescription);
      setThumbnail(event.thumbnail);
      setStatus(event.status);
    }
  }, [event]);

  if (!event) {
    return (
      <div className="space-y-4">
        <PageHeader title="Event Tidak Ditemukan" description="ID event tidak terdaftar." />
        <ButtonLink to="/admin/events">Kembali ke Daftar Event</ButtonLink>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startsAt = `${date}T${time}:00+07:00`;

    updateEvent(event.id, {
      title,
      slug,
      playlist,
      category,
      speaker: speaker.trim() || host.name,
      type,
      price: type === "free" ? 0 : Number(price),
      startsAt,
      durationMinutes: Number(durationMinutes),
      platform,
      location,
      zoomLink,
      quota: Number(quota),
      description,
      longDescription,
      thumbnail,
      status,
    });

    toast.success("Perubahan Event Berhasil Disimpan!", {
      description: `Data untuk "${title}" telah diperbarui.`,
    });

    navigate({ to: "/admin/events" });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteEvent(event.id);
    toast.success("Event Dihapus.");
    navigate({ to: "/admin/events" });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <ButtonLink to="/admin/events" variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Event
        </ButtonLink>

        <Button onClick={handleDelete} variant="danger" size="sm">
          <Trash2 className="size-4" />
          Hapus Event
        </Button>
      </div>

      <PageHeader
        title={`Ubah: ${event.title}`}
        description="Perbarui informasi jadwal, kuota peserta, dan link meeting acara."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          <h3 className="text-[17px] font-bold text-ink">Informasi Utama Event</h3>

          <div>
            <label className="aether-meta block text-ink-tertiary">Judul Event / Webinar</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <label className="aether-meta block text-ink-tertiary">Status Event</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "upcoming" | "live" | "past")}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                <option value="upcoming">Mendatang (Upcoming)</option>
                <option value="live">Sedang Berlangsung (Live)</option>
                <option value="past">Telah Selesai (Past)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Speaker / Host</label>
            <input
              type="text"
              required
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="Nama pemateri atau host"
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
            />
          </div>

          <div>
            <label className="aether-meta block text-ink-tertiary">Deskripsi Singkat</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <label className="aether-meta block text-ink-tertiary">Kuota Maksimal</label>
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

        {/* Schedule & Meeting Details */}
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
              <label className="aether-meta block text-ink-tertiary">Durasi (Menit)</label>
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
          previewTitle={title || "Judul Webinar"}
          previewBadge={playlist}
          folder="events"
        />

        {/* Save button */}
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="primary">
            <Save className="size-4" />
            Simpan Perubahan
          </Button>
          <ButtonLink to="/admin/events" variant="glass">
            Batal
          </ButtonLink>
        </div>
      </form>
      <DeleteConfirmModal
        open={showDeleteModal}
        title="Hapus Event?"
        description={
          <>
            Apakah Anda yakin ingin menghapus event{" "}
            <span className="font-semibold text-gray-900">"{event.title}"</span>{" "}
            secara permanen?
          </>
        }
        confirmLabel="Hapus Event"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
