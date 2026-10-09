import "./style.css";
import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { Ambient, Grain } from "./lib/cinema";
import { smooth } from "./lib/motion";
import { zoomBlur } from "./lib/transitions";
import { LANDSCAPE, VERTICAL } from "./lib/layout";
import {
  DUR,
  TRANSITION,
  Intro,
  Overview,
  SideNavScene,
  KasirScene,
  DashboardScene,
  StokScene,
  SupplierScene,
  SpreadsheetScene,
  Outro,
} from "./scenes/Scenes";

export const PROMO_DURATION =
  DUR.intro +
  DUR.overview +
  DUR.sidenav +
  DUR.kasir +
  DUR.dashboard +
  DUR.stok +
  DUR.supplier +
  DUR.sheet +
  DUR.outro -
  8 * TRANSITION;

export type PromoProps = { vertical: boolean };

export function Promo({ vertical }: PromoProps) {
  const layout = vertical ? VERTICAL : LANDSCAPE;
  const timing = linearTiming({ durationInFrames: TRANSITION, easing: smooth });

  const scenes = (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={DUR.intro}>
        <Intro layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.overview}>
        <Overview layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.sidenav}>
        <SideNavScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.kasir}>
        <KasirScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.dashboard}>
        <DashboardScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.stok}>
        <StokScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.supplier}>
        <SupplierScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.sheet}>
        <SpreadsheetScene layout={layout} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomBlur()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={DUR.outro}>
        <Outro layout={layout} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );

  return (
    <AbsoluteFill>
      <Ambient />
      {/* motion blur kamera ada di AppWindow (berbasis kecepatan), transisi pakai zoom-blur */}
      {scenes}
      <Grain />
    </AbsoluteFill>
  );
}
