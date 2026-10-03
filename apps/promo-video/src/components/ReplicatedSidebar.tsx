import React from "react";
import {
  LayoutDashboard,
  ScanBarcode,
  Boxes,
  FileSpreadsheet,
  Settings,
  Receipt,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { staticFile } from "remotion";

interface ReplicatedSidebarProps {
  activeItem?: string;
  className?: string;
  compact?: boolean;
}

export const ReplicatedSidebar: React.FC<ReplicatedSidebarProps> = ({
  activeItem = "Dasbor",
  className = "",
  compact = false,
}) => {
  const menuItems = [
    { label: "Kasir", icon: ScanBarcode, badge: undefined },
    { label: "Dasbor", icon: LayoutDashboard, badge: undefined },
    { label: "Stok", icon: Boxes, badge: 4 },
    { label: "Laporan", icon: FileSpreadsheet, badge: undefined },
    { label: "Pengaturan", icon: Settings, badge: undefined },
  ];

  return (
    <aside
      className={`w-64 h-full bg-white border-r border-[#E2E8F0] p-4 flex flex-col justify-between select-none ${className}`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <img
            src={staticFile("light-mode-logo.png")}
            alt="Crave POS Logo"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Menu Navigation */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = item.label === activeItem;
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] shadow-xs border border-[#BFDBFE]/60"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-[#2563EB]" : "text-[#64748B]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User / Merchant Profile */}
      <div className="pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <img
            src={staticFile("profile-logo.jpeg")}
            alt="Profile Avatar"
            className="w-10 h-10 rounded-xl object-cover border border-white shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-[#0F172A] truncate">
              Kopi Senja Utama
            </div>
            <div className="text-[11px] font-medium text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Kasir Aktif
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
