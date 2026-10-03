import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  FileBadge,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink } from "../../components/aether/primitives";
import { formatDate } from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/dashboard/past")({
  component: DashboardPastPage,
});

function DashboardPastPage() {
  const { events, myEvents } = useApp();

  const pastRegistered = myEvents
    .map((me) => {
      const ev = events.find((e) => e.id === me.eventId);
      return ev && ev.status === "past" ? { ...ev, myEvent: me } : null;
    })
    .filter(Boolean) as (typeof events[0] & { myEvent: typeof myEvents[0] })[];

  const handleDownloadMaterials = (title: string) => {
    toast.success("Mengunduh materi presentasi...", {
      description: `Materi slide & panduan PDF untuk ${title} sedang diunduh.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Past Events"
        description="Riwayat webinar yang telah selesai. Cek status absensi kehadiranmu dan unduh sertifikat resmi."
      />

      {pastRegistered.length > 0 ? (
        <div className="space-y-4">
          {pastRegistered.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{item.playlist}</Badge>
                  {item.myEvent.attended ? (
                    <Badge tone="success" className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Hadir &amp; Terverifikasi
                    </Badge>
                  ) : (
                    <Badge tone="neutral" className="flex items-center gap-1">
                      <XCircle className="size-3.5 text-danger" /> Tidak Hadir
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-ink sm:text-xl">{item.title}</h3>
                <p className="text-[13px] text-ink-secondary">{item.description}</p>

                <p className="text-[12px] text-ink-tertiary">
                  Dilaksanakan pada {formatDate(item.startsAt)} · {item.platform}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2.5 w-full md:w-auto shrink-0">
                {item.myEvent.attended ? (
                  <>
                    <ButtonLink
                      to="/dashboard/certificates"
                      variant="primary"
                      size="sm"
                      className="w-full md:w-auto justify-center"
                    >
                      <FileBadge className="size-4" />
                      Klaim / Lihat Sertifikat
                    </ButtonLink>
                    <button
                      type="button"
                      onClick={() => handleDownloadMaterials(item.title)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-white/80 px-4 py-1.5 text-[12px] font-medium text-ink-secondary hover:text-ink border border-hairline w-full md:w-auto"
                    >
                      <Download className="size-3.5" />
                      Unduh Materi PDF
                    </button>
                  </>
                ) : (
                  <div className="text-right">
                    <span className="text-[12px] text-ink-tertiary block">
                      Presensi tidak tercatat saat live
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.info("Rekaman dapat diakses melalui link Google Drive yang dikirim ke email peserta.")}
                      className="mt-1 text-[12px] font-medium text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <PlayCircle className="size-3.5" />
                      Tonton Rekaman Sesi
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <CalendarCheck className="mx-auto size-12 text-ink-tertiary" />
          <h3 className="mt-4 text-lg font-bold text-ink">Belum Ada Riwayat Event</h3>
          <p className="mt-1 text-sm text-ink-secondary max-w-sm mx-auto">
            Kamu belum memiliki riwayat partisipasi event yang telah selesai.
          </p>
        </div>
      )}
    </div>
  );
}
