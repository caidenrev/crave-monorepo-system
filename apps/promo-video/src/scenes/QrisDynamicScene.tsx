import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlowAura } from "../components/GlowAura";
import { BadgePill } from "../components/BadgePill";
import {
  QrCode,
  ShieldCheck,
  Check,
  Sparkles,
  Smartphone,
  Zap,
} from "lucide-react";

export const QrisDynamicScene: React.FC<{ isVertical?: boolean }> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene state timings
  // 0 - 65 frames: QRIS Display & Scanning Laser
  // 65 - 190 frames: Success trigger & celebration
  const isSuccess = frame >= 65;

  // Scanner beam position (0 - 65 frames)
  const laserY = interpolate(frame, [10, 60], [10, 90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Success Pop Spring
  const checkSpring = spring({
    frame: frame - 65,
    fps,
    config: { damping: 10, stiffness: 140, mass: 0.5 },
  });

  const checkScale = interpolate(checkSpring, [0, 1], [0, 1]);
  const checkPulse = 1 + Math.sin((frame - 65) / 10) * 0.05;

  // Notification slide down
  const notifSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const notifY = interpolate(notifSpring, [0, 1], [-80, 0]);
  const notifOpacity = interpolate(notifSpring, [0, 1], [0, 1]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 text-white">
      <GlowAura
        color={isSuccess ? "#10b981" : "#3b82f6"}
        size={550}
        className="top-1/3"
      />

      {/* Header */}
      <div className="text-center space-y-2 z-10">
        <BadgePill
          icon={<ShieldCheck className="size-3.5 text-emerald-400" />}
          text="FITUR UNGGULAN CRAVE POS"
          highlight
        />
        <h2
          className={`font-black tracking-tight ${
            isVertical ? "text-4xl" : "text-5xl"
          }`}
        >
          QRIS Dinamis Otomatis <span className="text-emerald-400">Nominal Pas</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Stiker QRIS statis UMKM otomatis diubah jadi QRIS dinamis. Pembayaran terverifikasi detik itu juga!
        </p>
      </div>

      {/* Center QRIS Card / Success Card */}
      <div className="relative my-auto z-10 flex flex-col items-center">
        {/* Floating Notification Popover (Post Success) */}
        {frame >= 75 && (
          <div
            style={{
              opacity: notifOpacity,
              transform: `translateY(${notifY}px)`,
            }}
            className="mb-4 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-700/90 border border-emerald-400/40 shadow-2xl backdrop-blur-xl flex items-center gap-3.5 text-white"
          >
            <div className="size-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="size-4 fill-emerald-600 stroke-none" />
            </div>
            <div>
              <p className="text-xs font-bold">ShopeePay Merchant Alert</p>
              <p className="text-[11px] text-emerald-100">
                Dana <span className="font-bold">Rp 95.000</span> masuk ke rekening toko Anda!
              </p>
            </div>
          </div>
        )}

        {/* QRIS / Success Window */}
        <div className="relative w-80 sm:w-96 rounded-3xl p-6 bg-slate-900/90 border border-slate-700/60 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl text-center space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-black">
                C
              </div>
              <span className="text-xs font-bold text-slate-300">Crave Merchant POS</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              QRIS DINAMIS
            </span>
          </div>

          {!isSuccess ? (
            /* QR Code Display with Laser Scanner */
            <div className="space-y-4 py-2">
              <div className="relative size-48 mx-auto rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center overflow-hidden">
                <QrCode className="size-full text-slate-900" />

                {/* Laser scan line */}
                <div
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                  style={{ top: `${laserY}%` }}
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">Total Tagihan Pelanggan</p>
                <p className="text-2xl font-black font-mono text-white tracking-tight">
                  Rp 95.000
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 animate-pulse">
                <Smartphone className="size-3.5" />
                <span>Menunggu Pelanggan Scan...</span>
              </div>
            </div>
          ) : (
            /* SUCCESS STATE - GREEN CHECKMARK CELEBRATION */
            <div className="py-6 space-y-4">
              <div
                style={{
                  transform: `scale(${checkScale * checkPulse})`,
                }}
                className="size-24 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/60 ring-8 ring-emerald-500/20"
              >
                <Check className="size-12 stroke-[3.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white text-glow-emerald">
                  Pembayaran Berhasil!
                </h3>
                <p className="text-xs text-emerald-300 font-medium">
                  Mutasi ShopeePay Terverifikasi Otomatis
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs flex justify-between items-center font-mono">
                <span className="text-slate-400">Status Stok:</span>
                <span className="text-emerald-400 font-bold">Terpotong Otomatis ✅</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 z-10">
        <BadgePill delay={20} text="🚀 Bebas Biaya Sewa EDC" />
        <BadgePill delay={35} text="⚡ Auto Webhook Settlement" highlight />
        <BadgePill delay={50} text="🔒 Anti-Fraud &amp; Validasi Instan" />
      </div>
    </div>
  );
};
