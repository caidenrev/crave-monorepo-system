import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sparkles, Globe, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { MorphButton } from "../ui/MorphButton";
import { DigitalCursor } from "../ui/DigitalCursor";

export const FastOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const scale = interpolate(enterSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Cursor movement
  const cursorX = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [360, 540]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 120 } }),
    [0, 1],
    [640, 480]
  );

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex flex-col items-center justify-between p-8 text-center select-none overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[800px] h-[600px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div
        className="relative z-10 pt-4 flex flex-col items-center space-y-3"
        style={{ opacity, transform: `scale(${scale})` }}
      >
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex items-center gap-3">
          <img
            src={staticFile("light-mode-logo.png")}
            alt="Crave POS"
            className="h-10 w-auto object-contain"
          />
          <span className="font-extrabold text-lg text-[#0F172A]">Crave POS</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-black text-[#2563EB]">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>UJI COBA GRATIS 14 HARI • SETUP DALAM 2 MENIT</span>
        </div>
      </div>

      {/* Center Dynamic CTA */}
      <div className="relative z-10 max-w-xl mx-auto space-y-5">
        <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
          Modernkan Kasir Bisnis Anda <br />
          <span className="text-[#2563EB]">Mulai Sekarang</span>
        </h2>

        {/* Interactive Morph Button */}
        <div className="pt-2 relative">
          <MorphButton
            clickFrame={35}
            typeFrame={50}
            successFrame={95}
          />

          {/* Cursor Animation */}
          {frame >= 10 && frame <= 90 && (
            <DigitalCursor
              x={cursorX}
              y={cursorY}
              clickFrame={35}
              label="Klik Daftar"
            />
          )}
        </div>
      </div>

      {/* Footer Info & URL */}
      <div
        className="relative z-10 pb-4 space-y-2"
        style={{ opacity }}
      >
        <div className="flex items-center justify-center gap-2 text-base font-black text-[#0F172A]">
          <Globe className="w-4 h-4 text-[#2563EB]" />
          <span className="text-[#2563EB]">pos.crave.id</span>
        </div>

        <div className="text-xs font-semibold text-[#64748B]">
          Aplikasi Kasir POS Digital untuk UMKM & Multi-Cabang Indonesia
        </div>
      </div>
    </div>
  );
};
