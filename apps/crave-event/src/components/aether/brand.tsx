// Generated from brand/crave-event-logo (see brand/build_logo.py). Edit the generator, not this file.
import type { SVGProps } from "react";

const RING = "M201.84,191.64A99,99 0 1 1 201.84,64.36A21,21 0 0 1 169.66,91.36A57,57 0 1 0 169.66,164.64A21,21 0 0 1 201.84,191.64Z";
const CRAVE: [number, string][] = [
  [0, "M82.14,88.3A50,50 0 1 1 82.14,11.7A11,11 0 0 1 68,28.55A28,28 0 1 0 68,71.45A11,11 0 0 1 82.14,88.3Z"],
  [116, "M22,11L22,89A11,11 0 0 1 0,89L0,11A11,11 0 0 1 22,11ZM0,50A50,50 0 0 1 62.94,1.7A11,11 0 0 1 57.25,22.95A28,28 0 0 0 22,50A11,11 0 0 1 0,50Z"],
  [192, "M96.98,67.1A50,50 0 1 1 96.98,32.9A11,11 0 0 1 76.31,40.42A28,28 0 1 0 76.31,59.58A11,11 0 0 1 96.98,67.1ZM100,11L100,89A11,11 0 0 1 78,89L78,11A11,11 0 0 1 100,11Z"],
  [306, "M21.08,6.6L55.08,84.6A11,11 0 0 1 34.92,93.4L0.92,15.4A11,11 0 0 1 21.08,6.6ZM34.92,84.6L68.92,6.6A11,11 0 0 1 89.08,15.4L55.08,93.4A11,11 0 0 1 34.92,84.6Z"],
  [408, "M88.3,82.14A50,50 0 1 1 100,50A11,11 0 0 1 78,50A28,28 0 1 0 71.45,68A11,11 0 0 1 88.3,82.14ZM11,39L89,39A11,11 0 0 1 89,61L11,61A11,11 0 0 1 11,39Z"],
];
const EVENT: [number, string][] = [
  [554, "M88.3,82.14A50,50 0 1 1 100,50A11,11 0 0 1 78,50A28,28 0 1 0 71.45,68A11,11 0 0 1 88.3,82.14ZM11,39L89,39A11,11 0 0 1 89,61L11,61A11,11 0 0 1 11,39Z"],
  [668, "M21.08,6.6L55.08,84.6A11,11 0 0 1 34.92,93.4L0.92,15.4A11,11 0 0 1 21.08,6.6ZM34.92,84.6L68.92,6.6A11,11 0 0 1 89.08,15.4L55.08,93.4A11,11 0 0 1 34.92,84.6Z"],
  [770, "M88.3,82.14A50,50 0 1 1 100,50A11,11 0 0 1 78,50A28,28 0 1 0 71.45,68A11,11 0 0 1 88.3,82.14ZM11,39L89,39A11,11 0 0 1 89,61L11,61A11,11 0 0 1 11,39Z"],
  [884, "M22,11L22,89A11,11 0 0 1 0,89L0,11A11,11 0 0 1 22,11ZM0,50A50,50 0 0 1 100,50A11,11 0 0 1 78,50A28,28 0 0 0 22,50A11,11 0 0 1 0,50ZM100,50L100,89A11,11 0 0 1 78,89L78,50A11,11 0 0 1 100,50Z"],
  [1002, "M41,-30L41,60A11,11 0 0 1 19,60L19,-30A11,11 0 0 1 41,-30ZM59,100A40,40 0 0 1 19,60A11,11 0 0 1 41,60A18,18 0 0 0 59,78A11,11 0 0 1 59,100ZM59,78L72,78A11,11 0 0 1 72,100L59,100A11,11 0 0 1 59,78ZM11,0L62,0A11,11 0 0 1 62,22L11,22A11,11 0 0 1 11,0Z"],
];

/** Crave Event symbol: C ring + live dot. Ring uses currentColor. */
export function CraveSymbol({ dotColor = "var(--danger)", ...props }: SVGProps<SVGSVGElement> & { dotColor?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true" {...props}>
      <path fill="currentColor" d={RING} />
      <circle cx="208" cy="128" r="22" fill={dotColor} />
    </svg>
  );
}

/** "crave event" wordmark. Both words take currentColor unless eventColor is set. */
export function CraveWordmark({ eventColor, ...props }: SVGProps<SVGSVGElement> & { eventColor?: string }) {
  return (
    <svg viewBox="0 0 1133 189" role="img" aria-label="Crave Event" {...props}>
      <g transform="translate(24,65)">
        <g fill="currentColor">
          {CRAVE.map(([x, d]) => (
            <path key={x} transform={`translate(${x},0)`} d={d} />
          ))}
        </g>
        <g fill={eventColor ?? "currentColor"}>
          {EVENT.map(([x, d]) => (
            <path key={x} transform={`translate(${x},0)`} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}
