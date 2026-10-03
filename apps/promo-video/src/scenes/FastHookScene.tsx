import React from "react";
import {
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const FastHookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs for the 3 layered sheets (staggered rise from bottom)
  const enterSpring1 = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const enterSpring2 = spring({
    frame: frame - 3,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const enterSpring3 = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  // Exit springs for the 3 layered sheets (staggered exit upwards)
  const exitSpring1 = spring({
    frame: frame - 42,
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const exitSpring2 = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 160 },
  });
  const exitSpring3 = spring({
    frame: frame - 48,
    fps,
    config: { damping: 15, stiffness: 160 },
  });

  // Calculate Y translations (% of screen)
  // Enter: 100% -> 0%
  // Exit: 0% -> -100%
  const getY1 = () => {
    const enterY = interpolate(enterSpring1, [0, 1], [100, 0]);
    const exitY = interpolate(exitSpring1, [0, 1], [0, -100]);
    return enterY + exitY;
  };

  const getY2 = () => {
    const enterY = interpolate(enterSpring2, [0, 1], [100, 0]);
    const exitY = interpolate(exitSpring2, [0, 1], [0, -100]);
    return enterY + exitY;
  };

  const getY3 = () => {
    const enterY = interpolate(enterSpring3, [0, 1], [100, 0]);
    const exitY = interpolate(exitSpring3, [0, 1], [0, -100]);
    return enterY + exitY;
  };

  // Border radius dynamic curves
  const topRadius = interpolate(enterSpring3, [0, 0.85, 1], [50, 20, 0]);
  const bottomRadius = interpolate(exitSpring1, [0, 0.5, 1], [0, 25, 50]);

  // Logo animation (fade in, float, scale pop, fade out up)
  const logoEnter = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  const logoExit = spring({
    frame: frame - 38,
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  const logoOpacity =
    interpolate(logoEnter, [0, 1], [0, 1]) *
    interpolate(logoExit, [0, 1], [1, 0]);

  const logoY =
    interpolate(logoEnter, [0, 1], [30, 0]) +
    interpolate(logoExit, [0, 1], [0, -30]);

  const logoScale =
    interpolate(logoEnter, [0, 1], [0.85, 1.05]) *
    interpolate(logoExit, [0, 1], [1, 0.95]);

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex items-center justify-center overflow-hidden select-none">
      {/* Layer 1: Sky Blue */}
      <div
        className="absolute inset-0 bg-blue-400 w-full h-full shadow-2xl"
        style={{
          transform: `translateY(${getY1()}%)`,
          borderTopLeftRadius: `${topRadius}%`,
          borderTopRightRadius: `${topRadius}%`,
          borderBottomLeftRadius: `${bottomRadius}%`,
          borderBottomRightRadius: `${bottomRadius}%`,
        }}
      />

      {/* Layer 2: Cobalt Blue */}
      <div
        className="absolute inset-0 bg-blue-600 w-full h-full shadow-2xl"
        style={{
          transform: `translateY(${getY2()}%)`,
          borderTopLeftRadius: `${topRadius}%`,
          borderTopRightRadius: `${topRadius}%`,
          borderBottomLeftRadius: `${bottomRadius}%`,
          borderBottomRightRadius: `${bottomRadius}%`,
        }}
      />

      {/* Layer 3: Vibrant Crave Blue */}
      <div
        className="absolute inset-0 bg-[#1B5CFE] w-full h-full shadow-2xl"
        style={{
          transform: `translateY(${getY3()}%)`,
          borderTopLeftRadius: `${topRadius}%`,
          borderTopRightRadius: `${topRadius}%`,
          borderBottomLeftRadius: `${bottomRadius}%`,
          borderBottomRightRadius: `${bottomRadius}%`,
        }}
      />

      {/* Center White Crave Logo */}
      <div
        className="relative z-20 flex flex-col items-center justify-center drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoY}px) scale(${logoScale})`,
        }}
      >
        <img
          src={staticFile("dark-mode-logo.png")}
          alt="Crave"
          className="h-24 sm:h-32 md:h-40 w-auto object-contain drop-shadow-lg"
        />
      </div>
    </div>
  );
};

