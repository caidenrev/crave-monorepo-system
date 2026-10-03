import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Share2,
  Ticket,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink } from "../../components/aether/primitives";
import { formatDate, formatPrice, formatTime } from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/dashboard/upcoming")({
  component: DashboardUpcomingPage,
});

function DashboardUpcomingPage() {
  const { events, myEvents } = useApp();

  const upcomingRegistered = myEvents
    .map((me) => {
      const ev = events.find((e) => e.id === me.eventId);
      return ev && ev.status === "upcoming" ? { ...ev, myEvent: me } : null;
    })
    .filter(Boolean) as (typeof events[0] & { myEvent: typeof myEvents[0] })[];

  const copyZoom = (link: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(link);
      toast.success("Link Zoom berhasil disalin!");
    }
  };

  const getCountdown = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - new Date().getTime();
    if (diff <= 0) return "Sedang Berlangsung / Hari Ini";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days} Hari ${hours} Jam Lagi`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Events"
        description="Daftar webinar mendatang yang telah kamu daftarkan. Link Zoom aktif dan siap diakses."
        action={
          <ButtonLink to="/events" variant="primary" size="sm">
            + Daftar Webinar Lain
          </ButtonLink>
        }
      />

      {upcomingRegistered.length > 0 ? (
        <div className="space-y-6">
          {upcomingRegistered.map((item) => (
            <div
              key={item.id}
              className="frosted-glass-card rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border border-white/90 bg-white/80 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(15,23,42,0.08),inset_2px_2px_5px_#ffffff,inset_-2px_-2px_5px_rgba(165,175,190,0.25)] hover:shadow-[0_20px_48px_-10px_rgba(10,132,255,0.12),inset_2px_2px_5px_#ffffff,inset_-2px_-2px_5px_rgba(165,175,190,0.2)] transition-all duration-300"
            >
              <div className="space-y-3.5 max-w-2xl">
                {/* Badges in Clay Pill Style */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <Badge tone="accent">#{item.playlist.toUpperCase()}</Badge>
                  <span className="neu-badge-glass aether-meta inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[11px] font-bold text-accent-strong">
                    <Clock className="size-3 text-accent shrink-0" strokeWidth={2.4} />
                    <span>{getCountdown(item.startsAt).toUpperCase()}</span>
                  </span>
                  <Badge tone={item.myEvent.paid ? "success" : "warning"}>
                    {item.myEvent.paid ? "TIKET TERKONFIRMASI" : "MENUNGGU PEMBAYARAN"}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl leading-snug">
                  {item.title}
                </h3>
                <p className="text-[14px] text-ink-secondary leading-relaxed">
                  {item.description}
                </p>

                {/* Tactile Clay Meta Pills */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[12.5px] sm:text-[13px] pt-1">
                  <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                    <Calendar className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                    <span className="font-semibold text-ink">{formatDate(item.startsAt)}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                    <Clock className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                    <span className="font-semibold text-ink">
                      {formatTime(item.startsAt)} ({item.durationMinutes} menit)
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                    <Video className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                    <span className="font-semibold text-ink">{item.platform}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons (Clay Neu 3D Buttons) */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 min-w-[200px]">
                <a
                  href={item.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="neu-btn-blue inline-flex items-center justify-center gap-2.5 px-6 py-3 text-[14px] font-semibold text-white shadow-md active:scale-98 transition-all w-full text-center"
                >
                  <Video className="size-4" strokeWidth={2.3} />
                  <span>Buka Link Zoom</span>
                </a>
                <button
                  type="button"
                  onClick={() => copyZoom(item.zoomLink)}
                  className="neu-btn-glass inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-[13px] font-semibold text-ink-secondary hover:text-accent shadow-xs active:scale-98 transition-all w-full"
                >
                  <Copy className="size-3.5 text-accent" strokeWidth={2.2} />
                  <span>Salin Tautan Zoom</span>
                </button>
                <Link
                  to="/events/$slug"
                  params={{ slug: item.slug }}
                  className="neu-link-glass mx-auto inline-flex items-center justify-center gap-1.5 text-center text-[12px] font-semibold text-accent hover:text-accent-strong py-1.5 px-4 transition-all"
                >
                  <span>Lihat Detail Sesi &amp; Rundown</span>
                  <ArrowRight className="size-3" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="frosted-glass-card rounded-[28px] sm:rounded-[32px] p-12 text-center border border-white/90 bg-white/80 shadow-lg">
          <span className="neu-icon-sphere size-16 mx-auto mb-4">
            <Ticket className="size-8 text-white" strokeWidth={1.8} />
          </span>
          <h3 className="text-lg font-bold text-ink">Belum Ada Event Mendatang</h3>
          <p className="mt-1 text-sm text-ink-secondary max-w-sm mx-auto">
            Kamu belum mendaftar di webinar yang akan datang. Temukan topik menarik di katalog kami.
          </p>
          <ButtonLink to="/events" className="mt-6" size="sm">
            Jelajahi Katalog Event
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
