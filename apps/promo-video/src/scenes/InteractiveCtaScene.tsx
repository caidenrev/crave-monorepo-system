import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sparkles, ArrowRight, ShieldCheck, Globe, Check } from "lucide-react";
import { MorphButton } from "../ui/MorphButton";
import { DigitalCursor } from "../ui/DigitalCursor";
import { BlurText } from "../ui/BlurText";
import { VIDEO_CONFIG } from "../config";

export const InteractiveCtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cycling CTA sub-headlines with blur transition
  const ctaPhrases = VIDEO_CONFIG.copy.cta.textSequence;
  const currentPhraseIndex = Math.min(
    ctaPhrases.length - 1,
    Math.floor(frame / 60)
  );

  // Digital cursor timeline
  // Frame 20: Cursor moves in
  // Frame 40: Clicks the CTA button
  // Frame 55: Typing email
  // Frame 110: Success badge confirmed
  const cursorX = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 110 } }),
    [0, 1],
    [320, 520]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 110 } }),
    [0, 1],
    [650, 480]
  );

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col items-center justify-between p-8 text-center select-none overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="relative z-10 pt-4 flex flex-col items-center space-y-3">
        <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft">
          <img
            src={staticFile("light-mode-logo.png")}
            alt="Crave POS Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{VIDEO_CONFIG.copy.cta.badge}</span>
        </div>
      </div>

      {/* Center Dynamic CTA Headline & Morph Button */}
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        {/* Dynamic cycling headline */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
          Tingkatkan Omzet Toko Anda Hari Ini
        </h2>

        {/* Dynamic Subtext */}
        <div className="h-8 flex items-center justify-center">
          <div
            key={currentPhraseIndex}
            className="text-base sm:text-lg font-bold text-[#2563EB] bg-[#EFF6FF] px-4 py-1.5 rounded-full border border-blue-200 inline-block transition-all shadow-xs"
          >
            {ctaPhrases[currentPhraseIndex]}
          </div>
        </div>

        {/* Morphing Interactive Button Container */}
        <div className="pt-2 relative">
          <MorphButton
            clickFrame={40}
            typeFrame={55}
            successFrame={110}
          />

          {/* Cursor Animation */}
          {frame >= 15 && frame <= 100 && (
            <DigitalCursor
              x={cursorX}
              y={cursorY}
              clickFrame={40}
            />
          )}
        </div>
      </div>

      {/* Footer Info & URL */}
      <div className="relative z-10 pb-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-base font-black text-[#0F172A]">
          <Globe className="w-4 h-4 text-[#2563EB]" />
          <span>{VIDEO_CONFIG.copy.cta.footerUrl}</span>
        </div>

        <div className="text-xs font-semibold text-[#64748B]">
          Media Sosial: {VIDEO_CONFIG.copy.cta.socialHandle} • Tanpa Biaya Pendaftaran
        </div>
      </div>
    </div>
  );
};
