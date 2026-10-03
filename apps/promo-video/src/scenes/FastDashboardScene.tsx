import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CraveAppFull } from "../components/CraveAppFull";
import { DigitalCursor } from "../ui/DigitalCursor";
import { Layers } from "lucide-react";

export const FastDashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  // Dynamic Camera Zoom & 3D Slant (Menyorong):
  // 0-35 frames: Enter wide angle
  // 35-90 frames: Zoom in & Slant 3D (tiltX: 14deg, tiltY: -8deg)
  // 90-180 frames: Click on Card Stok (lifts up in 3D floating state)
  const zoomStage1 = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 140 },
  });

  const zoomScale = interpolate(zoomStage1, [0, 1], [0.85, 1.45]);
  const panX = interpolate(zoomStage1, [0, 1], [0, -100]);
  const panY = interpolate(zoomStage1, [0, 1], [0, 70]);

  // 3D Menyorong Slant Angle
  const tiltX = interpolate(zoomStage1, [0, 1], [4, 14]);
  const tiltY = interpolate(zoomStage1, [0, 1], [-2, -8]);

  // Card Lift 3D Interaction:
  // Frame 55: Cursor moves to Card Stok (Card Index 2)
  // Frame 75: Click Card Stok
  // Frame 75+: Card 2 lifts up 3D
  const liftSpring = spring({
    frame: frame - 75,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const liftProgress = interpolate(liftSpring, [0, 1], [0, 1]);

  // Precise Cursor Position (points cleanly at Card 2)
  const cursorX = interpolate(
    spring({ frame: frame - 45, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [300, 740]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 45, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [580, 240]
  );

  // Revenue count-up
  const countProgress = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 90 } }),
    [0, 1],
    [2000, 14850000]
  );
  const txCount = Math.floor(
    interpolate(
      spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 90 } }),
      [0, 1],
      [2, 184]
    )
  );

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden p-4 perspective-1200">
      {/* Ambient Background Glow */}
      <div className="absolute w-[800px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Header Banner */}
      <div className="absolute top-6 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-black text-[#2563EB]">
        <Layers className="w-4 h-4" />
        <span>DASBOR ANALITIK & 3D ELEVATION KARTU STOK</span>
      </div>

      {/* Full Real App with Dynamic 3D Slant & Card Lift */}
      <div className="relative z-10 flex items-center justify-center transform-style-3d">
        <CraveAppFull
          view="dashboard"
          activeSidebarItem="Dasbor"
          zoomScale={zoomScale * interpolate(enterProgress, [0, 1], [0.7, 1])}
          panX={panX}
          panY={panY}
          tiltX={tiltX}
          tiltY={tiltY}
          revenue={formatRupiah(countProgress)}
          transactions={String(txCount)}
          liftCardIndex={2}
          liftProgress={liftProgress}
        />

        {/* Digital Cursor Clicking on Card */}
        {frame >= 40 && frame <= 130 && (
          <DigitalCursor
            x={cursorX}
            y={cursorY}
            clickFrame={75}
            label="⚡ 3D Inspect"
          />
        )}
      </div>
    </div>
  );
};
