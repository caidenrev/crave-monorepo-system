import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

// Font UI sama dengan pos-system (--font-sans: "Plus Jakarta Sans")
export const { fontFamily: jakarta } = loadJakarta("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

// Aksen serif italic untuk title agar terasa editorial & elegan
export const { fontFamily: serif } = loadSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
});
