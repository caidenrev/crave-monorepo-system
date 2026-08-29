import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.simplepoint",
  appName: "simple-point",
  webDir: ".output/public",
  // Uncomment and change the URL below to your deployed web app URL
  // if you want the Android app to act as a wrapper around your live site.
  server: {
    url: "https://crave-pos-system.vercel.app/",
    cleartext: true,
  },
};

export default config;
