import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface DigitalCursorProps {
  x: number;
  y: number;
  clickFrame?: number;
  label?: string;
}

export const DigitalCursor: React.FC<DigitalCursorProps> = ({
  x,
  y,
  clickFrame,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isClicked = clickFrame !== undefined && frame >= clickFrame;
  const clickProgress = isClicked
    ? spring({
        frame: frame - clickFrame,
        fps,
        config: { damping: 14, stiffness: 220 },
      })
    : 0;

  const scale = isClicked
    ? interpolate(clickProgress, [0, 0.4, 1], [1, 0.82, 1])
    : 1;

  const rippleScale = isClicked
    ? interpolate(clickProgress, [0, 1], [0.8, 2.4])
    : 0;
  const rippleOpacity = isClicked
    ? interpolate(clickProgress, [0, 0.8, 1], [0.6, 0.2, 0])
    : 0;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `scale(${scale})`,
      }}
    >
      {/* Click Ripple */}
      {isClicked && (
        <div
          className="absolute -top-3 -left-3 w-10 h-10 rounded-full border-2 border-[#2563EB] bg-[#2563EB]/10 pointer-events-none"
          style={{
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* SVG Modern Mouse Pointer */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
      >
        <path
          d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
          fill="#0F172A"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional Badge / Tooltip on Cursor */}
      {label && (
        <div className="absolute left-6 top-3 px-2 py-0.5 rounded bg-[#0F172A] text-white text-[11px] font-semibold tracking-wide shadow-md whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};
