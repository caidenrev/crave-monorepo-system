import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// Komponen pos-system dipakai langsung (bukan dibuat ulang): alias "@" diarahkan ke pos-system/src
const posSrc = path.resolve(process.cwd(), "..", "pos-system", "src");

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
Config.setConcurrency(4);
Config.overrideWebpackConfig((config) =>
  enableTailwind({
    ...config,
    resolve: {
      ...config.resolve,
      alias: { ...(config.resolve?.alias ?? {}), "@": posSrc },
    },
  }),
);
