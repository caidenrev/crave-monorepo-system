import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AppWindow, Title } from "../lib/cinema";
import { camAt, clamp, outExpo, progress, type CamKey } from "../lib/motion";
import { jakarta } from "../lib/fonts";
import type { Layout } from "../lib/layout";
import { AppShell } from "../pos/Shell";
import { Dashboard } from "../pos/Dashboard";
import {
  Kasir,
  KASIR_TAPS,
  kasirActions,
  type KasirTimeline,
} from "../pos/Kasir";
import { Stok, StokActions, stokLowCount } from "../pos/Stok";
import { Supplier, SUPPLIERS, supplierActions } from "../pos/Supplier";
import {
  Spreadsheet,
  spreadsheetActions,
  SHEET_TOTAL_ROW,
} from "../pos/Spreadsheet";
import { products } from "@/lib/pos-data";

/* durasi tiap scene (frame @30fps) */
export const DUR = {
  intro: 135,
  overview: 180,
  sidenav: 200,
  kasir: 390,
  dashboard: 210,
  stok: 300,
  supplier: 165,
  sheet: 195,
  outro: 165,
};
export const TRANSITION = 20;

/* ------------------------------------------------------------------ */
function Logo({
  size,
  frame,
  delay = 0,
}: {
  size: number;
  frame: number;
  delay?: number;
}) {
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const p = progress(frame, delay, delay + 26, outExpo);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "linear-gradient(160deg,#ffffff,#eef4ff)",
        boxShadow:
          "0 0 0 1px rgba(37,99,235,.10), 0 10px 24px -10px rgba(37,99,235,.45), inset 0 1px 0 #fff",
        position: "relative",
        display: "grid",
        placeItems: "center",
        transform: `scale(${0.6 + s * 0.4})`,
        opacity: p,
        filter: `blur(${(1 - p) * 16}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "18% 10% -14%",
          borderRadius: "50%",
          background: "rgba(37,99,235,.45)",
          filter: "blur(36px)",
          zIndex: -1,
        }}
      />
      <Img
        src={staticFile("light-mode-logo.png")}
        style={{
          width: size * 0.62,
          height: size * 0.62,
          objectFit: "contain",
        }}
      />
    </div>
  );
}

/** Sapuan cahaya lembut melintas (dipakai di intro/outro). */
function LightSweep({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const p = progress(frame, at, at + 45);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(105deg, transparent 35%, rgba(255,255,255,.75) 50%, transparent 65%)",
        transform: `translateX(${interpolate(p, [0, 1], [-100, 100])}%)`,
        opacity: p > 0 && p < 1 ? 1 : 0,
        mixBlendMode: "soft-light",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
export function Intro({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const v = layout.vertical;
  const word = "Crave";
  const exit = progress(frame, DUR.intro - 30, DUR.intro, outExpo);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: jakarta,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${1 + exit * 0.06})`,
        }}
      >
        <Logo size={v ? 220 : 180} frame={frame} delay={4} />
        <div style={{ display: "flex", marginTop: v ? 56 : 44 }}>
          {word.split("").map((ch, i) => {
            const p = progress(frame, 18 + i * 3, 44 + i * 3, outExpo);
            return (
              <span
                key={i}
                style={{
                  fontSize: v ? 190 : 168,
                  fontWeight: 800,
                  letterSpacing: "-0.055em",
                  color: "#0b1530",
                  lineHeight: 1,
                  display: "inline-block",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 40}px)`,
                  filter: `blur(${(1 - p) * 18}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <Title
          title="Point of sale, *reimagined.*"
          start={40}
          align="center"
          size={v ? 64 : 54}
          style={{ marginTop: v ? 30 : 22 }}
        />
      </div>
      <LightSweep at={30} />
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
export function Overview({ layout }: { layout: Layout }) {
  const { app, hero, heroTitle, vertical } = layout;
  const cam: CamKey[] = vertical
    ? [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1, rx: 8 },
        { f: 70, x: app.width / 2, y: app.height / 2, s: 1, rx: 0 },
        { f: 180, x: 560, y: 470, s: 1.18 },
      ]
    : [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1, rx: 10 },
        { f: 70, x: app.width / 2, y: app.height / 2, s: 1, rx: 0 },
        { f: 180, x: 700, y: 480, s: 1.08 },
      ];
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          top: heroTitle.top,
          height: "auto",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <Title
          eyebrow="Introducing Crave POS"
          title={
            vertical
              ? "Your whole store, *beautifully* in sync."
              : "Your whole store, *beautifully* in sync."
          }
          subtitle={
            vertical
              ? "Checkout, payments, inventory and analytics in one elegant workspace."
              : undefined
          }
          align="center"
          size={vertical ? 84 : 70}
          start={4}
        />
      </AbsoluteFill>
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={hero}
        cam={cam}
        enter={14}
      >
        <AppShell
          path="/dashboard"
          title="Dasbor"
          subtitle="Ringkasan performa penjualan hari ini"
          width={app.width}
          height={app.height}
        >
          <Dashboard start={30} contentWidth={layout.contentWidth} />
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
function FeatureTitle({
  layout,
  eyebrow,
  title,
  subtitle,
  start,
  end,
}: {
  layout: Layout;
  eyebrow: string;
  title: string;
  subtitle: string;
  start: number;
  end?: number;
}) {
  const frame = useCurrentFrame();
  const out = end ? progress(frame, end - 14, end, outExpo) : 0;
  const { title: t, vertical } = layout;
  return (
    <div
      style={{
        position: "absolute",
        left: t.left,
        top: t.top,
        width: t.width,
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        transform: `translateY(${-out * 20}px)`,
      }}
    >
      <Title
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        start={start}
        size={vertical ? 92 : 76}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function KasirScene({ layout }: { layout: Layout }) {
  const { app, feature, vertical } = layout;
  const timeline: KasirTimeline = {
    taps: KASIR_TAPS.map((name, i) => ({ name, at: 50 + i * 22 })),
    sheetAt: 160,
    payAt: 215,
    paidAt: 290,
  };

  // posisi kartu produk (untuk fokus kamera) — mengikuti grid pos-system
  const cols = layout.kasirCols;
  const cardW = (layout.contentWidth - (cols - 1) * 12) / cols;
  const cardCenter = (name: string) => {
    const i = products.findIndex((p) => p.name === name);
    return {
      x: 288 + 24 + (i % cols) * (cardW + 12) + cardW / 2,
      y: 214 + Math.floor(i / cols) * 152 + 70,
    };
  };
  const a = cardCenter(KASIR_TAPS[0]!);
  const b = cardCenter(KASIR_TAPS[2]!);
  const sheetX = app.width - 210;

  const cam: CamKey[] = [
    { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
    { f: 36, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, s: vertical ? 1.45 : 1.5 },
    {
      f: 122,
      x: (a.x + b.x) / 2 + 30,
      y: (a.y + b.y) / 2 + 30,
      s: vertical ? 1.38 : 1.42,
    },
    {
      f: 150,
      x: 288 + (app.width - 288) / 2,
      y: app.height - 160,
      s: vertical ? 1.4 : 1.45,
    },
    { f: 190, x: sheetX - 60, y: app.height / 2, s: vertical ? 1.15 : 1.12 },
    { f: 214, x: sheetX, y: app.height - 260, s: vertical ? 1.5 : 1.5 },
    { f: 245, x: sheetX, y: app.height / 2 - 20, s: vertical ? 1.5 : 1.5 },
    { f: 300, x: sheetX, y: app.height / 2 - 40, s: vertical ? 1.75 : 1.75 },
    { f: 390, x: sheetX, y: app.height / 2 - 40, s: vertical ? 1.85 : 1.85 },
  ];

  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="02 · Checkout"
        title="Ring up orders in *seconds.*"
        subtitle="Tap products, build the cart and check out without friction."
        start={8}
        end={200}
      />
      <FeatureTitle
        layout={layout}
        eyebrow="03 · Payments"
        title="QRIS, verified in *real time.*"
        subtitle="Every payment is matched automatically the moment it lands."
        start={204}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
        enter={0}
      >
        <AppShell
          path="/"
          title="Kasir"
          subtitle="Kamis, 13 Agustus 2026 · Shift pagi"
          actions={kasirActions}
          width={app.width}
          height={app.height}
        >
          <Kasir
            timeline={timeline}
            columns={layout.kasirCols}
            appWidth={app.width}
            appHeight={app.height}
          />
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
export function DashboardScene({ layout }: { layout: Layout }) {
  const { app, feature, vertical } = layout;
  const cam: CamKey[] = vertical
    ? [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
        { f: 50, x: 690, y: 210, s: 1.55 },
        { f: 110, x: 600, y: 470, s: 1.5 },
        { f: 160, x: 930, y: 470, s: 1.6 },
        { f: 210, x: 680, y: 720, s: 1.15 },
      ]
    : [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
        { f: 50, x: 790, y: 210, s: 1.6 },
        { f: 110, x: 650, y: 430, s: 1.5 },
        { f: 160, x: 1190, y: 440, s: 1.65 },
        { f: 210, x: 880, y: 700, s: 1.2 },
      ];
  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="04 · Analytics"
        title="Know your numbers, *live.*"
        subtitle="Revenue, trends and best-sellers update with every single sale."
        start={6}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
      >
        <AppShell
          path="/dashboard"
          title="Dasbor"
          subtitle="Ringkasan performa penjualan hari ini"
          width={app.width}
          height={app.height}
        >
          <Dashboard start={18} contentWidth={layout.contentWidth} />
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
export function StokScene({ layout }: { layout: Layout }) {
  const { app, feature, vertical } = layout;
  // frame komponen Stok = frame scene - 10
  const tapAt = 94;
  const openAt = 100;
  const cam: CamKey[] = vertical
    ? [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
        { f: 45, x: 640, y: 360, s: 1.5 },
        { f: 86, x: 760, y: 120, s: 1.5 },
        { f: 120, x: app.width / 2, y: app.height / 2, s: 1.5 },
        { f: 228, x: app.width / 2, y: app.height / 2, s: 1.55 },
        { f: 250, x: 500, y: 380, s: 1.6 },
        { f: 300, x: 600, y: 500, s: 1.3 },
      ]
    : [
        { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
        { f: 45, x: 640, y: 330, s: 1.55 },
        { f: 86, x: 900, y: 120, s: 1.5 },
        { f: 120, x: app.width / 2, y: app.height / 2, s: 1.45 },
        { f: 228, x: app.width / 2, y: app.height / 2, s: 1.5 },
        { f: 250, x: 560, y: 360, s: 1.6 },
        { f: 300, x: 680, y: 440, s: 1.3 },
      ];
  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="05 · Inventory"
        title="Inventory that *watches itself.*"
        subtitle="Low-stock alerts and one-tap reorders keep your shelves full."
        start={6}
        end={108}
      />
      <FeatureTitle
        layout={layout}
        eyebrow="06 · Products"
        title="New products, *ready to sell.*"
        subtitle="Add price, stock and supplier once and it is on the register instantly."
        start={112}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
      >
        <AppShell
          path="/stok"
          title="Stok Barang"
          subtitle={`${products.length} produk aktif · ${stokLowCount} perlu restok`}
          actions={<StokActions start={10} tapAt={tapAt} />}
          width={app.width}
          height={app.height}
        >
          <Stok start={10} columns={layout.stokCols} addFlow={{ openAt }} />
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll menu samping: kamera meluncur di sidebar, menu aktif mengikuti */
/* ------------------------------------------------------------------ */
const NAV_ITEMS: { path: string; y: number }[] = [
  { path: "/", y: 154 },
  { path: "/dashboard", y: 198 },
  { path: "/stok", y: 242 },
  { path: "/laporan", y: 334 },
  { path: "/penjualan-harian", y: 378 },
  { path: "/kartu-stok", y: 422 },
  { path: "/spreadsheet", y: 466 },
  { path: "/pengeluaran", y: 510 },
  { path: "/perencana", y: 554 },
  { path: "/supplier", y: 631 },
  { path: "/kategori", y: 675 },
  { path: "/pengaturan", y: 719 },
  { path: "/karyawan", y: 763 },
  { path: "/bantuan", y: 807 },
  { path: "/info", y: 851 },
];

export function SideNavScene({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const { app, feature } = layout;
  const cam: CamKey[] = [
    { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
    { f: 30, x: 144, y: 198, s: 2.6 },
    { f: 62, x: 144, y: 340, s: 2.6 },
    { f: 96, x: 144, y: 560, s: 2.6 },
    { f: 126, x: 144, y: 810, s: 2.6 },
    { f: 152, x: 144, y: 160, s: 2.6 },
    { f: 186, x: app.width / 2, y: app.height / 2, s: 1 },
  ];
  // menu aktif = item terdekat dengan pusat kamera (scroll-spy)
  const camY = camAt(frame, cam).y;
  const nearest = NAV_ITEMS.reduce((a, b) =>
    Math.abs(b.y - camY) < Math.abs(a.y - camY) ? b : a,
  );
  const path = frame < 26 ? "/dashboard" : frame >= 150 ? "/" : nearest.path;
  const showKasir = frame >= 150;

  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="01 · Navigation"
        title="Every tool, *one tap away.*"
        subtitle="Sales, stock, reports and suppliers, organised in one calm and focused sidebar."
        start={6}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
      >
        <AppShell
          path={path}
          title={showKasir ? "Kasir" : "Dasbor"}
          subtitle={
            showKasir
              ? "Kamis, 13 Agustus 2026 · Shift pagi"
              : "Ringkasan performa penjualan hari ini"
          }
          actions={showKasir ? kasirActions : undefined}
          width={app.width}
          height={app.height}
        >
          {showKasir ? (
            <Kasir
              start={-60}
              timeline={{
                taps: [{ name: KASIR_TAPS[0]!, at: 99999 }],
                sheetAt: 99999,
                payAt: 99999,
                paidAt: 99999,
              }}
              columns={layout.kasirCols}
              appWidth={app.width}
              appHeight={app.height}
            />
          ) : (
            <Dashboard start={-300} contentWidth={layout.contentWidth} />
          )}
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
export function SupplierScene({ layout }: { layout: Layout }) {
  const { app, feature, vertical } = layout;
  const cols = vertical ? 3 : 4;
  const waTapAt = 95;
  const cam: CamKey[] = [
    { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
    { f: 45, x: 560, y: 300, s: 1.6 },
    { f: 90, x: 420, y: 250, s: 2.0 },
    { f: 128, x: 420, y: 250, s: 2.05 },
    { f: 165, x: app.width / 2 + 40, y: 400, s: 1.15 },
  ];
  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="07 · Suppliers"
        title="Restock with *one message.*"
        subtitle="Every supplier is a tap away. Reorder straight from WhatsApp."
        start={6}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
      >
        <AppShell
          path="/supplier"
          title="Manajemen Supplier"
          subtitle={`${SUPPLIERS.length} supplier terdaftar`}
          actions={supplierActions}
          width={app.width}
          height={app.height}
        >
          <Supplier start={6} columns={cols} waTapAt={waTapAt - 6} />
        </AppShell>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/* Spreadsheet: Workbook asli (fortune-sheet) + sorotan sel & rumus     */
/* ------------------------------------------------------------------ */
const SHEET = {
  colF: { x: 883, w: 130 },
  rowY: (r: number) => 174 + (r - 1) * 20,
  fx: { x: 456, y: 128, w: 960, h: 26 },
};

function SheetHighlights() {
  const frame = useCurrentFrame();
  const grow = progress(frame, 70, 108, outExpo);
  const formula = "=SUM(F2:F13)";
  const typedLen = Math.max(
    0,
    Math.min(formula.length, Math.floor((frame - 108) / 2) + 1),
  );
  const onTotal = frame >= 140;
  const pulse = interpolate(frame, [140, 150, 175], [0, 1, 0], clamp);
  const selTop = onTotal ? SHEET.rowY(SHEET_TOTAL_ROW + 1) : SHEET.rowY(2);
  const selH = onTotal ? 20 : Math.max(20, 20 * 12 * grow);
  if (frame < 66) return null;
  return (
    <>
      {/* seleksi sel (gaya fortune-sheet: biru #0188fb) */}
      <div
        className="pointer-events-none absolute z-50"
        style={{
          left: SHEET.colF.x,
          top: selTop,
          width: SHEET.colF.w,
          height: selH,
          border: "2px solid #0188fb",
          background: onTotal
            ? `rgba(1,136,251,${0.08 + pulse * 0.15})`
            : "rgba(1,136,251,0.12)",
          boxShadow:
            pulse > 0
              ? `0 0 0 ${pulse * 6}px rgba(1,136,251,${0.25 * pulse})`
              : undefined,
        }}
      />
      {frame >= 108 ? (
        <div
          className="pointer-events-none absolute z-50 flex items-center bg-white px-2 text-[13px] text-slate-800"
          style={{
            left: SHEET.fx.x,
            top: SHEET.fx.y,
            width: SHEET.fx.w,
            height: SHEET.fx.h,
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span style={{ color: "#0188fb" }}>{formula.slice(0, typedLen)}</span>
          <span
            className="ml-px h-4 w-px bg-slate-800"
            style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}
          />
        </div>
      ) : null}
    </>
  );
}

export function SpreadsheetScene({ layout }: { layout: Layout }) {
  const { app, feature } = layout;
  const cam: CamKey[] = [
    { f: 0, x: app.width / 2, y: app.height / 2, s: 1 },
    { f: 45, x: 680, y: 300, s: 1.5 },
    { f: 90, x: 880, y: 300, s: 1.8 },
    { f: 130, x: 820, y: 230, s: 1.75 },
    { f: 160, x: 900, y: 420, s: 1.9 },
    { f: 195, x: 760, y: 420, s: 1.3 },
  ];
  return (
    <AbsoluteFill>
      <FeatureTitle
        layout={layout}
        eyebrow="08 · Spreadsheet"
        title="Your reports, *Excel-ready.*"
        subtitle="Edit freely with formulas, then import or export to Excel in one click."
        start={6}
      />
      <AppWindow
        appWidth={app.width}
        appHeight={app.height}
        box={feature}
        cam={cam}
      >
        <AppShell
          path="/spreadsheet"
          title="Spreadsheet Data"
          subtitle="Bebas mengedit dan menggunakan rumus seperti di Excel"
          actions={spreadsheetActions}
          width={app.width}
          height={app.height}
        >
          <Spreadsheet height={app.height - 140} />
        </AppShell>
        <div className="absolute inset-0">
          <SheetHighlights />
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
export function Outro({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const v = layout.vertical;
  const ring = progress(frame, 0, 90, outExpo);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: jakarta,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: "1.5px solid rgba(37,99,235,.18)",
          transform: `scale(${0.4 + ring * 0.8})`,
          opacity: interpolate(ring, [0, 0.2, 1], [0, 1, 0], clamp),
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Logo size={v ? 180 : 150} frame={frame} delay={2} />
        <Title
          title="Sell smarter. *Grow faster.*"
          subtitle="Crave — the point of sale for growing businesses."
          start={14}
          align="center"
          size={v ? 96 : 92}
          style={{ marginTop: v ? 60 : 48 }}
        />
        <div
          style={{
            marginTop: 44,
            padding: "18px 34px",
            borderRadius: 999,
            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
            color: "white",
            fontWeight: 700,
            fontSize: v ? 34 : 28,
            boxShadow:
              "0 18px 40px -12px rgba(37,99,235,.6), inset 0 1px 0 rgba(255,255,255,.35)",
            opacity: progress(frame, 56, 80, outExpo),
            transform: `translateY(${(1 - progress(frame, 56, 80, outExpo)) * 20}px)`,
          }}
        >
          Start selling with Crave
        </div>
      </div>
      <LightSweep at={60} />
    </AbsoluteFill>
  );
}
