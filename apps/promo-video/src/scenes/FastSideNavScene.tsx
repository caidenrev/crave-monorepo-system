import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CraveAppFull } from "../components/CraveAppFull";
import { DigitalCursor } from "../ui/DigitalCursor";
import { FileSpreadsheet, Layers, CheckCircle2 } from "lucide-react";

export const FastSideNavScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Full SideNav items sequence from top to bottom
  const menuSequence = [
    "Kasir",
    "Dasbor",
    "Stok",
    "Laporan",
    "Ringkasan Laporan",
    "Penjualan Harian",
    "Kartu Stok",
    "Spreadsheet",
    "Pengeluaran",
    "Perencana Bisnis",
    "Supplier",
    "Kategori",
    "Pengaturan",
  ];

  // Phase 1: Rapid hover gliding down the static SideNav (Frame 0 - 45)
  // Sidebar container is completely static (scrollY = 0) so full menu is visible
  // Camera zooms in (2.8x) and pans down directly tracking the active blue button
  const glideProgress = Math.max(0, Math.min(1, frame / 40));
  const activeIdx = Math.min(
    menuSequence.length - 1,
    Math.floor(glideProgress * menuSequence.length)
  );
  const currentActive = frame < 45 ? menuSequence[activeIdx] : "Spreadsheet";

  // Phase 2: Pull out to 3D Slanted Perspective (Menyorong) for Spreadsheet Demo (Frame 42+)
  const transitionTo3D = spring({
    frame: frame - 42,
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  // Zoom scale: 2.8x during hover tracking -> 1.15x for 3D slanted spreadsheet
  const zoomScale =
    interpolate(glideProgress, [0, 1], [2.7, 2.9]) *
    interpolate(transitionTo3D, [0, 1], [1, 0.4]);

  // Pan X: Center sidebar during Phase 1 -> center 3D app during Phase 2
  const panX = interpolate(transitionTo3D, [0, 1], [490, -40]);

  // Pan Y: Directly tracks the blue button vertically (from +260px at Kasir down to -280px at Pengaturan)
  // Then recenters for 3D view
  const trackPanY = interpolate(glideProgress, [0, 1], [250, -260]);
  const panY = interpolate(transitionTo3D, [0, 1], [trackPanY, 30]);

  // 3D Slanted Angle (Menyorong): 0deg during menu scan -> tiltX: 14deg, tiltY: -8deg for Spreadsheet!
  const tiltX = interpolate(transitionTo3D, [0, 1], [0, 14]);
  const tiltY = interpolate(transitionTo3D, [0, 1], [0, -8]);

  // Cursor for Spreadsheet feature demo
  const cursorX = interpolate(
    spring({ frame: frame - 65, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [520, 860]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 65, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [400, 260]
  );

  const isSpreadsheetView = frame >= 42;

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden p-4 perspective-1200">
      {/* Background Ambient Glow */}
      <div className="absolute w-[800px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Active Feature Banner */}
      <div className="absolute top-6 right-10 z-40 flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-soft-lg text-xs font-black text-[#2563EB]">
        {isSpreadsheetView ? (
          <>
            <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#0F172A]">FITUR REAL-TIME:</span>
            <span className="text-[#10B981]">SPREADSHEET & EXCEL SYNC</span>
          </>
        ) : (
          <>
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[#0F172A]">MENU AKTIF:</span>
            <span className="text-[#2563EB]">{currentActive}</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </>
        )}
      </div>

      {/* Full Crave POS App with 3D Slant & Rapid Menu Glide */}
      <div className="relative z-10 flex items-center justify-center transform-style-3d">
        <CraveAppFull
          view={isSpreadsheetView ? "spreadsheet" : "dashboard"}
          activeSidebarItem={currentActive}
          openLaporan={true}
          scrollY={0} // Sidebar container is static so all menu items stay visible in natural layout!
          zoomScale={zoomScale}
          panX={panX}
          panY={panY}
          tiltX={tiltX}
          tiltY={tiltY}
        />

        {/* Cursor click demo in 3D Spreadsheet */}
        {frame >= 60 && frame <= 130 && (
          <DigitalCursor
            x={cursorX}
            y={cursorY}
            clickFrame={85}
            label="📊 Auto Formula Sync"
          />
        )}
      </div>
    </div>
  );
};

