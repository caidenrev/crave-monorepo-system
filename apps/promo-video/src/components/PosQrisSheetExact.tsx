import React from "react";
import { ChevronLeft, RefreshCw, CheckCircle2 } from "lucide-react";

interface PosQrisSheetExactProps {
  isPaid?: boolean;
  className?: string;
}

export const PosQrisSheetExact: React.FC<PosQrisSheetExactProps> = ({
  isPaid = false,
  className = "",
}) => {
  return (
    <div
      className={`w-[380px] h-full bg-white border-l border-[#E2E8F0] shadow-2xl p-6 flex flex-col justify-between select-none font-sans ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
          isPaid ? "bg-emerald-100 text-emerald-700" : "bg-[#EFF6FF] text-[#2563EB]"
        }`}>
          {isPaid ? "LUNAS ✓" : "09:58"}
        </span>
      </div>

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-4">
        <div className="text-center">
          <div className="text-xs font-semibold text-[#64748B]">Total Tagihan</div>
          <div className="text-3xl font-black text-[#2563EB] tracking-tight">
            Rp1.110
          </div>
        </div>

        {/* Clean Swap: QR Card vs Success Celebration Card */}
        {isPaid ? (
          <div className="w-64 h-64 p-6 rounded-3xl bg-emerald-50/80 border-2 border-emerald-300 shadow-soft-lg flex flex-col items-center justify-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg shadow-emerald-500/35">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>
            <div className="font-black text-base text-[#0F172A] tracking-tight">
              PEMBAYARAN LUNAS
            </div>
            <div className="text-xs font-bold text-[#10B981] bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
              ShopeePay Webhook Confirmed
            </div>
          </div>
        ) : (
          <div className="relative w-64 h-64 p-4 rounded-3xl bg-white border-2 border-[#E2E8F0] shadow-soft flex items-center justify-center overflow-hidden">
            {/* Dense High Resolution QR Code Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#0F172A]">
              <rect width="100" height="100" fill="#FFFFFF" rx="6" />
              {/* Top-Left Finder */}
              <rect x="6" y="6" width="28" height="28" fill="#0F172A" rx="4" />
              <rect x="10" y="10" width="20" height="20" fill="#FFFFFF" rx="2" />
              <rect x="14" y="14" width="12" height="12" fill="#0F172A" rx="1" />

              {/* Top-Right Finder */}
              <rect x="66" y="6" width="28" height="28" fill="#0F172A" rx="4" />
              <rect x="70" y="10" width="20" height="20" fill="#FFFFFF" rx="2" />
              <rect x="74" y="14" width="12" height="12" fill="#0F172A" rx="1" />

              {/* Bottom-Left Finder */}
              <rect x="6" y="66" width="28" height="28" fill="#0F172A" rx="4" />
              <rect x="10" y="70" width="20" height="20" fill="#FFFFFF" rx="2" />
              <rect x="14" y="74" width="12" height="12" fill="#0F172A" rx="1" />

              {/* QR Dense Data Grid */}
              <rect x="40" y="8" width="6" height="6" fill="#0F172A" />
              <rect x="52" y="8" width="8" height="6" fill="#0F172A" />
              <rect x="40" y="18" width="18" height="6" fill="#0F172A" />
              <rect x="40" y="30" width="6" height="10" fill="#0F172A" />
              <rect x="50" y="28" width="12" height="6" fill="#0F172A" />
              
              <rect x="8" y="40" width="16" height="6" fill="#0F172A" />
              <rect x="28" y="40" width="8" height="8" fill="#0F172A" />
              <rect x="40" y="44" width="20" height="16" fill="#2563EB" rx="2" />
              <rect x="66" y="40" width="14" height="6" fill="#0F172A" />
              <rect x="84" y="40" width="10" height="14" fill="#0F172A" />

              <rect x="40" y="66" width="8" height="8" fill="#0F172A" />
              <rect x="52" y="66" width="10" height="18" fill="#0F172A" />
              <rect x="66" y="66" width="28" height="8" fill="#0F172A" />
              <rect x="66" y="78" width="8" height="16" fill="#0F172A" />
              <rect x="78" y="78" width="16" height="16" fill="#0F172A" />
            </svg>
          </div>
        )}

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
          <span className={`w-2.5 h-2.5 rounded-full ${isPaid ? "bg-[#10B981]" : "bg-[#10B981] animate-pulse"}`} />
          <span>{isPaid ? "Transaksi Berhasil Dicatat" : "Menunggu pembayaran pelanggan..."}</span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3 pt-3">
        <button
          className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-soft transition-all ${
            isPaid
              ? "bg-[#10B981] text-white shadow-emerald-500/25"
              : "bg-[#2563EB] text-white shadow-glow-blue hover:bg-[#1D4ED8]"
          }`}
        >
          {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          <span>{isPaid ? "Cetak Struk Bluetooth" : "Cek Status Pembayaran"}</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-semibold text-[#64748B] hover:text-[#EF4444] cursor-pointer">
            {isPaid ? "Selesai & Transaksi Baru" : "Batalkan & Kembali ke Keranjang"}
          </span>
        </div>
      </div>
    </div>
  );
};
