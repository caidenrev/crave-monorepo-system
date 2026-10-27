import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Clock,
  Download,
  Mail,
  MonitorPlay,
  Plus,
  QrCode,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatPrice,
  formatShortDate,
  formatTime,
  isPlaylistMatch,
  type BlogPost,
  type EventItem,
  type Playlist,
} from "@/lib/mock-data";
import { CraveSymbol, CraveWordmark } from "./brand";

/* ------------------------------------------------------------------ helpers */

export function thumbnailStyle(thumbnail: string) {
  const isImage = /^(https?:\/\/|data:image\/|\/)/.test(thumbnail);
  return isImage
    ? { backgroundImage: `url("${thumbnail}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: thumbnail };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** Remaining time until `iso`, ticking every second. Null until mounted (avoids SSR mismatch). */
function useCountdown(iso: string | undefined) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!iso || now === null) return null;
  const diff = Math.max(0, new Date(iso).getTime() - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
    done: diff === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function SectionTitle({ title, sub, light }: { title: string; sub?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className={`text-[30px] leading-tight font-semibold tracking-tight sm:text-[40px] ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {sub && <p className={`mt-3 text-[15px] leading-relaxed ${light ? "text-white/75" : "text-ink-secondary"}`}>{sub}</p>}
    </div>
  );
}

/* --------------------------------------------------------------------- hero */

