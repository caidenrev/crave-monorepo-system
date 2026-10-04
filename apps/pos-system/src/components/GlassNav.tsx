// GlassNav.jsx — navigasi "liquid glass" ala iOS 26/27 (React)
// Install ikon:  npm i lucide-react
// Kapsul kaca membiaskan (SVG displacement) seluruh yang ada di belakangnya: bar, ikon, teks, isi halaman. Pelangi muncul dari pembiasan itu.

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Radio, Phone, Users, MessagesSquare, Settings } from "lucide-react";

export type GlassNavTab = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; fill?: string }>;
  badge?: number | string;
  dot?: boolean;
  noFill?: boolean;
};

export type GlassNavProps = {
  tabs?: GlassNavTab[];
  value?: string;
  onChange?: (id: string) => void;
  blur?: number;
  theme?: "light" | "dark";
};

const DEFAULT_TABS: GlassNavTab[] = [
  { id: "updates", label: "Updates", icon: Radio, dot: true },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "communities", label: "Communities", icon: Users },
  { id: "chats", label: "Chats", icon: MessagesSquare, badge: 26 },
  { id: "settings", label: "Settings", icon: Settings, noFill: true },
];

// @config-start
const CONFIG = {
  theme: "light" as "light" | "dark", // "light" | "dark"
  convex: true, // true = cembung (isi ditarik dari dalam), false = isi ditarik dari luar tepi
  blur: 8, // blur kaca bar navigasi (px)
  lensBlur: 0, // blur kapsul saat ditekan (px) - 0 = paling bening
  refraction: 34, // kekuatan lengkungan di tepi kapsul
  dispersion: 12, // pemisahan warna merah/hijau/biru (sumber "pelangi")
  bezel: 0.26, // lebar zona lengkung di tepi kapsul (x tinggi kapsul)
  vertical: 0.5, // kekuatan lengkungan atas/bawah (kecil = tidak lebay)
  haptic: true, // getaran saat disentuh/digeser (Android Chrome; iOS Safari 17.4+ terbatas)
  hapticPress: 12, // ms getaran saat jari menyentuh
  hapticTick: 8, // ms getaran tiap melewati menu lain saat digeser
  hapticSelect: 18, // ms getaran saat dilepas / menu terpilih
  lensExtra: 0.3, // kapsul lebih lebar dari 1 tab (per sisi, x lebar tab)
  stiffness: 220, // kekakuan pegas geser (naik = lebih cepat)
  damping: 15, // redaman (turun = lebih kenyal)
  liftDelay: 110, // ms jeda terangkat sebelum meluncur
  minLift: 170, // ms minimal lama terangkat saat tap
};
// @config-end

const THEMES = {
  light: {
    bar: "rgba(255,255,255,.5)",
    barRing: "rgba(0,0,0,.14)",
    barShadow: "0 6px 24px rgba(0,0,0,.10)",
    tab: "#2c2c2e",
    tabOn: "#000",
    idle: "rgba(0,0,0,.08)",
    lens: "rgba(255,255,255,.3)",
    ring: "rgba(0,0,0,.14)",
    hi: "rgba(255,255,255,.95)",
    shade: "rgba(40,50,80,.16)",
    lensShadow: "0 10px 26px rgba(0,0,0,.18)",
    bright: 1.04,
  },
  dark: {
    bar: "rgba(255,255,255,.07)",
    barRing: "rgba(255,255,255,.2)",
    barShadow: "0 10px 30px rgba(0,0,0,.35)",
    tab: "#d4d4da",
    tabOn: "#fff",
    idle: "rgba(255,255,255,.12)",
    lens: "rgba(255,255,255,.05)",
    ring: "rgba(255,255,255,.38)",
    hi: "rgba(255,255,255,.7)",
    shade: "rgba(0,0,0,.35)",
    lensShadow: "0 12px 28px rgba(0,0,0,.4)",
    bright: 1.15,
  },
};

// Getaran: Android/Chrome pakai navigator.vibrate; iOS Safari 17.4+ pakai trik <input switch>
let hapticLabel: HTMLLabelElement | undefined;
function haptic(ms: number) {
  if (!CONFIG.haptic || !ms || typeof document === "undefined") return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
    return;
  }
  try {
    if (!hapticLabel) {
      hapticLabel = document.createElement("label");
      hapticLabel.setAttribute("aria-hidden", "true");
      hapticLabel.style.cssText =
        "position:fixed;left:-99px;top:-99px;opacity:0;pointer-events:none";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      hapticLabel.appendChild(input);
      document.body.appendChild(hapticLabel);
    }
    hapticLabel.click();
  } catch {
    /* perangkat tidak mendukung */
  }
}

