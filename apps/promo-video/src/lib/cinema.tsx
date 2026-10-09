import { useId, type CSSProperties, type ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { camAt, clamp, outExpo, progress, type CamKey } from "./motion";
import { jakarta, serif } from "./fonts";

export const useIsVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/* ------------------------------------------------------------------ */
/* Latar: putih dengan ambience biru yang bergerak pelan + grid halus  */
/* ------------------------------------------------------------------ */
export function Ambient() {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (
    x: number,
    y: number,
    size: number,
    color: string,
    speed: number,
    phase: number,
  ): CSSProperties => ({
    position: "absolute",
    left: `${x + Math.sin(t * speed + phase) * 6}%`,
    top: `${y + Math.cos(t * speed * 0.8 + phase) * 6}%`,
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
    transform: "translate(-50%, -50%)",
    filter: "blur(40px)",
  });
  return (
    <AbsoluteFill style={{ background: "#f7f9ff", overflow: "hidden" }}>
      <div style={blob(18, 22, 1100, "rgba(59,130,246,.22)", 0.35, 0)} />
      <div style={blob(82, 70, 1200, "rgba(37,99,235,.18)", 0.28, 2)} />
      <div style={blob(60, 8, 800, "rgba(125,211,252,.22)", 0.42, 4)} />
      {/* grid titik halus, memudar ke tepi */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(30,64,175,.13) 1.2px, transparent 1.2px)",
          backgroundSize: "34px 34px",
          backgroundPosition: `${-frame * 0.15}px ${-frame * 0.1}px`,
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)",
          opacity: 0.55,
        }}
      />
      {/* vignette sangat tipis */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(30,58,138,.06) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

/** Grain film tipis: menghilangkan banding pada gradasi/bayangan lembut. */
export function Grain() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.09 }}
    >
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 6}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/* Title & subtitle: muncul per kata (blur → tajam, naik halus)        */
/* ------------------------------------------------------------------ */
type TitleProps = {
  eyebrow?: string;
  /** gunakan *kata* untuk aksen serif italic biru */
  title: string;
  subtitle?: string;
  start?: number;
  align?: "left" | "center";
  size?: number;
  style?: CSSProperties;
};

