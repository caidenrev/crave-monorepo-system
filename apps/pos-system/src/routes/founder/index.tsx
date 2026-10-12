import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { CreditCard, Receipt, UserPlus } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/founder/FounderShell";
import {
  angka,
  Delta,
  Empty,
  METHOD_LABEL,
  rupiahShort,
  Segmented,
  STATE_COLOR,
  STATE_LABEL,
  StateBadge,
  tanggal,
  Tile,
  TileTitle,
  tooltipStyle,
} from "@/components/founder/ui";
import { rupiah } from "@/lib/pos-data";
import { NotInstalledError, useAnalytics, useLive, type Analytics, type Live } from "@/lib/useFounder";
import type { SubscriptionState } from "@/lib/useSubscription";

export const Route = createFileRoute("/founder/")({
  component: OverviewPage,
});

type Metric = "gmv" | "tx" | "active";
const METRIC: Record<Metric, { label: string; format: (v: number) => string }> = {
  gmv: { label: "Omzet merchant", format: rupiah },
  tx: { label: "Transaksi", format: angka },
  active: { label: "Merchant bertransaksi", format: angka },
};

const hari = (iso: string) => tanggal(iso, "d MMM");
const bulan = (ym: string) => tanggal(`${ym}-01`, "MMM yy");

function OverviewPage() {
  const [days, setDays] = useState(30);
  const analytics = useAnalytics(days);
  const live = useLive();
  const a = analytics.data;

  if (analytics.error instanceof NotInstalledError) {
    return (
      <>
        <PageHeader title="Ringkasan" />
        <Tile>
          <TileTitle title="Analitik belum dipasang" />
          <p className="mt-2 text-sm text-muted-foreground">
            Jalankan seluruh isi file <code className="font-mono">supabase_founder.sql</code> di Supabase SQL
            Editor, lalu muat ulang halaman ini. Halaman Merchant dan Pembayaran tetap bisa dipakai.
          </p>
        </Tile>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Ringkasan"
        subtitle="Kesehatan bisnis Crave POS: langganan, pendapatan, dan aktivitas merchant."
        actions={
          <Segmented
            label="Rentang waktu"
            value={days}
            onChange={setDays}
            options={[
              { value: 7, label: "7 hari" },
              { value: 30, label: "30 hari" },
              { value: 90, label: "90 hari" },
            ]}
          />
        }
      />

      {analytics.error ? (
        <Tile>
          <p className="text-sm text-destructive">{analytics.error.message}</p>
        </Tile>
      ) : !a ? (
        <BentoSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12">
          <MrrTile a={a} className="md:col-span-3 xl:col-span-4 xl:row-span-2" />
          <LiveTile live={live.data} className="md:col-span-3 xl:col-span-5 xl:row-span-2" />
          <MerchantTile a={a} className="md:col-span-3 xl:col-span-3" />
          <ConversionTile a={a} className="md:col-span-3 xl:col-span-3" />

          <ActivityTile a={a} className="md:col-span-6 xl:col-span-8" />
          <StatusTile a={a} className="md:col-span-6 xl:col-span-4" />

          <RevenueTile a={a} className="md:col-span-3 xl:col-span-5" />
          <SignupTile a={a} className="md:col-span-3 xl:col-span-4" />
          <MixTile a={a} className="md:col-span-6 xl:col-span-3" />

          <FeedTile live={live.data} className="md:col-span-6 xl:col-span-5" />
          <ExpiringTile a={a} className="md:col-span-3 xl:col-span-4" />
          <TopTile a={a} className="md:col-span-3 xl:col-span-3" />
        </div>
      )}
    </>
  );
}

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-12" aria-busy="true">
      {["xl:col-span-4 h-72", "xl:col-span-5 h-72", "xl:col-span-3 h-72", "xl:col-span-8 h-80", "xl:col-span-4 h-80"].map(
        (c) => (
          <div key={c} className={`animate-pulse rounded-3xl border bg-muted/50 md:col-span-3 ${c}`} />
        ),
      )}
    </div>
  );
}

type TileProps = { a: Analytics; className?: string };

