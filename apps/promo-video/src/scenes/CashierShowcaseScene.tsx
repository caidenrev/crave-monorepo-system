import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MockupDevice } from "../components/MockupDevice";
import { BadgePill } from "../components/BadgePill";
import { GlowAura } from "../components/GlowAura";
import { AnimatedCounter } from "../components/AnimatedCounter";
import {
  ShoppingCart,
  Plus,
  Coffee,
  Utensils,
  Check,
  Zap,
} from "lucide-react";

export const CashierShowcaseScene: React.FC<{ isVertical?: boolean }> = ({
  isVertical = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [-30, 0]);

  // Simulated items added to cart at specific frames
  const item1Added = frame > 40;
  const item2Added = frame > 75;
  const item3Added = frame > 110;

  let totalCartAmount = 0;
  let cartCount = 0;
  if (item1Added) {
    totalCartAmount += 28000;
    cartCount += 1;
  }
  if (item2Added) {
    totalCartAmount += 35000;
    cartCount += 2;
  }
  if (item3Added) {
    totalCartAmount += 32000;
    cartCount += 3;
  }

  // Cursor click animation coordinates
  const cursorX = interpolate(
    frame,
    [25, 40, 60, 75, 95, 110],
    [30, 32, 55, 57, 75, 77],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [25, 40, 60, 75, 95, 110],
    [45, 47, 45, 47, 45, 47],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorClick =
    (frame >= 38 && frame <= 44) ||
    (frame >= 73 && frame <= 79) ||
    (frame >= 108 && frame <= 114);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 text-white">
      <GlowAura color="#2563eb" size={450} className="top-10" />

      {/* Header Headline */}
      <div
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}
        className="text-center space-y-2 z-10"
      >
        <BadgePill
          icon={<Zap className="size-3.5 text-amber-400" />}
          text="FITUR KASIR TERCEPAT"
          highlight
        />
        <h2
          className={`font-black tracking-tight ${
            isVertical ? "text-4xl" : "text-5xl"
          }`}
        >
          Sentuh, Pilih, &amp; Checkout <span className="text-blue-400">Dalam 3 Detik</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Antarmuka responsif ramah kasir dengan perhitungan pajak, diskon, &amp; stok real-time otomatis.
        </p>
      </div>

      {/* POS Device Showcase */}
      <div className="w-full max-w-4xl my-auto z-10">
        <MockupDevice type={isVertical ? "mobile" : "tablet"} tilt delay={10}>
          <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 min-h-[360px] grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Products Grid (2 Cols) */}
            <div className="md:col-span-2 space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold">
                  Semua Menu
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400">
                  Coffee
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400">
                  Pastry
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400">
                  Main Course
                </span>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Item 1 */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    item1Added
                      ? "bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-500/20"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <Coffee className="size-4" />
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Stok: 42
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold truncate">Iced Americano</p>
                    <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                      Rp 28.000
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    item2Added
                      ? "bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-500/20"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Utensils className="size-4" />
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Stok: 18
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold truncate">Almond Croissant</p>
                    <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                      Rp 35.000
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    item3Added
                      ? "bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-500/20"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Coffee className="size-4" />
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Stok: 25
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold truncate">Matcha Latte</p>
                    <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                      Rp 32.000
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary Panel (1 Col) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <ShoppingCart className="size-3.5 text-blue-400" /> Keranjang
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  {cartCount} Item
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 flex-1">
                {item1Added && (
                  <div className="flex justify-between items-center py-1">
                    <span>1x Iced Americano</span>
                    <span className="font-mono font-bold">28.000</span>
                  </div>
                )}
                {item2Added && (
                  <div className="flex justify-between items-center py-1">
                    <span>1x Almond Croissant</span>
                    <span className="font-mono font-bold">35.000</span>
                  </div>
                )}
                {item3Added && (
                  <div className="flex justify-between items-center py-1">
                    <span>1x Matcha Latte</span>
                    <span className="font-mono font-bold">32.000</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Bayar</span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    Rp {totalCartAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full py-2.5 rounded-xl bg-blue-600 font-bold text-xs text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                  <span>Lanjut Pembayaran</span>
                </div>
              </div>
            </div>
          </div>
        </MockupDevice>
      </div>

      {/* Floating features footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 z-10">
        <BadgePill delay={30} text="🖨️ Thermal Bluetooth Printer" />
        <BadgePill delay={45} text="⚡ Auto Deduct Stock" highlight />
        <BadgePill delay={60} text="💵 Cash / QRIS / Transfer" />
      </div>
    </div>
  );
};
