import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  stagger?: boolean;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = "",
  delay = 0,
  wordDelay = 3,
  stagger = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!stagger) {
    const progress = spring({
      frame: frame - delay,
      fps,
      config: { damping: 16, stiffness: 140 },
    });

    const opacity = interpolate(progress, [0, 1], [0, 1]);
    const blur = interpolate(progress, [0, 1], [12, 0]);
    const translateY = interpolate(progress, [0, 1], [18, 0]);

    return (
      <div
        className={className}
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {text}
      </div>
    );
  }

  const words = text.split(" ");

  return (
    <div className={`inline-flex flex-wrap gap-x-[0.28em] gap-y-1 ${className}`}>
      {words.map((word, i) => {
        const itemDelay = delay + i * wordDelay;
        const progress = spring({
          frame: frame - itemDelay,
          fps,
          config: { damping: 15, stiffness: 150 },
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const blur = interpolate(progress, [0, 1], [14, 0]);
        const translateY = interpolate(progress, [0, 1], [22, 0]);

        return (
          <span
            key={i}
            className="inline-block"
            style={{
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
