import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRight, Check, Sparkles, Mail } from "lucide-react";

interface MorphButtonProps {
  clickFrame: number;
  typeFrame: number;
  successFrame: number;
}

export const MorphButton: React.FC<MorphButtonProps> = ({
  clickFrame,
  typeFrame,
  successFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Morph progress (from button to expanded card)
  const morphProgress = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 16, stiffness: 150 },
  });

  // Success state progress
  const successProgress = spring({
    frame: frame - successFrame,
    fps,
    config: { damping: 14, stiffness: 180 },
  });

  const emailText = "owner@kedaikopi.com";
  const typedLength = Math.min(
    emailText.length,
    Math.max(0, Math.floor((frame - typeFrame) * 0.8))
  );
  const currentTyped = emailText.slice(0, typedLength);

  const isSuccess = frame >= successFrame;

  if (isSuccess) {
    const scale = interpolate(successProgress, [0, 1], [0.92, 1]);
    return (
      <div
        className="w-full max-w-md mx-auto py-4 px-6 rounded-2xl bg-[#10B981] text-white flex items-center justify-center gap-3 shadow-glow-blue"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-white stroke-[3]" />
        </div>
        <div className="text-left">
          <div className="text-base font-bold">Undangan Akses Terkirim!</div>
          <div className="text-xs text-emerald-100">Cek inbox email Anda sekarang</div>
        </div>
      </div>
    );
  }

  if (frame >= clickFrame) {
    const width = interpolate(morphProgress, [0, 1], [280, 480]);
    return (
      <div
        className="mx-auto rounded-2xl bg-white border-2 border-[#2563EB] p-2.5 flex items-center gap-3 shadow-soft-lg transition-all"
        style={{ width: `${width}px`, maxWidth: "90%" }}
      >
        <div className="pl-3 text-[#64748B]">
          <Mail className="w-5 h-5 text-[#2563EB]" />
        </div>
        <div className="flex-1 font-mono text-base font-medium text-[#0F172A] truncate">
          {currentTyped}
          <span className="animate-pulse text-[#2563EB]">|</span>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm flex items-center gap-1.5 shadow-md">
          <span>Kirim</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#2563EB] text-white font-bold text-lg shadow-glow-blue border border-blue-400/30 hover:bg-[#1D4ED8] transition-all">
      <Sparkles className="w-5 h-5 text-blue-200" />
      <span>Mulai Coba Gratis</span>
      <ArrowRight className="w-5 h-5" />
    </div>
  );
};
