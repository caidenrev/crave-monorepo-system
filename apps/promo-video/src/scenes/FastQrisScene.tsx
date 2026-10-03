import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PosQrisSheetExact } from "../components/PosQrisSheetExact";
import { DigitalCursor } from "../ui/DigitalCursor";
import { ShieldCheck, Zap } from "lucide-react";

export const FastQrisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const scale = interpolate(enterProgress, [0, 1], [0.85, 1.05]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);

  // Settlement timeline (150 frames / 5.0s):
  // Frame 0-45: Scanning QRIS (Waiting status)
  // Frame 45: Cursor clicks "Cek Status Pembayaran"
  // Frame 50+: Instant ShopeePay webhook confirmed -> Green Checkmark "PEMBAYARAN LUNAS"
  const isPaid = frame >= 50;

  const cursorX = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1],
    [320, 540]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1],
    [680, 590]
  );

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden p-6 font-sans">
      {/* Background Ambience */}
      <div className="absolute w-[800px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Header Banner */}
      <div className="absolute top-6 z-30 flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-soft-lg text-xs font-black text-[#10B981]">
        <Zap className="w-4 h-4 fill-[#10B981]" />
        <span>PEMBAYARAN QRIS DINAMIS — SHOPEEPAY INSTAN VERIFIED</span>
      </div>

      {/* Main QRIS Sheet Box (Exact to Image 4) */}
      <div
        className="relative z-10 w-[420px] h-[640px] rounded-3xl bg-white border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col"
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <PosQrisSheetExact isPaid={isPaid} />
      </div>

      {/* Digital Cursor Clicking "Cek Status Pembayaran" */}
      {frame >= 15 && frame <= 70 && (
        <DigitalCursor
          x={cursorX}
          y={cursorY}
          clickFrame={45}
          label="⚡ Verifikasi"
        />
      )}
    </div>
  );
};