function MrrTile({ a, className }: TileProps) {
  const k = a.kpi;
  return (
    <Tile tone="primary" className={className}>
      <TileTitle title="Pendapatan berulang bulanan (MRR)" hint="Dari merchant yang langganannya masih aktif" inverted />
      <p className="mt-4 text-4xl font-extrabold tracking-tight tabular-nums">{rupiah(k.mrr)}</p>
      <p className="mt-1 text-xs text-primary-foreground/75">
        Setara {rupiah(k.mrr * 12)} per tahun · {angka(k.active + k.grace)} merchant berbayar
      </p>

      <div className="mt-4 h-28 w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={a.daily} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Tooltip
              formatter={(v: number) => [rupiah(v), "Pembayaran masuk"]}
              labelFormatter={(l: string) => hari(l)}
              contentStyle={tooltipStyle}
            />
            <XAxis dataKey="date" hide />
            <Area type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={2} fill="url(#fillMrr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
        <div>
          <dt className="text-[11px] text-primary-foreground/75">Masuk {a.days} hari</dt>
          <dd className="flex flex-wrap items-baseline gap-x-2 text-lg font-extrabold tabular-nums">
            {rupiah(k.revenue)}
            <Delta current={k.revenue} previous={k.revenue_prev} inverted />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-primary-foreground/75">Total sejak awal</dt>
          <dd className="text-lg font-extrabold tabular-nums">{rupiah(k.revenue_total)}</dd>
        </div>
      </dl>
    </Tile>
  );
}

function LiveTile({ live, className }: { live: Live | undefined; className?: string }) {
  return (
    <Tile className={className}>
      <TileTitle
        title="Pantauan langsung"
        hint={live ? `Diperbarui ${tanggal(live.now, "HH:mm:ss")} · tiap 10 detik` : "Menghubungkan..."}
        right={
          <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            LIVE
          </span>
        }
      />

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Kasir aktif", hint: "15 menit terakhir", value: live?.active_now },
          { label: "Transaksi", hint: "1 jam terakhir", value: live?.tx_hour },
          { label: "Akun online", hint: "1 jam terakhir", value: live?.online },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-muted/60 p-3">
            <dt className="text-[11px] font-bold text-muted-foreground">{s.label}</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{s.value === undefined ? "-" : angka(s.value)}</dd>
            <p className="text-[10px] text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </dl>

      <div className="mt-4 h-28 w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={live?.minutes ?? []} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap={1}>
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              formatter={(v: number) => [`${angka(v)} transaksi`, ""]}
              labelFormatter={(ago: number) => (ago === 0 ? "Menit ini" : `${ago} menit lalu`)}
              contentStyle={tooltipStyle}
              separator=""
            />
            <XAxis dataKey="ago" hide />
            <YAxis hide allowDecimals={false} domain={[0, (max: number) => Math.max(max, 3)]} />
            <Bar dataKey="tx" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} minPointSize={2} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>60 menit lalu</span>
        <span>Transaksi per menit</span>
        <span>sekarang</span>
      </div>
      <div className="h-4" />

      <dl className="mt-auto grid grid-cols-2 gap-3 border-t pt-4">
        <div>
          <dt className="text-[11px] text-muted-foreground">Omzet merchant hari ini</dt>
          <dd className="text-lg font-extrabold tabular-nums">{live ? rupiah(live.gmv_today) : "-"}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Hari ini</dt>
          <dd className="text-lg font-extrabold tabular-nums">
            {live ? `${angka(live.tx_today)} transaksi · ${angka(live.merchants_today)} toko` : "-"}
          </dd>
        </div>
      </dl>
    </Tile>
  );
}

function MerchantTile({ a, className }: TileProps) {
  const k = a.kpi;
  return (
    <Tile className={className}>
      <TileTitle title="Merchant terdaftar" />
      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{angka(k.merchants)}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        +{angka(k.signups)} dalam {a.days} hari
        <Delta current={k.signups} previous={k.signups_prev} />
      </p>
      <p className="mt-auto pt-3 text-xs text-muted-foreground">
        {angka(k.active_merchants)} toko bertransaksi dalam {a.days} hari
      </p>
    </Tile>
  );
}

