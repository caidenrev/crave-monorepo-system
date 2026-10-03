import React from "react";
import { SideNavExact } from "./SideNavExact";
import { DashboardExact } from "./DashboardExact";
import { ReplicatedCashier } from "./ReplicatedCashier";
import { SpreadsheetExact } from "./SpreadsheetExact";
import { Lock, ShieldCheck } from "lucide-react";

interface CraveAppFullProps {
  view?: "dashboard" | "cashier" | "spreadsheet";
  activeSidebarItem?: string;
  openLaporan?: boolean;
  scrollY?: number;
  zoomScale?: number;
  panX?: number;
  panY?: number;
  tiltX?: number;
  tiltY?: number;
  revenue?: string;
  transactions?: string;
  liftCardIndex?: number;
  liftProgress?: number;
}

export const CraveAppFull: React.FC<CraveAppFullProps> = ({
  view = "dashboard",
  activeSidebarItem = "Dasbor",
  openLaporan = true,
  scrollY = 0,
  zoomScale = 1,
  panX = 0,
  panY = 0,
  tiltX = 0,
  tiltY = 0,
  revenue = "Rp14.850.000",
  transactions = "184",
  liftCardIndex,
  liftProgress = 0,
}) => {
  const getUrlPath = () => {
    if (view === "cashier") return "kasir";
    if (view === "spreadsheet") return "spreadsheet";
    return "dashboard";
  };

  return (
    <div
      className="relative w-[1380px] h-[860px] rounded-3xl bg-white border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col transition-all"
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
            https://pos.crave.id/{getUrlPath()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Crave POS v2.4</span>
        </div>
      </div>

      {/* Main Workspace: Left SideNav + Right App Content */}
      <div className="flex-1 flex overflow-hidden">
        <SideNavExact
          activeItem={activeSidebarItem}
          openLaporan={openLaporan}
          scrollY={scrollY}
        />

        <main className="flex-1 h-full overflow-hidden bg-[#F8FAFC]">
          {view === "dashboard" ? (
            <DashboardExact
              revenue={revenue}
              transactions={transactions}
              liftCardIndex={liftCardIndex}
              liftProgress={liftProgress}
            />
          ) : view === "cashier" ? (
            <ReplicatedCashier />
          ) : (
            <SpreadsheetExact />
          )}
        </main>
      </div>
    </div>
  );
};
