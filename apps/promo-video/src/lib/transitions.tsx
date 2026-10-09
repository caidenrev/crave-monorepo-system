import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill } from "remotion";

type Props = Record<string, never>;

/** Transisi sinematik: scene lama mundur & blur, scene baru maju dari depan & menajam. */
function ZoomBlur({
  children,
  presentationDirection,
  presentationProgress: p,
}: TransitionPresentationComponentProps<Props>) {
  const entering = presentationDirection === "entering";
  const style = entering
    ? {
        opacity: p,
        transform: `scale(${1.07 - 0.07 * p})`,
        filter: `blur(${(1 - p) * 18}px)`,
      }
    : {
        opacity: 1 - p,
        transform: `scale(${1 - 0.06 * p})`,
        filter: `blur(${p * 18}px)`,
      };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
}

export const zoomBlur = (): TransitionPresentation<Props> => ({
  component: ZoomBlur,
  props: {},
});
