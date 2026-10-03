import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { VIDEO_CONFIG } from "./config";
import "./styles.css";

export const Root: React.FC = () => {
  return (
    <>
      {/* 9:16 Vertical Composition (TikTok / Instagram Reels / YouTube Shorts) */}
      <Composition
        id={VIDEO_CONFIG.formats.vertical.id}
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.formats.vertical.width}
        height={VIDEO_CONFIG.formats.vertical.height}
        defaultProps={{}}
      />

      {/* 1:1 Square Composition (Instagram Feed / LinkedIn Carousel) */}
      <Composition
        id={VIDEO_CONFIG.formats.square.id}
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.formats.square.width}
        height={VIDEO_CONFIG.formats.square.height}
        defaultProps={{}}
      />

      {/* 16:9 Landscape Composition (YouTube / Website Hero Video) */}
      <Composition
        id={VIDEO_CONFIG.formats.landscape.id}
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.formats.landscape.width}
        height={VIDEO_CONFIG.formats.landscape.height}
        defaultProps={{}}
      />
    </>
  );
};
