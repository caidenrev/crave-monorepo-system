import React from "react";
import { Trash2, QrCode, CreditCard, Wallet, Minus, Plus, ShoppingBag } from "lucide-react";

interface PosCartSheetExactProps {
  qty?: number;
  isQrisClicked?: boolean;
  className?: string;
}

export const PosCartSheetExact: React.FC<PosCartSheetExactProps> = ({
  qty = 1,
  isQrisClicked = false,
  className = "",
}) => {
  return (
    <div
      className={`w-[380px] h-full bg-white border-l border-[#E2E8F0] shadow-2xl p-6 flex flex-col justify-between select-none font-sans ${className}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
              Keranjang
            </h2>
            <p className="text-xs text-[#64748B] font-medium">Struk #27363</p>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EF4444] text-[#EF4444] text-xs font-bold hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        </div>

        {/* Cart Item Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-[#0F172A]">Es Tejus</h4>
            <div className="text-xs font-medium text-[#64748B]">Rp1.000 × {qty}</div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-xs font-bold text-[#64748B] shadow-xs">
              <Minus className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-[#0F172A] w-4 text-center">
              {qty}
            </span>
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary & Payments */}
      <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
        {/* Price Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-[#64748B] font-medium">
            <span>Subtotal</span>
            <span className="text-[#0F172A] font-bold">Rp1.000</span>
          </div>
          <div className="flex justify-between text-[#64748B] font-medium">
            <span>Pajak 11%</span>
            <span className="text-[#0F172A] font-bold">Rp110</span>
          </div>
          <div className="flex justify-between text-base font-black text-[#0F172A] pt-2 border-t border-[#F1F5F9]">
            <span>Total</span>
            <span className="text-[#2563EB]">Rp1.110</span>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Metode Pembayaran
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* QRIS Active */}
            <div className="p-3 rounded-2xl bg-[#2563EB] text-white shadow-soft text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer">
              <QrCode className="w-5 h-5 text-white" />
              <span className="text-xs font-black">QRIS</span>
            </div>

            {/* Kartu */}
            <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] text-center flex flex-col items-center justify-center gap-1.5">
              <CreditCard className="w-5 h-5 text-[#64748B]" />
              <span className="text-xs font-bold">Kartu</span>
            </div>

            {/* Tunai */}
            <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] text-center flex flex-col items-center justify-center gap-1.5">
              <Wallet className="w-5 h-5 text-[#64748B]" />
              <span className="text-xs font-bold">Tunai</span>
            </div>
          </div>
        </div>

        {/* Big Action Button (Green as in Image 3) */}
        <button
          className={`w-full py-3.5 px-4 rounded-2xl bg-[#059669] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all ${
            isQrisClicked ? "scale-95 bg-[#047857]" : "hover:bg-[#047857]"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Bayar QRIS Rp1.110</span>
        </button>
      </div>
    </div>
  );
};
