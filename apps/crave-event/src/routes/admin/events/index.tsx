import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Crown,
  Edit3,
  ExternalLink,
  Plus,
  QrCode,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink, FilterTabs, SearchInput } from "../../../components/aether/primitives";
import { QrMatrix } from "../../../components/aether/qr-code";
import { GlassButton } from "../../../components/ui/glass";
import { formatDate, formatPrice, formatTime, type EventItem } from "../../../lib/mock-data";
import { useApp } from "../../../lib/store";
import { DeleteConfirmModal } from "../../../components/aether/delete-confirm-modal";

export const Route = createFileRoute("/admin/events/")({
  component: AdminEventsPage,
});

function AdminEventsPage() {
  const { events, attendees, deleteEvent, deleteAllEvents, resetAllEvents, isSuperAdmin } = useApp();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [liveQrEvent, setLiveQrEvent] = useState<EventItem | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [showDeleteAllEventsModal, setShowDeleteAllEventsModal] = useState(false);

  const filtered = events.filter((ev) => {
    if (statusFilter !== "all" && ev.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.playlist.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (ev: EventItem) => {
    setDeletingEvent(ev);
  };

  const handleConfirmDelete = () => {
    if (!deletingEvent) return;
    deleteEvent(deletingEvent.id);
    toast.success("Event Berhasil Dihapus", {
      description: `Event "${deletingEvent.title}" telah dihapus dari sistem.`,
    });
    setDeletingEvent(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Event"
        description="Kelola jadwal webinar, harga tiket, kuota peserta, dan tayangkan kode QR absensi."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="neu-btn-glass rounded-xl px-3.5 py-2 text-[13px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-2 border border-purple-200/80 bg-purple-50/60 hover:bg-purple-100/60 shadow-xs transition-all"
              >
                <Crown className="size-4 text-purple-600" />
                <span>Reset Data Event</span>
              </button>
            )}
            <ButtonLink to="/admin/events/new" variant="primary" size="sm">
              <Plus className="size-4" />
              Buat Event Baru
            </ButtonLink>
          </div>
        }
      />

      {/* Super Admin Status Banner */}
      {isSuperAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50/50 border border-purple-200/80 text-[13px]">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="size-4" />
            </div>
            <div>
              <span className="font-bold text-purple-900">Mode Super Admin Aktif:</span>{" "}
              <span className="text-purple-700">Anda berhak menghapus event siapa saja atau mereset seluruh data webinar untuk keperluan testing.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="neu-btn-glass text-[12px] font-bold text-purple-700 px-3 py-1.5 rounded-lg border border-purple-300 shadow-xs shrink-0 hover:bg-purple-100"
          >
            Kelola Reset Data
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari judul atau playlist..."
          />
        </div>

        <div className="w-full sm:w-64">
          <FilterTabs
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Semua" },
              { value: "upcoming", label: "Mendatang" },
              { value: "past", label: "Selesai" },
            ]}
          />
        </div>
      </div>

      {/* Events Table Container */}
      <div className="glass overflow-hidden rounded-2xl border border-hairline">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-hairline bg-surface/80 text-[12px] uppercase text-ink-tertiary">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-4 py-3.5 font-semibold">Playlist</th>
                <th className="px-4 py-3.5 font-semibold">Tipe &amp; Harga</th>
                <th className="px-4 py-3.5 font-semibold">Waktu Pelaksanaan</th>
                <th className="px-4 py-3.5 font-semibold">Pendaftar / Kuota</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-11 shrink-0 rounded-lg shadow-xs overflow-hidden"
                        style={
                          item?.thumbnail &&
                          (item.thumbnail.startsWith("http://") ||
                            item.thumbnail.startsWith("https://") ||
                            item.thumbnail.startsWith("data:image/") ||
                            item.thumbnail.startsWith("/"))
                            ? {
                                backgroundImage: `url("${item.thumbnail}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : { background: item?.thumbnail || "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)" }
                        }
                      />
                      <div className="min-w-0 max-w-xs">
                        <Link
                          to="/events/$slug"
                          params={{ slug: item.slug }}
                          className="font-semibold text-ink hover:text-accent truncate block"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[12px] text-ink-tertiary">{item.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge tone="accent">{item.playlist}</Badge>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink">{formatPrice(item.price)}</span>
                      <span className="text-[11px] text-ink-tertiary">
                        {item.type === "free" ? "Gratis" : "Berbayar"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-[13px]">
                      <p className="font-medium text-ink">{formatDate(item.startsAt).split(",")[0]}</p>
                      <p className="text-[11px] text-ink-tertiary">{formatTime(item.startsAt)}</p>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col text-[13px]">
                      {(() => {
                        const liveRegistered = attendees.filter((a) => a.eventId === item.id).length;
                        const liveAttended = attendees.filter((a) => a.eventId === item.id && a.attended).length;
                        return (
                          <>
                            <span className="font-semibold text-ink">
                              {liveRegistered} / {item.quota}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-ink-tertiary">
                              <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
                              </span>
                              {liveAttended} Hadir
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge tone={item.status === "upcoming" ? "accent" : "neutral"}>
                      {item.status === "upcoming" ? "Mendatang" : "Selesai"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLiveQrEvent(item)}
                        title="Tayangkan QR Absensi"
                        className="rounded-pill p-2 text-accent-strong hover:bg-accent-tint transition-colors"
                      >
                        <QrCode className="size-4" />
                      </button>
                      <Link
                        to="/admin/events/$id"
                        params={{ id: item.id }}
                        title="Ubah Event"
                        className="rounded-pill p-2 text-ink-secondary hover:bg-white hover:text-ink transition-colors"
                      >
                        <Edit3 className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Hapus Event"
                        className="rounded-pill p-2 text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-secondary">
                    <p className="text-[15px] font-semibold text-ink">Tidak ada event yang ditemukan.</p>
                    <p className="mt-1 text-[13px] text-ink-tertiary">
                      {events.length === 0
                        ? "Seluruh data event saat ini kosong (telah di-reset oleh Super Admin)."
                        : "Coba sesuaikan kata kunci pencarian atau tab filter status."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      {isSuperAdmin && events.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            resetAllEvents();
                            toast.success("Data Default Dipulihkan!", {
                              description: "Event bawaan telah dimasukkan kembali.",
                            });
                          }}
                          className="neu-btn-glass px-4 py-2 rounded-xl text-[13px] font-semibold text-purple-700 bg-purple-50/80 border border-purple-200 shadow-xs flex items-center gap-1.5 hover:bg-purple-100"
                        >
                          <RotateCcw className="size-4 text-purple-600" />
                          Pulihkan Data Default
                        </button>
                      )}
                      <ButtonLink to="/admin/events/new" variant="primary" size="sm">
                        <Plus className="size-4" /> Buat Event Baru
                      </ButtonLink>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Host Live Presentation QR Modal */}
      {liveQrEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glass modal card */}
          <div
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(48px) saturate(180%)",
              WebkitBackdropFilter: "blur(48px) saturate(180%)",
              border: "1px solid rgba(255,255,255,1)",
              boxShadow: "inset 0 1.5px 0 rgba(255,255,255,1), 0 32px 80px rgba(15,23,42,0.22), 0 4px 16px rgba(15,23,42,0.10)",
            }}
          >
            {/* Tag chip */}
            <span className="inline-flex items-center rounded-full bg-accent-tint px-4 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-accent-strong border border-accent/20">
              Host Live Presentation Screen
            </span>

            <h3 className="mt-3 text-xl font-bold text-ink">{liveQrEvent.title}</h3>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Bagikan layar (share screen) ini ke peserta webinar di Zoom untuk absensi &amp; klaim
              sertifikat instan.
            </p>

            {(() => {
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const activeCode = liveQrEvent.attendanceCode || `ATTEND-${liveQrEvent.id.toUpperCase()}`;
              const qrPayload = `${origin}/dashboard/scan?event=${liveQrEvent.id}&code=${activeCode}`;

              return (
                <>
                  {/* QR box */}
                  <div className="my-6 flex flex-col items-center gap-2">
                    <div
                      className="rounded-2xl p-3 bg-white"
                      style={{
                        boxShadow: "0 4px 24px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)",
                        border: "1px solid rgba(15,23,42,0.06)",
                      }}
                    >
                      <QrMatrix value={qrPayload} size={220} />
                    </div>
                    <span className="text-[11.5px] font-medium text-ink-tertiary">
                      Scan dengan kamera ponsel untuk presensi kilat &lt; 5 detik
                    </span>
                  </div>

                  {/* Manual code */}
                  <div className="rounded-2xl bg-accent-tint/60 px-4 py-3 text-center border border-accent/20">
                    <span className="block text-[10px] font-semibold tracking-widest uppercase text-accent-strong">Kode Absensi Manual Cadangan</span>
                    <span className="mt-1 block font-mono text-2xl font-bold tracking-widest text-ink select-all">
                      {activeCode}
                    </span>
                    <span className="mt-1 block text-[11px] text-ink-tertiary">
                      Bisa dibacakan jika kamera peserta mengalami kendala
                    </span>
                  </div>
                </>
              );
            })()}

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  toast.success("Token QR diperbarui!", {
                    description: "Jendela waktu absensi aktif 15 menit ke depan.",
                  });
                }}
              >
                Refresh Token QR
              </Button>
              <Button
                variant="glass"
                size="sm"
                className="flex-1"
                onClick={() => setLiveQrEvent(null)}
              >
                Tutup Layar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Reset Data Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 border border-purple-200">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Crown className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Reset Data Event (Super Admin)</h3>
                  <p className="text-[12px] text-ink-tertiary">Akses Root untuk testing &amp; pembersihan data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="neu-btn-glass size-8 flex items-center justify-center rounded-full text-ink-tertiary hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-purple-50/70 p-3.5 border border-purple-200/80 text-[12.5px] text-purple-900 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-purple-800">
                  <ShieldAlert className="size-4 text-purple-600" />
                  Hak Akses Super Admin Penuh
                </p>
                <p className="mt-1">
                  Sebagai Super Admin, Anda dapat mengosongkan seluruh database event atau mengembalikannya ke data bawaan awal kapan saja.
                </p>
              </div>

              {/* Action 1: Delete All */}
              <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13.5px] font-bold text-red-700 flex items-center gap-1.5">
                    <Trash2 className="size-4 text-red-600" />
                    Hapus Semua Event (Kosongkan Database)
                  </h4>
                  <p className="mt-0.5 text-[12px] text-ink-secondary">
                    Menghapus seluruh ({events.length}) event webinar dari memori &amp; Supabase Cloud.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteAllEventsModal(true)}
                  className="neu-btn-glass shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 border-none shadow-xs transition-colors cursor-pointer"
                >
                  Hapus Semua Event
                </button>
              </div>

              {/* Action 2: Reset to Defaults */}
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[13.5px] font-bold text-purple-800 flex items-center gap-1.5">
                    <RotateCcw className="size-4 text-purple-600" />
                    Pulihkan Data Event Bawaan (Default)
                  </h4>
                  <p className="mt-0.5 text-[12px] text-ink-secondary">
                    Mengisi kembali katalog event dengan data demo berkualitas tinggi (English Club, AI Talks, dll).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetAllEvents();
                    setShowResetModal(false);
                    toast.success("Data Event Dipulihkan!", {
                      description: "Event demo bawaan telah dimuat ulang.",
                    });
                  }}
                  className="neu-btn-glass shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow-xs transition-colors cursor-pointer"
                >
                  Pulihkan Default
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={() => setShowResetModal(false)} variant="glass" size="sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete single event modal */}
      <DeleteConfirmModal
        open={!!deletingEvent}
        title="Hapus Event?"
        description={
          <>
            Apakah Anda yakin ingin menghapus event{" "}
            <span className="font-semibold text-gray-900">"{deletingEvent?.title}"</span>?
          </>
        }
        confirmLabel="Hapus Event"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEvent(null)}
      />

      {/* Delete all events modal */}
      <DeleteConfirmModal
        open={showDeleteAllEventsModal}
        title="Hapus Semua Event?"
        subtitle="Tindakan ini TIDAK dapat dibatalkan."
        description={
          <>
            Anda akan menghapus{" "}
            <span className="font-semibold text-gray-900">{events.length} event</span>{" "}
            secara permanen dari sistem dan Supabase Cloud.
          </>
        }
        confirmLabel="Hapus Semua Event"
        onConfirm={() => {
          deleteAllEvents();
          setShowDeleteAllEventsModal(false);
          setShowResetModal(false);
          toast.success("Semua Event Berhasil Dihapus!", {
            description: "Database event kini bersih dan kosong.",
          });
        }}
        onCancel={() => setShowDeleteAllEventsModal(false)}
      />
    </div>
  );
}
