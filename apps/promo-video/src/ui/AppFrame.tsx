import React from "react";
import { Lock, ShieldCheck } from "lucide-react";

interface AppFrameProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
  tiltX?: number;
  tiltY?: number;
  scale?: number;
  translateY?: number;
  opacity?: number;
}

export const AppFrame: React.FC<AppFrameProps> = ({
  children,
  url = "pos.crave.id/dasbor",
  className = "",
  tiltX = 0,
  tiltY = 0,
  scale = 1,
  translateY = 0,
  opacity = 1,
}) => {
  return (
    <div
      className={`relative w-full rounded-3xl bg-white border border-[#E2E8F0] shadow-soft-lg overflow-hidden transition-all ${className}`}
      style={{
        opacity,
        transform: `perspective(1400px) translateY(${translateY}px) scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Browser / App Titlebar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] select-none">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[#0F172A] font-semibold">{url}</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Official App</span>
        </div>
      </div>

      {/* Main App Content Viewport */}
      <div className="relative bg-[#F8FAFC] overflow-hidden">
        {children}
      </div>
    </div>
  );
};
