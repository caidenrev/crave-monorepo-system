/**
 * Salinan KasirPage (apps/pos-system/src/routes/index.tsx): grid produk, tombol
 * "Lanjut Bayar", Sheet keranjang, tampilan QRIS, dan PaymentSuccess.
 * Interaksi (tap produk, buka sheet, bayar) digerakkan oleh frame video.
 */
import {
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import QRCode from "react-qr-code";
import {
  Search,
  Plus,
  Minus,
  ScanLine,
  ShoppingCart,
  ArrowRight,
  Trash2,
  QrCode,
  CreditCard,
  Wallet,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { products, rupiah, type CartLine } from "@/lib/pos-data";
import { clamp, outExpo, progress, smooth } from "../lib/motion";

const payments = [
  { key: "QRIS", icon: QrCode },
  { key: "Kartu", icon: CreditCard },
  { key: "Tunai", icon: Wallet },
] as const;

const byName = (n: string) => products.find((p) => p.name === n)!;

export type KasirTimeline = {
  /** frame tap produk (relatif terhadap start) */
  taps: { name: string; at: number }[];
  sheetAt: number;
  payAt: number;
  paidAt: number;
};

export const KASIR_TAPS = [
  "Es Kopi Susu",
  "Croissant Butter",
  "Matcha Latte",
  "Es Kopi Susu",
];

function Ripple({
  at,
  frame,
  color = "rgba(37,99,235,.18)",
}: {
  at: number;
  frame: number;
  color?: string;
}) {
  if (frame < at || frame > at + 20) return null;
  const p = progress(frame, at, at + 20, outExpo);
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: 260,
        height: 260,
        marginLeft: -130,
        marginTop: -130,
        background: color,
        transform: `scale(${0.1 + p})`,
        opacity: 1 - p,
      }}
    />
  );
}

/* ---------------- PaymentSuccess (versi frame) ---------------- */
const COLORS = [
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#22c55e",
  "#a3e635",
  "#fbbf24",
];

function burst(
  count: number,
  minDist: number,
  maxDist: number,
  delay: number,
  seed: string,
) {
  return Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const angle = (i / count) * Math.PI * 2 + (r("a") - 0.5) * 0.5;
    const dist = minDist + r("d") * (maxDist - minDist);
    const s = r("s");
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist + 30 + r("y") * 30,
      size: 5 + r("z") * 7,
      color: COLORS[Math.floor(r("c") * COLORS.length)]!,
      shape: s < 0.45 ? "dot" : s < 0.8 ? "square" : "spark",
      rotate: (r("r") - 0.5) * 540,
      delay: delay + r("t") * 0.08,
      duration: 0.9 + r("u") * 0.5,
    };
  });
}
const PARTICLES = [
  ...burst(26, 70, 150, 0.18, "b1"),
  ...burst(16, 40, 95, 0.42, "b2"),
];

