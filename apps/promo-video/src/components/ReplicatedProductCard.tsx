import React from "react";
import { Plus, Coffee, Utensils, Cookie, Package } from "lucide-react";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

interface ReplicatedProductCardProps {
  product: ProductItem;
  onAdd?: () => void;
  isHighlighted?: boolean;
  scale?: number;
  className?: string;
}

export const ReplicatedProductCard: React.FC<ReplicatedProductCardProps> = ({
  product,
  isHighlighted = false,
  scale = 1,
  className = "",
}) => {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === "Minuman") return Coffee;
    if (cat === "Makanan") return Utensils;
    if (cat === "Snack") return Cookie;
    return Package;
  };

  const Icon = getCategoryIcon(product.category);

  return (
    <div
      className={`p-4 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-soft select-none ${
        isHighlighted
          ? "border-2 border-[#2563EB] shadow-glow-blue bg-blue-50/20"
          : "border-[#E2E8F0] hover:border-[#2563EB]/50"
      } ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold">
            {product.category}
          </span>
          <span className="text-[11px] font-medium text-[#64748B]">
            Stok: <strong className="text-[#0F172A]">{product.stock}</strong>
          </span>
        </div>

        {/* Product Image / Icon representation */}
        <div className="w-full h-20 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-3 text-[#2563EB]">
          <Icon className="w-9 h-9 stroke-[1.5]" />
        </div>

        {/* Product Details */}
        <h4 className="font-bold text-sm text-[#0F172A] truncate">
          {product.name}
        </h4>
        <div className="text-[10px] text-[#64748B]">SKU: {product.sku}</div>
      </div>

      {/* Bottom Price & Add Action */}
      <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <div className="font-black text-sm text-[#2563EB]">
          {formatRupiah(product.price)}
        </div>
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
            isHighlighted
              ? "bg-[#2563EB] text-white shadow-md scale-110"
              : "bg-[#EFF6FF] text-[#2563EB]"
          }`}
        >
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
