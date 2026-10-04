import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Gift,
  HelpCircle,
  MapPin,
  Share2,
  ShieldCheck,
  BookOpen,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaymentDialog } from "../../components/aether/payment-dialog";
import { MarkdownRenderer } from "../../components/aether/markdown-renderer";
import {
  ArrowButton,
  Badge,
  Button,
  ButtonLink,
  GlassCard,
  SectionHeading,
} from "../../components/aether/primitives";
import { SiteFooter, SiteHeader } from "../../components/aether/site-header";
import { formatDate, formatPrice, formatTime, type EventItem } from "../../lib/mock-data";
import { useApp } from "../../lib/store";
import { shareContent } from "../../lib/utils";

export const Route = createFileRoute("/events/$slug")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { events, registerEvent, payEvent, isRegistered, isPaid, currentUser } = useApp();

  const event = events.find((e) => e.slug === slug || e.id === slug);
  const [showPayment, setShowPayment] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">Event Tidak Ditemukan</h1>
          <p className="mt-2 text-ink-secondary">
            Event yang kamu cari mungkin telah berakhir atau link tidak valid.
          </p>
          <ButtonLink to="/events" className="mt-6">
            Kembali ke Katalog
          </ButtonLink>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const registered = Boolean(currentUser && isRegistered(event.id));
  const paid = Boolean(currentUser && isPaid(event.id));
  const canAccessZoom = Boolean(currentUser && registered && (event.type === "free" || paid));

  const relatedEvents = events
    .filter((e) => e.id !== event.id && e.playlist === event.playlist)
    .slice(0, 3);

  const handleRegisterFree = () => {
    if (!currentUser) {
      toast.info("Silakan masuk atau daftar akun terlebih dahulu untuk mendaftar event.");
      navigate({
        to: "/auth",
        search: { mode: "login", redirect: `/events/${event.slug}` },
      });
      return;
    }

    registerEvent(event.id, true);
    toast.success("Pendaftaran Berhasil!", {
      description: `Kamu telah terdaftar di ${event.title}. Akses link Zoom & tiket telah aktif di Dashboard.`,
      action: {
        label: "Buka Dashboard",
        onClick: () => navigate({ to: "/dashboard" }),
      },
    });
  };

  const handlePaymentSuccess = () => {
    if (!currentUser) {
      toast.info("Silakan masuk atau daftar akun terlebih dahulu.");
      navigate({
        to: "/auth",
        search: { mode: "login", redirect: `/events/${event.slug}` },
      });
      return;
    }

    if (!registered) {
      registerEvent(event.id, true);
    } else {
      payEvent(event.id);
    }
    setShowPayment(false);
    toast.success("Pembayaran Terverifikasi!", {
      description: "Tiket webinar kamu telah aktif dan langsung tercatat di Dashboard.",
      action: {
        label: "Buka Dashboard",
        onClick: () => navigate({ to: "/dashboard" }),
      },
    });
  };

  const copyShareLink = async () => {
    const result = await shareContent({
      title: event.title,
      text: event.description,
      path: `/events/${event.slug}`,
    });

    if (result.copied) {
      toast.success("Tautan event publik berhasil disalin!", {
        description: "Link siap dibagikan ke teman atau media sosial.",
      });
    }
  };

  const copyZoomLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(event.zoomLink);
      toast.success("Link Zoom berhasil disalin!");
    }
  };

  const quotaPercent = Math.min(100, Math.round((event.registered / event.quota) * 100));

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/events"
            className="neu-btn-glass inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-ink-secondary hover:text-accent shadow-xs"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Katalog
          </Link>
          <button
            onClick={copyShareLink}
            className="neu-btn-glass inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-ink-secondary hover:text-accent shadow-xs"
          >
            <Share2 className="size-3.5 text-accent" />
            Bagikan Event
          </button>
        </div>

        {/* Hero & Registration Sidebar Grid */}
        <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visual Thumbnail Banner */}
            {(() => {
              const thumb = event?.thumbnail || "";
              const isImageSrc =
                Boolean(thumb) &&
                (thumb.startsWith("http://") ||
                  thumb.startsWith("https://") ||
                  thumb.startsWith("data:image/") ||
                  thumb.startsWith("/"));

              return (
                <div
                  className="relative h-64 w-full rounded-2xl p-5 sm:h-80 flex flex-col justify-start shadow-xs overflow-hidden"
                  style={
                    isImageSrc
                      ? {
                          backgroundImage: `url("${thumb}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: thumb || "linear-gradient(135deg, #0a84ff 0%, #0056b3 100%)" }
                  }
                >
                  {isImageSrc && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                  )}
                  <div className="relative z-10 flex items-center justify-between">
                    <Badge tone="neutral" className="text-xs font-bold shadow-xs">
                      {event.playlist}
                    </Badge>
                    <Badge tone="neutral" className="text-xs font-bold shadow-xs">
                      {formatPrice(event.price)}
                    </Badge>
                  </div>
                </div>
              );
            })()}

            {/* Event Title & Category - Clean Typography Without Container Box */}
            <div className="space-y-1.5 pt-1">
              <span className="aether-meta text-xs font-bold uppercase tracking-wider text-accent-strong">
                {event.category}
              </span>
              <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl tracking-tight">
                {event.title}
              </h1>
            </div>

            {/* Author & Event Meta Bar - Clean Responsive Mobile & Desktop Layout */}
            <div className="border-y border-hairline py-3.5 text-[13px] text-ink-secondary">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap">
                {/* Author Info */}
                <div className="shrink-0">
                  <p className="font-semibold text-ink leading-tight">{event?.speaker || "Speaker"}</p>
                  <p className="text-[11px] text-ink-tertiary">Host &amp; Speaker Utama</p>
                </div>

                <span className="hidden sm:inline text-hairline">|</span>

                {/* Event Details Chips - Clean Alignment on Mobile */}
                <div className="flex flex-wrap items-center gap-x-3.5 sm:gap-x-4 gap-y-2 text-[12px] sm:text-[13px]">
                  <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                    <Calendar className="size-3.5 text-accent shrink-0" />
                    <span>{formatDate(event.startsAt)}</span>
                  </span>
                  <span className="text-hairline">·</span>
                  <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                    <Clock className="size-3.5 text-accent shrink-0" />
                    <span>{formatTime(event.startsAt)}</span>
                  </span>
                  <span className="text-hairline">·</span>
                  <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                    <MapPin className="size-3.5 text-accent shrink-0" />
                    <span>{event.platform}</span>
                  </span>
                  <span className="text-hairline">·</span>
                  <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                    <Users className="size-3.5 text-accent shrink-0" />
                    <span>{event.registered} / {event.quota}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Event Description & Overview */}
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-ink">Tentang Webinar Ini</h2>
                <div className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                  <MarkdownRenderer content={event.longDescription} />
                </div>
              </div>

              {/* Rundown Sesi */}
              <div className="border-t border-hairline pt-6">
                <h3 className="text-[17px] font-semibold text-ink">Susunan Acara (Rundown)</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex gap-4 items-start">
                    <span className="aether-meta rounded-pill bg-accent-tint px-2.5 py-1 text-accent-strong shrink-0">
                      10 Mnt
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">
                        Pembukaan, Sambutan &amp; Ice Breaking
                      </p>
                      <p className="text-[13px] text-ink-secondary">
                        Pengenalan konsep dan interaksi pembuka bersama peserta.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="aether-meta rounded-pill bg-accent-tint px-2.5 py-1 text-accent-strong shrink-0">
                      50 Mnt
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">
                        Pemaparan Materi Utama &amp; Demonstrasi Kasus
                      </p>
                      <p className="text-[13px] text-ink-secondary">
                        Bedah strategi praktis, studi kasus riil, dan walkthrough langsung.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="aether-meta rounded-pill bg-accent-tint px-2.5 py-1 text-accent-strong shrink-0">
                      20 Mnt
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">
                        Tanya Jawab (Live Q&amp;A) Interaktif
                      </p>
                      <p className="text-[13px] text-ink-secondary">
                        Peserta bebas berkonsultasi langsung mengenai topik yang dibahas.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <span className="aether-meta rounded-pill bg-accent-tint px-2.5 py-1 text-accent-strong shrink-0">
                      10 Mnt
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-ink">
                        Scan Absensi QR &amp; Klaim Sertifikat Otomatis
                      </p>
                      <p className="text-[13px] text-ink-secondary">
                        QR code absensi ditayangkan live di layar Zoom untuk klaim sertifikat instan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You Get / Benefits */}
              <div className="border-t border-hairline pt-6">
                <h3 className="text-[17px] font-semibold text-ink">Benefit yang Kamu Dapatkan</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <CheckCircle className="size-5 text-success shrink-0" />
                    <span className="text-[13px] font-medium text-ink">
                      Sertifikat Resmi Berlisensi ID
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <CheckCircle className="size-5 text-success shrink-0" />
                    <span className="text-[13px] font-medium text-ink">
                      Akses Rekaman Video Sesi
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <CheckCircle className="size-5 text-success shrink-0" />
                    <span className="text-[13px] font-medium text-ink">
                      Bahan Presentasi &amp; Template PDF
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <CheckCircle className="size-5 text-success shrink-0" />
                    <span className="text-[13px] font-medium text-ink">
                      Grup Diskusi &amp; Networking Peserta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Zoom Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="frosted-glass-card p-6 sm:p-7 shadow-lg">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="aether-meta text-ink-tertiary">Harga Tiket</p>
                  <p className="text-3xl font-extrabold text-ink">
                    {formatPrice(event.price)}
                  </p>
                </div>
                <Badge tone="neutral">
                  {event.type === "free" ? "Akses Terbuka" : "Berbayar"}
                </Badge>
              </div>

              {/* Quota Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between text-[12px] text-ink-secondary">
                  <span>Kuota Terisi</span>
                  <span className="font-semibold text-ink">
                    {event.registered} dari {event.quota} kursi
                  </span>
                </div>
                <div className="neu-inset mt-2 h-2.5 w-full rounded-pill overflow-hidden">
                  <div
                    className="h-full rounded-pill bg-accent transition-[width] duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>

              {/* Feature checklist included in ticket */}
              <ul className="mt-5 space-y-2.5 border-t border-hairline pt-4">
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>Akses Interaktif Live Zoom</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>Presensi Cepat QR &lt; 5 Detik</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>E-Sertifikat Terverifikasi Ber-ID</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span>Materi Slide &amp; File Pembahasan</span>
                </li>
              </ul>

              {/* Action Buttons depending on status */}
              <div className="mt-6 space-y-3">
                {!currentUser ? (
                  <div className="space-y-3 rounded-2xl border border-accent/20 bg-accent-tint/30 p-4 text-center">
                    <p className="text-[13px] font-bold text-ink">
                      Masuk untuk Mendaftar Event
                    </p>
                    <p className="text-[11.5px] text-ink-secondary leading-relaxed">
                      Kamu harus memiliki akun peserta terlebih dahulu agar tiket, sertifikat, dan presensi tersimpan di akunmu.
                    </p>
                    <Button
                      onClick={() => {
                        toast.info("Silakan masuk atau buat akun peserta terlebih dahulu.");
                        navigate({
                          to: "/auth",
                          search: { mode: "login", redirect: `/events/${event.slug}` },
                        });
                      }}
                      className="w-full"
                    >
                      Masuk / Daftar Akun
                    </Button>
                  </div>
                ) : canAccessZoom ? (
                  <div className="neu-stat-card space-y-3.5 p-5 rounded-2xl border border-white/90 bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="neu-icon-sphere size-7.5 shrink-0">
                        <Check className="size-4 text-white" strokeWidth={2.6} />
                      </span>
                      <span className="font-bold text-[14px] text-ink">
                        Kamu Sudah Terdaftar!
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-secondary leading-relaxed">
                      Link Zoom telah aktif. Kamu bisa menyalin link atau langsung masuk saat sesi
                      dimulai.
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <a
                        href={event.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="neu-btn-blue inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white shadow-md"
                      >
                        <Video className="size-4" />
                        Buka Zoom Meeting
                      </a>
                      <button
                        onClick={copyZoomLink}
                        className="neu-btn-glass inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-[13px] font-medium text-ink-secondary shadow-xs hover:text-accent transition-colors"
                      >
                        <Copy className="size-3.5 text-accent" />
                        Salin Link Zoom
                      </button>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/dashboard"
                        className="neu-btn-glass inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-accent shadow-xs hover:text-accent-strong transition-all"
                      >
                        <span>Lihat Tiket di Dashboard Saya</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : event.type === "free" ? (
                  <Button onClick={handleRegisterFree} className="w-full">
                    Daftar Sekarang (Gratis)
                  </Button>
                ) : (
                  <Button onClick={() => setShowPayment(true)} className="w-full">
                    Beli Tiket Sekarang
                  </Button>
                )}
              </div>

              {/* Assurances */}
              <div className="mt-6 border-t border-hairline pt-4 space-y-2 text-[12px] text-ink-secondary">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" />
                  <span>Jaminan verifikasi absensi &amp; sertifikat instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-accent" />
                  <span>Materi kurasi praktisi native speaker</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {relatedEvents.length > 0 && (
          <div className="mt-16 border-t border-hairline pt-12">
            <SectionHeading
              overline="Rekomendasi Lain"
              title="Event Serupa di Playlist Ini"
              description={`Webinar lainnya di kategori ${event.playlist}`}
            />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((re) => (
                <div key={re.id} className="glass rounded-xl p-5">
                  <Badge tone="neutral">{re.playlist}</Badge>
                  <h4 className="mt-3 text-[16px] font-semibold text-ink line-clamp-1">
                    {re.title}
                  </h4>
                  <p className="mt-1 text-[13px] text-ink-secondary line-clamp-2">
                    {re.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 text-[12px]">
                    <span className="font-semibold text-accent">{formatPrice(re.price)}</span>
                    <Link
                      to="/events/$slug"
                      params={{ slug: re.slug }}
                      className="neu-btn-blue px-3 py-1 text-[12px] font-semibold text-white shadow-xs"
                    >
                      Lihat Detail &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />

      {showPayment && (
        <PaymentDialog
          event={event}
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onPaid={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
