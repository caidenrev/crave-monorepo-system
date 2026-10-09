/** Ringkas user agent jadi nama yang mudah dibaca kasir. */
export function describeDevice(ua: string | null): {
  device: string;
  browser: string;
  kind: "phone" | "tablet" | "desktop";
} {
  if (!ua) return { device: "Perangkat tidak dikenal", browser: "", kind: "desktop" };

  let device = "Perangkat lain";
  let kind: "phone" | "tablet" | "desktop" = "desktop";
  if (/iPad/.test(ua)) {
    device = "iPad";
    kind = "tablet";
  } else if (/iPhone/.test(ua)) {
    device = "iPhone";
    kind = "phone";
  } else if (/Android/.test(ua)) {
    const model = ua.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/[^;)]*)?[;)]/)?.[1]?.trim();
    device = model && model !== "K" ? `Android · ${model}` : "Android";
    kind = /Mobile/.test(ua) ? "phone" : "tablet";
  } else if (/Windows/.test(ua)) device = "Windows";
  else if (/Macintosh|Mac OS X/.test(ua)) device = "Mac";
  else if (/CrOS/.test(ua)) device = "Chromebook";
  else if (/Linux/.test(ua)) device = "Linux";

  let browser = "";
  if (/; wv\)/.test(ua)) browser = "Aplikasi Crave";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/CriOS|Chrome\//.test(ua)) browser = "Chrome";
  else if (/FxiOS|Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  return { device, browser, kind };
}
