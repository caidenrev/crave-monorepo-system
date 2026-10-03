import React from "react";
import { Plus } from "lucide-react";

interface PosProductCardExactProps {
  category?: string;
  name?: string;
  price?: string;
  stock?: string;
  isClicked?: boolean;
  isLifted?: boolean;
  className?: string;
}

export const PosProductCardExact: React.FC<PosProductCardExactProps> = ({
  category = "Minuman",
  name = "Es Tejus",
  price = "Rp1.000",
  stock = "98 pcs",
  isClicked = false,
  isLifted = false,
  className = "",
}) => {
  return (
    <div
      className={`w-72 p-4 rounded-3xl bg-white select-none transition-all ${
        isLifted
          ? "shadow-2xl z-30 relative"
          : isClicked
          ? "border border-[#2563EB] shadow-glow-blue"
          : "border border-[#E2E8F0] shadow-soft"
      } ${className}`}
      style={
        isLifted
          ? {
              transform: "scale(1.08) translateY(-14px) translateZ(40px)",
              boxShadow: "0 24px 45px -10px rgba(37, 99, 235, 0.45)",
              border: "2px solid #2563EB",
            }
          : {}
      }
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold">
          {category}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[11px] font-bold shadow-xs">
          {stock}
        </span>
      </div>

      {/* Product Title */}
      <div className="my-4">
        <h3 className="font-extrabold text-lg text-[#0F172A] tracking-tight">
          {name}
        </h3>
      </div>

      {/* Price & Add Action Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="font-black text-lg text-[#2563EB]">
          {price}
        </span>
        <button
          className={`w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-md transition-transform ${
            isClicked || isLifted ? "scale-95 bg-[#1D4ED8]" : "hover:scale-105"
          }`}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
