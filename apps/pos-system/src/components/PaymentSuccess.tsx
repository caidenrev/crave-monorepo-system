import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { playCashierSound } from "@/lib/cashier-sound";

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#22c55e", "#a3e635", "#fbbf24"];

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: "dot" | "square" | "spark";
  rotate: number;
  delay: number;
  duration: number;
};

function makeBurst(
  count: number,
  minDist: number,
  maxDist: number,
  delay: number,
  idOffset: number,
) {
  return Array.from({ length: count }, (_, i): Particle => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = minDist + Math.random() * (maxDist - minDist);
    const r = Math.random();
    return {
      id: idOffset + i,
      x: Math.cos(angle) * dist,
      // sedikit jatuh ke bawah, seperti confetti kena gravitasi
      y: Math.sin(angle) * dist + 30 + Math.random() * 30,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      shape: r < 0.45 ? "dot" : r < 0.8 ? "square" : "spark",
      rotate: (Math.random() - 0.5) * 540,
      delay: delay + Math.random() * 0.08,
      duration: 0.9 + Math.random() * 0.5,
    };
  });
}

function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.9,
      delay: 0.35,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);
  return <>{format(shown)}</>;
}

export function PaymentSuccess({
  amount,
  format,
  description = "Transaksi telah terverifikasi dan stok otomatis terpotong.",
}: {
  amount: number;
  format: (n: number) => string;
  /** keterangan di bawah nominal */
  description?: string | undefined;
}) {
  const reduce = useReducedMotion();
  const particles = useMemo(
    () => (reduce ? [] : [...makeBurst(26, 70, 150, 0.18, 0), ...makeBurst(16, 40, 95, 0.42, 100)]),
    [reduce],
  );

  const playedRef = useRef(false);
  useEffect(() => {
    if (playedRef.current) return; // StrictMode menjalankan effect dua kali di dev
    playedRef.current = true;
    playCashierSound();
    try {
      navigator.vibrate?.([30, 60, 50]);
    } catch {
      // perangkat tidak mendukung getar
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-5">
      <div className="relative flex size-40 items-center justify-center">
        {/* gelombang cincin */}
        {!reduce &&
          [0, 0.25, 0.5].map((d) => (
            <motion.span
              key={d}
              className="absolute size-20 rounded-full border-2 border-emerald-400"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{
                duration: 1.4,
                delay: 0.15 + d,
                ease: "easeOut",
                repeat: 1,
                repeatDelay: 0.6,
              }}
            />
          ))}

        {/* glow lembut */}
        <motion.span
          className="absolute size-28 rounded-full bg-emerald-400/30 blur-xl"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.3, 1], opacity: [0, 1, 0.6] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {/* partikel */}
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute"
            style={{
              width: p.shape === "spark" ? p.size * 0.45 : p.size,
              height: p.shape === "spark" ? p.size * 1.8 : p.size,
              background: p.color,
              borderRadius: p.shape === "dot" ? 999 : 2,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 1, 0.6],
              opacity: [1, 1, 1, 0],
              rotate: p.rotate,
            }}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
          />
        ))}

        {/* lingkaran + ceklis */}
        <motion.div
          className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/40"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <svg viewBox="0 0 24 24" className="size-11" fill="none" aria-hidden="true">
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="white"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="space-y-1.5 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Pembayaran Berhasil!
        </h3>
        <p className="text-2xl font-extrabold tabular-nums text-emerald-600">
          <CountUp value={amount} format={format} />
        </p>
        <p className="mx-auto max-w-[240px] text-xs text-slate-500">{description}</p>
      </motion.div>
    </div>
  );
}
