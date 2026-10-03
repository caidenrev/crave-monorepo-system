import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Plus,
  QrCode,
  Ticket,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink, StatCard } from "../../components/aether/primitives";
import { QrMatrix } from "../../components/aether/qr-code";
import {
  formatDate,
  formatPrice,
  formatShortDate,
  formatTime,
  revenueTrend,
  type EventItem,
} from "../../lib/mock-data";
import { useApp } from "../../lib/store";

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { events, attendees } = useApp();
  const [liveQrEvent, setLiveQrEvent] = useState<EventItem | null>(null);

  const totalRegistered = events.reduce((acc, curr) => acc + curr.registered, 0);
  const totalRevenue = events
    .filter((e) => e.type === "paid")
    .reduce((acc, curr) => acc + curr.price * curr.registered, 0);

  const pastEvents = events.filter((e) => e.status === "past");
  const pastRegistered = pastEvents.reduce((acc, curr) => acc + curr.registered, 0);
  const pastAttended = pastEvents.reduce((acc, curr) => acc + curr.attended, 0);
  const averageAttendanceRate =
    pastRegistered > 0 ? Math.round((pastAttended / pastRegistered) * 100) : 82;

  const upcomingEvents = events.filter((e) => e.status === "upcoming");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ringkasan Host"
        description="Pantau metrik pendaftaran, tren kehadiran peserta, dan kelola aktivitas webinar aktif."
        action={
          <div className="flex gap-2">
            <ButtonLink to="/admin/events/new" variant="primary" size="sm">
              <Plus className="size-4" />
              Buat Event Baru
            </ButtonLink>
            <ButtonLink to="/admin/events" variant="glass" size="sm">
              Kelola Event
            </ButtonLink>
          </div>
        }
      />

      {/* 4 Neumorphic Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Ticket className="size-5" />}
          label="Total Event Dibuat"
          value={`${events.length} Event`}
          trend={`${upcomingEvents.length} Aktif Mendatang`}
          progress={80}
        />
        <StatCard
          icon={<Users className="size-5" />}
          label="Total Pendaftar"
          value={totalRegistered.toLocaleString("id-ID")}
          trend="+18% vs bulan lalu"
          progress={88}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="Rata-rata Kehadiran"
          value={`${averageAttendanceRate}%`}
          trend="Tinggi & Akurat"
          progress={averageAttendanceRate}
        />
        <StatCard
          icon={<DollarSign className="size-5" />}
          label="Estimasi Pendapatan"
          value={formatPrice(totalRevenue)}
          trend="Tiket Berbayar"
          progress={92}
        />
      </div>

      {/* Growth Chart Section */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <p className="aether-meta text-accent">Pertumbuhan Webinar</p>
            <h2 className="text-[18px] font-bold text-ink">Tren Peserta &amp; Kehadiran Bulanan</h2>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-medium">
            <span className="flex items-center gap-1.5 text-accent-strong">
              <span className="size-2.5 rounded-full bg-accent" /> Total Pendaftar
            </span>
            <span className="flex items-center gap-1.5 text-success">
              <span className="size-2.5 rounded-full bg-success" /> Peserta Hadir (Absensi QR)
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPeserta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="month" stroke="var(--ink-tertiary)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--ink-tertiary)" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="peserta"
                name="Pendaftar"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPeserta)"
              />
              <Area
                type="monotone"
                dataKey="hadir"
                name="Hadir"
                stroke="var(--success)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorHadir)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Events needing host attention */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-ink">Webinar Mendatang Siap Dijalankan</h3>
            <p className="text-[13px] text-ink-secondary">
              Buka QR Code absensi secara live saat sesi webinar berlangsung untuk peserta.
            </p>
          </div>
          <Link to="/admin/events" className="text-[13px] font-medium text-accent hover:underline">
            Semua Event &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {upcomingEvents.map((ev) => (
            <div
              key={ev.id}
              className="glass rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="accent">{ev.playlist}</Badge>
                  <Badge tone={ev.type === "free" ? "success" : "neutral"}>
                    {formatPrice(ev.price)}
                  </Badge>
                </div>
                <h4 className="mt-3 text-[16px] font-bold text-ink line-clamp-1">{ev.title}</h4>
                <p className="mt-1 text-[13px] text-ink-secondary line-clamp-2">{ev.description}</p>
                <div className="mt-3 flex items-center justify-between text-[12px] text-ink-tertiary">
                  <span>{formatShortDate(ev.startsAt)} · {formatTime(ev.startsAt)}</span>
                  <span>{ev.registered}/{ev.quota} Peserta</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-hairline">
                <Button
                  onClick={() => setLiveQrEvent(ev)}
                  variant="primary"
                  size="sm"
                  className="w-full text-[13px]"
                >
                  <QrCode className="size-4" />
                  Tayangkan QR Absensi Live
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Live QR Modal for Zoom Screen Share */}
      {liveQrEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="glass relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <Badge tone="accent">Host Live Presentation Screen</Badge>
            <h3 className="mt-2 text-xl font-bold text-ink">{liveQrEvent.title}</h3>
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
                  <div className="my-6 flex flex-col items-center justify-center gap-2">
                    <div className="rounded-2xl border-4 border-accent p-2.5 bg-white shadow-xl">
                      <QrMatrix value={qrPayload} size={220} />
                    </div>
                    <span className="text-[11.5px] font-medium text-ink-tertiary">
                      Scan dengan kamera ponsel untuk presensi kilat &lt; 5 detik
                    </span>
                  </div>

                  <div className="rounded-xl bg-accent-tint/60 p-3 text-center border border-accent/20">
                    <span className="aether-meta block text-accent-strong">Kode Absensi Manual Cadangan</span>
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

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  toast.success("Token QR diperbarui!", {
                    description: "Jendela waktu absensi aktif 15 menit ke depan.",
                  });
                }}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Refresh Token QR
              </Button>
              <Button onClick={() => setLiveQrEvent(null)} variant="glass" size="sm" className="flex-1">
                Tutup Layar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
