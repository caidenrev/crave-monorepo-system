import { Composition } from "remotion";
import { Promo, PROMO_DURATION, type PromoProps } from "./Promo";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="CravePromo-Landscape"
        component={Promo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ vertical: false } satisfies PromoProps}
      />
      <Composition
        id="CravePromo-Vertical"
        component={Promo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ vertical: true } satisfies PromoProps}
      />
    </>
  );
}
