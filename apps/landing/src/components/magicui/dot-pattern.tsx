"use client";

import React, { useId } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  [key: string]: unknown;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId();
  const patternId = `${id}-pattern`;
  const w = Number(width);
  const h = Number(height);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={patternId}
          width={w}
          height={h}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          {glow ? (
            <motion.circle
              cx={cx}
              cy={cy}
              r={cr}
              fill={`url(#${id}-gradient)`}
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ) : (
            <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
