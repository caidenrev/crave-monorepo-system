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
import { staticFile } from "remotion";

interface DashboardExactProps {
  revenue?: string;
  transactions?: string;
  lowStock?: string;
  avgBasket?: string;
  chartProgress?: number;
  liftCardIndex?: number;
  liftProgress?: number;
  className?: string;
}

export const DashboardExact: React.FC<DashboardExactProps> = ({
  revenue = "Rp14.850.000",
  transactions = "184",
  lowStock = "0",
  avgBasket = "Rp80.700",
  chartProgress = 1,
  liftCardIndex,
  liftProgress = 0,
  className = "",
}) => {
  const getCardStyle = (index: number) => {
    if (liftCardIndex === index && liftProgress > 0) {
      const scale = 1 + liftProgress * 0.1;
      const translateY = -liftProgress * 14;
      return {
        transform: `scale(${scale}) translateY(${translateY}px) translateZ(40px)`,
        boxShadow: `0 24px 45px -10px rgba(37, 99, 235, 0.45)`,
        border: "2px solid #2563EB",
        zIndex: 50,
        position: "relative" as const,
        transition: "all 0.1s ease-out",
      };
    }
    return {};
  };

  return (
    <div className={`w-full h-full bg-[#F8FAFC] flex flex-col select-none ${className}`}>
      {/* Top App Header */}
      <header className="px-6 py-3.5 border-b border-[#E2E8F0] bg-white flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
            Dasbor
          </h2>
          <p className="text-[11px] text-[#64748B] font-medium">
            Ringkasan performa penjualan hari ini
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              placeholder="Cari transaksi atau produk"
              className="w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] outline-none"
            />
          </div>

          {/* Bell Notifications */}
          <div className="relative p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xs">
            <Bell className="w-4 h-4 text-[#64748B]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-black flex items-center justify-center">
              2
            </span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src={staticFile("profile-logo.jpeg")}
              alt="Eka Revandi"
              className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
            />
            <div className="hidden sm:block text-left leading-tight">
              <div className="font-bold text-xs text-[#0F172A]">Eka Revandi</div>
              <div className="text-[10px] text-[#64748B]">caidenrev@gmail.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid with overflow-visible for unclipped 3D cards */}
      <div className="flex-1 p-6 space-y-6 overflow-visible">
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible pt-2">
          {/* Card 0: Blue Primary Pill */}
          <div
            className="p-4 rounded-2xl bg-[#2563EB] text-white shadow-soft flex flex-col justify-between h-28 border border-blue-500 relative transition-all"
            style={getCardStyle(0)}
          >
            <div className="flex items-start justify-between">
              <Wallet className="w-5 h-5 text-white" />
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-white">
                <ArrowUpRight className="w-3 h-3" />
                +12,4%
              </span>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">{revenue}</div>
              <div className="text-[11px] font-medium text-blue-100">
                Pendapatan hari ini
              </div>
            </div>
          </div>

          {/* Card 1: Total Transaksi */}
          <div
            className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between h-28 relative transition-all"
            style={getCardStyle(1)}
          >
            <div className="flex items-start justify-between">
              <Receipt className="w-5 h-5 text-[#0F172A]" />
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#10B981]">
                <ArrowUpRight className="w-3 h-3" />
                +8,1%
              </span>
            </div>
            <div>
              <div className="text-xl font-black text-[#0F172A] tracking-tight">
                {transactions}
              </div>
              <div className="text-[11px] font-medium text-[#64748B]">Transaksi</div>
            </div>
          </div>

          {/* Card 2: Stok Menipis (Target of 3D Lift with unclipped clean borders) */}
          <div
            className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between h-28 relative transition-all"
            style={getCardStyle(2)}
          >
            <div className="flex items-start justify-between">
              <AlertTriangle className="w-5 h-5 text-[#0F172A]" />
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#EF4444]">
                <ArrowDownRight className="w-3 h-3" />
                Perlu restok
              </span>
            </div>
            <div>
              <div className="text-xl font-black text-[#0F172A] tracking-tight">
                {lowStock}
              </div>
              <div className="text-[11px] font-medium text-[#64748B]">
                Stok menipis
              </div>
            </div>
          </div>

          {/* Card 3: Rata-rata Belanja */}
          <div
            className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between h-28 relative transition-all"
            style={getCardStyle(3)}
          >
            <div className="flex items-start justify-between">
              <Users className="w-5 h-5 text-[#0F172A]" />
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#EF4444]">
                <ArrowDownRight className="w-3 h-3" />
                -2,3%
              </span>
            </div>
            <div>
              <div className="text-xl font-black text-[#0F172A] tracking-tight">
                {avgBasket}
              </div>
              <div className="text-[11px] font-medium text-[#64748B]">
                Rata-rata belanja
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Area Line Chart & Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area Line Chart (2 Cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#0F172A]">
                  Penjualan per hari
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Diperbarui otomatis setiap transaksi
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div className="p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-1 text-[11px] font-bold">
                <span className="px-3 py-1 rounded-lg text-[#64748B]">Perjam</span>
                <span className="px-3 py-1 rounded-lg bg-white text-[#0F172A] shadow-xs">
                  Hari
                </span>
                <span className="px-3 py-1 rounded-lg text-[#64748B]">Minggu</span>
              </div>
            </div>

            {/* Area Line Chart SVG */}
            <div className="h-44 w-full relative">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid & Labels */}
                {[
                  { y: 20, label: "2k" },
                  { y: 55, label: "1.5k" },
                  { y: 90, label: "1k" },
                  { y: 125, label: "0.5k" },
                  { y: 150, label: "0k" },
                ].map((g) => (
                  <g key={g.label}>
                    <line
                      x1="35"
                      y1={g.y}
                      x2="500"
                      y2={g.y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x="25"
                      y={g.y + 3}
                      fill="#94A3B8"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {g.label}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"].map((d, i) => (
                  <text
                    key={d}
                    x={45 + i * 72}
                    y="160"
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {d}
                  </text>
                ))}

                {/* Area Fill */}
                <path
                  d="M 45 150 L 117 150 L 189 150 L 261 150 L 333 150 L 405 145 C 430 140, 460 30, 480 20 L 480 150 Z"
                  fill="url(#areaFill)"
                />

                {/* Line Path */}
                <path
                  d="M 45 150 L 117 150 L 189 150 L 261 150 L 333 150 L 405 145 C 430 140, 460 30, 480 20"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Live Data Node */}
                <circle
                  cx="480"
                  cy="20"
                  r="5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Donut Chart (1 Col) */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#0F172A]">
                Kontribusi kategori
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Persentase dari total penjualan
              </p>
            </div>

            {/* Donut SVG */}
            <div className="flex items-center justify-center py-4">
              <svg width="140" height="140" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="16"
                  strokeDasharray="226"
                  strokeDashoffset="0"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-2 text-[#0F172A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span>Minuman</span>
              </div>
              <span className="text-[#2563EB]">100%</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: 7 Days Bar & Transaksi Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Penjualan 7 hari terakhir */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-4">
            <h3 className="font-extrabold text-sm text-[#0F172A]">
              Penjualan 7 hari terakhir
            </h3>
            <div className="h-28 flex items-end justify-between px-6 pt-2">
              <div className="w-10 h-2 bg-[#F1F5F9] rounded-t-md" />
              <div className="w-10 h-2 bg-[#F1F5F9] rounded-t-md" />
              <div className="w-10 h-2 bg-[#F1F5F9] rounded-t-md" />
              <div className="w-10 h-2 bg-[#F1F5F9] rounded-t-md" />
              <div className="w-10 h-2 bg-[#F1F5F9] rounded-t-md" />
              <div className="w-10 h-20 bg-[#2563EB] rounded-t-md shadow-xs" />
            </div>
          </div>

          {/* Right: Transaksi terbaru */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft space-y-3">
            <h3 className="font-extrabold text-sm text-[#0F172A]">
              Transaksi terbaru
            </h3>

            <div className="space-y-2">
              {[
                { id: "716DA2E6 • 1 Item", time: "11:34 • Eka Revandi", price: "Rp1.000" },
                { id: "7DE2F344 • 1 Item", time: "02:44 • Eka Revandi", price: "Rp1.000" },
              ].map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{tx.id}</div>
                    <div className="text-[10px] text-[#64748B]">{tx.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold">
                      QRIS
                    </span>
                    <span className="text-xs font-black text-[#0F172A]">
                      {tx.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
