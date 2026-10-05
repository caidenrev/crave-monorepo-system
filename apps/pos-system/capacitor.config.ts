import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.simplepoint",
  appName: "simple-point",
  webDir: ".output/public",
  server: {
    url: "https://crave-pos-system.vercel.app/",
    cleartext: true,
  },
};

export default config;
