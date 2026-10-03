import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AppFrame } from "../ui/AppFrame";
import { ReplicatedDashboard } from "../components/ReplicatedDashboard";
import { ReplicatedSidebar } from "../components/ReplicatedSidebar";
import { BlurText } from "../ui/BlurText";
import { VIDEO_CONFIG } from "../config";

export const DashboardHeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring from bottom
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const translateY = interpolate(enterProgress, [0, 1], [180, 0]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const blur = interpolate(enterProgress, [0, 1], [14, 0]);

  // Subtle 3D tilt & gentle floating
  const tiltX = interpolate(enterProgress, [0, 1], [12, 4]);
  const tiltY = interpolate(enterProgress, [0, 1], [-8, -2]);
  const scale = interpolate(enterProgress, [0, 1], [0.92, 1]);

  // Counter growth
  const countProgress = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 90 } }),
    [0, 1],
    [0, 1]
  );

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Headline */}
      <div className="relative z-20 text-center max-w-2xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]">
          <span>{VIDEO_CONFIG.copy.dashboard.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          <BlurText text={VIDEO_CONFIG.copy.dashboard.headline} delay={5} />
        </h2>
      </div>

      {/* Hero UI Frame */}
      <div
        className="relative z-10 w-full max-w-5xl mx-auto my-auto"
        style={{
          filter: `blur(${blur}px)`,
        }}
      >
        <AppFrame
          url="pos.crave.id/dasbor"
          tiltX={tiltX}
          tiltY={tiltY}
          scale={scale}
          translateY={translateY}
          opacity={opacity}
        >
          <div className="flex h-[480px] sm:h-[540px]">
            {/* Real Left Sidebar */}
            <div className="hidden md:block">
              <ReplicatedSidebar activeItem="Dasbor" />
            </div>

            {/* Real Dashboard Body */}
            <div className="flex-1 overflow-hidden">
              <ReplicatedDashboard countProgress={countProgress} />
            </div>
          </div>
        </AppFrame>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-20 text-center pb-2">
        <span className="text-xs font-semibold text-[#64748B]">
          Multi-Outlet Cloud Sync • Laporan Real-Time Otomatis
        </span>
      </div>
    </div>
  );
};
