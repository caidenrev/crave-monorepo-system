import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipStartFrame: number;
  className?: string;
  delay?: number;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  flipStartFrame,
  className = "",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 140 },
  });

  const enterScale = interpolate(enterProgress, [0, 1], [0.8, 1]);
  const enterOpacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const enterTranslateY = interpolate(enterProgress, [0, 1], [40, 0]);

  // Flip rotation spring
  const flipProgress = spring({
    frame: frame - flipStartFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const rotateY = interpolate(flipProgress, [0, 1], [0, 180]);

  return (
    <div
      className={`relative perspective-1200 ${className}`}
      style={{
        opacity: enterOpacity,
        transform: `translateY(${enterTranslateY}px) scale(${enterScale})`,
      }}
    >
      <div
        className="relative w-full h-full transform-style-3d transition-transform duration-500"
        style={{
          transform: `rotateY(${rotateY}deg)`,
        }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white border border-[#E2E8F0] shadow-soft p-6 flex flex-col justify-between">
          {front}
        </div>

        {/* Back Face (Rotated 180deg) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-white border border-[#2563EB]/40 shadow-soft-lg p-6 flex flex-col justify-between">
          {back}
        </div>
      </div>
    </div>
  );
};
