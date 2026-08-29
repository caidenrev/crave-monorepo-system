import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import {
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Wallet,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rupiah } from "@/lib/pos-data";
import { useDashboard } from "@/lib/useDashboard";
import { useProducts } from "@/lib/useProducts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dasbor Analitik Penjualan Harian — Crave" },
      {
        name: "description",
        content:
          "Pantau pendapatan, jumlah transaksi, produk terlaris, dan stok menipis secara real-time dari satu dasbor.",
      },
      { property: "og:title", content: "Dasbor Analitik Penjualan — Crave" },
      {
        property: "og:description",
        content: "Laporan penjualan real-time untuk bisnis UMKM Anda.",
      },
    ],
  }),
  component: DashboardPage,
});

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function DashboardPage() {
  const { data: dashData, isLoading: isLoadingDash } = useDashboard();
  const { data: products = [], isLoading: isLoadingProd } = useProducts();
  const [chartPeriod, setChartPeriod] = useState<"perjam" | "hari" | "minggu">("perjam");

  if (isLoadingDash || isLoadingProd) {
    return (
      <AppShell title="Dasbor" subtitle="Ringkasan performa penjualan hari ini">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const stats = [
    {
      label: "Pendapatan hari ini",
      value: rupiah(dashData?.pendapatanHariIni || 0),
      delta: "+12,4%",
      up: true,
      icon: Wallet,
    },
    {
      label: "Transaksi",
      value: String(dashData?.totalTransaksi || 0),
      delta: "+8,1%",
      up: true,
      icon: Receipt,
    },
    {
      label: "Stok menipis",
      value: String(lowStockCount),
      delta: "Perlu restok",
      up: false,
      icon: AlertTriangle,
    },
    {
      label: "Rata-rata belanja",
      value: rupiah(dashData?.rataRataBelanja || 0),
      delta: "-2,3%",
      up: false,
      icon: Users,
    },
  ];
  return (
    <AppShell title="Dasbor" subtitle="Ringkasan performa penjualan hari ini">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
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
                    (i === 0 ? "text-white" : s.up ? "text-success" : "text-destructive")
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
                    "text-2xl font-black tracking-tight " +
                    (i === 0 ? "text-white" : "text-foreground")
                  }
                >
                  {s.value}
                </p>
                <p
                  className={
                    "text-[13px] font-medium mt-0.5 " +
                    (i === 0 ? "text-primary-foreground/80" : "text-muted-foreground")
                  }
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="card-soft p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">
                  Penjualan{" "}
                  {chartPeriod === "perjam"
                    ? "per jam"
                    : chartPeriod === "hari"
                      ? "per hari"
                      : "per minggu"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Diperbarui otomatis setiap transaksi
                </p>
              </div>
              <Tabs
                value={chartPeriod}
                onValueChange={(v) => setChartPeriod(v as any)}
                className="relative"
              >
                <TabsList className="rounded-xl relative z-0">
                  <div
                    id="tab-slider"
                    className="absolute left-1 top-1 bottom-1 w-20 rounded-md bg-background dark:bg-primary shadow transition-transform duration-300 ease-in-out z-0"
                    style={{
                      transform:
                        chartPeriod === "perjam"
                          ? "translateX(0)"
                          : chartPeriod === "hari"
                            ? "translateX(100%)"
                            : "translateX(200%)",
                    }}
                  />
                  <TabsTrigger
                    value="perjam"
                    className="w-20 relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-primary-foreground"
                  >
                    Perjam
                  </TabsTrigger>
                  <TabsTrigger
                    value="hari"
                    className="w-20 relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-primary-foreground"
                  >
                    Hari
                  </TabsTrigger>
                  <TabsTrigger
                    value="minggu"
                    className="w-20 relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:text-primary-foreground"
                  >
                    Minggu
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    chartPeriod === "perjam"
                      ? dashData?.salesByHour || []
                      : chartPeriod === "hari"
                        ? dashData?.salesByDay || []
                        : dashData?.salesByWeek || []
                  }
                >
                  <defs>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                    stroke="var(--color-border)"
                  />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis
                    tickFormatter={(v: number) => `${v / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={40}
                  />
                  <Tooltip
                    formatter={(v: number) => rupiah(v)}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="penjualan"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2.5}
                    fill="url(#fillSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-soft p-4">
            <p className="text-sm font-extrabold">Kontribusi kategori</p>
            <p className="text-[11px] text-muted-foreground">Persentase dari total penjualan</p>
            <div className="mt-2 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashData?.categoryShare || []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {(dashData?.categoryShare || []).map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {(dashData?.categoryShare || []).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: chartColors[i % 4] }}
                    />
                    {c.name}
                  </span>
                  <span className="font-bold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="card-soft p-4 h-fit">
              <p className="text-sm font-extrabold">Penjualan 7 hari terakhir</p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashData?.weeklySales || []}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      stroke="var(--color-border)"
                    />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis
                      tickFormatter={(v: number) => `${v / 1000000}jt`}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      width={38}
                    />
                    <Tooltip
                      formatter={(v: number) => rupiah(v)}
                      contentStyle={{ borderRadius: 12 }}
                    />
                    <Bar
                      dataKey="Minuman"
                      stackId="a"
                      fill="var(--color-chart-1)"
                      radius={[0, 0, 6, 6]}
                    />
                    <Bar dataKey="Makanan" stackId="a" fill="var(--color-chart-2)" />
                    <Bar dataKey="Snack" stackId="a" fill="var(--color-chart-3)" />
                    <Bar
                      dataKey="Lainnya"
                      stackId="a"
                      fill="var(--color-chart-4)"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-extrabold">{rupiah(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-soft p-4">
            <p className="text-sm font-extrabold">Transaksi terbaru</p>
            <div className="mt-3 space-y-2">
              {(dashData?.recentTransactions || []).map((t) => (
                <div
                  key={t.id}
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
                      variant={t.method === "Utang" ? "destructive" : "secondary"}
                      className="rounded-full text-[10px]"
                    >
                      {t.method}
                    </Badge>
                    <span className="text-sm font-extrabold">{rupiah(t.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
