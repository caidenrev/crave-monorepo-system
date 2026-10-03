import React from "react";
import { SideNavExact } from "./SideNavExact";
import { PosProductCardExact } from "./PosProductCardExact";
import { PosFloatingCartBar } from "./PosFloatingCartBar";
import { PosCartSheetExact } from "./PosCartSheetExact";
import { PosQrisSheetExact } from "./PosQrisSheetExact";
import { Search, Lock, ShieldCheck, Bell } from "lucide-react";
import { staticFile } from "remotion";

interface CashierFullExactProps {
  sheetOpen?: boolean;
  sheetStep?: "cart" | "qris";
  isProductClicked?: boolean;
  isProductLifted?: boolean;
  isLanjutBayarClicked?: boolean;
  isLanjutBayarLifted?: boolean;
  isBayarQrisClicked?: boolean;
  isQrisPaid?: boolean;
  zoomScale?: number;
  panX?: number;
  panY?: number;
  tiltX?: number;
  tiltY?: number;
  className?: string;
}

export const CashierFullExact: React.FC<CashierFullExactProps> = ({
  sheetOpen = false,
  sheetStep = "cart",
  isProductClicked = false,
  isProductLifted = false,
  isLanjutBayarClicked = false,
  isLanjutBayarLifted = false,
  isBayarQrisClicked = false,
  isQrisPaid = false,
  zoomScale = 1,
  panX = 0,
  panY = 0,
  tiltX = 14,
  tiltY = -8,
  className = "",
}) => {
  return (
    <div
      className={`relative w-[1380px] h-[860px] rounded-3xl bg-white border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col transition-all font-sans transform-style-3d ${className}`}
      style={{
        transform: `perspective(1200px) scale(${zoomScale}) translate3d(${panX}px, ${panY}px, 0px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformOrigin: "center center",
      }}
    >
      {/* Top Browser / Window Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-2 px-5 py-1 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#64748B] shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[#0F172A] font-bold">
            https://pos.crave.id/kasir
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Crave POS v2.4</span>
        </div>
      </div>

      {/* Main Workspace (SideNav + Content) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left SideNav */}
        <SideNavExact activeItem="Kasir" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden relative">
          {/* Kasir Top Header (Exact to user Image 2) */}
          <header className="px-8 py-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                Kasir
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                Kamis, 13 Agustus 2026 • Shift pagi
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  placeholder="Cari transaksi atau produk"
                  className="w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] outline-none"
                />
              </div>

              <div className="relative p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] shadow-xs">
                <Bell className="w-4 h-4 text-[#64748B]" />
              </div>

              <div className="flex items-center gap-2 pl-1">
                <img
                  src={staticFile("profile-logo.jpeg")}
                  alt="Eka Revandi"
                  className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                />
              </div>
            </div>
          </header>

          {/* Kasir Body Viewport */}
          <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Product Search Input Bar */}
              <div className="relative max-w-xl">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  placeholder="Cari produk atau ketik kode barcode"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-xs outline-none"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2.5">
                <span className="px-5 py-2 rounded-full bg-[#2563EB] text-white text-xs font-extrabold shadow-soft cursor-pointer">
                  Semua
                </span>
                <span className="px-5 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] text-xs font-bold shadow-xs cursor-pointer">
                  Minuman
                </span>
              </div>

              {/* Product Card Grid (Exact to Image 1) with 3D Elevation */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <PosProductCardExact
                  category="Minuman"
                  name="Es Tejus"
                  price="Rp1.000"
                  stock="98 pcs"
                  isClicked={isProductClicked}
                  isLifted={isProductLifted}
                />
              </div>
            </div>

            {/* Floating Bottom Cart Bar (Exact to Image 2) with 3D Elevation */}
            <div className="flex justify-center pb-4">
              <PosFloatingCartBar
                itemsCount="1 Item"
                totalPrice="Rp1.110"
                isClicked={isLanjutBayarClicked}
                isLifted={isLanjutBayarLifted}
              />
            </div>
          </div>
        </div>

        {/* Dimmed Overlay when Sheet is Open */}
        {sheetOpen && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-20 transition-opacity" />
        )}

        {/* Right Sheet Drawer (Full Window Height from top to bottom) */}
        {sheetOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-30 shadow-2xl flex flex-col h-full w-[440px] bg-white border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200">
            {sheetStep === "cart" ? (
              <PosCartSheetExact
                qty={1}
                isQrisClicked={isBayarQrisClicked}
              />
            ) : (
              <PosQrisSheetExact isPaid={isQrisPaid} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
