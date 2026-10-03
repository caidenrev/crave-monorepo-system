import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ScanBarcode,
  QrCode,
  TrendingUp,
  Store,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { FlipCard } from "../ui/FlipCard";
import { BlurText } from "../ui/BlurText";
import { VIDEO_CONFIG } from "../config";

export const FlipCardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const featureIcons = [ScanBarcode, QrCode, TrendingUp, Store];

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Headline */}
      <div className="relative z-20 text-center max-w-xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Fitur Unggulan Crave POS</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          <BlurText text="Dirancang untuk Kecepatan & Efisiensi" delay={5} />
        </h2>
      </div>

      {/* 4 Flip Cards Grid */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {VIDEO_CONFIG.copy.features.map((feat, i) => {
          const Icon = featureIcons[i];
          const flipStartFrame = 45 + i * 15;

          return (
            <FlipCard
              key={feat.id}
              delay={i * 6}
              flipStartFrame={flipStartFrame}
              className="h-64 sm:h-72"
              front={
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
                        {feat.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-[#0F172A] leading-snug">
                        {feat.title}
                      </h4>
                      <div className="text-xs font-semibold text-[#2563EB] mt-0.5">
                        {feat.subtitle}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                    {feat.desc}
                  </p>
                </>
              }
              back={
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2563EB]">
                        Solusi Crave
                      </span>
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    </div>

                    <div className="p-3 rounded-2xl bg-[#EFF6FF] border border-blue-200 space-y-1">
                      <div className="text-xs font-black text-[#0F172A]">
                        Teruji Otomatis
                      </div>
                      <div className="text-[11px] text-[#2563EB] font-semibold">
                        Hemat waktu hingga 75%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Instan & Tanpa Manual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Data Aman Terenkripsi</span>
                    </div>
                  </div>
                </>
              }
            />
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-20 text-center pb-2">
        <span className="text-xs font-semibold text-[#64748B]">
          Semua Fitur Tersedia Langsung Tanpa Biaya Tersembunyi
        </span>
      </div>
    </div>
  );
};
