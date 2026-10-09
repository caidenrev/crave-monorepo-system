import { Easing, interpolate, spring } from "remotion";

/** Kurva "ease in-out" lembut ala demo produk (mirip cubic-bezier Apple). */
export const smooth = Easing.bezier(0.65, 0, 0.35, 1);
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 0→1 antara frame a dan b dengan easing. */
export const progress = (frame: number, a: number, b: number, ease = smooth) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: ease });

/** Spring yang tenang (tanpa memantul berlebihan) untuk elemen UI. */
export const calmSpring = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames = 30,
) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping: 200 },
  });

export type CamKey = {
  f: number;
  /** titik fokus pada koordinat app (px) */
  x: number;
  y: number;
  /** skala zoom */
  s: number;
  rx?: number;
  ry?: number;
};

/** Interpolasi keyframe kamera; setiap segmen pakai easing halus. */
export function camAt(frame: number, keys: CamKey[]) {
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (frame <= first.f)
    return { ...first, rx: first.rx ?? 0, ry: first.ry ?? 0 };
  if (frame >= last.f) return { ...last, rx: last.rx ?? 0, ry: last.ry ?? 0 };
  let i = 0;
  while (i < keys.length - 1 && frame > keys[i + 1]!.f) i++;
  const a = keys[i]!;
  const b = keys[i + 1]!;
  const t = smooth((frame - a.f) / (b.f - a.f));
  const lerp = (p: number, q: number) => p + (q - p) * t;
  return {
    f: frame,
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y),
    // zoom diinterpolasi secara logaritmik agar terasa linear di mata
    s: Math.exp(lerp(Math.log(a.s), Math.log(b.s))),
    rx: lerp(a.rx ?? 0, b.rx ?? 0),
    ry: lerp(a.ry ?? 0, b.ry ?? 0),
  };
}

/** Hitung angka naik (count-up) dengan easing. */
export const countUp = (frame: number, a: number, b: number, value: number) =>
  Math.round(value * progress(frame, a, b, outExpo));
