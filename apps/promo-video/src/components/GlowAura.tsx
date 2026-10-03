import React from "react";
import { useCurrentFrame } from "remotion";

export const GlowAura: React.FC<{
  color?: string;
  size?: number;
  className?: string;
}> = ({ color = "#3b82f6", size = 400, className = "" }) => {
  const frame = useCurrentFrame();
  const scale = 1 + Math.sin(frame / 15) * 0.08;
  const opacity = 0.5 + Math.sin(frame / 20) * 0.15;

  return (
    <div
      className={`absolute rounded-full blur-[100px] pointer-events-none -z-10 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};