export function Title({
  eyebrow,
  title,
  subtitle,
  start = 0,
  align = "left",
  size,
  style,
}: TitleProps) {
  const frame = useCurrentFrame();
  const vertical = useIsVertical();
  const fontSize = size ?? (vertical ? 92 : 84);
  // "*kata kata*" → aksen serif; tanda bintang boleh mencakup beberapa kata
  let inAccent = false;
  const words = title.split(" ").map((raw) => {
    let w = raw;
    const opens = w.startsWith("*");
    if (opens) w = w.slice(1);
    const closes = w.endsWith("*");
    if (closes) w = w.slice(0, -1);
    const accent = inAccent || opens;
    if (opens && !closes) inAccent = true;
    if (closes) inAccent = false;
    return { text: w, accent };
  });

  const reveal = (i: number): CSSProperties => {
    const p = progress(frame, start + 6 + i * 3, start + 26 + i * 3, outExpo);
    return {
      display: "inline-block",
      opacity: p,
      transform: `translateY(${(1 - p) * 0.45}em)`,
      filter: `blur(${(1 - p) * 14}px)`,
      marginRight: "0.24em",
    };
  };

  const eyebrowP = progress(frame, start, start + 18, outExpo);
  const subP = progress(
    frame,
    start + 16 + words.length * 3,
    start + 40 + words.length * 3,
    outExpo,
  );

  return (
    <div style={{ fontFamily: jakarta, textAlign: align, ...style }}>
      {eyebrow ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px 8px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,.75)",
            border: "1px solid rgba(37,99,235,.18)",
            boxShadow: "0 6px 20px -8px rgba(37,99,235,.35)",
            color: "#1d4ed8",
            fontSize: vertical ? 26 : 22,
            fontWeight: 700,
            letterSpacing: "0.02em",
            marginBottom: 28,
            opacity: eyebrowP,
            transform: `translateY(${(1 - eyebrowP) * 12}px)`,
            filter: `blur(${(1 - eyebrowP) * 6}px)`,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              background: "linear-gradient(135deg,#60a5fa,#2563eb)",
              boxShadow: "0 0 0 4px rgba(37,99,235,.15)",
            }}
          />
          {eyebrow}
        </div>
      ) : null}
      <h1
        style={{
          margin: 0,
          fontSize,
          lineHeight: 1.04,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: "#0b1530",
        }}
      >
        {words.map(({ text, accent }, i) => {
          return (
            <span key={i} style={reveal(i)}>
              {accent ? (
                <span
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    fontSize: "1.12em",
                    background:
                      "linear-gradient(120deg,#1d4ed8 10%,#3b82f6 55%,#38bdf8 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingRight: "0.06em",
                  }}
                >
                  {text}
                </span>
              ) : (
                text
              )}
            </span>
          );
        })}
      </h1>
      {subtitle ? (
        <p
          style={{
            margin: align === "center" ? "26px auto 0" : "26px 0 0",
            maxWidth:
              align === "center"
                ? vertical
                  ? 900
                  : 1100
                : vertical
                  ? 860
                  : 620,
            fontSize: vertical ? 34 : 28,
            lineHeight: 1.45,
            fontWeight: 500,
            color: "#53607a",
            opacity: subP,
            transform: `translateY(${(1 - subP) * 14}px)`,
            filter: `blur(${(1 - subP) * 8}px)`,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jendela app: frame kaca + kamera (zoom/pan/tilt) di dalamnya         */
/* ------------------------------------------------------------------ */
type AppWindowProps = {
  /** ukuran "layar" app virtual */
  appWidth: number;
  appHeight: number;
  /** ukuran & posisi jendela di kanvas video */
  box: { left: number; top: number; width: number; height: number };
  /** keyframe kamera di dalam jendela (titik fokus dalam koordinat app) */
  cam: CamKey[];
  /** keyframe untuk jendela itu sendiri (masuk dengan tilt 3D) */
  enter?: number;
  children: ReactNode;
};

export function AppWindow({
  appWidth,
  appHeight,
  box,
  cam,
  enter = 0,
  children,
}: AppWindowProps) {
  const frame = useCurrentFrame();
  const fid = "mb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const fit = box.width / appWidth;

  // posisi kamera (sudah dibatasi agar tidak keluar dari area app) pada frame f
  const view = (f: number) => {
    const c = camAt(f, cam);
    const s = fit * c.s;
    const visW = box.width / s;
    const visH = box.height / s;
    const cx =
      visW >= appWidth
        ? appWidth / 2
        : Math.min(Math.max(c.x, visW / 2), appWidth - visW / 2);
    const cy =
      visH >= appHeight
        ? appHeight / 2
        : Math.min(Math.max(c.y, visH / 2), appHeight - visH / 2);
    return { c, s, cx, cy, e: progress(f, enter, enter + 34, outExpo) };
  };
  const { c, s, cx, cy, e } = view(frame);

  // Motion blur berbasis kecepatan: blur searah gerak, sebanding perpindahan per frame
  // (shutter 180°). Saat kamera diam tidak ada blur sama sekali → tetap tajam.
  const a = view(frame - 0.5);
  const b = view(frame + 0.5);
  const zoomPx =
    Math.abs(Math.log(b.s / a.s)) * Math.max(box.width, box.height) * 0.5;
  const moveX = Math.abs((b.cx - a.cx) * s);
  const moveY = Math.abs((b.cy - a.cy) * s) + Math.abs(b.e - a.e) * 120;
  // ambang 1.2px: drift/zoom pelan tetap tajam, hanya gerakan cepat yang blur
  const blurX = Math.min(12, Math.max(0, (moveX + zoomPx * 0.6) * 0.34 - 1.2));
  const blurY = Math.min(12, Math.max(0, (moveY + zoomPx * 0.6) * 0.34 - 1.2));
  const blurring = blurX > 0.25 || blurY > 0.25;

  const winStyle: CSSProperties = {
    position: "absolute",
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    borderRadius: 28,
    overflow: "hidden",
    background: "var(--color-background)",
    // bayangan besar dibuat terpisah (div blur) — box-shadow lebar menimbulkan banding
    boxShadow:
      "0 0 0 1px rgba(15,23,42,.06), 0 2px 6px rgba(30,64,175,.07), 0 14px 34px -14px rgba(30,64,175,.28)",
    transform: `perspective(2400px) translateY(${(1 - e) * 120}px) rotateX(${(1 - e) * 18}deg) scale(${0.92 + e * 0.08})`,
    opacity: interpolate(e, [0, 0.4], [0, 1], clamp),
    transformOrigin: "50% 100%",
  };

  const stage: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: appWidth,
    height: appHeight,
    transformOrigin: "0 0",
    // geser supaya titik fokus (c.x, c.y) berada di tengah jendela
    transform: `perspective(2000px) translate(${box.width / 2 - cx * s}px, ${box.height / 2 - cy * s}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${s})`,
    filter: blurring ? `url(#${fid})` : undefined,
  };

  const glow: CSSProperties = {
    position: "absolute",
    left: box.left + box.width * 0.06,
    top: box.top + box.height * 0.12,
    width: box.width * 0.88,
    height: box.height * 0.9,
    borderRadius: 60,
    background:
      "linear-gradient(180deg, rgba(37,99,235,.0), rgba(37,99,235,.34))",
    filter: "blur(70px)",
    transform: winStyle.transform,
    transformOrigin: "50% 100%",
    opacity: interpolate(e, [0, 0.6], [0, 1], clamp),
  };

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <filter
          id={fid}
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${blurX / s} ${blurY / s}`} />
        </filter>
      </svg>
      <div style={glow} />
      <div style={winStyle}>
        <div style={stage}>{children}</div>
        {/* kilau kaca tipis di tepi jendela */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            pointerEvents: "none",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(255,255,255,.4)",
          }}
        />
      </div>
    </>
  );
}

/** Efek "tap": riak lingkaran biru di posisi tertentu (koordinat app). */
export function Tap({ x, y, at }: { x: number; y: number; at: number }) {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 18, outExpo);
  if (frame < at || frame > at + 22) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 70,
        height: 70,
        marginLeft: -35,
        marginTop: -35,
        borderRadius: 99,
        border: "3px solid rgba(37,99,235,.55)",
        background: "rgba(59,130,246,.14)",
        transform: `scale(${0.4 + p * 0.9})`,
        opacity: 1 - p,
        pointerEvents: "none",
        zIndex: 80,
      }}
    />
  );
}