const EY = 8; // kapsul menonjol ke atas/bawah bar (px)
const PAD = 6; // padding bar (px)

// Peta pembiasan "liquid": di tepi kapsul, isi dari LUAR tepi ditarik masuk (kuat di ujung kiri/kanan, lemah di atas/bawah)
function makeMap(W: number, H: number) {
  const FW = W,
    FH = H;
  const c = document.createElement("canvas");
  c.width = FW;
  c.height = FH;
  const g = c.getContext("2d");
  if (!g) return "";
  const im = g.createImageData(FW, FH);
  const r = H / 2,
    bz = H * CONFIG.bezel,
    ky = CONFIG.vertical,
    sg = CONFIG.convex ? -1 : 1;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const px = x + 0.5,
        py = y + 0.5;
      const cx = Math.min(Math.max(px, r), W - r);
      const dx = px - cx,
        dy = py - H / 2;
      const d = Math.hypot(dx, dy);
      const t = (r - d) / bz;
      const m = d <= r && t < 1 ? Math.pow(1 - Math.max(0, t), 1.6) : 0;
      const nx = d ? dx / d : 0,
        ny = d ? dy / d : 0;
      const i = (y * FW + x) * 4;
      im.data[i] = clamp(128 + sg * nx * m * 127);
      im.data[i + 1] = clamp(128 + sg * ny * m * ky * 127);
      im.data[i + 2] = 128;
      im.data[i + 3] = 255;
    }
  }
  g.putImageData(im, 0, 0);
  return c.toDataURL();
}

