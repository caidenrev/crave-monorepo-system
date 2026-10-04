import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Real ISO/IEC 18004 Standard QR Code Matrix Component */
export function QrMatrix({
  value,
  size = 220,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [svgXml, setSvgXml] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    QRCode.toString(value || "CRAVE_EVENT", {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((svg) => {
        if (!isCancelled) {
          setSvgXml(svg);
        }
      })
      .catch((err) => {
        console.error("[QrMatrix] Gagal generate standard QR Code:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [value]);

  if (!svgXml) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-white p-4 border border-hairline/80 animate-pulse"
      >
        <span className="text-[11px] font-medium text-ink-tertiary">Menyiapkan QR Code...</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-slate-200/90 overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block ${
        className || ""
      }`}
      dangerouslySetInnerHTML={{ __html: svgXml }}
    />
  );
}
