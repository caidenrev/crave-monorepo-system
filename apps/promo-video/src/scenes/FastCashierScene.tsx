import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CashierFullExact } from "../components/CashierFullExact";
import { DigitalCursor } from "../ui/DigitalCursor";
import { Zap } from "lucide-react";

export const FastCashierScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Full Flow Timeline (240 frames / 8.0s):
  // Frame 0-35: Zoom in on "Es Tejus" Card (scale: 1.75, panX: 280, panY: 140)
  // Frame 35: Click "+" on "Es Tejus" -> Product card lifts up high in 3D!
  // Frame 45-75: Fast pan & zoom down to "Lanjut Bayar" Bar (scale: 1.85, panX: 40, panY: -250)
  // Frame 75: Click "Lanjut Bayar" -> Bar lifts up high in 3D!
  // Frame 80+: Full-height Sheet opens on right -> Camera pans to Payment Sheet (scale: 1.55, panX: -380, panY: 0)
  // Frame 105: Cursor clicks "Bayar QRIS Rp1.110" (green button)
  // Frame 115: Sheet switches to QRIS Payment with dense QR Code
  // Frame 130+: (2 Seconds Faster!) Instant ShopeePay settlement & Clean Green Checkmark celebration (QR code unmounted)!

  const isProductClicked = frame >= 35 && frame < 55;
  const isProductLifted = frame >= 35 && frame < 65;
  const isLanjutBayarClicked = frame >= 75 && frame < 85;
  const isLanjutBayarLifted = frame >= 65 && frame < 85;
  const sheetOpen = frame >= 80;
  const sheetStep = frame >= 115 ? "qris" : "cart";
  const isBayarQrisClicked = frame >= 105 && frame < 115;
  const isQrisPaid = frame >= 130; // 2 Seconds faster settlement as requested!

  // Exact 3D Slanted Angle
  const tiltX = 14;
  const tiltY = -8;

  // Intense Close-up Camera Zoom & Pan Timeline
  let zoomScale = 1.65;
  let panX = 260;
  let panY = 120;

  if (frame < 50) {
    // Stage 1: Big zoom on Product "Es Tejus"
    const p1 = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
    zoomScale = interpolate(p1, [0, 1], [1.2, 1.75]);
    panX = interpolate(p1, [0, 1], [100, 280]);
    panY = interpolate(p1, [0, 1], [40, 130]);
  } else if (frame < 85) {
    // Stage 2: Fast zoom punch down to "Lanjut Bayar" Floating Bar
    const p2 = spring({ frame: frame - 50, fps, config: { damping: 15, stiffness: 150 } });
    zoomScale = interpolate(p2, [0, 1], [1.75, 1.88]);
    panX = interpolate(p2, [0, 1], [280, 40]);
    panY = interpolate(p2, [0, 1], [130, -250]);
  } else {
    // Stage 3: Smooth big zoom on Right Payment Sheet & QRIS
    const p3 = spring({ frame: frame - 85, fps, config: { damping: 15, stiffness: 140 } });
    zoomScale = interpolate(p3, [0, 1], [1.88, 1.55]);
    panX = interpolate(p3, [0, 1], [40, -380]);
    panY = interpolate(p3, [0, 1], [-250, 0]);
  }

  // Exact Cursor Position targeting each button cleanly
  let cursorX = 520;
  let cursorY = 380;
  let clickFrame = 35;
  let cursorLabel = "+ Tambah";

  if (frame >= 45 && frame < 90) {
    cursorX = interpolate(
      spring({ frame: frame - 45, fps, config: { damping: 15, stiffness: 140 } }),
      [0, 1],
      [520, 690]
    );
    cursorY = interpolate(
      spring({ frame: frame - 45, fps, config: { damping: 15, stiffness: 140 } }),
      [0, 1],
      [380, 640]
    );
    clickFrame = 75;
    cursorLabel = "Lanjut Bayar ➔";
  } else if (frame >= 90) {
    cursorX = interpolate(
      spring({ frame: frame - 90, fps, config: { damping: 15, stiffness: 140 } }),
      [0, 1],
      [690, 840]
    );
    cursorY = interpolate(
      spring({ frame: frame - 90, fps, config: { damping: 15, stiffness: 140 } }),
      [0, 1],
      [640, 650]
    );
    clickFrame = 105;
    cursorLabel = "Bayar QRIS";
  }

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] flex flex-col items-center justify-center select-none overflow-hidden p-4 font-sans perspective-1200">
      {/* Background Ambience */}
      <div className="absolute w-[900px] h-[700px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Active Feature Banner */}
      <div className="absolute top-6 z-40 flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-soft-lg text-xs font-black text-[#2563EB]">
        <Zap className="w-4 h-4 fill-[#2563EB]" />
        <span>KASIR KILAT ➔ 3D LIFT PRODUK & LANJUT BAYAR</span>
      </div>

      {/* Full App Viewport with Big Close-up Zoom & 3D Slanted Angle */}
      <div className="relative z-10 flex items-center justify-center transform-style-3d">
        <CashierFullExact
          sheetOpen={sheetOpen}
          sheetStep={sheetStep}
          isProductClicked={isProductClicked}
          isProductLifted={isProductLifted}
          isLanjutBayarClicked={isLanjutBayarClicked}
          isLanjutBayarLifted={isLanjutBayarLifted}
          isBayarQrisClicked={isBayarQrisClicked}
          isQrisPaid={isQrisPaid}
          zoomScale={zoomScale}
          panX={panX}
          panY={panY}
          tiltX={tiltX}
          tiltY={tiltY}
        />

        {/* Digital Cursor Clicking Timeline */}
        {frame >= 15 && frame <= 135 && (
          <DigitalCursor
            x={cursorX}
            y={cursorY}
            clickFrame={clickFrame}
            label={cursorLabel}
          />
        )}
      </div>
    </div>
  );
};
