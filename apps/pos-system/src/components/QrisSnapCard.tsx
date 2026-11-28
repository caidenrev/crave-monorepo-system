import React, { useState } from "react";
import { Download, Info, Share2, Store } from "lucide-react";
import qrisWhiteLogo from "@/assets/brands/qris-white.png";
import qrisLogo from "@/assets/brands/qris.png";

export function qrisNmid(payload?: string): string | null {
  if (!payload || !payload.startsWith("000201")) return null;
  const read = (s: string) => {
    const out: Record<string, string> = {};
    for (let i = 0; i + 4 <= s.length; ) {
      const tag = s.slice(i, i + 2);
      const len = Number(s.slice(i + 2, i + 4));
      if (!Number.isFinite(len)) return out;
      out[tag] = s.slice(i + 4, i + 4 + len);
      i += 4 + len;
    }
    return out;
  };
  try {
    const root = read(payload);
    const sub51 = read(root["51"] ?? "");
    const nmid = sub51["02"];
    return nmid && /^ID[0-9A-Z]{6,}$/.test(nmid) ? nmid : null;
  } catch {
    return null;
  }
}

interface QrisSnapCardProps {
  qrImageBase64: string;
  storeName?: string;
  storeLogo?: string | null;
  orderId?: string;
  totalAmount: number;
  customerName?: string;
  qrisString?: string;
  expiresAt?: string;
  timeLeftSeconds: number;
  formatRupiah: (val: number) => string;
}

export function QrisSnapCard({
  qrImageBase64,
  storeName,
  storeLogo,
  orderId,
  totalAmount,
  customerName,
  qrisString,
  expiresAt,
  timeLeftSeconds,
  formatRupiah,
}: QrisSnapCardProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);
  const nmid = qrisNmid(qrisString);
  const displayName = storeName?.trim() || "Kasir Toko";

  // 4 digit timer: MMSS
  const safeSecs = Math.max(0, timeLeftSeconds);
  const mins = String(Math.floor(safeSecs / 60)).padStart(2, "0");
  const secs = String(safeSecs % 60).padStart(2, "0");
  const timerDigits = `${mins}${secs}`;

  // Format deadline WIB
  let deadlineText = "Dalam 10 menit";
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (!Number.isNaN(d.getTime())) {
      deadlineText =
        new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }).format(d) + " WIB";
    }
  }

  const handleDownload = () => {
    if (!qrImageBase64) return;
    const a = document.createElement("a");
    a.href = qrImageBase64;
    a.download = `QRIS-${orderId || "pembayaran"}.png`;
    a.click();
  };

  const handleShare = async () => {
    const text = `Tagihan ${displayName} sebesar ${formatRupiah(totalAmount)}${orderId ? ` (Order ${orderId})` : ""} lewat QRIS`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bayar ${displayName}`,
          text,
        });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareNote("Info tagihan disalin");
    } catch {
      return;
    }
    window.setTimeout(() => setShareNote(null), 2500);
  };

  return (
    <div className="w-full max-w-[360px] text-left space-y-3">
      {/* 1. IDENTITAS TOKO / MERCHANT ROW (Tanpa Logo Crave) */}
      <div className="flex items-center gap-2.5 min-w-0">
        {storeLogo ? (
          <img
            src={storeLogo}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#DCE2FF]"
          />
        ) : (
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border"
            style={{ background: "#EEF1FF", borderColor: "#DCE2FF" }}
          >
            <Store className="w-4 h-4 text-[#2D3FE7]" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[14px] font-bold leading-tight text-[#0F172A] truncate">
            {displayName}
          </div>
          <div className="text-[11.5px] font-medium mt-0.5 text-[#64748B] truncate">
            {orderId ? `Order ${orderId}` : customerName?.trim() ? `a.n. ${customerName.trim()}` : "Pembayaran QRIS"}
          </div>
        </div>
      </div>

      {/* 2. KOTAK TIMER & PETUNJUK (Persis Snap Console) */}
      <div className="p-3.5 rounded-[14px]" style={{ background: "#F3F6FA" }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11.5px] text-[#64748B]">Selesaikan sebelum</div>
            <div className="text-[12.5px] font-bold text-[#0F172A] truncate">{deadlineText}</div>
          </div>

          {/* 4-Digit Boxed Countdown */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="w-6 h-8 rounded-md flex items-center justify-center text-[14px] font-extrabold tabular-nums"
                style={{ background: "#2D3FE71F", color: "#2D3FE7" }}
              >
                {timerDigits[i]}
              </span>
            ))}
            <span className="font-extrabold text-[#2D3FE7]">:</span>
            {[2, 3].map((i) => (
              <span
                key={i}
                className="w-6 h-8 rounded-md flex items-center justify-center text-[14px] font-extrabold tabular-nums"
                style={{ background: "#2D3FE71F", color: "#2D3FE7" }}
              >
                {timerDigits[i]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11.5px] leading-snug mt-3 pt-3 border-t border-[#E2E8F0] text-[#64748B]">
          <Info className="w-3.5 h-3.5 mt-px flex-shrink-0" />
          <span>Bisa dibayar dengan e-wallet atau mobile banking apa pun yang mendukung QRIS.</span>
        </div>
      </div>

      {/* 3. KARTU QRIS BIRU + LEMBAR BAWAH OVERLAPPING */}
      <div className="overflow-hidden rounded-[20px]">
        <div
          className="px-5 pt-4 pb-10 text-center text-white"
          style={{ background: "#2D3FE7" }}
        >
          <div className="flex items-center justify-between">
            <img
              src={qrisWhiteLogo}
              alt="QRIS"
              className="h-4 w-auto object-contain select-none"
              draggable={false}
            />
            <span className="text-[10px] font-bold tracking-wide opacity-80">
              QR NOMINAL PAS
            </span>
          </div>

          <div className="mt-3 text-[15px] font-extrabold leading-tight truncate">
            {displayName}
          </div>
          <div className="text-[11px] font-medium opacity-80 mt-0.5 truncate">
            {nmid ? `NMID: ${nmid}` : "Scan QRIS untuk membayar"}
          </div>

          {/* Wadah QR Putih */}
          <div className="mt-3 mx-auto w-fit bg-white p-3 rounded-[14px]">
            <img
              src={qrImageBase64}
              alt="QRIS"
              className="size-40 sm:size-44 object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Lembar Bawah */}
        <div
          className="-mt-6 relative px-4 pt-4 pb-4 bg-white border border-[#E2E8F0]"
          style={{ borderRadius: "14px 14px 20px 20px" }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#0F172A]">
              <img
                src={qrisLogo}
                alt="QRIS"
                className="h-3 w-auto object-contain select-none"
                draggable={false}
              />
              QRIS
            </span>
            {customerName?.trim() && (
              <span className="text-[11px] font-semibold text-[#64748B] truncate max-w-[140px]">
                a.n. {customerName.trim()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-[13px] text-[#64748B]">Total</span>
            <span className="text-[18px] font-extrabold tabular-nums text-[#0F172A]">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={() => void handleShare()}
              className="w-full py-2.5 text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-85 rounded-[12px]"
              style={{ background: "#2D3FE71A", color: "#2D3FE7" }}
            >
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-85 rounded-[12px]"
              style={{ background: "#2D3FE71A", color: "#2D3FE7" }}
            >
              <Download className="w-4 h-4" /> Unduh QR
            </button>
          </div>

          {shareNote && (
            <p
              role="status"
              className="text-center text-[11.5px] font-semibold mt-2 text-[#64748B]"
            >
              {shareNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