export default function GlassNav({
  tabs = DEFAULT_TABS,
  value,
  onChange,
  blur = CONFIG.blur,
  theme = CONFIG.theme,
}: GlassNavProps) {
  const th = THEMES[theme] || THEMES.light;
  const n = tabs.length;
  const fid = "lg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const idx = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );
  const [dim, setDim] = useState({ w: 0, h: 0 });

  const canFx = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Chrome|Chromium/.test(navigator.userAgent) &&
      !/CriOS|FxiOS/.test(navigator.userAgent),
    [],
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setDim({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animasi pegas (kenyal): x = posisi kapsul (satuan tab), l = tinggi "terangkat" (0..1)
  const sim = useRef({ x: idx, v: 0, tx: idx, l: 0, vl: 0, tl: 0, raf: 0, last: 0 });
  const [anim, setAnim] = useState({ x: idx, l: 0 });
  const ptr = useRef({
    down: false,
    p: idx,
    i: idx,
    lifted: false,
    t0: 0,
    t1: 0 as ReturnType<typeof setTimeout> | 0,
    t2: 0 as ReturnType<typeof setTimeout> | 0,
  });

  const kick = () => {
    const s = sim.current;
    if (s.raf) return;
    s.last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.032, (t - s.last) / 1000 || 0.016);
      s.last = t;
      s.v += (-CONFIG.stiffness * (s.x - s.tx) - CONFIG.damping * s.v) * dt;
      s.x += s.v * dt;
      s.vl += (-320 * (s.l - s.tl) - 21 * s.vl) * dt;
      s.l += s.vl * dt;
      const done =
        Math.abs(s.x - s.tx) < 0.002 &&
        Math.abs(s.v) < 0.01 &&
        Math.abs(s.l - s.tl) < 0.002 &&
        Math.abs(s.vl) < 0.01;
      if (done) {
        s.x = s.tx;
        s.l = s.tl;
        s.v = s.vl = 0;
        s.raf = 0;
      } else s.raf = requestAnimationFrame(step);
      setAnim({ x: s.x, l: s.l });
    };
    s.raf = requestAnimationFrame(step);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(sim.current.raf);
      clearTimeout(ptr.current.t1);
      clearTimeout(ptr.current.t2);
    },
    [],
  );
  useEffect(() => {
    if (!ptr.current.down) {
      sim.current.tx = idx;
      kick();
    }
  }, [idx]);

  const tabW = dim.w / n;
  const EX = Math.round(tabW * CONFIG.lensExtra);
  const lensW = Math.round(tabW + 2 * EX);
  const lensH = dim.h + 2 * EY;
  // lensW/lensH derived from dim.w/dim.h; CONFIG values are static
  const mapUrl = useMemo(
    () => (canFx && dim.w ? makeMap(lensW, lensH) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- original displacement-map dependencies
    [canFx, dim.w, dim.h, CONFIG.vertical, CONFIG.bezel, CONFIG.convex],
  );

  const calc = (e: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * n;
    return {
      p: Math.min(n - 1, Math.max(0, x - 0.5)),
      i: Math.min(n - 1, Math.max(0, Math.floor(x))),
    };
  };
  // 1) tekan: kapsul terangkat di tempat lama  2) meluncur kenyal ke tab yang disentuh  3) lepas: turun
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const P = ptr.current,
      s = sim.current;
    clearTimeout(P.t1);
    clearTimeout(P.t2);
    P.down = true;
    P.lifted = false;
    P.t0 = performance.now();
    {
      const c = calc(e);
      P.p = c.p;
      P.i = c.i;
    }
    haptic(CONFIG.hapticPress);
    s.tl = 1;
    kick();
    P.t1 = setTimeout(() => {
      P.lifted = true;
      if (P.down) {
        s.tx = P.p;
        kick();
      }
    }, CONFIG.liftDelay);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const P = ptr.current;
    if (!P.down) return;
    const c = calc(e);
    P.p = c.p;
    if (c.i !== P.i) {
      P.i = c.i;
      haptic(CONFIG.hapticTick);
    } // tiap melewati menu lain
    if (P.lifted) {
      sim.current.tx = P.p;
      kick();
    }
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const P = ptr.current,
      s = sim.current;
    if (!P.down) return;
    P.down = false;
    clearTimeout(P.t1);
    const { i } = calc(e);
    haptic(CONFIG.hapticSelect);
    s.tx = i;
    kick();
    P.t2 = setTimeout(
      () => {
        s.tl = 0;
        kick();
      },
      Math.max(0, CONFIG.minLift - (performance.now() - P.t0)),
    );
    const id = tabs[i]?.id;
    if (id) onChange?.(id);
  };

  const selectByKeyboard = (i: number) => {
    const id = tabs[i]?.id;
    if (!id) return;
    const s = sim.current;
    s.tx = i;
    kick();
    onChange?.(id);
    tabRefs.current[i]?.focus();
  };

  const onTabKeyDown = (i: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = e.key === "ArrowRight" ? Math.min(n - 1, i + 1) : Math.max(0, i - 1);
      tabRefs.current[next]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      tabRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      tabRefs.current[n - 1]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectByKeyboard(i);
    }
  };

  const x = anim.x;
  const l = Math.max(0, anim.l);
  const lifted = l > 0.02;
  const exl = EX * l,
    eyl = EY * l;
  const left = x * tabW - exl;
  const curW = tabW + 2 * exl,
    curH = dim.h + 2 * eyl;
  const current = Math.min(n - 1, Math.max(0, Math.round(x)));
  const useSvg = lifted && canFx && mapUrl;
  const bf = lifted
    ? `${useSvg ? `url(#${fid}) ` : ""}blur(${CONFIG.lensBlur}px) saturate(1.4) brightness(${th.bright})`
    : "none";
  // tab asli dilubangi sebesar kapsul; di lubang itu tampil baris ikon "terisi" (lensMode)
  const rr = curH / 2,
    y0 = -eyl;
  const holeClip = lifted
    ? `path(evenodd, 'M-200 -200H${dim.w + 200}V${dim.h + 200}H-200Z M${left + rr} ${y0}H${left + curW - rr}A${rr} ${rr} 0 0 1 ${left + curW - rr} ${y0 + curH}H${left + rr}A${rr} ${rr} 0 0 1 ${left + rr} ${y0}Z')`
    : "none";

  // kapsul ada di LUAR bar supaya ikut membiaskan bar + isi halaman di belakangnya
  const lensStyle: CSSProperties = {
    position: "absolute",
    left: PAD + left,
    top: PAD - eyl,
    width: curW,
    height: curH,
    borderRadius: 999,
    zIndex: 3,
    pointerEvents: "none",
    background: th.lens,
    backdropFilter: bf,
    WebkitBackdropFilter: bf,
    boxShadow: `inset 0 0 0 1.5px ${th.ring}, inset 0 3px 3px -1px ${th.hi}, inset 0 -3px 4px -1px ${th.hi}, ${th.lensShadow}`,
  };

  const S = CONFIG.refraction,
    D = CONFIG.dispersion;
  const dm = (scale: number, result: string) => (
    <feDisplacementMap
      in="SourceGraphic"
      in2="map"
      scale={scale}
      xChannelSelector="R"
      yChannelSelector="G"
      result={result}
    />
  );

  // lensMode = true: semua ikon tampil tebal & terisi (seperti ikon aktif iOS)
  const renderTabs = (cur: number, lensMode: boolean) =>
    tabs.map((t, i) => {
      const Icon = t.icon;
      const on = lensMode || i === cur;
      return (
        <div
          key={t.id}
          ref={
            lensMode
              ? undefined
              : (el) => {
                  tabRefs.current[i] = el;
                }
          }
          role={lensMode ? undefined : "tab"}
          aria-selected={lensMode ? undefined : i === idx}
          tabIndex={lensMode ? undefined : i === idx ? 0 : -1}
          onKeyDown={lensMode ? undefined : (e) => onTabKeyDown(i, e)}
          className={lensMode ? undefined : "glassnav-tab"}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "7px 0 6px",
            position: "relative",
            whiteSpace: "nowrap",
            fontSize: 10.5,
            fontWeight: on ? 700 : 600,
            color: on ? th.tabOn : th.tab,
          }}
        >
          <Icon
            size={24}
            strokeWidth={on ? 2.2 : 1.8}
            fill={on && !t.noFill ? "currentColor" : "none"}
          />
          <span>{t.label}</span>
          {t.dot && (
            <i
              style={{
                position: "absolute",
                top: 5,
                right: "calc(50% - 18px)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#25d366",
              }}
            />
          )}
          {t.badge && (
            <b
              style={{
                position: "absolute",
                top: 1,
                right: "calc(50% - 28px)",
                background: "#25d366",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 99,
                padding: "1px 6px",
              }}
            >
              {t.badge}
            </b>
          )}
        </div>
      );
    });

  return (
    <div
      role="tablist"
      aria-label="Navigasi utama"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <style>{`.glassnav-tab:focus{outline:none}.glassnav-tab:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:12px}`}</style>
      {canFx && mapUrl && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter
              id={fid}
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={lensW}
              height={lensH}
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={mapUrl}
                x="0"
                y="0"
                width={lensW}
                height={lensH}
                preserveAspectRatio="none"
                result="map"
              />
              {dm(S - D, "a")}
              <feColorMatrix
                in="a"
                type="matrix"
                values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
                result="r"
              />
              {dm(S, "b")}
              <feColorMatrix
                in="b"
                type="matrix"
                values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
                result="g"
              />
              {dm(S + D, "c")}
              <feColorMatrix
                in="c"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
                result="bl"
              />
              <feBlend in="r" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="bl" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}

      <div
        style={{
          position: "relative",
          borderRadius: 999,
          padding: PAD,
          background: th.bar,
          backdropFilter: `blur(${blur}px) saturate(1.6)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(1.6)`,
          boxShadow: `inset 0 0 0 1px ${th.barRing}, ${th.barShadow}`,
        }}
      >
        <div ref={trackRef} style={{ position: "relative", display: "flex" }}>
          {/* kapsul abu-abu saat diam (di belakang ikon) */}
          <div
            style={{
              position: "absolute",
              left: x * tabW,
              top: 0,
              bottom: 0,
              width: tabW,
              borderRadius: 999,
              background: th.idle,
              opacity: 1 - Math.min(1, l * 2),
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              width: "100%",
              position: "relative",
              zIndex: 2,
              clipPath: holeClip,
            }}
          >
            {renderTabs(current, false)}
          </div>
          {lifted && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left,
                top: -eyl,
                width: curW,
                height: curH,
                borderRadius: 999,
                overflow: "hidden",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  width: dim.w,
                  height: dim.h,
                  left: -left,
                  top: eyl,
                }}
              >
                {renderTabs(current, true)}
              </div>
            </div>
          )}
        </div>
      </div>

      {lifted && <div style={lensStyle} />}
    </div>
  );
}
