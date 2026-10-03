import { Config } from "@remotion/cli/config";
import path from "path";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration: any) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules ?? []).filter((rule: any) => {
          if (rule && rule.test && rule.test.toString().includes("css")) {
            return false;
          }
          return true;
        }),
        {
          test: /\.css$/i,
          use: [
            require.resolve("style-loader"),
            {
              loader: require.resolve("css-loader"),
              options: {
                import: false,
              },
            },
            {
              loader: require.resolve("postcss-loader"),
              options: {
                postcssOptions: {
                  plugins: [require("@tailwindcss/postcss")],
                },
              },
            },
          ],
        },
      ],
    },
  };
});





