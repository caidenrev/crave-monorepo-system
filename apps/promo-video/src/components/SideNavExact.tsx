import React from "react";
import {
  ScanBarcode,
  LayoutDashboard,
  Boxes,
  FileSpreadsheet,
  Receipt,
  Package,
  CalendarClock,
  Wallet,
  Lightbulb,
  Truck,
  Tags,
  Settings,
  Users,
  MessageSquare,
  Info,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  Sun,
  Moon,
  MoreVertical,
} from "lucide-react";
import { staticFile } from "remotion";

interface SideNavExactProps {
  activeItem?: string;
  openLaporan?: boolean;
  scrollY?: number;
  className?: string;
}

export const SideNavExact: React.FC<SideNavExactProps> = ({
  activeItem = "Dasbor",
  openLaporan = true,
  scrollY = 0,
  className = "",
}) => {
  return (
    <aside
      className={`w-72 h-full bg-white border-r border-[#E2E8F0] flex flex-col justify-between p-3.5 select-none font-sans overflow-hidden ${className}`}
    >
      {/* Scrollable Container with smooth transform scroll */}
      <div
        className="flex-1 overflow-y-auto space-y-3 transition-transform duration-100 ease-out pr-1"
        style={{
          transform: `translateY(-${scrollY}px)`,
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2.5">
            <img
              src={staticFile("light-mode-logo.png")}
              alt="Crave"
              className="w-8 h-8 max-w-[32px] max-h-[32px] object-contain shrink-0"
              style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
            />
            <div className="leading-tight">
              <h1 className="text-base font-black text-[#0F172A] tracking-tight">
                Crave
              </h1>
              <p className="text-[11px] text-[#64748B] font-medium">
                Point Of Sales Management
              </p>
            </div>
          </div>

          {/* Collapse Button */}
          <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            readOnly
            placeholder="Cari"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] outline-none"
          />
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* MENU SECTION */}
        <div className="space-y-1">
          <div className="px-2 pt-1 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Menu
          </div>

          {/* Kasir */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Kasir"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            <ScanBarcode className="w-4 h-4 shrink-0" />
            <span>Kasir</span>
          </div>

          {/* Dasbor */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Dasbor"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dasbor</span>
          </div>

          {/* Stok */}
          <div
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Stok"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B] hover:bg-[#F1F5F9]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Stok</span>
            </div>
          </div>

          {/* Laporan (Accordion) */}
          <div className="space-y-1">
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                activeItem === "Laporan"
                  ? "bg-[#2563EB] text-white shadow-soft"
                  : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Laporan</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  openLaporan ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Sub Items under Laporan */}
            {openLaporan && (
              <div className="ml-4 pl-3 border-l-2 border-[#E2E8F0] space-y-1 pt-0.5">
                {[
                  { label: "Ringkasan Laporan", icon: FileSpreadsheet },
                  { label: "Penjualan Harian", icon: Receipt },
                  { label: "Kartu Stok", icon: Package },
                  { label: "Spreadsheet", icon: CalendarClock },
                ].map((sub) => {
                  const isSubActive = activeItem === sub.label;
                  return (
                    <div
                      key={sub.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSubActive
                          ? "bg-[#2563EB] text-white shadow-soft scale-102"
                          : "text-[#64748B] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <sub.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{sub.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pengeluaran */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Pengeluaran"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>Pengeluaran</span>
          </div>

          {/* Perencana Bisnis */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Perencana Bisnis"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Perencana Bisnis</span>
          </div>
        </div>

        {/* LAINNYA SECTION */}
        <div className="space-y-1 pt-2">
          <div className="px-2 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Lainnya
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Supplier"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Supplier</span>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Kategori"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Tags className="w-4 h-4 shrink-0" />
            <span>Kategori</span>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Pengaturan"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Pengaturan</span>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Karyawan"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Karyawan</span>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Bantuan"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Bantuan</span>
          </div>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
              activeItem === "Info Aplikasi"
                ? "bg-[#2563EB] text-white shadow-soft"
                : "text-[#64748B]"
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>Info Aplikasi</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Area */}
      <div className="space-y-2 pt-2 border-t border-[#E2E8F0] shrink-0">
        {/* Light / Dark Mode Toggle */}
        <div className="p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-2 gap-1 text-xs font-bold text-center">
          <div className="py-1.5 rounded-lg bg-white shadow-xs text-[#0F172A] flex items-center justify-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </div>
          <div className="py-1.5 rounded-lg text-[#64748B] flex items-center justify-center gap-1.5">
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={staticFile("profile-logo.jpeg")}
              alt="Eka Revandi"
              className="w-8 h-8 max-w-[32px] max-h-[32px] rounded-full object-cover border border-white shadow-xs shrink-0"
              style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
            />
            <div className="min-w-0 leading-tight">
              <div className="font-extrabold text-xs text-[#0F172A] truncate">
                Eka Revandi
              </div>
              <div className="text-[10px] text-[#64748B] truncate font-medium">
                caidenrev@gmail.com
              </div>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-[#64748B] shrink-0" />
        </div>
      </div>
    </aside>
  );
};
