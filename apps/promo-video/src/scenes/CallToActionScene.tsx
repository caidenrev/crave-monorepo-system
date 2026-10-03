import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import { GlowAura } from "../components/GlowAura";
import { BadgePill } from "../components/BadgePill";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export const CallToActionScene: React.FC<{ isVertical?: boolean }> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });

  const scale = interpolate(entrance, [0, 1], [0.7, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const btnPulse = 1 + Math.sin(frame / 12) * 0.04;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-6">
      <GlowAura color="#3b82f6" size={600} />

      <div
        style={{ opacity, transform: `scale(${scale})` }}
        className="flex flex-col items-center max-w-3xl space-y-6 z-10"
      >
        <BadgePill
          icon={<Sparkles className="size-4 text-blue-400" />}
          text="GRATIS UJI COBA TANPA KARTU KREDIT"
          highlight
        />

        {/* 3D Logo Reveal */}
        <div className="relative size-32 rounded-3xl p-3 bg-gradient-to-br from-blue-600/30 to-slate-900/80 border border-blue-400/40 shadow-2xl shadow-blue-500/40 backdrop-blur-xl flex items-center justify-center">
          <Img
            src={staticFile("dark-mode-logo.png")}
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="space-y-2">
          <h1
            className={`font-black tracking-tight leading-tight ${
              isVertical ? "text-5xl" : "text-6xl"
            }`}
          >
            Revolusi Kasir &amp; Bisnis Anda dengan{" "}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Crave POS
            </span>
          </h1>
          <p className="text-base sm:text-lg text-blue-200/80 max-w-xl mx-auto">
            Solusi kasir pintar, QRIS dinamis otomatis, dan manajemen inventori modern untuk UMKM Indonesia.
          </p>
        </div>

        {/* Call to Action Button */}
        <div
          style={{ transform: `scale(${btnPulse})` }}
          className="pt-2"
        >
          <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-lg sm:text-xl shadow-2xl shadow-blue-500/50 border border-blue-300/30 flex items-center gap-3 cursor-pointer">
            <span>Daftar &amp; Coba Sekarang</span>
            <ArrowRight className="size-6 stroke-[3]" />
          </div>
        </div>

        {/* Value Props & Contact */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 pt-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Setup Kurang dari 2 Menit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>Support Semua Printer Thermal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Data 100% Aman &amp; Terisolasi</span>
          </div>
        </div>

        {/* Website & Social Watermark */}
        <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400 px-4 font-mono">
          <span>🌐 pos.crave.id</span>
          <span>Instagram: @crave.pos</span>
        </div>
      </div>
    </div>
  );
};
