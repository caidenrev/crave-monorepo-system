import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const BadgePill: React.FC<{
  icon?: React.ReactNode;
  text: string;
  delay?: number;
  highlight?: boolean;
}> = ({ icon, text, delay = 0, highlight = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.6,
    },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-lg transition-all ${
        highlight
          ? "bg-blue-600/30 border border-blue-400/50 text-blue-300 shadow-blue-500/20"
          : "bg-slate-800/80 border border-slate-700/60 text-slate-200"
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{text}</span>
    </div>
  );
};
