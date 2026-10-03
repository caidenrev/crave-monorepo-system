import React from "react";
import {
  Wallet,
  Receipt,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface ReplicatedDashboardProps {
  className?: string;
  countProgress?: number;
}

export const ReplicatedDashboard: React.FC<ReplicatedDashboardProps> = ({
  className = "",
  countProgress = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated revenue count-up
  const currentRevenue = Math.floor(14850000 * countProgress);
  const currentTransactions = Math.floor(184 * countProgress);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Chart growth animation
  const chartDrawProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <div className={`w-full bg-[#F8FAFC] p-6 space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Dasbor Analitik
          </h2>
          <p className="text-xs text-[#64748B] font-medium">
            Ringkasan performa penjualan real-time cabang utama
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#64748B] shadow-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Cari transaksi...</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xs">
            <Bell className="w-4 h-4 text-[#2563EB]" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Primary Solid Card */}
        <div className="p-4 rounded-3xl bg-[#2563EB] text-white shadow-soft flex flex-col justify-between border border-blue-500">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-2xl bg-white/15">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +12,4%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">
              Pendapatan Hari Ini
            </p>
            <p className="text-lg font-black tracking-tight">
              {formatRupiah(currentRevenue)}
            </p>
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="p-4 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-2xl bg-[#EFF6FF]">
              <Receipt className="w-5 h-5 text-[#2563EB]" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +8,1%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Total Transaksi
            </p>
            <p className="text-xl font-black text-[#0F172A] tracking-tight">
              {currentTransactions} <span className="text-xs font-normal text-[#64748B]">struk</span>
            </p>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="p-4 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-2xl bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <span className="text-[11px] font-bold text-[#EF4444] px-2 py-0.5 rounded-full bg-red-50">
              Perlu Restok
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Stok Menipis
            </p>
            <p className="text-xl font-black text-[#EF4444] tracking-tight">
              4 <span className="text-xs font-normal text-[#64748B]">Item</span>
            </p>
          </div>
        </div>

        {/* Card 4: Average Basket */}
        <div className="p-4 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-2xl bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#10B981]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +4,2%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Rata-rata Belanja
            </p>
            <p className="text-lg font-black text-[#0F172A] tracking-tight">
              Rp 80.700
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Chart & Recent Orders Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart Card */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Tren Penjualan Per Jam</h3>
              <p className="text-[11px] text-[#64748B]">Grafik transaksi jam buka 08:00 - 22:00</p>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
              Live Real-time
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-44 w-full relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" />

              {/* Area Under Curve */}
              <path
                d="M 0 130 C 80 110, 120 40, 200 60 C 260 80, 320 20, 390 35 C 440 45, 470 15, 500 20 L 500 150 L 0 150 Z"
                fill="url(#chartGrad)"
                opacity={chartDrawProgress}
              />

              {/* Stroke Line */}
              <path
                d="M 0 130 C 80 110, 120 40, 200 60 C 260 80, 320 20, 390 35 C 440 45, 470 15, 500 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="600"
                strokeDashoffset={interpolate(chartDrawProgress, [0, 1], [600, 0])}
              />

              {/* Active High Point Node */}
              {chartDrawProgress > 0.8 && (
                <g>
                  <circle cx="390" cy="35" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                  <rect x="360" y="8" width="60" height="20" rx="6" fill="#0F172A" />
                  <text x="390" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Rp 3.4M
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="p-5 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A]">Transaksi Terkini</h3>

          <div className="space-y-2.5">
            {[
              { id: "#27363", item: "Es Kopi Susu x2", time: "Baru saja", price: "Rp 36.000", method: "QRIS" },
              { id: "#27362", item: "Croissant + Latte", time: "2 mnt lalu", price: "Rp 47.000", method: "ShopeePay" },
              { id: "#27361", item: "Americano Ice", time: "5 mnt lalu", price: "Rp 16.000", method: "Tunai" },
            ].map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">{tx.item}</div>
                  <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <span>{tx.id}</span> • <span>{tx.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[#2563EB]">{tx.price}</div>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#10B981]">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {tx.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
