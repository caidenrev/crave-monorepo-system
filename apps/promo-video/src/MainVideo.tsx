import React from "react";
import {
  TransitionSeries,
  springTiming,
} from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";

import { FastHookScene } from "./scenes/FastHookScene";
import { FastDashboardScene } from "./scenes/FastDashboardScene";
import { FastSideNavScene } from "./scenes/FastSideNavScene";
import { FastCashierScene } from "./scenes/FastCashierScene";
import { FastOutroScene } from "./scenes/FastOutroScene";

export const MainVideo: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#F8FAFC]">
      <TransitionSeries>
        {/* Scene 1: Signature 2-Second Crave POS Blue Layered Opening */}
        <TransitionSeries.Sequence durationInFrames={60}>
          <FastHookScene />
        </TransitionSeries.Sequence>

        {/* Transition 1 -> 2 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 15, stiffness: 180 } })}
        />

        {/* Scene 2: 3D Menyorong Dashboard & Card Stok 3D Lift (Detik 2-5) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <FastDashboardScene />
        </TransitionSeries.Sequence>

        {/* Transition 2 -> 3 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 14, stiffness: 180 } })}
        />

        {/* Scene 3: Rapid Static-Menu Hover Tracking & 3D Slanted Spreadsheet (Detik 5-10) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <FastSideNavScene />
        </TransitionSeries.Sequence>

        {/* Transition 3 -> 4 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 14, stiffness: 180 } })}
        />

        {/* Scene 4: Full Crave POS Cashier, Floating Bar, Sheet Drawer & QRIS Settlement (Detik 10-20) */}
        <TransitionSeries.Sequence durationInFrames={325}>
          <FastCashierScene />
        </TransitionSeries.Sequence>

        {/* Transition 4 -> 5 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 14, stiffness: 180 } })}
        />

        {/* Scene 5: High-Energy 3D Device Outro & Interactive Morph CTA (Detik 20-30) */}
        <TransitionSeries.Sequence durationInFrames={305}>
          <FastOutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </div>
  );
};
