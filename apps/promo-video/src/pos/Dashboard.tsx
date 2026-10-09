/**
 * Salinan DashboardPage (apps/pos-system/src/routes/dashboard.tsx).
 * Data dari @/lib/pos-data (data contoh bawaan pos-system). Animasi recharts
 * dimatikan dan diganti animasi berbasis frame agar render video deterministik.
 */
import { useCurrentFrame } from "remotion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  rupiah,
  salesByHour,
  weeklySales,
  categoryShare,
  transactions,
  products,
} from "@/lib/pos-data";
import { countUp, outExpo, progress } from "../lib/motion";

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

const pendapatan = salesByHour.reduce((a, b) => a + b.penjualan, 0);
const totalTransaksi = salesByHour.reduce((a, b) => a + b.transaksi, 0);

export function Dashboard({
  start = 0,
  contentWidth,
}: {
  start?: number;
  contentWidth: number;
}) {
  const frame = useCurrentFrame() - start;
  const twoCol = contentWidth > 1000;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const stats = [
    {
      label: "Pendapatan hari ini",
      value: rupiah(countUp(frame, 6, 50, pendapatan)),
      delta: "+12,4%",
      up: true,
      icon: Wallet,
    },
    {
      label: "Transaksi",
      value: String(countUp(frame, 10, 50, totalTransaksi)),
      delta: "+8,1%",
      up: true,
      icon: Receipt,
    },
    {
      label: "Stok menipis",
      value: String(countUp(frame, 14, 40, lowStockCount)),
      delta: "Perlu restok",
      up: false,
      icon: AlertTriangle,
    },
    {
      label: "Rata-rata belanja",
      value: rupiah(
        countUp(frame, 18, 54, Math.round(pendapatan / totalTransaksi)),
      ),
      delta: "-2,3%",
      up: false,
      icon: Users,
    },
  ];

  // ukuran grafik dihitung dari lebar konten (ResponsiveContainer tidak deterministik saat render)
  const areaW = Math.round(((contentWidth - 16) * 2) / 3 - 32);
  const pieW = Math.round((contentWidth - 16) / 3 - 32);
  const barW = Math.round(
    twoCol ? (contentWidth - 16) / 2 - 32 : contentWidth - 32,
  );

  const areaP = progress(frame, 24, 84, outExpo);
  const pieP = progress(frame, 34, 90, outExpo);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => {
          const p = progress(frame, i * 4, i * 4 + 22, outExpo);
          return (
            <div
              key={s.label}
              style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}
              className={
                "p-4 flex flex-col justify-between rounded-3xl " +
                (i === 0 || i === 3 ? "col-span-2 md:col-span-1 " : "") +
                (i === 0
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border border-primary"
                  : "bg-card border border-border/50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]")
              }
            >
              <div className="flex items-start justify-between gap-2">
                <span className={i === 0 ? "text-white" : "text-foreground"}>
                  <s.icon className="size-6" />
                </span>
                <span
                  className={
                    "flex items-center gap-1 text-[12px] font-bold " +
                    (i === 0
                      ? "text-white"
                      : s.up
                        ? "text-success"
                        : "text-destructive")
                  }
                >
                  {s.up ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownRight className="size-4" />
                  )}
                  {s.delta}
                </span>
              </div>
              <div className="mt-4">
                <p
                  className={
                    "text-2xl font-black tracking-tight tabular-nums " +
                    (i === 0 ? "text-white" : "text-foreground")
                  }
                >
                  {s.value}
                </p>
                <p
                  className={
                    "text-[13px] font-medium mt-0.5 " +
                    (i === 0
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground")
                  }
                >
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card-soft p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">
                Penjualan per jam
              </p>
              <p className="text-[11px] text-muted-foreground">
                Diperbarui otomatis setiap transaksi
              </p>
            </div>
            <Tabs value="perjam" className="relative">
              <TabsList className="rounded-xl relative z-0">
                <div className="absolute left-1 top-1 bottom-1 w-20 rounded-md bg-background shadow z-0" />
                <TabsTrigger
                  value="perjam"
                  className="w-20 relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Perjam
                </TabsTrigger>
                <TabsTrigger value="hari" className="w-20 relative z-10">
                  Hari
                </TabsTrigger>
                <TabsTrigger value="minggu" className="w-20 relative z-10">
                  Minggu
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div
            className="mt-4 h-64 w-full"
            style={{ clipPath: `inset(-10px ${(1 - areaP) * 100}% -10px 0)` }}
          >
            <AreaChart width={areaW} height={256} data={salesByHour}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                tickFormatter={(v: number) => `${v / 1000}k`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={40}
              />
              <Area
                type="monotone"
                dataKey="penjualan"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                fill="url(#fillSales)"
                isAnimationActive={false}
              />
            </AreaChart>
          </div>
        </div>

        <div className="card-soft p-4">
          <p className="text-sm font-extrabold">Kontribusi kategori</p>
          <p className="text-[11px] text-muted-foreground">
            Persentase dari total penjualan
          </p>
          <div className="mt-2 h-48 w-full">
            <PieChart width={pieW} height={192}>
              <Pie
                data={categoryShare}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                startAngle={90}
                endAngle={90 - 360 * Math.max(0.001, pieP)}
                isAnimationActive={false}
              >
                {categoryShare.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-1.5">
            {categoryShare.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: chartColors[i % 4] }}
                  />
                  {c.name}
                </span>
                <span className="font-bold tabular-nums">
                  {Math.round(c.value * pieP)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={"grid gap-4 " + (twoCol ? "grid-cols-2" : "")}>
        <div className="flex flex-col gap-4">
          <div className="card-soft p-4 h-fit">
            <p className="text-sm font-extrabold">Penjualan 7 hari terakhir</p>
            <div className="mt-4 h-56 w-full">
              <BarChart
                width={barW}
                height={224}
                data={weeklySales.map((d, i) => {
                  const g = progress(frame, 40 + i * 4, 70 + i * 4, outExpo);
                  return {
                    ...d,
                    Minuman: d.Minuman * g,
                    Makanan: d.Makanan * g,
                    Snack: d.Snack * g,
                    Lainnya: d.Lainnya * g,
                  };
                })}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  domain={[0, 7000000]}
                  tickFormatter={(v: number) => `${v / 1000000}jt`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={38}
                />
                <Bar
                  dataKey="Minuman"
                  stackId="a"
                  fill="var(--color-chart-1)"
                  radius={[0, 0, 6, 6]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="Makanan"
                  stackId="a"
                  fill="var(--color-chart-2)"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="Snack"
                  stackId="a"
                  fill="var(--color-chart-3)"
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="Lainnya"
                  stackId="a"
                  fill="var(--color-chart-4)"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </div>
          </div>

          <div className="card-soft p-4">
            <p className="text-sm font-extrabold">Produk Terlaris Hari Ini</p>
            <div className="mt-3 space-y-2">
              {products.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.category}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold">
                    {rupiah(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-soft p-4">
          <p className="text-sm font-extrabold">Transaksi terbaru</p>
          <div className="mt-3 space-y-2">
            {transactions.map((t, i) => {
              const p = progress(frame, 50 + i * 5, 70 + i * 5, outExpo);
              return (
                <div
                  key={t.id}
                  style={{
                    opacity: p,
                    transform: `translateX(${(1 - p) * 30}px)`,
                  }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {t.id} · {t.items} item
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {t.time} · {t.cashier}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[10px]"
                    >
                      {t.method}
                    </Badge>
                    <span className="text-sm font-extrabold">
                      {rupiah(t.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
