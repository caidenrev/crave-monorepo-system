import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileBadge,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink } from "../../components/aether/primitives";
import { QrMatrix } from "../../components/aether/qr-code";
import { formatDate, host } from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/dashboard/certificates")({
  component: DashboardCertificatesPage,
});

function DashboardCertificatesPage() {
  const { events, myEvents, currentUser } = useApp();

  const certifiedEvents = myEvents
    .filter((me) => me.certificateId)
    .map((me) => {
      const ev = events.find((e) => e.id === me.eventId);
      return ev ? { ...ev, myEvent: me } : null;
    })
    .filter(Boolean) as (typeof events[0] & { myEvent: typeof myEvents[0] })[];

  const [activeCertificate, setActiveCertificate] = useState<(typeof certifiedEvents)[0] | null>(
    null,
  );

  const handleDownload = (certId: string, title: string) => {
    toast.success("Memulai unduhan sertifikat...", {
      description: `File sertifikat ${certId} (${title}) beresolusi tinggi sedang disimpan.`,
    });
  };

  const handleShare = (certId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/verify/${certId}`);
      toast.success("Tautan verifikasi sertifikat disalin!");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sertifikat Saya"
        description="Koleksi sertifikat resmi yang telah kamu raih setelah menghadiri sesi webinar secara penuh."
      />

      {certifiedEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {certifiedEvents.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="accent">{item.playlist}</Badge>
                  <span className="font-mono text-[11px] font-semibold text-accent-strong bg-accent-tint px-2.5 py-0.5 rounded-pill">
                    {item.myEvent.certificateId}
                  </span>
                </div>
                <h3 className="mt-3 text-[17px] font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">
                  Diterbitkan pada {formatDate(item.startsAt)} · {item.durationMinutes} Menit Sesi
                </p>
              </div>

              {/* Mini Preview Box */}
              <div
                onClick={() => setActiveCertificate(item)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-white via-surface to-accent-tint/30 p-4 text-center shadow-xs transition hover:shadow-md"
              >
                <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
                  <span>Crave Event Certification</span>
                  <span className="text-success flex items-center gap-1 font-medium">
                    <CheckCircle2 className="size-3" /> Resmi
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-bold tracking-wide text-ink uppercase">
                  {currentUser?.name || "Peserta"}
                </p>
                <p className="text-[11px] text-accent-strong font-medium truncate mt-0.5">
                  {item.title}
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-medium text-accent opacity-90 group-hover:opacity-100">
                  <Eye className="size-3.5" /> Klik untuk Buka Pratinjau
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => setActiveCertificate(item)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="size-4" />
                  Pratinjau
                </Button>
                <Button
                  onClick={() =>
                    handleDownload(item.myEvent.certificateId!, item.title)
                  }
                  variant="glass"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="size-4" />
                  Unduh PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Award className="mx-auto size-12 text-ink-tertiary" />
          <h3 className="mt-4 text-lg font-bold text-ink">Belum Ada Sertifikat</h3>
          <p className="mt-1 text-sm text-ink-secondary max-w-sm mx-auto">
            Hadir di webinar dan lakukan scan absensi QR saat sesi berlangsung untuk mendapatkan
            sertifikat resmi.
          </p>
          <ButtonLink to="/dashboard/scan" className="mt-6" size="sm">
            Buka Halaman Absensi QR
          </ButtonLink>
        </div>
      )}

      {/* Fullscreen Certificate Modal Preview */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <FileBadge className="size-5 text-accent" />
                <h3 className="text-lg font-bold text-ink">Sertifikat Terverifikasi</h3>
              </div>
              <button
                onClick={() => setActiveCertificate(null)}
                className="rounded-pill p-1.5 text-ink-tertiary hover:bg-neutral-100 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Certificate Paper */}
            <div className="my-6 rounded-xl border-4 border-double border-accent/40 bg-gradient-to-b from-[#fafcff] to-[#f4f7fb] p-8 text-center text-ink shadow-inner relative overflow-hidden">
              {/* Corner Watermarks */}
              <div className="absolute top-2 left-3 text-[10px] uppercase tracking-widest text-accent/30 font-mono">
                Crave Event Verified
              </div>
              <div className="absolute top-2 right-3 text-[10px] uppercase tracking-widest text-accent/30 font-mono">
                {activeCertificate.myEvent.certificateId}
              </div>

              <div className="inline-flex size-14 items-center justify-center rounded-pill bg-accent-tint text-accent-strong shadow-sm mb-3">
                <Award className="size-7" />
              </div>

              <p className="aether-meta text-accent-strong tracking-widest">
                Certificate of Completion &amp; Attendance
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl font-serif">
                SERTIFIKAT KELULUSAN
              </h2>

              <p className="mt-4 text-[13px] text-ink-secondary">Diberikan dengan bangga kepada:</p>
              <p className="mt-1 text-2xl font-bold tracking-wide text-ink sm:text-3xl font-serif border-b-2 border-accent/30 inline-block px-8 pb-1">
                {currentUser?.name || "Peserta"}
              </p>

              <p className="mt-4 text-[13px] text-ink-secondary">
                Atas partisipasi aktif dan kelulusan penuh dalam sesi webinar interaktif:
              </p>
              <h4 className="mt-1 text-lg font-bold text-accent-strong">
                {activeCertificate.title}
              </h4>
              <p className="text-[12px] text-ink-tertiary">
                Kategori {activeCertificate.playlist} · Durasi {activeCertificate.durationMinutes}{" "}
                Menit · Dilaksanakan pada {formatDate(activeCertificate.startsAt)}
              </p>

              {/* Certificate Footer / Signature and QR */}
              <div className="mt-8 flex items-end justify-between border-t border-accent/20 pt-6 px-4">
                <div className="text-left">
                  <div className="h-10 w-28 border-b border-ink/40 font-serif italic text-ink text-sm flex items-end">
                    {host.name}
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-ink">{host.name}</p>
                  <p className="text-[10px] text-ink-tertiary">Host &amp; Lead Speaker</p>
                </div>

                <div className="flex flex-col items-center">
                  <QrMatrix
                    value={`https://aether.ems/cert/${activeCertificate.myEvent.certificateId}`}
                    size={64}
                  />
                  <span className="aether-meta mt-1 text-[9px] text-ink-tertiary">
                    Scan untuk Verifikasi
                  </span>
                </div>

                <div className="text-right">
                  <Badge tone="success" className="text-[10px]">
                    Status: Resmi &amp; Valid
                  </Badge>
                  <p className="mt-2 font-mono text-[11px] font-semibold text-accent-strong">
                    ID: {activeCertificate.myEvent.certificateId}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => handleShare(activeCertificate.myEvent.certificateId!)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink"
              >
                <Share2 className="size-4" />
                Salin Tautan Verifikasi
              </button>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleDownload(
                      activeCertificate.myEvent.certificateId!,
                      activeCertificate.title,
                    )
                  }
                  variant="primary"
                  size="sm"
                >
                  <Download className="size-4" />
                  Unduh Sertifikat (PDF / PNG)
                </Button>
                <Button onClick={() => setActiveCertificate(null)} variant="glass" size="sm">
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
