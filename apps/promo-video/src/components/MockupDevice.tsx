import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MockupDevice: React.FC<{
  children: React.ReactNode;
  type?: "mobile" | "tablet";
  tilt?: boolean;
  delay?: number;
  className?: string;
}> = ({ children, type = "tablet", tilt = false, delay = 0, className = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 14,
      stiffness: 90,
      mass: 0.8,
    },
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const translateY = interpolate(entrance, [0, 1], [80, 0]);
  const rotateX = tilt ? interpolate(entrance, [0, 1], [15, 6]) : 0;
  const rotateY = tilt ? interpolate(entrance, [0, 1], [-15, -4]) : 0;

  return (
    <div
      style={{
        transform: `perspective(1200px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      className={`relative rounded-3xl p-3 bg-gradient-to-b from-slate-700/80 via-slate-800 to-slate-950 border border-slate-600/50 shadow-2xl shadow-blue-900/30 ${className}`}
    >
      {/* Device frame border glow */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

      {/* Screen container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-black/40 shadow-inner">
        {/* Device Status Bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-slate-950 text-slate-400 text-[11px] font-mono border-b border-slate-800/80">
          <span className="font-bold text-white">09:41</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-sans font-bold">ONLINE</span>
            <span className="ml-2">100% ⚡</span>
          </div>
        </div>

        {/* Inner Content */}
        <div className="relative overflow-hidden">{children}</div>

        {/* Screen Glass Reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)",
          }}
        />
      </div>
    </div>
  );
};