function ConversionTile({ a, className }: TileProps) {
  const k = a.kpi;
  const rate = k.merchants > 0 ? (k.paid_merchants / k.merchants) * 100 : 0;
  return (
    <Tile className={className}>
      <TileTitle title="Konversi ke berbayar" />
      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">
        {rate.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(rate)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Konversi ke berbayar"
      >
        <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {angka(k.paid_merchants)} dari {angka(k.merchants)} merchant pernah membayar
      </p>
      {k.pending_invoices > 0 && (
        <Link to="/founder/pembayaran" className="mt-auto pt-3 text-xs font-semibold text-primary hover:underline">
          {angka(k.pending_invoices)} tagihan menunggu pembayaran
        </Link>
      )}
    </Tile>
  );
}

function ActivityTile({ a, className }: TileProps) {
  const [metric, setMetric] = useState<Metric>("gmv");
  const k = a.kpi;
  const totals: Record<Metric, [number, number]> = {
    gmv: [k.gmv, k.gmv_prev],
    tx: [k.tx, k.tx_prev],
    active: [k.active_merchants, k.active_merchants_prev],
  };
  const [current, previous] = totals[metric];
  return (
    <Tile className={className}>
      <TileTitle
        title="Aktivitas merchant"
        hint={`Seluruh toko, ${a.days} hari terakhir`}
        right={
          <Segmented
            label="Metrik"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "gmv", label: "Omzet" },
              { value: "tx", label: "Transaksi" },
              { value: "active", label: "Toko aktif" },
            ]}
          />
        }
      />
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-2xl font-extrabold tracking-tight tabular-nums">
        {METRIC[metric].format(current)}
        <Delta current={current} previous={previous} />
        <span className="text-xs font-normal text-muted-foreground">vs {a.days} hari sebelumnya</span>
      </p>
      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={a.daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={hari}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              minTickGap={28}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickFormatter={(v: number) => (metric === "gmv" ? rupiahShort(v) : angka(v))}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={48}
              allowDecimals={false}
              stroke="var(--color-muted-foreground)"
            />
            <Tooltip
              formatter={(v: number) => [METRIC[metric].format(v), METRIC[metric].label]}
              labelFormatter={(l: string) => tanggal(l, "EEEE, d MMM yyyy")}
              contentStyle={tooltipStyle}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              fill="url(#fillActivity)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

const STATES: SubscriptionState[] = ["active", "trial", "grace", "expired", "suspended"];

function StatusTile({ a, className }: TileProps) {
  const data = STATES.map((s) => ({ state: s, name: STATE_LABEL[s], value: a.kpi[s] }));
  const total = a.kpi.merchants;
  return (
    <Tile className={className}>
      <TileTitle title="Status langganan" hint="Sebaran seluruh merchant saat ini" />
      <div className="relative mx-auto mt-2 h-48 w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total > 0 ? data.filter((d) => d.value > 0) : [{ state: "suspended", name: "Belum ada", value: 1 }]}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={total > 0 ? 3 : 0}
              stroke="var(--color-card)"
              strokeWidth={2}
            >
              {(total > 0 ? data.filter((d) => d.value > 0) : [{ state: "suspended" as const }]).map((d) => (
                <Cell key={d.state} fill={total > 0 ? STATE_COLOR[d.state] : "var(--color-muted)"} />
              ))}
            </Pie>
            {total > 0 && <Tooltip formatter={(v: number) => `${angka(v)} merchant`} contentStyle={tooltipStyle} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-extrabold tabular-nums">{angka(total)}</p>
            <p className="text-[11px] text-muted-foreground">merchant</p>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((d) => (
          <li key={d.state} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: STATE_COLOR[d.state] }} />
              {d.name}
            </span>
            <span className="font-bold tabular-nums">
              {angka(d.value)}
              <span className="ml-1.5 font-normal text-muted-foreground">
                {total > 0 ? `${Math.round((d.value / total) * 100)}%` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

function RevenueTile({ a, className }: TileProps) {
  return (
    <Tile className={className}>
      <TileTitle title="Pendapatan langganan per bulan" hint="12 bulan terakhir, tagihan lunas" />
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={a.monthly} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              tickFormatter={bulan}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              minTickGap={12}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickFormatter={rupiahShort}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={48}
              stroke="var(--color-muted-foreground)"
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              formatter={(v: number, _n, item) => [
                `${rupiah(v)} · ${angka((item.payload as Analytics["monthly"][number]).invoices)} tagihan`,
                "Pendapatan",
              ]}
              labelFormatter={(l: string) => tanggal(`${l}-01`, "MMMM yyyy")}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

function SignupTile({ a, className }: TileProps) {
  return (
    <Tile className={className}>
      <TileTitle
        title="Pendaftaran baru"
        hint={`${angka(a.kpi.signups)} merchant dalam ${a.days} hari`}
        right={<Delta current={a.kpi.signups} previous={a.kpi.signups_prev} />}
      />
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={a.daily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={hari}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              minTickGap={28}
              stroke="var(--color-muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={28}
              allowDecimals={false}
              stroke="var(--color-muted-foreground)"
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)" }}
              formatter={(v: number) => [`${angka(v)} merchant`, "Daftar"]}
              labelFormatter={(l: string) => tanggal(l, "EEEE, d MMM yyyy")}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="signups" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Tile>
  );
}

function ShareBars({ rows }: { rows: { key: string; label: string; count: number; amount: number }[] }) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <ul className="mt-2 space-y-2.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate font-semibold">{r.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {angka(r.count)}x · {rupiahShort(r.amount)}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(r.amount / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MixTile({ a, className }: TileProps) {
  return (
    <Tile className={className}>
      <TileTitle title="Paket & metode bayar" hint="Dari seluruh tagihan lunas" />
      {a.plans.length === 0 ? (
        <Empty>Belum ada pembayaran.</Empty>
      ) : (
        <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Durasi</p>
            <ShareBars
              rows={a.plans.map((p) => ({ key: String(p.months), label: `${p.months} bulan`, count: p.count, amount: p.amount }))}
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Metode</p>
            <ShareBars
              rows={a.methods.map((m) => ({
                key: m.method,
                label: METHOD_LABEL[m.method] ?? m.method,
                count: m.count,
                amount: m.amount,
              }))}
            />
          </div>
        </div>
      )}
    </Tile>
  );
}

const FEED_ICON = { transaction: Receipt, signup: UserPlus, payment: CreditCard } as const;

function FeedTile({ live, className }: { live: Live | undefined; className?: string }) {
  return (
    <Tile className={className}>
      <TileTitle title="Aktivitas terbaru" hint="Transaksi kasir, pendaftaran, dan pembayaran langganan" />
      {!live ? (
        <Empty>Memuat...</Empty>
      ) : live.feed.length === 0 ? (
        <Empty>Belum ada aktivitas.</Empty>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
          {live.feed.map((f, i) => {
            const Icon = FEED_ICON[f.type];
            return (
              <li key={`${f.type}-${f.at}-${i}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/60">
                <span
                  className={
                    "grid size-8 shrink-0 place-items-center rounded-full " +
                    (f.type === "payment"
                      ? "bg-success/15 text-success"
                      : f.type === "signup"
                        ? "bg-chart-2/15 text-chart-2"
                        : "bg-primary/10 text-primary")
                  }
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{f.who}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {f.type === "transaction"
                      ? `Transaksi ${f.detail ?? ""}`
                      : f.type === "signup"
                        ? "Mendaftar"
                        : `Bayar langganan ${f.detail ?? ""}`}
                    {" · "}
                    {formatDistanceToNow(new Date(f.at), { addSuffix: true, locale: id })}
                  </p>
                </div>
                {f.amount !== null && (
                  <span className="shrink-0 text-sm font-bold tabular-nums">{rupiah(f.amount)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

function ExpiringTile({ a, className }: TileProps) {
  return (
    <Tile className={className}>
      <TileTitle title="Perlu ditindaklanjuti" hint="Trial atau masa aktif berakhir dalam 7 hari" />
      {a.expiring.length === 0 ? (
        <Empty>Tidak ada yang akan berakhir minggu ini.</Empty>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
          {a.expiring.map((e) => (
            <li key={e.user_id}>
              <Link
                to="/founder/merchant"
                search={{ q: e.email }}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.store_name || e.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(e.ends_at) < new Date() ? "Habis " : "Berakhir "}
                    {formatDistanceToNow(new Date(e.ends_at), { addSuffix: true, locale: id })} ·{" "}
                    {tanggal(e.ends_at, "d MMM")}
                  </p>
                </div>
                <StateBadge state={e.state} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

function TopTile({ a, className }: TileProps) {
  const max = Math.max(...a.top.map((t) => t.gmv), 1);
  return (
    <Tile className={className}>
      <TileTitle title="Merchant teratas" hint={`Omzet ${a.days} hari terakhir`} />
      {a.top.length === 0 ? (
        <Empty>Belum ada transaksi.</Empty>
      ) : (
        <ol className="mt-3 space-y-3">
          {a.top.map((t, i) => (
            <li key={t.user_id}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate font-semibold">
                  <span className="mr-1.5 tabular-nums text-muted-foreground">{i + 1}.</span>
                  {t.store_name || t.email}
                </span>
                <span className="shrink-0 font-bold tabular-nums">{rupiahShort(t.gmv)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(t.gmv / max) * 100}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{angka(t.tx)} transaksi</p>
            </li>
          ))}
        </ol>
      )}
    </Tile>
  );
}
