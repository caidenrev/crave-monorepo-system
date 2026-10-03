import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import { GlowAura } from "../components/GlowAura";
import { BadgePill } from "../components/BadgePill";
import { AnimatedCounter } from "../components/AnimatedCounter";
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Users,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const DashboardAnalyticsScene: React.FC<{ isVertical?: boolean }> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 14 } });
  const cardScale = interpolate(entrance, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Animated chart bar heights
  const barHeights = [45, 60, 55, 75, 70, 90, 100].map((h, i) => {
    return interpolate(frame - i * 5, [10, 60], [0, h], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 text-white">
      <GlowAura color="#6366f1" size={500} className="top-20" />

      {/* Header */}
      <div className="text-center space-y-2 z-10">
        <BadgePill
          icon={<TrendingUp className="size-3.5 text-indigo-400" />}
          text="REAL-TIME BUSINESS DASHBOARD"
          highlight
        />
        <h2
          className={`font-black tracking-tight ${
            isVertical ? "text-4xl" : "text-5xl"
          }`}
        >
          Pantau Penjualan &amp; Stok <span className="text-indigo-400">Kapan Saja</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Laporan keuangan otomatis, grafik performa outlet, dan manajemen persediaan tanpa selisih.
        </p>
      </div>

      {/* Dashboard Preview Glass Container */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
        className="w-full max-w-4xl my-auto z-10 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-700/60 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl space-y-6"
      >
        {/* Merchant Header with User Avatar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
              <Img
                src={staticFile("profile-logo.jpeg")}
                className="size-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Crave Cafe &amp; Resto</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Owner Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Merchant ID: CRV-92810 • Jakarta Selatan</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300">
              Hari Ini: 1 Okt 2026
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30">
            <span className="text-xs text-slate-400">Total Omzet Bulan Ini</span>
            <p className="text-2xl font-black font-mono text-white mt-1">
              Rp{" "}
              <AnimatedCounter
                from={12000000}
                to={48500000}
                durationInFrames={60}
                delay={15}
                formatRupiah
              />
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
              ↑ +142% vs bulan lalu
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30">
            <span className="text-xs text-slate-400">Total Transaksi Selesai</span>
            <p className="text-2xl font-black font-mono text-white mt-1">
              <AnimatedCounter from={250} to={1480} durationInFrames={60} delay={15} />{" "}
              <span className="text-sm font-sans font-normal text-slate-400">Struk</span>
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
              ↑ 99.8% Sukses QRIS
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30">
            <span className="text-xs text-slate-400">Item Produk Terpantau</span>
            <p className="text-2xl font-black font-mono text-white mt-1">
              <AnimatedCounter from={40} to={128} durationInFrames={60} delay={15} />{" "}
              <span className="text-sm font-sans font-normal text-slate-400">SKU</span>
            </p>
            <span className="text-[11px] text-indigo-300 font-bold mt-1 inline-block">
              🛡️ Zero Stock Selisih
            </span>
          </div>
        </div>

        {/* Dynamic Sales Chart Graphic */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white">Tren Penjualan 7 Hari Terakhir</span>
            <span className="text-emerald-400 font-bold">Rata-rata: Rp 6.9 Juta / Hari</span>
          </div>

          <div className="h-24 flex items-end justify-between gap-3 pt-4 px-2">
            {barHeights.map((h, index) => {
              const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 shadow-md shadow-blue-500/30 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">{days[index]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 z-10">
        <BadgePill delay={20} text="🔒 Row-Level Security (RLS) Terisolasi" />
        <BadgePill delay={35} text="☁️ Cloud Real-Time Sync" highlight />
        <BadgePill delay={50} text="📈 Export Excel &amp; Laporan Lengkap" />
      </div>
    </div>
  );
};
