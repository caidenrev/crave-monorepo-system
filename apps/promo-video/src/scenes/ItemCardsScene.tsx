import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AppFrame } from "../ui/AppFrame";
import { ReplicatedCashier } from "../components/ReplicatedCashier";
import { ReplicatedSidebar } from "../components/ReplicatedSidebar";
import { DigitalCursor } from "../ui/DigitalCursor";
import { BlurText } from "../ui/BlurText";
import { Sparkles } from "lucide-react";
import { VIDEO_CONFIG } from "../config";

export const ItemCardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const translateY = interpolate(enterProgress, [0, 1], [140, 0]);
  const opacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const blur = interpolate(enterProgress, [0, 1], [12, 0]);

  // Click & Pick Animation timeline
  // Frame 35: Cursor moves to "Es Kopi Susu" (+) button
  // Frame 45: Click action happens (cursor click pulse)
  // Frame 50+: Cart items updated from 1 item to 2 items
  const isItemPicked = frame >= 45;

  const cursorX = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 100 } }),
    [0, 1],
    [200, 360]
  );
  const cursorY = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 18, stiffness: 100 } }),
    [0, 1],
    [320, 230]
  );

  const cartState = isItemPicked
    ? [
        { product: VIDEO_CONFIG.copy.products[0], qty: 2 }, // Es Kopi Susu x2 = 36.000
        { product: VIDEO_CONFIG.copy.products[2], qty: 1 }, // Croissant = 25.000
      ]
    : [
        { product: VIDEO_CONFIG.copy.products[0], qty: 1 }, // Es Kopi Susu x1 = 18.000
        { product: VIDEO_CONFIG.copy.products[2], qty: 1 }, // Croissant = 25.000
      ];

  return (
    <div className="relative w-full h-full bg-ambient-gradient flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Headline */}
      <div className="relative z-20 text-center max-w-xl mx-auto space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-soft text-xs font-bold text-[#2563EB]">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Kasir Cepat & Responsif</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          <BlurText text="Input Menu & Struk Otomatis" delay={5} />
        </h2>
      </div>

      {/* Hero POS Cashier UI Frame */}
      <div
        className="relative z-10 w-full max-w-5xl mx-auto my-auto"
        style={{
          filter: `blur(${blur}px)`,
        }}
      >
        <AppFrame
          url="pos.crave.id/kasir"
          scale={0.96}
          translateY={translateY}
          opacity={opacity}
        >
          <div className="relative flex h-[480px] sm:h-[530px]">
            {/* Left Sidebar */}
            <div className="hidden md:block">
              <ReplicatedSidebar activeItem="Kasir" />
            </div>

            {/* Cashier View */}
            <div className="flex-1 overflow-hidden">
              <ReplicatedCashier
                cartItems={cartState}
                highlightedProductId={frame >= 35 && frame <= 65 ? "p1" : undefined}
              />
            </div>

            {/* Digital Cursor Interaction */}
            {frame >= 15 && frame <= 85 && (
              <DigitalCursor
                x={cursorX}
                y={cursorY}
                clickFrame={45}
                label="+ Tambah Menu"
              />
            )}
          </div>
        </AppFrame>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-20 text-center pb-2">
        <span className="text-xs font-semibold text-[#64748B]">
          Kalkulasi Pajak & Diskon Akurat Otomatis dalam 1 Ketukan
        </span>
      </div>
    </div>
  );
};
