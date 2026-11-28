import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { CreditCard, Receipt, UserPlus, Users, Sparkles } from "lucide-react";
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
import {
  NotInstalledError,
  useAnalytics,
  useLive,
  useHrmAnalytics,
  type Analytics,
  type Live,
  type HrmAnalytics,
} from "@/lib/useFounder";
import type { SubscriptionState } from "@/lib/useSubscription";

export const Route = createFileRoute("/founder/")({
  component: OverviewPage,
});

export type SaasFilter = "all" | "pos" | "hrm";

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
  const [saas, setSaas] = useState<SaasFilter>("all");
  const analytics = useAnalytics(days);
  const live = useLive();
  const hrmQuery = useHrmAnalytics(days);

  const a = analytics.data;
  const hrm = hrmQuery.data;

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

  const subtitle =
    saas === "hrm"
      ? "Kesehatan bisnis Crave HRM: langganan perusahaan, arus kas, dan aktivitas absensi."
      : saas === "pos"
        ? "Kesehatan bisnis Crave POS: langganan, pendapatan, dan aktivitas merchant."
        : "Pemantauan terpusat seluruh ekosistem Crave SaaS: Crave POS & Crave HRM.";

  return (
    <>
      <PageHeader
        title="Ringkasan"
        subtitle={subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Ekosistem SaaS"
              value={saas}
              onChange={setSaas}
              options={[
                { value: "all", label: "Semua SaaS" },
                { value: "pos", label: "Crave POS" },
                { value: "hrm", label: "Crave HRM" },
              ]}
            />
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
          </div>
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
          <MrrTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-4 xl:row-span-2" />
          <LiveTile live={live.data} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-5 xl:row-span-2" />
          <MerchantTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-3" />
          <ConversionTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-3" />

          <ActivityTile a={a} hrm={hrm} saas={saas} className="md:col-span-6 xl:col-span-8" />
          <StatusTile a={a} hrm={hrm} saas={saas} className="md:col-span-6 xl:col-span-4" />

          <RevenueTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-5" />
          <SignupTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-4" />
          <MixTile a={a} hrm={hrm} saas={saas} className="md:col-span-6 xl:col-span-3" />

          <FeedTile live={live.data} hrm={hrm} saas={saas} className="md:col-span-6 xl:col-span-5" />
          <ExpiringTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-4" />
          <TopTile a={a} hrm={hrm} saas={saas} className="md:col-span-3 xl:col-span-3" />
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

type TileProps = {
  a: Analytics;
  hrm?: HrmAnalytics | null;
  saas: SaasFilter;
  className?: string;
};

function MrrTile({ a, hrm, saas, className }: TileProps) {
  const kPos = a.kpi;
  const kHrm = hrm?.kpi;

  const mrr =
    saas === "hrm"
      ? (kHrm?.mrr ?? 0)
      : saas === "pos"
        ? kPos.mrr
        : kPos.mrr + (kHrm?.mrr ?? 0);

  const annualMrr = mrr * 12;

  const payingCount =
    saas === "hrm"
      ? (kHrm?.paying_companies ?? 0)
      : saas === "pos"
        ? kPos.active + kPos.grace
        : kPos.active + kPos.grace + (kHrm?.paying_companies ?? 0);

  const revenuePeriod =
    saas === "hrm"
      ? (kHrm?.revenue_period ?? 0)
      : saas === "pos"
        ? kPos.revenue
        : kPos.revenue + (kHrm?.revenue_period ?? 0);

  const revenuePrevious =
    saas === "hrm"
      ? (kHrm?.revenue_previous ?? 0)
      : saas === "pos"
        ? kPos.revenue_prev
        : kPos.revenue_prev + (kHrm?.revenue_previous ?? 0);

  const revenueTotal =
    saas === "hrm"
      ? (kHrm?.revenue_total ?? 0)
      : saas === "pos"
        ? kPos.revenue_total
        : kPos.revenue_total + (kHrm?.revenue_total ?? 0);

  const dailyChart =
    saas === "hrm"
      ? (hrm?.daily ?? [])
      : saas === "pos"
        ? a.daily
        : a.daily.map((d) => {
            const hrmDay = hrm?.daily.find((hd) => hd.date === d.date);
            return {
              ...d,
              revenue: d.revenue + (hrmDay?.revenue ?? 0),
            };
          });

  const hint =
    saas === "hrm"
      ? "Dari perusahaan Crave HRM yang langganannya aktif"
      : saas === "pos"
        ? "Dari merchant Crave POS yang langganannya aktif"
        : "Total gabungan ekosistem Crave POS & Crave HRM";

  const tenantLabel = saas === "hrm" ? "perusahaan" : saas === "pos" ? "merchant" : "tenant";

  return (
    <Tile tone="primary" className={className}>
      <TileTitle title="Pendapatan berulang bulanan (MRR)" hint={hint} inverted />
      <p className="mt-4 text-4xl font-extrabold tracking-tight tabular-nums">{rupiah(mrr)}</p>
      <p className="mt-1 text-xs text-primary-foreground/75">
        Setara {rupiah(annualMrr)} per tahun · {angka(payingCount)} {tenantLabel} berbayar
      </p>

      <div className="mt-4 h-28 w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyChart} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
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
            {rupiah(revenuePeriod)}
            <Delta current={revenuePeriod} previous={revenuePrevious} inverted />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-primary-foreground/75">Total sejak awal</dt>
          <dd className="text-lg font-extrabold tabular-nums">{rupiah(revenueTotal)}</dd>
        </div>
      </dl>
    </Tile>
  );
}

function LiveTile({
  live,
  hrm,
  saas,
  className,
}: {
  live: Live | undefined;
  hrm?: HrmAnalytics | null;
  saas: SaasFilter;
  className?: string;
}) {
  const statBoxes =
    saas === "hrm"
      ? [
          { label: "Presensi hari ini", hint: "Karyawan hadir kantor/GPS", value: `${angka(hrm?.kpi.attendance_today ?? 0)} hadir` },
          { label: "Akun login HR", hint: "Admin HR & Supervisor", value: `${angka(hrm?.kpi.total_users ?? 0)} user` },
          { label: "Prospek baru", hint: "Permintaan demo sales", value: `${angka(hrm?.kpi.new_leads ?? 0)} leads` },
        ]
      : saas === "pos"
        ? [
            { label: "Kasir aktif", hint: "15 menit terakhir", value: live?.active_now === undefined ? "-" : angka(live.active_now) },
            { label: "Transaksi", hint: "1 jam terakhir", value: live?.tx_hour === undefined ? "-" : angka(live.tx_hour) },
            { label: "Akun online", hint: "1 jam terakhir", value: live?.online === undefined ? "-" : angka(live.online) },
          ]
        : [
            {
              label: "Kasir & Presensi",
              hint: "Kasir aktif / Presensi hadir",
              value: `${angka(live?.active_now ?? 0)} POS · ${angka(hrm?.kpi.attendance_today ?? 0)} HRM`,
            },
            {
              label: "Transaksi (POS)",
              hint: "1 jam terakhir",
              value: live?.tx_hour === undefined ? "-" : `${angka(live.tx_hour)} tx`,
            },
            {
              label: "Akun Online / User",
              hint: "Sesi kasir & akun HR",
              value: `${angka((live?.online ?? 0) + (hrm?.kpi.total_users ?? 0))} akun`,
            },
          ];

  return (
    <Tile className={className}>
      <TileTitle
        title="Pantauan langsung"
        hint={
          live
            ? `Diperbarui ${tanggal(live.now, "HH:mm:ss")} · realtime`
            : "Menghubungkan..."
        }
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
        {statBoxes.map((s) => (
          <div key={s.label} className="rounded-2xl bg-muted/60 p-3">
            <dt className="text-[11px] font-bold text-muted-foreground truncate">{s.label}</dt>
            <dd className="text-xl sm:text-2xl font-extrabold tabular-nums truncate">{s.value}</dd>
            <p className="text-[10px] text-muted-foreground truncate">{s.hint}</p>
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
        <span>Aktivitas transaksi per menit</span>
        <span>sekarang</span>
      </div>
      <div className="h-4" />

      <dl className="mt-auto grid grid-cols-2 gap-3 border-t pt-4">
        <div>
          <dt className="text-[11px] text-muted-foreground">
            {saas === "hrm" ? "Total tenaga kerja" : "Omzet merchant hari ini"}
          </dt>
          <dd className="text-lg font-extrabold tabular-nums">
            {saas === "hrm"
              ? `${angka(hrm?.kpi.total_employees ?? 0)} karyawan`
              : live
                ? rupiah(live.gmv_today)
                : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">
            {saas === "hrm" ? "Total perusahaan tenant" : "Hari ini"}
          </dt>
          <dd className="text-lg font-extrabold tabular-nums">
            {saas === "hrm"
              ? `${angka(hrm?.kpi.total_companies ?? 0)} perusahaan`
              : live
                ? `${angka(live.tx_today)} transaksi · ${angka(live.merchants_today)} toko`
                : "-"}
          </dd>
        </div>
      </dl>
    </Tile>
  );
}

function MerchantTile({ a, hrm, saas, className }: TileProps) {
  const k = a.kpi;
  const count =
    saas === "hrm"
      ? (hrm?.kpi.total_companies ?? 0)
      : saas === "pos"
        ? k.merchants
        : k.merchants + (hrm?.kpi.total_companies ?? 0);

  const signups =
    saas === "hrm"
      ? (hrm?.kpi.signups_period ?? 0)
      : saas === "pos"
        ? k.signups
        : k.signups + (hrm?.kpi.signups_period ?? 0);

  const title =
    saas === "hrm" ? "Perusahaan terdaftar" : saas === "pos" ? "Merchant terdaftar" : "Tenant terdaftar";

  const subtext =
    saas === "hrm"
      ? `${angka(hrm?.kpi.total_employees ?? 0)} karyawan aktif dikelola`
      : saas === "pos"
        ? `${angka(k.active_merchants)} toko bertransaksi dalam ${a.days} hari`
        : `${angka(k.merchants)} toko POS · ${angka(hrm?.kpi.total_companies ?? 0)} perusahaan HRM`;

  return (
    <Tile className={className}>
      <TileTitle title={title} />
      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{angka(count)}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
        +{angka(signups)} dalam {a.days} hari
      </p>
      <p className="mt-auto pt-3 text-xs text-muted-foreground truncate">{subtext}</p>
    </Tile>
  );
}

function ConversionTile({ a, hrm, saas, className }: TileProps) {
  const k = a.kpi;
  const total =
    saas === "hrm"
      ? (hrm?.kpi.total_companies ?? 0)
      : saas === "pos"
        ? k.merchants
        : k.merchants + (hrm?.kpi.total_companies ?? 0);

  const paid =
    saas === "hrm"
      ? (hrm?.kpi.paying_companies ?? 0)
      : saas === "pos"
        ? k.paid_merchants
        : k.paid_merchants + (hrm?.kpi.paying_companies ?? 0);

  const rate = total > 0 ? (paid / total) * 100 : 0;
  const pendingCount = k.pending_invoices;

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
        {angka(paid)} dari {angka(total)} {saas === "hrm" ? "perusahaan" : saas === "pos" ? "merchant" : "tenant"} pernah membayar
      </p>
      {pendingCount > 0 && saas !== "hrm" && (
        <Link to="/founder/pembayaran" className="mt-auto pt-3 text-xs font-semibold text-primary hover:underline">
          {angka(pendingCount)} tagihan menunggu pembayaran
        </Link>
      )}
    </Tile>
  );
}

function ActivityTile({ a, hrm, saas, className }: TileProps) {
  const [metric, setMetric] = useState<Metric>("gmv");
  const k = a.kpi;
  const totals: Record<Metric, [number, number]> = {
    gmv: [k.gmv, k.gmv_prev],
    tx: [k.tx, k.tx_prev],
    active: [k.active_merchants, k.active_merchants_prev],
  };
  const [current, previous] = totals[metric];

  if (saas === "hrm") {
    const hrmDaily = hrm?.daily ?? [];
    return (
      <Tile className={className}>
        <TileTitle
          title="Tren Arus Kas Langganan HRM"
          hint={`Seluruh perusahaan tenant, ${a.days} hari terakhir`}
        />
        <p className="mt-3 text-2xl font-extrabold tracking-tight tabular-nums">
          {rupiah(hrm?.kpi.revenue_period ?? 0)}
          <span className="text-xs font-normal text-muted-foreground ml-2">
            dari {angka(hrm?.kpi.paying_companies ?? 0)} perusahaan berlangganan
          </span>
        </p>
        <div className="mt-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hrmDaily} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fillHrmActivity" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={rupiahShort}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={48}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip
                formatter={(v: number) => [rupiah(v), "Pembayaran Masuk"]}
                labelFormatter={(l: string) => tanggal(l, "EEEE, d MMM yyyy")}
                contentStyle={tooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#fillHrmActivity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Tile>
    );
  }

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

function StatusTile({ a, hrm, saas, className }: TileProps) {
  const k = a.kpi;
  const h = hrm?.kpi;

  const data = STATES.map((s) => {
    let value = 0;
    if (saas === "pos") {
      value = k[s];
    } else if (saas === "hrm") {
      if (s === "active") value = h?.active_companies ?? 0;
      else if (s === "trial") value = h?.trial_companies ?? 0;
      else if (s === "grace") value = h?.grace_companies ?? 0;
      else if (s === "expired") value = h?.expired_companies ?? 0;
      else if (s === "suspended") value = h?.suspended_companies ?? 0;
    } else {
      let hVal = 0;
      if (s === "active") hVal = h?.active_companies ?? 0;
      else if (s === "trial") hVal = h?.trial_companies ?? 0;
      else if (s === "grace") hVal = h?.grace_companies ?? 0;
      else if (s === "expired") hVal = h?.expired_companies ?? 0;
      else if (s === "suspended") hVal = h?.suspended_companies ?? 0;
      value = k[s] + hVal;
    }
    return { state: s, name: STATE_LABEL[s], value };
  });

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const label = saas === "hrm" ? "perusahaan" : saas === "pos" ? "merchant" : "tenant";

  return (
    <Tile className={className}>
      <TileTitle title="Status langganan" hint={`Sebaran seluruh ${label} saat ini`} />
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
            {total > 0 && <Tooltip formatter={(v: number) => `${angka(v)} ${label}`} contentStyle={tooltipStyle} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-extrabold tabular-nums">{angka(total)}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
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

function SignupTile({ a, hrm, saas, className }: TileProps) {
  const signupsCount =
    saas === "hrm"
      ? (hrm?.kpi.signups_period ?? 0)
      : saas === "pos"
        ? a.kpi.signups
        : a.kpi.signups + (hrm?.kpi.signups_period ?? 0);

  const prevCount = saas === "pos" ? a.kpi.signups_prev : undefined;
  const label = saas === "hrm" ? "perusahaan" : saas === "pos" ? "merchant" : "tenant";

  const chartData =
    saas === "hrm"
      ? (hrm?.daily ?? [])
      : saas === "pos"
        ? a.daily
        : a.daily.map((d) => {
            const hd = hrm?.daily.find((h) => h.date === d.date);
            return {
              ...d,
              signups: d.signups + (hd?.signups ?? 0),
            };
          });

  return (
    <Tile className={className}>
      <TileTitle
        title="Pendaftaran baru"
        hint={`${angka(signupsCount)} ${label} dalam ${a.days} hari`}
        right={prevCount !== undefined ? <Delta current={signupsCount} previous={prevCount} /> : undefined}
      />
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
              formatter={(v: number) => [`${angka(v)} ${label}`, "Daftar"]}
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

const FEED_ICON = { transaction: Receipt, signup: UserPlus, payment: CreditCard, lead: Sparkles } as const;

function FeedTile({
  live,
  hrm,
  saas,
  className,
}: {
  live: Live | undefined;
  hrm?: HrmAnalytics | null;
  saas: SaasFilter;
  className?: string;
}) {
  const posFeed = (live?.feed ?? []).map((f) => ({ ...f, source: "Crave POS" }));
  const hrmFeed = (hrm?.feed ?? []).map((f) => ({ ...f, source: "Crave HRM" }));

  const combined =
    saas === "pos"
      ? posFeed
      : saas === "hrm"
        ? hrmFeed
        : [...posFeed, ...hrmFeed].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <Tile className={className}>
      <TileTitle title="Aktivitas terbaru" hint="Transaksi kasir, pendaftaran, dan pembayaran langganan" />
      {combined.length === 0 ? (
        <Empty>Belum ada aktivitas.</Empty>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
          {combined.slice(0, 15).map((f, i) => {
            const Icon = FEED_ICON[f.type as keyof typeof FEED_ICON] ?? Receipt;
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
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{f.who}</p>
                    {saas === "all" && (
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                        {f.source}
                      </span>
                    )}
                  </div>
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

function ExpiringTile({ a, hrm, saas, className }: TileProps) {
  const posExpiring = a.expiring.map((e) => ({
    id: e.user_id,
    title: e.store_name || e.email,
    source: "Crave POS",
    state: e.state,
    ends_at: e.ends_at,
    link: `/founder/merchant?q=${encodeURIComponent(e.email)}`,
  }));

  const hrmExpiring = (hrm?.expiring ?? []).map((e) => ({
    id: String(e.id),
    title: `${e.name} (${e.total_employees} staf)`,
    source: "Crave HRM",
    state: e.state,
    ends_at: e.ends_at,
    link: `/founder/merchant?product=hrm&q=${encodeURIComponent(e.email)}`,
  }));

  const list =
    saas === "pos"
      ? posExpiring
      : saas === "hrm"
        ? hrmExpiring
        : [...posExpiring, ...hrmExpiring].sort(
            (x, y) => new Date(x.ends_at).getTime() - new Date(y.ends_at).getTime()
          );

  return (
    <Tile className={className}>
      <TileTitle title="Perlu ditindaklanjuti" hint="Trial atau masa aktif berakhir dalam 7 hari" />
      {list.length === 0 ? (
        <Empty>Tidak ada yang akan berakhir minggu ini.</Empty>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
          {list.map((e) => (
            <li key={`${e.source}-${e.id}`}>
              <Link
                to={e.link}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    {saas === "all" && (
                      <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                        {e.source}
                      </span>
                    )}
                  </div>
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
