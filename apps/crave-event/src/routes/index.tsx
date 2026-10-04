import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  QrCode,
  ShieldCheck,
  Users,
  Video,
  LayoutDashboard,
  ArrowRight,
  Zap,
} from "lucide-react";
import { CrystalBenefitCard } from "../components/aether/crystal-card";
import { EventCard } from "../components/aether/event-card";
import { PaymentDialog } from "../components/aether/payment-dialog";
import {
  ArrowButton,
  Badge,
  ButtonLink,
  GlassCard,
  SectionHeading,
} from "../components/aether/primitives";
import { SiteFooter, SiteHeader } from "../components/aether/site-header";
import { formatShortDate, isPlaylistMatch, type EventItem } from "../lib/mock-data";
import { useApp } from "../lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { events, playlists, blogPosts, payEvent, isRegistered, isPaid } = useApp();
  const [selectedEventForPay, setSelectedEventForPay] = useState<EventItem | null>(null);

  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 3);
  const recentPosts = blogPosts.filter((p) => p.status === "published").slice(0, 3);

  const handlePaid = () => {
    if (selectedEventForPay) {
      payEvent(selectedEventForPay.id);
      toast.success("Pembayaran berhasil!", {
        description: `Tiket untuk ${selectedEventForPay.title} telah aktif. Link Zoom dapat diakses di dashboard.`,
      });
      setSelectedEventForPay(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-8 pb-16 sm:pt-14 sm:pb-24">
        {/* Soft background ambient gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-tint/70 via-blue-100/30 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-48 left-10 -z-10 size-72 rounded-full bg-accent/8 blur-3xl"
        />

        <div className="mx-auto max-w-5xl text-left sm:text-center">
          {/* Top Announcement Pill - Glass Tactile Button Style */}
          <div className="neu-btn-glass inline-flex items-center gap-2.5 px-4.5 py-1.5 mb-6 text-[12.5px] sm:text-[13px] font-semibold text-ink select-none cursor-default">
            <span>Platform Webinar &amp; Workshop Cerdas</span>
            <span className="neu-btn-blue text-[10px] font-bold px-2.5 py-0.5 text-white uppercase tracking-wider shadow-xs">
              Baru
            </span>
          </div>

          <h1 className="clay-puff-heading text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-slate-950 sm:leading-[1.14]">
            Kelola <span className="clay-puff-blue">Event</span> Tanpa{" "}
            <span className="clay-puff-blue">Ribet</span>{" "}
            <br className="hidden sm:inline" />
            <span className="text-slate-950">
              Dimanapun &amp; Kapanpun.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 max-w-2xl sm:mx-auto text-[15px] sm:text-[18px] leading-relaxed text-ink-secondary">
            Satu platform cerdas untuk registrasi terpusat, presensi QR instan &lt; 5 detik, dan penerbitan sertifikat resmi otomatis tanpa alur manual.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-start sm:justify-center gap-3.5">
            <ArrowButton to="/events">Jelajahi Semua Event</ArrowButton>
          </div>

          {/* Trust / Social Proof Rating */}
          <div className="mt-7 flex items-center justify-start sm:justify-center gap-3 text-left">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white ring-2 ring-white">
                AR
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white ring-2 ring-white">
                SK
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-cyan-600 text-[11px] font-bold text-white ring-2 ring-white">
                DL
              </span>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white ring-2 ring-white">
                +1k
              </span>
            </div>
            <div className="text-[12px] sm:text-[12.5px] leading-tight text-ink-secondary">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                ★★★★★ <span className="text-ink font-bold text-[12px] ml-0.5">4.9/5</span>
              </div>
              <span>Dipercaya oleh 1,200+ peserta &amp; 80+ penyelenggara</span>
            </div>
          </div>

          {/* Premium Hero Product Mockup Showcase (Clay & Frosted Glass Frame) */}
          <div className="mt-12 sm:mt-16 rounded-[32px] border border-white/90 bg-white/80 backdrop-blur-2xl p-4 sm:p-7 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.12),inset_0_2px_4px_#ffffff] text-left relative overflow-hidden group">
            {/* Top Mockup Window Bar */}
            <div className="flex items-center justify-between pb-4 sm:pb-5 mb-5 sm:mb-6 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
                <div className="hidden sm:inline-flex items-center gap-1.5 ml-3 px-3 py-1 rounded-pill bg-slate-100/90 text-[11.5px] text-ink-secondary font-medium border border-hairline/80">
                  <span className="text-slate-400">craveevent.id/live-hub</span>
                </div>
              </div>

              {/* Live Session Status Badge */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11.5px] font-medium text-ink-secondary">
                  248 Peserta Terhubung
                </span>
              </div>
            </div>

            {/* Mockup Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              {/* Left Column: Live Event Spotlight Card (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/25 blur-2xl"
                  aria-hidden="true"
                />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="rounded-pill bg-accent px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white">
                      #TECHTALK
                    </span>
                    <span className="text-[12px] text-blue-200/80 font-medium">
                      Cloud Architecture Summit 2026
                    </span>
                  </div>

                  <h3 className="text-[17px] sm:text-[20px] font-bold text-white leading-snug">
                    Membangun Arsitektur Microservices &amp; GenAI Skala Jutaan Request
                  </h3>

                  <p className="text-[13px] text-slate-300 leading-relaxed line-clamp-2">
                    Pelajari best practice deployment Kubernetes, automasi absensi event, dan integrasi serverless modern langsung dari praktisi industri.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-accent-soft flex items-center justify-center font-bold text-[12px] text-white">
                      CR
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-white">Eka Revandi</p>
                      <p className="text-[11px] text-slate-400">Principal Cloud Architect</p>
                    </div>
                  </div>

                  <Link
                    to="/events"
                    className="neu-btn-blue text-[12.5px] font-semibold px-4 py-2 text-white inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Video className="size-3.5" />
                    <span>Masuk Ruang Sesi</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Two Tactile Clay Cards (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                {/* 1. Instant QR Attendance Card */}
                <div className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08),inset_1.5px_1.5px_3px_#ffffff] flex items-center gap-4 transition-transform group-hover:-translate-y-0.5">
                  <div className="neu-icon-sphere size-12 shrink-0">
                    <QrCode className="size-6 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-ink">Presensi QR Kilat</span>
                      <span className="rounded-pill bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        &lt; 3.2 Detik
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-secondary mt-0.5">
                      Check-in otomatis tanpa antre, terhubung langsung ke analitik kehadiran host.
                    </p>
                  </div>
                </div>

                {/* 2. Automated Instant E-Certificate Card */}
                <div className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08),inset_1.5px_1.5px_3px_#ffffff] flex items-center gap-4 transition-transform group-hover:translate-y-0.5">
                  <div className="neu-icon-sphere size-12 shrink-0">
                    <GraduationCap className="size-6 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-ink">E-Sertifikat Otomatis</span>
                      <span className="rounded-pill bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 flex items-center gap-0.5">
                        <CheckCircle2 className="size-3 text-blue-600" /> Resmi
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-secondary mt-0.5">
                      Nomor seri unik &amp; QR verifikasi valid. Terbit otomatis seusai sesi selesai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Key Value Ribbon Chips */}
            <div className="mt-6 pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-ink-secondary">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                <span>Pendaftaran Terpusat &amp; Pembayaran QRIS Otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                <span>Integrasi Link Zoom &amp; YouTube Live Streaming</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                <span>Ekspor CSV Peserta Sekali Klik untuk Host</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playlist Unggulan Section */}
      {playlists.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              overline="Kurasi Materi"
              title="Playlist Event Unggulan"
              description="Temukan sesi belajar yang sesuai dengan minat dan target perkembangan skill kamu."
              action={
                <Link
                  to="/events"
                  className="neu-link-glass text-[13px] font-semibold text-accent"
                >
                  Lihat semua kategori &rarr;
                </Link>
              }
            />

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {playlists.map((pl) => {
                const eventCount = events.filter(
                  (ev) => isPlaylistMatch(ev.playlist, pl.tag) || isPlaylistMatch(ev.playlist, pl.title),
                ).length;
                const blogCount = blogPosts.filter(
                  (b) => isPlaylistMatch(b.tag, pl.tag) || isPlaylistMatch(b.tag, pl.title),
                ).length;
                const totalCount = eventCount + blogCount;

                return (
                  <Link
                    key={pl.id}
                    to="/events"
                    search={{ playlist: pl.tag }}
                    className="glass lift group flex flex-col justify-between rounded-lg p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge tone="neutral">{pl.tag}</Badge>
                        <span className="text-[12px] font-semibold text-ink-tertiary">
                          {totalCount > 0
                            ? `${eventCount > 0 ? `${eventCount} Event` : ""}${eventCount > 0 && blogCount > 0 ? " · " : ""}${blogCount > 0 ? `${blogCount} Blog` : ""}`
                            : "Segera Hadir"}
                        </span>
                      </div>
                      <h3 className="mt-4 text-[18px] font-semibold text-ink group-hover:text-accent transition-colors">
                        {pl.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-normal text-ink-secondary">
                        {pl.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4">
                      <span className="neu-btn-blue px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs">
                        Jelajahi Playlist &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Event Terdekat Section */}
      {upcomingEvents.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              overline="Jadwal Terdekat"
              title="Event &amp; Webinar Mendatang"
              description="Pilih sesi yang kamu butuhkan. Tiket gratis maupun berbayar siap didaftarkan langsung."
              action={
                <ButtonLink to="/events" variant="glass" size="sm">
                  Lihat Kalender Lengkap
                </ButtonLink>
              }
            />

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alur & Keunggulan Crave Event */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            overline="Sistem Presisi"
            title="Bagaimana Crave Event Mengubah Pengalaman Webinar"
            description="Dari pendaftaran hingga penerbitan sertifikat dalam 4 langkah otomatis tanpa repot."
          />

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="frosted-glass-card lift p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="neu-step-circle text-[15px] font-bold">
                  1
                </span>
                <h4 className="mt-5 text-[16px] font-semibold text-ink">Pendaftaran Terpusat</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  Pilih webinar gratis atau berbayar dengan pembayaran QRIS/VA otomatis. Data tersimpan di akunmu.
                </p>
              </div>
            </div>

            <div className="frosted-glass-card lift p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="neu-step-circle text-[15px] font-bold">
                  2
                </span>
                <h4 className="mt-5 text-[16px] font-semibold text-ink">Akses Link Zoom</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  Link Zoom terproteksi terbuka di dashboard peserta beserta hitung mundur waktu mulai.
                </p>
              </div>
            </div>

            <div className="frosted-glass-card lift p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="neu-step-circle text-[15px] font-bold">
                  3
                </span>
                <h4 className="mt-5 text-[16px] font-semibold text-ink">Presensi Cepat QR</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  Scan QR code yang ditayangkan host di Zoom. Verifikasi instan dalam &lt; 5 detik.
                </p>
              </div>
            </div>

            <div className="frosted-glass-card lift p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="neu-step-circle text-[15px] font-bold">
                  4
                </span>
                <h4 className="mt-5 text-[16px] font-semibold text-ink">Sertifikat Terverifikasi</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  Klaim mandiri sertifikat ber-ID unik langsung setelah hadir. Siap diunduh dan dipamerkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilihan Akses & Benefit Belajar (Crystal Liquid Glass Cards) */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            overline="Standar Kualitas"
            title="Pilihan Akses & Paket Benefit Webinar"
            description="Transparan dan tanpa biaya tersembunyi. Dapatkan sertifikat terverifikasi, rekaman seumur hidup, dan materi lengkap."
          />

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Kartu 1: Akses Komunitas (Gratis) */}
            <CrystalBenefitCard
              title="Akses Komunitas"
              subtitle="Sempurna untuk eksplorasi materi, tanya jawab, dan belajar bersama talenta berbakat."
              price="Rp 0"
              badge="Gratis Terbuka"
              features={[
                "Akses Siaran Langsung Zoom Webinar",
                "Sesi Tanya Jawab Interaktif Live",
                "Presensi Kehadiran QR Presisi < 5 Detik",
                "Grup Diskusi Komunitas Peserta",
                "Katalog Jadwal & Pengingat Kalender Otomatis",
              ]}
              buttonText="Jelajahi Event Gratis"
              buttonVariant="glass"
              onAction={() => navigate({ to: "/events" })}
            />

            {/* Kartu 2: Akses Eksklusif Pro (Unggulan dengan Rotating Electric Beam) */}
            <CrystalBenefitCard
              title="Akses Eksklusif Pro"
              subtitle="Paket terlengkap untuk akselerasi karier dengan sertifikat resmi dan arsip materi seumur hidup."
              price="Mulai Rp 49.000"
              badge="Paling Populer"
              features={[
                "Semua Benefit Akses Komunitas",
                "E-Sertifikat Terverifikasi QR & ID Resmi",
                "Akses Rekaman Video Sesi Seumur Hidup",
                "Slide PDF & Template Kerja Praktik",
                "Prioritas Tanya Jawab Langsung Bersama Speaker",
                "Konsultasi Portofolio & Mini Review",
              ]}
              buttonText="Daftar Akses Lengkap"
              onAction={() => navigate({ to: "/events" })}
            />
          </div>
        </div>
      </section>

      {/* Blog Terbaru Section */}
      {recentPosts.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              overline="Wawasan &amp; Panduan"
              title="Artikel &amp; Catatan Belajar"
              description="Tips komunikasi, strategi presentasi, dan alur kerja teknologi dari host."
              action={
                <ButtonLink to="/blog" variant="glass" size="sm">
                  Buka Semua Artikel
                </ButtonLink>
              }
            />

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="glass lift group flex flex-col justify-between rounded-lg p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="aether-meta rounded-pill bg-accent-tint px-2.5 py-0.5 text-accent-strong">
                        {post.tag}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-tertiary">
                        <Clock className="size-3" />
                        {post.readMinutes} mnt baca
                      </span>
                    </div>
                    <h3 className="mt-4 text-[17px] font-semibold text-ink group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[13px] text-ink-secondary">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4 text-[12px] text-ink-tertiary">
                    <span>{formatShortDate(post.publishedAt)}</span>
                    <span className="neu-btn-blue px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs">
                      Baca &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Box */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="glass relative overflow-hidden rounded-2xl p-8 text-center sm:p-14">
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              Siap Mengembangkan Kemampuan &amp; Karier?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] text-ink-secondary">
              Daftar ke webinar berikutnya sekarang. Akses ilmu langsung dari praktisi dan dapatkan
              sertifikat resmi untuk portofoliomu.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ArrowButton to="/events">Mulai Cari Event</ArrowButton>
              <ButtonLink to="/auth" variant="glass">
                Masuk ke Akun
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {selectedEventForPay && (
        <PaymentDialog
          event={selectedEventForPay}
          open={!!selectedEventForPay}
          onClose={() => setSelectedEventForPay(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}