function PaymentSuccess({ amount, frame }: { amount: number; frame: number }) {
  const { fps } = useVideoConfig();
  const t = frame / fps; // detik sejak sukses
  const circle = spring({
    frame,
    fps,
    config: { stiffness: 260, damping: 14, mass: 1 },
  });
  const check = interpolate(t, [0.25, 0.7], [0, 1], {
    ...clamp,
    easing: smooth,
  });
  const text = interpolate(t, [0.3, 0.7], [0, 1], clamp);
  const count = Math.round(
    amount *
      interpolate(t, [0.35, 1.25], [0, 1], { ...clamp, easing: outExpo }),
  );
  const glowS = interpolate(t, [0, 0.45, 0.9], [0.4, 1.3, 1], clamp);
  const glowO = interpolate(t, [0, 0.45, 0.9], [0, 1, 0.6], clamp);

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-5">
      <div className="relative flex size-40 items-center justify-center">
        {[0, 0.25, 0.5].map((d) => {
          const local = (t - 0.15 - d) % 2.0;
          const p = t < 0.15 + d ? 0 : Math.min(1, local / 1.4);
          return (
            <span
              key={d}
              className="absolute size-20 rounded-full border-2 border-emerald-400"
              style={{
                transform: `scale(${1 + p * 1.4})`,
                opacity: t < 0.15 + d ? 0 : 0.7 * (1 - p),
              }}
            />
          );
        })}
        <span
          className="absolute size-28 rounded-full bg-emerald-400/30 blur-xl"
          style={{ transform: `scale(${glowS})`, opacity: glowO }}
        />
        {PARTICLES.map((p, i) => {
          const q = interpolate(t, [p.delay, p.delay + p.duration], [0, 1], {
            ...clamp,
            easing: (v) => 1 - Math.pow(1 - v, 2.4),
          });
          const sc = interpolate(q, [0, 0.33, 0.66, 1], [0, 1.2, 1, 0.6]);
          const op = interpolate(q, [0, 0.66, 1], [1, 1, 0]);
          return (
            <span
              key={i}
              className="pointer-events-none absolute"
              style={{
                width: p.shape === "spark" ? p.size * 0.45 : p.size,
                height: p.shape === "spark" ? p.size * 1.8 : p.size,
                background: p.color,
                borderRadius: p.shape === "dot" ? 999 : 2,
                transform: `translate(${p.x * q}px, ${p.y * q}px) rotate(${p.rotate * q}deg) scale(${sc})`,
                opacity: t < p.delay ? 0 : op,
              }}
            />
          );
        })}
        <div
          className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/40"
          style={{
            transform: `scale(${circle}) rotate(${(1 - circle) * -90}deg)`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-11"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="white"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - check}
            />
          </svg>
        </div>
      </div>
      <div
        className="space-y-1.5 text-center"
        style={{ opacity: text, transform: `translateY(${(1 - text) * 12}px)` }}
      >
        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Pembayaran Berhasil!
        </h3>
        <p className="text-2xl font-extrabold tabular-nums text-emerald-600">
          {rupiah(count)}
        </p>
        <p className="mx-auto max-w-[240px] text-xs text-slate-500">
          Transaksi telah terverifikasi dan stok otomatis terpotong.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Halaman Kasir ---------------- */
export function Kasir({
  start = 0,
  timeline,
  columns,
  appWidth,
  appHeight,
}: {
  start?: number;
  timeline: KasirTimeline;
  columns: number;
  appWidth: number;
  appHeight: number;
}) {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();

  // keranjang dibangun dari tap yang sudah terjadi
  const cart: CartLine[] = [];
  for (const tap of timeline.taps) {
    if (frame < tap.at + 4) continue;
    const p = byName(tap.name);
    const line = cart.find((l) => l.product.id === p.id);
    if (line) line.qty += 1;
    else cart.push({ product: p, qty: 1 });
  }
  const subtotal = cart.reduce((a, l) => a + l.product.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;
  const finalTotal = (() => {
    const all: Record<string, number> = {};
    for (const t of timeline.taps) all[t.name] = (all[t.name] ?? 0) + 1;
    const sub = Object.entries(all).reduce(
      (a, [n, q]) => a + byName(n).price * q,
      0,
    );
    return sub + Math.round(sub * 0.11);
  })();

  const cats = ["Semua", "Minuman", "Makanan", "Snack", "Lainnya"];
  const sheet = progress(
    frame,
    timeline.sheetAt,
    timeline.sheetAt + 22,
    outExpo,
  );
  const pill = spring({
    frame: frame - (timeline.taps[0]!.at + 4),
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const step: "cart" | "qris" | "paid" =
    frame >= timeline.paidAt
      ? "paid"
      : frame >= timeline.payAt + 8
        ? "qris"
        : "cart";
  const qrisIn = progress(
    frame,
    timeline.payAt + 8,
    timeline.payAt + 26,
    outExpo,
  );
  const secsLeft = Math.max(
    0,
    600 - Math.floor(Math.max(0, frame - timeline.payAt) / fps),
  );
  const timer = `${String(Math.floor(secsLeft / 60)).padStart(2, "0")}:${String(secsLeft % 60).padStart(2, "0")}`;

  return (
    <>
      <div className="grid gap-4">
        <section className="space-y-4 min-w-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Cari produk atau ketik kode barcode"
              className="h-12 rounded-2xl border-none bg-card pl-11 shadow-soft"
            />
          </div>
          <div className="flex gap-2 pb-2">
            {cats.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={c === "Semua" ? "default" : "outline"}
                className="shrink-0 rounded-full"
              >
                {c}
              </Button>
            ))}
          </div>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {products.map((p, i) => {
              const low = p.stock <= p.minStock;
              const enter = progress(frame, 4 + i * 2, 26 + i * 2, outExpo);
              const taps = timeline.taps.filter((t) => t.name === p.name);
              const press = taps.reduce(
                (m, t) => Math.max(m, 1 - Math.abs(frame - t.at - 3) / 5),
                0,
              );
              return (
                <button
                  key={p.id}
                  className="card-soft group relative overflow-hidden flex flex-col gap-2 p-3 text-left"
                  style={{
                    opacity: enter,
                    transform: `translateY(${(1 - enter) * 26}px) scale(${1 - Math.max(0, press) * 0.04})`,
                    boxShadow: press > 0 ? "var(--shadow-soft-lg)" : undefined,
                  }}
                >
                  {taps.map((t) => (
                    <Ripple key={t.at} at={t.at} frame={frame} />
                  ))}
                  <div className="flex items-start justify-between gap-1.5">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-[10px] px-2 py-0.5"
                    >
                      {p.category}
                    </Badge>
                    <span
                      className={
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm " +
                        (low
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-success text-success-foreground")
                      }
                    >
                      {p.stock} pcs
                    </span>
                  </div>
                  <p className="line-clamp-2 min-h-10 text-sm font-bold leading-tight">
                    {p.name}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-sm font-extrabold text-primary">
                      {rupiah(p.price)}
                    </span>
                    <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Plus className="size-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Tombol "Lanjut Bayar" mengambang */}
      {cart.length > 0 && (
        <div
          className="absolute bottom-10 z-40 w-[480px]"
          style={{
            left: 288 + (appWidth - 288 - 480) / 2,
            transform: `translateY(${(1 - pill) * 140}px)`,
            opacity: Math.min(1, pill * 1.5) * (1 - sheet),
          }}
        >
          <button className="relative overflow-hidden flex h-16 w-full items-center justify-between rounded-full bg-primary p-2 pl-3">
            <Ripple
              at={timeline.sheetAt - 6}
              frame={frame}
              color="rgba(255,255,255,.25)"
            />
            <div className="flex items-center gap-3 text-primary-foreground">
              <div className="grid size-11 place-items-center rounded-2xl bg-white/20">
                <ShoppingCart className="size-5" />
              </div>
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-[11px] font-medium text-primary-foreground/90">
                  {cart.length} Item
                </span>
                <span className="text-[15px] font-bold tabular-nums">
                  {rupiah(total)}
                </span>
              </div>
            </div>
            <div className="flex h-full items-center gap-1.5 rounded-full bg-background px-5 text-sm font-extrabold text-primary shadow-sm">
              Lanjut Bayar <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      )}

      {/* Sheet keranjang (side="right") */}
      {sheet > 0 && (
        <>
          <div
            className="absolute inset-0 z-[10000] bg-black/80"
            style={{ opacity: sheet * 0.45 }}
          />
          <div
            className="absolute inset-y-0 right-0 z-[10001] flex h-full w-[420px] flex-col bg-white p-6 shadow-2xl border-l"
            style={{
              transform: `translateX(${(1 - sheet) * 100}%)`,
              height: appHeight,
            }}
          >
            <div className="flex flex-1 min-h-0 flex-col">
              {step === "cart" ? (
                <>
                  <div className="shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-extrabold text-foreground">
                          Keranjang
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Struk #POS-274051
                        </p>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 p-1">
                        <Trash2 className="size-4" /> Kosongkan
                      </button>
                    </div>
                    <Separator className="my-3" />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden pr-1">
                    <div className="space-y-2.5">
                      {cart.map((l) => (
                        <div
                          key={l.product.id}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100/80"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {l.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {rupiah(l.product.price)} × {l.qty}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700">
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-slate-800">
                              {l.qty}
                            </span>
                            <button className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 mt-auto pt-2">
                    <Separator className="my-3" />
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Pajak 11%</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(tax)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-base">
                        <span className="font-bold">Total</span>
                        <span className="font-extrabold text-blue-600 text-lg">
                          {rupiah(total)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Metode Pembayaran
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {payments.map((p) => (
                        <button
                          key={p.key}
                          className={
                            "flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-bold " +
                            (p.key === "QRIS"
                              ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "border-slate-200 bg-white text-slate-600")
                          }
                        >
                          <p.icon className="size-4.5" />
                          {p.key}
                        </button>
                      ))}
                    </div>
                    <Button
                      className="relative overflow-hidden mt-4 h-13 w-full rounded-2xl text-[15px] font-bold shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                      style={{
                        transform: `scale(${1 - Math.max(0, 1 - Math.abs(frame - timeline.payAt - 2) / 5) * 0.03})`,
                      }}
                    >
                      <Ripple
                        at={timeline.payAt}
                        frame={frame}
                        color="rgba(255,255,255,.3)"
                      />
                      <QrCode className="size-5 mr-2" />
                      Bayar QRIS {rupiah(total)}
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-1 flex-col justify-between py-1"
                  style={{ opacity: step === "qris" ? qrisIn : 1 }}
                >
                  <div className="shrink-0">
                    <div className="flex items-center justify-between">
                      {step === "qris" ? (
                        <>
                          <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground p-1">
                            <ChevronLeft className="size-4" /> Kembali ke
                            Keranjang
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {timer}
                          </span>
                        </>
                      ) : (
                        <div className="w-full text-center py-1">
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                            Konfirmasi Transaksi
                          </span>
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-2">
                    {step === "paid" ? (
                      <PaymentSuccess
                        amount={finalTotal}
                        frame={frame - timeline.paidAt}
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center w-full max-w-[280px]"
                        style={{
                          transform: `translateY(${(1 - qrisIn) * 20}px) scale(${0.96 + qrisIn * 0.04})`,
                        }}
                      >
                        <div className="text-center mb-3">
                          <p className="text-xs text-slate-500 font-medium">
                            Total Tagihan
                          </p>
                          <p className="text-2xl font-black text-blue-600 tracking-tight">
                            {rupiah(finalTotal)}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                          <QRCode
                            value={`00020101021226670016COM.CRAVE.WWW01189360091800000000000215CRAVEPOS27405154${finalTotal}5802ID5913CRAVE COFFEE6007JAKARTA6304A1B2`}
                            size={208}
                            fgColor="#0f172a"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                          <span
                            className="size-2 rounded-full bg-emerald-500"
                            style={{
                              opacity:
                                0.5 + 0.5 * Math.abs(Math.sin(frame / 8)),
                            }}
                          />
                          <span>Menunggu pembayaran pelanggan...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="shrink-0 mt-auto pt-3 space-y-2"
                    style={{ opacity: step === "paid" ? 0 : 1 }}
                  >
                    <Button className="h-12 w-full rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                      <RefreshCw className="size-4 mr-2" /> Cek Status
                      Pembayaran
                    </Button>
                    <button
                      type="button"
                      className="w-full text-center text-xs font-semibold text-slate-500 py-1"
                    >
                      Batalkan &amp; Kembali ke Keranjang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export const kasirActions = (
  <Button className="rounded-xl">
    <ScanLine className="size-4" /> <span>Scan barcode</span>
  </Button>
);
