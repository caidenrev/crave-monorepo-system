import React from "react";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface PosFloatingCartBarProps {
  itemsCount?: string;
  totalPrice?: string;
  isClicked?: boolean;
  isLifted?: boolean;
  className?: string;
}

export const PosFloatingCartBar: React.FC<PosFloatingCartBarProps> = ({
  itemsCount = "1 Item",
  totalPrice = "Rp1.110",
  isClicked = false,
  isLifted = false,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center justify-between p-2 pl-4 rounded-full bg-[#2563EB] text-white shadow-soft-lg select-none transition-all ${
        isLifted
          ? "scale-110 -translate-y-4 shadow-2xl ring-4 ring-blue-400/40 z-30"
          : isClicked
          ? "scale-95 shadow-glow-blue"
          : ""
      } ${className}`}
      style={{
        minWidth: "350px",
        ...(isLifted
          ? {
              transform: "scale(1.12) translateY(-18px) translateZ(50px)",
              boxShadow: "0 28px 50px -10px rgba(37, 99, 235, 0.5), 0 0 0 2px #FFFFFF",
            }
          : {}),
      }}
    >
      {/* Left Item Count & Price */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-xs">
          <ShoppingCart className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-blue-100">
            {itemsCount}
          </div>
          <div className="text-base font-black text-white tracking-tight">
            {totalPrice}
          </div>
        </div>
      </div>

      {/* Right White Pill Action Button */}
      <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#2563EB] text-xs font-black shadow-md">
        <span>Lanjut Bayar</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </div>
    </div>
  );
};
