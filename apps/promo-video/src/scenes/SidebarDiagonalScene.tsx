import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ScanBarcode,
  LayoutDashboard,
  Boxes,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { BlurText } from "../ui/BlurText";
import { VIDEO_CONFIG } from "../config";

export const SidebarDiagonalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const menuItems = [
    { label: "Kasir", icon: ScanBarcode, desc: "Transaksi kilat & scan barcode", color: "#2563EB" },
    { label: "Dasbor", icon: LayoutDashboard, desc: "Statistik & analitik harian", color: "#2563EB" },
    { label: "Stok", icon: Boxes, desc: "Inventaris otomatis berkurang", color: "#F59E0B" },
    { label: "Laporan", icon: FileSpreadsheet, desc: "Export Excel & rekap instan", color: "#10B981" },
    { label: "Pengaturan", icon: Settings, desc: "Multi-outlet & hak akses", color: "#64748B" },
  ];

  // Active item switcher based on frame progress
  const activeIndex = Math.min(
    menuItems.length - 1,
    Math.floor((frame / 30) % menuItems.length)
  );

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Subtle Ambience */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Headline */}
      <div className="relative z-20 text-center max-w-xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]">
          <span>{VIDEO_CONFIG.copy.sidebar.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          <BlurText text={VIDEO_CONFIG.copy.sidebar.headline} delay={5} />
        </h2>
      </div>

      {/* Diagonal Menu Showcase Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Diagonal Staggered Menu Stack */}
        <div
          className="space-y-3"
          style={{
            transform: "rotate(-6deg) translateY(-10px)",
            transformOrigin: "center left",
          }}
        >
          {menuItems.map((item, i) => {
            const itemProgress = spring({
              frame: frame - i * 6,
              fps,
              config: { damping: 15, stiffness: 140 },
            });

            const translateX = interpolate(itemProgress, [0, 1], [-120, 0]);
            const opacity = interpolate(itemProgress, [0, 1], [0, 1]);
            const isActive = i === activeIndex;
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`p-4 rounded-2xl flex items-center justify-between transition-all select-none ${
                  isActive
                    ? "bg-white border-2 border-[#2563EB] shadow-soft-lg scale-105 z-20"
                    : "bg-white/80 border border-[#E2E8F0] shadow-soft hover:bg-white z-10"
                }`}
                style={{
                  opacity,
                  transform: `translateX(${translateX}px)`,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "bg-[#EFF6FF] text-[#2563EB]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A]">
                      {item.label}
                    </div>
                    <div className="text-xs text-[#64748B]">{item.desc}</div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-[#EFF6FF] text-[#2563EB]"
                      : "text-[#94A3B8]"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Feature Preview Panel */}
        <div className="relative">
          <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                  Modul Aktif: {menuItems[activeIndex].label}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#2563EB] px-2.5 py-0.5 rounded-full bg-[#EFF6FF]">
                Auto-Sync
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="text-sm font-black text-[#0F172A]">
                {menuItems[activeIndex].label} Pintar
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {menuItems[activeIndex].desc}. Data tersimpan otomatis di cloud dan dapat diakses dari tablet kasir maupun dashboard owner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#EFF6FF] text-center">
                <div className="text-lg font-black text-[#2563EB]">100%</div>
                <div className="text-[10px] font-semibold text-[#64748B]">Real-Time Sync</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-center">
                <div className="text-lg font-black text-[#10B981]">0.2s</div>
                <div className="text-[10px] font-semibold text-[#64748B]">Latency Kilat</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-20 text-center pb-2">
        <span className="text-xs font-semibold text-[#64748B]">
          Semua Modul Terhubung Tanpa Perlu Setup Rumit
        </span>
      </div>
    </div>
  );
};