export function PulseHero({ featured }: { featured: EventItem | null }) {
  const isLive = featured?.status === "live";
  const t = useCountdown(isLive ? undefined : featured?.startsAt);

  return (
    <section className="px-2.5 pt-2.5 sm:px-3 sm:pt-3">
      <div className="relative isolate flex min-h-[620px] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#071A44_0%,#0848B8_48%,#0A84FF_100%)] px-5 pt-28 pb-16 text-center text-white sm:min-h-[680px] sm:rounded-[36px]">
        {/* soft light behind the title */}
        <div
          aria-hidden="true"
          className="absolute top-[38%] left-1/2 -z-10 h-[420px] w-[820px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(140,200,255,0.55),transparent)] blur-2xl"
        />
        {/* brand ring motif */}
        <CraveSymbol
          dotColor="transparent"
          className="absolute -right-40 -bottom-56 -z-10 size-[620px] text-white/[0.06] sm:-right-24"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#0A84FF]/60 to-transparent" />

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-[48px] leading-[1.02] font-semibold tracking-[-0.035em] sm:text-[80px] lg:text-[96px]">
            Event yang Bikin{" "}
            <span className="bg-gradient-to-b from-white to-[#9FD0FF] bg-clip-text text-transparent">Nagih.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
            Webinar &amp; workshop dengan presensi QR kurang dari 5 detik dan sertifikat resmi yang langsung terbit.
            Daftar sekali, sisanya otomatis.
          </p>

          {/* countdown */}
          {featured && (
            <div className="mt-9">
              {isLive ? (
                <p className="inline-flex items-center gap-2.5 text-[22px] font-semibold sm:text-[28px]">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex size-full rounded-full bg-danger opacity-70 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-3 rounded-full bg-danger" />
                  </span>
                  Sedang live sekarang
                </p>
              ) : t?.done ? (
                <>
                  <p className="text-[12px] font-semibold tracking-[0.18em] text-white/60 uppercase">Jadwal terdekat</p>
                  <p className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[38px]">
                    {formatShortDate(featured.startsAt)} <span className="text-white/60">·</span> {formatTime(featured.startsAt)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[12px] font-semibold tracking-[0.18em] text-white/60 uppercase">Event berikutnya dimulai dalam</p>
                  <p className="mt-2 text-[26px] font-semibold tracking-tight tabular-nums sm:text-[38px]" aria-live="off">
                    {t ? (
                      [
                        [t.d, "Hari"],
                        [pad(t.h), "Jam"],
                        [pad(t.m), "Mnt"],
                        [pad(t.s), "Dtk"],
                      ].map(([v, unit], i) => (
                        <span key={unit}>
                          {i > 0 && <span className="mx-1.5 text-white/40 sm:mx-2.5">:</span>}
                          {v}
                          <span className="ml-1 text-[0.5em] font-medium text-white/60">{unit}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-white/40">-- : -- : -- : --</span>
                    )}
                  </p>
                </>
              )}
            </div>
          )}

          {/* event pill (stands in for the reference's email field) */}
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 pl-5 text-left backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold tracking-wider text-white/55 uppercase">
                {featured ? (isLive ? "Live sekarang" : formatShortDate(featured.startsAt)) : "Jadwal terbaru"}
              </p>
              <p className="truncate text-[13.5px] font-medium text-white">
                {featured ? featured.title : "Lihat semua webinar & workshop"}
              </p>
            </div>
            {featured ? (
              <Link
                to="/events/$slug"
                params={{ slug: featured.slug }}
                className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-accent transition hover:-translate-y-0.5"
              >
                {isLive ? "Masuk" : "Daftar"}
              </Link>
            ) : (
              <Link to="/events" className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-accent">
                Jelajahi
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- why */

export function WhySection({ featured }: { featured: EventItem | null }) {
  const facts = featured
    ? [
        { label: "Tanggal", value: formatShortDate(featured.startsAt) },
        { label: "Waktu", value: formatTime(featured.startsAt) },
        { label: "Platform", value: featured.platform },
        { label: "Akses", value: formatPrice(featured.price) },
      ]
    : null;

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[30px] font-semibold tracking-tight text-ink sm:text-[40px]">Kenapa Crave Event</h2>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-ink sm:text-[21px]">
          Crave Event dibuat untuk belajar yang benar-benar terasa: daftar tanpa Google Form, hadir cukup scan QR, dan
          sertifikat sudah di tanganmu sebelum sesi ditutup. Kamu fokus ke materinya, sisanya kami yang urus.
        </p>
      </div>

      {facts && (
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-y-6 rounded-[24px] bg-[#0B1530] px-6 py-7 text-white shadow-[0_24px_48px_-24px_rgba(11,21,48,0.6)] sm:grid-cols-4 sm:rounded-[28px] sm:px-10">
          {facts.map((f, i) => (
            <div key={f.label} className={`px-2 sm:px-4 ${i > 0 ? "sm:border-l sm:border-white/15" : ""}`}>
              <p className="text-[18px] font-semibold sm:text-[20px]">{f.label}</p>
              <p className="mt-1 truncate text-[13px] text-white/65">{f.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------- roles */

const ROLES = {
  peserta: {
    label: "Peserta",
    steps: [
      { title: "Daftar sekali klik", body: "Pilih webinar gratis atau berbayar. Bayar lewat QRIS, tiket langsung aktif di dashboard." },
      { title: "Hadir cukup scan QR", body: "Scan kode yang ditayangkan host lewat kamera ponsel atau webcam. Tercatat kurang dari 5 detik." },
      { title: "Klaim sertifikat resmi", body: "Sertifikat ber-ID unik dan bisa diverifikasi, siap diunduh begitu kamu tercatat hadir." },
    ],
  },
  host: {
    label: "Host",
    steps: [
      { title: "Buat event dalam hitungan detik", body: "Atur jadwal, kuota, harga, dan link Zoom dari satu formulir. Publikasikan, selesai." },
      { title: "Tayangkan QR presensi", body: "Tampilkan QR saat share screen. Kehadiran peserta masuk secara live ke panelmu." },
      { title: "Kelola & ekspor peserta", body: "Pantau pendaftar, status bayar, dan kehadiran, lalu ekspor CSV sekali klik." },
    ],
  },
} as const;

type Role = keyof typeof ROLES;

function RoleVisual({ role }: { role: Role }) {
  return (
    <div className="relative isolate flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0B1530_0%,#0848B8_70%,#0A84FF_100%)] p-8">
      <CraveSymbol dotColor="transparent" className="absolute -top-24 -left-24 -z-10 size-[380px] text-white/[0.07]" />
      {role === "host" ? (
        <div className="w-full max-w-[260px] rounded-2xl bg-white p-5 text-center shadow-2xl">
          <p className="text-[11px] font-semibold tracking-wider text-ink-tertiary uppercase">Presensi sesi</p>
          <div className="mx-auto mt-3 grid size-36 place-items-center rounded-xl bg-accent-tint">
            <QrCode className="size-24 text-ink" strokeWidth={1.4} />
          </div>
          <p className="mt-3 text-[14px] font-semibold text-ink">Scan untuk hadir</p>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[12px] text-ink-secondary">
            <span className="size-1.5 rounded-full bg-danger" /> Live, peserta masuk otomatis
          </p>
        </div>
      ) : (
        <div className="w-full max-w-[320px] rotate-[-3deg] rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <CraveSymbol className="size-7 text-accent" />
            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700">Terverifikasi</span>
          </div>
          <p className="mt-5 text-[11px] font-semibold tracking-[0.2em] text-ink-tertiary uppercase">Sertifikat kehadiran</p>
          <p className="mt-1 text-[20px] font-semibold text-ink">Nama Peserta</p>
          <div className="mt-4 h-1.5 w-3/4 rounded-full bg-hairline" />
          <div className="mt-2 h-1.5 w-1/2 rounded-full bg-hairline" />
          <div className="mt-5 flex items-end justify-between border-t border-hairline pt-3">
            <span className="text-[11px] text-ink-tertiary">ID unik + QR verifikasi</span>
            <Award className="size-6 text-accent" />
          </div>
        </div>
      )}
    </div>
  );
}

export function RolesSection() {
  const [role, setRole] = useState<Role>("peserta");
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[30px] leading-tight font-semibold tracking-tight text-ink sm:text-[40px]">
              Satu Platform,
              <br />
              Dua Peran
            </h2>
            <p className="mt-3 max-w-md text-[14.5px] text-ink-secondary">
              Dari sisi peserta maupun host, alurnya dibuat sesingkat mungkin.
            </p>
          </div>
          <div role="tablist" aria-label="Pilih peran" className="inline-flex self-start rounded-full bg-accent-tint/70 p-1 sm:self-auto">
            {(Object.keys(ROLES) as Role[]).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-all ${
                  role === r ? "bg-accent text-white shadow-[0_6px_16px_rgba(10,132,255,0.3)]" : "text-accent hover:text-accent-strong"
                }`}
              >
                {ROLES[r].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <RoleVisual role={role} />
          <ol className="space-y-8">
            {ROLES[role].steps.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="w-9 shrink-0 text-[52px] leading-[0.8] font-semibold tracking-tighter text-accent">{i + 1}</span>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- schedule */

export function ScheduleSection({ events, playlists }: { events: EventItem[]; playlists: Playlist[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState(0);

  const list = useMemo(
    () =>
      events
        .filter((e) => e.status !== "past")
        .filter((e) => !filter || isPlaylistMatch(e.playlist, filter))
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 6),
    [events, filter],
  );

  return (
    <section id="jadwal" className="scroll-mt-24 px-4 py-16 sm:py-20">
      <SectionTitle title="Jadwal Event" sub="Sesi pilihan dari praktisi, urut dari yang paling dekat. Klik untuk lihat detailnya." />

      {playlists.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
          {[{ tag: null as string | null, title: "Semua" }, ...playlists.map((p) => ({ tag: p.tag, title: p.title }))].map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setFilter(p.tag);
                setOpen(0);
              }}
              className={`inline-flex items-center gap-1.5 transition-colors ${filter === p.tag ? "font-semibold text-accent" : "text-ink-secondary hover:text-ink"}`}
            >
              <span className={`size-1.5 rounded-full ${filter === p.tag ? "bg-accent" : "bg-ink/25"}`} />
              {p.title}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-hairline bg-white py-10 text-center text-[14px] text-ink-secondary">
            Belum ada jadwal di kategori ini.
          </p>
        )}
        {list.map((ev, i) => {
          const expanded = open === i;
          return (
            <div
              key={ev.id}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                expanded ? "border-accent/20 bg-accent-tint/60" : "border-hairline bg-white hover:border-accent/30"
              }`}
            >
              <button
                onClick={() => setOpen(expanded ? -1 : i)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 px-5 py-4 text-left sm:gap-8 sm:px-6"
              >
                <span className="w-24 shrink-0 text-[12px] leading-tight text-ink-tertiary sm:w-28">
                  <span className="flex items-center gap-1.5 font-semibold text-ink-secondary">
                    {ev.status === "live" ? (
                      <>
                        <span className="size-1.5 rounded-full bg-danger" /> LIVE
                      </>
                    ) : (
                      <>
                        <CalendarDays className="size-3.5 text-accent" /> {formatShortDate(ev.startsAt)}
                      </>
                    )}
                  </span>
                  <span className="mt-0.5 block">{formatTime(ev.startsAt)}</span>
                </span>
                <span className={`min-w-0 flex-1 text-[15px] font-medium sm:text-[17px] ${expanded ? "text-accent" : "text-ink"}`}>
                  {ev.title}
                </span>
                <Plus
                  className={`size-5 shrink-0 text-ink-tertiary transition-transform duration-300 ${expanded ? "rotate-45" : ""}`}
                />
              </button>

              <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 sm:pr-6 sm:pl-[160px]">
                    <p className="text-[14px] leading-relaxed text-ink-secondary">{ev.description}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-secondary">
                        <span className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                            {initials(ev.speaker)}
                          </span>
                          {ev.speaker}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MonitorPlay className="size-4 text-accent" /> {ev.platform}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-4 text-accent" /> {ev.registered}/{ev.quota}
                        </span>
                      </div>
                      <Link
                        to="/events/$slug"
                        params={{ slug: ev.slug }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        {formatPrice(ev.price)} · Lihat detail <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link to="/events" className="text-[14px] font-semibold text-accent hover:underline underline-offset-4">
          Lihat kalender lengkap →
        </Link>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- speakers */

export function SpeakersSection({ events }: { events: EventItem[] }) {
  const speakers = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      if (!e.speaker) continue;
      map.set(e.speaker, [...(map.get(e.speaker) ?? []), e]);
    }
    return [...map.entries()].map(([name, evs]) => ({ name, events: evs, latest: evs[0]! }));
  }, [events]);
  const [idx, setIdx] = useState(0);

  if (speakers.length === 0) return null;
  const n = speakers.length;
  const cur = speakers[idx % n]!;
  const prev = speakers[(idx - 1 + n) % n]!;
  const next = speakers[(idx + 1) % n]!;

  const MiniCard = ({ s, onClick }: { s: typeof cur; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="hidden w-44 shrink-0 rounded-2xl bg-white/95 p-4 text-left shadow-lg transition hover:-translate-y-1 md:block"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-[14px] font-bold text-white">{initials(s.name)}</span>
      <p className="mt-6 text-[14px] font-semibold text-ink">{s.name}</p>
      <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-secondary">{s.latest.category}</p>
    </button>
  );

  return (
    <section id="speaker" className="scroll-mt-24 px-2.5 sm:px-3">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#12B5AE_0%,#1AA6C8_100%)] px-5 py-16 sm:rounded-[36px] sm:px-10 sm:py-20">
        <CraveSymbol dotColor="transparent" className="absolute -top-40 -right-40 -z-10 size-[520px] text-white/[0.08]" />
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">Kenalan dengan Speaker</h2>
              <p className="mt-2 text-[14.5px] text-white/80">Praktisi yang membawakan sesi di Crave Event.</p>
            </div>
            {n > 1 && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setIdx((i) => (i - 1 + n) % n)}
                  aria-label="Speaker sebelumnya"
                  className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % n)}
                  aria-label="Speaker berikutnya"
                  className="flex size-10 items-center justify-center rounded-full bg-white text-[#0E8E9A] transition hover:-translate-y-0.5"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            {n > 2 && <MiniCard s={prev} onClick={() => setIdx((i) => (i - 1 + n) % n)} />}

            <div key={cur.name} className="grid w-full max-w-2xl gap-6 rounded-[24px] bg-white p-5 shadow-2xl motion-safe:animate-[aether-pop_0.35s_ease-out] sm:grid-cols-[200px_1fr] sm:p-6">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#0B1530,#0848B8)]">
                <CraveSymbol dotColor="transparent" className="absolute -right-10 -bottom-10 size-44 text-white/10" />
                <span className="text-[56px] font-semibold tracking-tight text-white">{initials(cur.name)}</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[22px] font-semibold text-accent">{cur.name}</p>
                <p className="text-[12.5px] font-medium text-ink-tertiary">
                  Speaker · {cur.events.length} sesi · {cur.latest.category}
                </p>
                <p className="mt-4 line-clamp-4 text-[14px] leading-relaxed text-ink-secondary">{cur.latest.description}</p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink">{cur.latest.title}</span>
                  <Link
                    to="/events/$slug"
                    params={{ slug: cur.latest.slug }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:-translate-y-0.5"
                    aria-label={`Lihat sesi ${cur.latest.title}`}
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

            {n > 1 && <MiniCard s={next} onClick={() => setIdx((i) => (i + 1) % n)} />}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- faq */

const FAQS = [
  {
    q: "Siapa saja yang bisa ikut event di Crave Event?",
    a: "Siapa pun. Pelajar, mahasiswa, profesional, atau komunitas. Cukup buat akun, pilih event, lalu daftar.",
  },
  {
    q: "Bagaimana cara mendaftar event?",
    a: "Buka halaman event, klik Daftar. Untuk event gratis tiket langsung aktif; untuk event berbayar, selesaikan pembayaran QRIS dan tiket aktif otomatis di dashboard.",
  },
  {
    q: "Bagaimana presensinya?",
    a: "Saat sesi berjalan, host menayangkan QR code di layar. Scan pakai kamera ponsel atau webcam, kehadiranmu tercatat dalam hitungan detik.",
  },
  {
    q: "Kapan sertifikat bisa diunduh?",
    a: "Begitu kehadiranmu tercatat, sertifikat bisa langsung diklaim dan diunduh dari dashboard. Setiap sertifikat punya ID unik dan QR verifikasi.",
  },
  {
    q: "Apakah ada event gratis?",
    a: "Ada. Banyak sesi komunitas yang gratis. Filter di halaman event untuk melihat event gratis maupun berbayar.",
  },
  {
    q: "Saya ingin jadi host. Bagaimana caranya?",
    a: "Hubungi kami lewat support@craveservices.my.id. Setelah akunmu diaktifkan sebagai host, kamu bisa membuat event dari panel speaker.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <SectionTitle title="Pertanyaan yang Sering Ditanyakan" sub="Hal-hal yang perlu kamu tahu sebelum ikut event pertama." />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const expanded = open === i;
          return (
            <div key={f.q} className={`rounded-2xl border transition-colors ${expanded ? "border-transparent bg-[#EDF0F5]" : "border-hairline bg-white"}`}>
              <button
                onClick={() => setOpen(expanded ? -1 : i)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[14.5px] font-semibold text-ink sm:px-6"
              >
                {f.q}
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    expanded ? "rotate-45 border-ink/20 bg-white" : "border-hairline"
                  }`}
                >
                  <Plus className="size-3.5" />
                </span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-ink-secondary sm:px-6">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- articles */

export function ArticlesSection({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState(0);
  if (posts.length === 0) return null;
  const cur = posts[Math.min(active, posts.length - 1)]!;

  return (
    <section className="px-4 py-16 sm:py-20">
      <SectionTitle title="Artikel & Panduan" sub="Catatan belajar, tips presentasi, dan alur kerja dari para host." />
      <div className="mx-auto mt-12 grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_1.15fr] md:gap-16">
        <ul className="space-y-1 md:text-right">
          {posts.map((p, i) => (
            <li key={p.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`group inline-flex items-baseline gap-3 py-1.5 text-[15px] transition-colors md:flex-row-reverse ${
                  i === active ? "font-semibold text-ink" : "text-ink-tertiary hover:text-ink-secondary"
                }`}
              >
                <span className={`text-[11px] tabular-nums ${i === active ? "text-accent" : ""}`}>[{pad(i + 1)}]</span>
                <span className="line-clamp-1 text-left md:text-right">{p.title}</span>
              </button>
            </li>
          ))}
        </ul>

        <Link
          key={cur.id}
          to="/blog/$slug"
          params={{ slug: cur.slug }}
          className="group block overflow-hidden rounded-[24px] border border-hairline bg-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25)] motion-safe:animate-[aether-pop_0.3s_ease-out]"
        >
          <div className="h-52 w-full" style={thumbnailStyle(cur.cover)} aria-hidden="true" />
          <div className="p-5">
            <div className="flex items-center justify-between text-[12px] text-ink-tertiary">
              <span className="font-semibold text-accent">{cur.tag}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> {cur.readMinutes} mnt baca
              </span>
            </div>
            <h3 className="mt-2 text-[17px] font-semibold text-ink transition-colors group-hover:text-accent">{cur.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-[13.5px] text-ink-secondary">{cur.excerpt}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- cta */

export function CtaSection({ featured }: { featured: EventItem | null }) {
  return (
    <section className="px-4 py-10 sm:py-16">
      <div className="relative isolate mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#12B5AE_0%,#0A84FF_100%)] px-7 py-10 text-white sm:grid-cols-[1.2fr_1fr] sm:px-12 sm:py-14">
        <CraveSymbol dotColor="transparent" className="absolute -bottom-32 -left-24 -z-10 size-[360px] text-white/10" />
        <div>
          <h2 className="text-[28px] leading-tight font-semibold tracking-tight sm:text-[34px]">Siap ikut event berikutnya?</h2>
          <p className="mt-3 max-w-sm text-[14.5px] text-white/80">
            Daftar sekarang, hadir dengan sekali scan, dan bawa pulang sertifikat resmi untuk portofoliomu.
          </p>
          {featured ? (
            <Link
              to="/events/$slug"
              params={{ slug: featured.slug }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-accent transition hover:-translate-y-0.5"
            >
              <Ticket className="size-4" /> Daftar Sekarang
            </Link>
          ) : (
            <Link
              to="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-accent transition hover:-translate-y-0.5"
            >
              <Ticket className="size-4" /> Jelajahi Event
            </Link>
          )}
        </div>
        {featured && (
          <div className="sm:text-right">
            <p className="text-[13px] font-medium text-white/75">
              {formatShortDate(featured.startsAt)} · {formatTime(featured.startsAt)}
            </p>
            <p className="mt-2 text-[24px] leading-snug font-semibold sm:text-[30px]">{featured.title}</p>
            <p className="mt-2 text-[13px] text-white/75">{featured.platform}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- footer */

export function BigFooter() {
  return (
    <footer className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#0A84FF_0%,#0868D8_100%)] px-6 pt-14 pb-8 text-white sm:rounded-[36px] sm:px-12 sm:pt-20">
        <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 h-72 w-[90%] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <CraveWordmark className="mx-auto block w-full max-w-6xl text-white" eventColor="rgba(255,255,255,0.72)" />

        <div className="mx-auto mt-14 grid max-w-6xl gap-10 border-t border-white/20 pt-8 text-[13px] sm:grid-cols-3">
          <div>
            <p className="max-w-xs text-white/80">
              Platform webinar dengan presensi QR dan sertifikat otomatis. Bagian dari keluarga Crave.
            </p>
            <p className="mt-4 text-white/60">© {new Date().getFullYear()} Crave Event</p>
          </div>
          <div>
            <p className="font-semibold">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-white/75">
              <li>
                <Link to="/events" className="hover:text-white">Semua event</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white">Blog</Link>
              </li>
              <li>
                <Link to="/dashboard/certificates" className="hover:text-white">Sertifikat saya</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white">Masuk / Daftar</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Kontak</p>
            <ul className="mt-3 space-y-2 text-white/75">
              <li>
                <a href="mailto:support@craveservices.my.id" className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="size-4" /> support@craveservices.my.id
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <Download className="size-4" /> Sertifikat bisa diunduh kapan saja dari dashboard
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
