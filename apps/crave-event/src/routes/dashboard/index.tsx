import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileBadge,
  GraduationCap,
  PlayCircle,
  QrCode,
  Ticket,
  Video,
} from "lucide-react";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, ButtonLink, StatCard } from "../../components/aether/primitives";
import { formatDate, formatShortDate, formatTime } from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { events, myEvents, currentUser } = useApp();

  const userEvents = myEvents
    .map((me) => {
      const event = events.find((e) => e.id === me.eventId);
      return event ? { ...event, myEvent: me } : null;
    })
    .filter(Boolean) as (typeof events[0] & { myEvent: typeof myEvents[0] })[];

  const upcomingUserEvents = userEvents.filter((e) => e.status === "upcoming");
  const pastUserEvents = userEvents.filter((e) => e.status === "past");
  const attendedCount = userEvents.filter((e) => e.myEvent.attended).length;
  const certificateCount = userEvents.filter((e) => e.myEvent.certificateId).length;

  const totalLearningHours = (
    userEvents
      .filter((e) => e.myEvent.attended)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60
  ).toFixed(1);

  const attendanceRate =
    pastUserEvents.length > 0
      ? Math.round(
          (pastUserEvents.filter((e) => e.myEvent.attended).length / pastUserEvents.length) * 100,
        )
      : 100;

  const nextEvent = upcomingUserEvents[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Halo, ${currentUser?.name || "Peserta"} 👋`}
        description="Pantau jadwal webinar, absensi kehadiran, dan klaim sertifikat belajarmu di sini."
        action={
          <div className="flex gap-2">
            <ButtonLink to="/dashboard/scan" variant="primary" size="sm">
              <QrCode className="size-4" />
              Scan Absensi
            </ButtonLink>
            <ButtonLink to="/events" variant="glass" size="sm">
              Cari Event Lain
            </ButtonLink>
          </div>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Ticket className="size-5" />}
          label="Event Diikuti"
          value={`${userEvents.length} Event`}
          trend={`${upcomingUserEvents.length} Mendatang`}
          progress={userEvents.length ? Math.min(100, (userEvents.length / 8) * 100) : 0}
        />
        <StatCard
          icon={<Clock className="size-5" />}
          label="Jam Belajar"
          value={`${totalLearningHours} Jam`}
          trend="Waktu Praktik"
          progress={75}
        />
        <StatCard
          icon={<GraduationCap className="size-5" />}
          label="Sertifikat Diraih"
          value={`${certificateCount} Lembar`}
          trend="Terverifikasi"
          progress={certificateCount ? Math.min(100, (certificateCount / 5) * 100) : 0}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="Tingkat Kehadiran"
          value={`${attendanceRate}%`}
          trend={`${attendedCount} dari ${pastUserEvents.length || 1} sesi`}
          progress={attendanceRate}
        />
      </div>

      {/* Next Upcoming Event Hero Highlight or Discovery Card */}
      {nextEvent ? (
        <div className="frosted-glass-card rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-white/90 bg-white/80 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(15,23,42,0.08),inset_2px_2px_5px_#ffffff,inset_-2px_-2px_5px_rgba(165,175,190,0.25)] relative overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2">
                <Badge tone="accent">Webinar Terdekat Kamu</Badge>
                <Badge tone="success">Terdaftar &amp; Aktif</Badge>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[26px]">
                {nextEvent.title}
              </h2>
              <p className="text-[14px] text-ink-secondary leading-relaxed">{nextEvent.description}</p>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[12.5px] sm:text-[13px] pt-1">
                <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                  <CalendarClock className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                  <span className="font-semibold text-ink">{formatDate(nextEvent.startsAt)}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                  <Clock className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                  <span className="font-semibold text-ink">{formatTime(nextEvent.startsAt)}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-pill bg-white/75 backdrop-blur-md px-3.5 py-1.5 border border-white/90 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff]">
                  <Video className="size-3.5 text-accent shrink-0" strokeWidth={2.2} />
                  <span className="font-semibold text-ink">{nextEvent.platform}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end shrink-0 min-w-[200px]">
              <a
                href={nextEvent.zoomLink}
                target="_blank"
                rel="noreferrer"
                className="neu-btn-blue inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold text-white shadow-md active:scale-98 transition-all w-full text-center"
              >
                <Video className="size-4" strokeWidth={2.2} />
                <span>Masuk Zoom Meeting</span>
              </a>
              <ButtonLink
                to="/dashboard/scan"
                variant="glass"
                size="sm"
                className="w-full text-center justify-center"
              >
                Siapkan Absensi QR
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : (
        <div className="frosted-glass-card rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-white/90 bg-white/80 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(15,23,42,0.08),inset_2px_2px_5px_#ffffff,inset_-2px_-2px_5px_rgba(165,175,190,0.25)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge tone="accent">Mulai Belajar</Badge>
              <Badge tone="neutral">Webinar Praktisi</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[24px]">
              Belum Ada Webinar Mendatang yang Diikuti
            </h2>
            <p className="text-[14px] text-ink-secondary max-w-lg">
              Daftar di salah satu webinar gratis atau berbayar kami untuk mengakses live meeting Zoom dan klaim sertifikat berlisensi.
            </p>
          </div>
          <ButtonLink to="/events" variant="primary" className="shrink-0">
            Jelajahi &amp; Daftar Event &rarr;
          </ButtonLink>
        </div>
      )}

      {/* Recent Upcoming & Past Events Overview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Upcoming Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-ink">Upcoming Event Saya</h3>
            <Link to="/dashboard/upcoming" className="text-[13px] font-medium text-accent hover:underline">
              Lihat semua &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingUserEvents.length > 0 ? (
              upcomingUserEvents.slice(0, 3).map((item) => (
                <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="accent" className="text-[10px]">{item.playlist}</Badge>
                      <span className="text-[11px] text-ink-tertiary">{formatShortDate(item.startsAt)}</span>
                    </div>
                    <h4 className="mt-1 font-semibold text-ink text-[15px] truncate">{item.title}</h4>
                    <p className="text-[12px] text-ink-secondary">{formatTime(item.startsAt)} · {item.platform}</p>
                  </div>
                  <a
                    href={item.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="neu-btn-blue px-3.5 py-1.5 text-[12px] font-semibold text-white shrink-0"
                  >
                    Link Zoom
                  </a>
                </div>
              ))
            ) : (
              <div className="glass rounded-xl p-6 text-center space-y-2">
                <Ticket className="size-8 mx-auto text-ink-tertiary/70" />
                <p className="text-[14px] font-semibold text-ink">Belum Ada Pendaftaran Aktif</p>
                <p className="text-[12px] text-ink-secondary">
                  Event yang kamu daftarkan akan otomatis muncul di sini lengkap dengan link Zoom.
                </p>
                <div className="pt-2">
                  <ButtonLink to="/events" size="sm" variant="glass">
                    Cari Webinar Sekarang
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Ready Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-ink">Sertifikat Terbaru</h3>
            <Link to="/dashboard/certificates" className="text-[13px] font-medium text-accent hover:underline">
              Buka semua sertifikat &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {userEvents.filter((e) => e.myEvent.certificateId).length > 0 ? (
              userEvents
                .filter((e) => e.myEvent.certificateId)
                .slice(0, 3)
                .map((item) => (
                  <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-10 items-center justify-center rounded-pill bg-accent-tint text-accent-strong shrink-0">
                        <FileBadge className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-ink text-[14px] truncate">{item.title}</h4>
                        <p className="text-[11px] text-ink-tertiary">
                          No: {item.myEvent.certificateId} · Terverifikasi
                        </p>
                      </div>
                    </div>
                    <ButtonLink
                      to="/dashboard/certificates"
                      variant="glass"
                      size="sm"
                      className="shrink-0 text-[12px] py-1 px-3"
                    >
                      Lihat
                    </ButtonLink>
                  </div>
                ))
            ) : (
              <div className="glass rounded-xl p-6 text-center space-y-2">
                <FileBadge className="size-8 mx-auto text-ink-tertiary/70" />
                <p className="text-[14px] font-semibold text-ink">Belum Ada Sertifikat</p>
                <p className="text-[12px] text-ink-secondary">
                  Ikuti sesi webinar dan lakukan scan QR absensi untuk menerbitkan e-sertifikat instan.
                </p>
                <div className="pt-2">
                  <ButtonLink to="/dashboard/scan" size="sm" variant="glass">
                    Scan Absensi
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
