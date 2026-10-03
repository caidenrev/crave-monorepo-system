import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const BackgroundGrid: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
}> = ({ primaryColor = "#2563eb", secondaryColor = "#06b6d4" }) => {
  const frame = useCurrentFrame();

  const orb1X = interpolate(frame, [0, 900], [20, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const orb1Y = interpolate(frame, [0, 450, 900], [15, 60, 20]);
  
  const orb2X = interpolate(frame, [0, 900], [80, 25]);
  const orb2Y = interpolate(frame, [0, 450, 900], [70, 25, 80]);

  const pulse = Math.sin(frame / 20) * 0.15 + 0.85;

  return (
    <div className="absolute inset-0 bg-[#070b14] overflow-hidden -z-10 select-none pointer-events-none">
      {/* Dynamic Moving Neon Orbs */}
      <div
        className="absolute rounded-full blur-[140px] opacity-40 transition-all"
        style={{
          width: "550px",
          height: "550px",
          left: `${orb1X}%`,
          top: `${orb1Y}%`,
          transform: `translate(-50%, -50%) scale(${pulse})`,
          background: `radial-gradient(circle, ${primaryColor} 0%, rgba(37,99,235,0) 70%)`,
        }}
      />
      <div
        className="absolute rounded-full blur-[160px] opacity-35 transition-all"
        style={{
          width: "600px",
          height: "600px",
          left: `${orb2X}%`,
          top: `${orb2Y}%`,
          transform: `translate(-50%, -50%) scale(${1.2 - pulse * 0.2})`,
          background: `radial-gradient(circle, ${secondaryColor} 0%, rgba(6,182,212,0) 70%)`,
        }}
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />

      {/* Radial vignette mask */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #070b14 90%)",
        }}
      />
    </div>
  );
};
