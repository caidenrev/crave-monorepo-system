import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  durationInFrames?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  formatRupiah?: boolean;
}> = ({
  from = 0,
  to,
  durationInFrames = 60,
  delay = 0,
  prefix = "",
  suffix = "",
  formatRupiah = false,
}) => {
  const frame = useCurrentFrame();

  const currentVal = interpolate(frame - delay, [0, durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rounded = Math.round(currentVal);

  const formatted = formatRupiah
    ? new Intl.NumberFormat("id-ID").format(rounded)
    : rounded.toLocaleString("id-ID");

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
