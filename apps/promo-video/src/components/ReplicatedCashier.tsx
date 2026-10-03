import React from "react";
import {
  Search,
  ScanBarcode,
  Minus,
  Plus,
  Trash2,
  QrCode,
  CreditCard,
  Wallet,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { ReplicatedProductCard, type ProductItem } from "./ReplicatedProductCard";
import { VIDEO_CONFIG } from "../config";

interface CartLine {
  product: ProductItem;
  qty: number;
}

interface ReplicatedCashierProps {
  cartItems?: CartLine[];
  highlightedProductId?: string;
  className?: string;
}

export const ReplicatedCashier: React.FC<ReplicatedCashierProps> = ({
  cartItems = [
    { product: VIDEO_CONFIG.copy.products[0], qty: 2 }, // Es Kopi Susu x2 = 36.000
    { product: VIDEO_CONFIG.copy.products[2], qty: 1 }, // Croissant = 25.000
  ],
  highlightedProductId,
  className = "",
}) => {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className={`w-full bg-[#F8FAFC] p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 ${className}`}>
      {/* Left: Product Catalog */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header & Search */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value=""
              placeholder="Cari menu atau scan barcode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-xs outline-none"
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60 font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <ScanBarcode className="w-4 h-4" />
            <span>Scan</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["Semua", "Minuman", "Makanan", "Snack"].map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                i === 0
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-white text-[#64748B] border border-[#E2E8F0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {VIDEO_CONFIG.copy.products.map((p) => (
            <ReplicatedProductCard
              key={p.id}
              product={p}
              isHighlighted={p.id === highlightedProductId}
            />
          ))}
        </div>
      </div>

      {/* Right: Cart & Payment Panel */}
      <div className="p-4 rounded-3xl bg-white border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">Pesanan #27364</h3>
            </div>
            <span className="text-xs font-bold text-[#2563EB] px-2 py-0.5 rounded-full bg-[#EFF6FF]">
              {cartItems.reduce((acc, item) => acc + item.qty, 0)} Item
            </span>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 pt-3">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-2 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-bold text-xs text-[#0F172A] truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {formatRupiah(item.product.price)}
                  </div>
                </div>

                {/* Qty Stepper */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-xs font-bold text-[#64748B]">
                    -
                  </div>
                  <span className="font-bold text-xs text-[#0F172A] w-4 text-center">
                    {item.qty}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Checkout */}
        <div className="pt-3 border-t border-[#F1F5F9] space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Pajak (10%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#0F172A] pt-1 border-t border-[#F1F5F9]">
              <span>Total Tagihan</span>
              <span className="text-[#2563EB]">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "QRIS", icon: QrCode, active: true },
              { label: "Kartu", icon: CreditCard, active: false },
              { label: "Tunai", icon: Wallet, active: false },
            ].map((pm) => (
              <div
                key={pm.label}
                className={`py-1.5 px-2 rounded-xl text-center flex flex-col items-center gap-1 font-bold text-[10px] ${
                  pm.active
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                }`}
              >
                <pm.icon className="w-3.5 h-3.5" />
                <span>{pm.label}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button className="w-full py-3 rounded-2xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-blue">
            <span>Proses Bayar QRIS ({formatRupiah(total)})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
