import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sparkles, ShieldCheck } from "lucide-react";
import { BlurText } from "../ui/BlurText";
import { VIDEO_CONFIG } from "../config";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 160 },
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.75, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);
  const logoBlur = interpolate(logoProgress, [0, 1], [16, 0]);

  // Badge entrance
  const badgeProgress = spring({
    frame: frame - 12,
    fps,
    config: { damping: 16, stiffness: 140 },
  });
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [15, 0]);

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col items-center justify-center p-8 text-center select-none overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center space-y-7">
        {/* Top Feature Pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]"
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{VIDEO_CONFIG.copy.hook.badge}</span>
        </div>

        {/* Brand Logo */}
        <div
          className="p-4 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft-lg"
          style={{
            opacity: logoOpacity,
            filter: `blur(${logoBlur}px)`,
            transform: `scale(${logoScale})`,
          }}
        >
          <img
            src={staticFile("light-mode-logo.png")}
            alt="Crave POS Logo"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Big Staggered Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15] max-w-lg">
          <BlurText
            text={VIDEO_CONFIG.copy.hook.headline}
            delay={20}
            wordDelay={4}
          />
        </h1>

        {/* Subtitle */}
        <div className="max-w-md text-sm sm:text-base font-medium text-[#64748B] leading-relaxed">
          <BlurText
            text={VIDEO_CONFIG.copy.hook.subheadline}
            delay={45}
            stagger={false}
          />
        </div>

        {/* Trust Badge at Bottom */}
        <div
          className="flex items-center gap-2 text-xs font-bold text-[#10B981] pt-2"
          style={{
            opacity: interpolate(
              spring({ frame: frame - 60, fps, config: { damping: 15 } }),
              [0, 1],
              [0, 1]
            ),
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Terverifikasi QRIS Nasional & Standar Keamanan Bank</span>
        </div>
      </div>
    </div>
  );
};
