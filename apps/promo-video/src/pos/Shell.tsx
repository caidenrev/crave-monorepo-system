/**
 * Salinan AppShell + SideNav dari apps/pos-system/src/components.
 * Markup & class identik; yang diganti hanya router/auth/notifikasi
 * (tidak ada di video) menjadi nilai statis, dan posisi `fixed` → `absolute`
 * agar shell berada di dalam "layar" virtual video.
 */
import type { ReactNode } from "react";
import { Img, staticFile } from "remotion";
import {
  LayoutDashboard,
  ScanBarcode,
  Boxes,
  Users,
  FileSpreadsheet,
  Search,
  ChevronDown,
  ChevronLeft,
  Info,
  MessageSquare,
  Sun,
  Moon,
  MoreVertical,
  SlidersHorizontal,
  CalendarClock,
  Receipt,
  Package,
  Settings,
  Wallet,
  Truck,
  Tags,
  Lightbulb,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import profileLogo from "@/assets/profile-logo.jpeg";

const USER = { name: "Samantha W", email: "samantha@crave.id" };

type Item = {
  to: string;
  label: string;
  icon: typeof ScanBarcode;
  badge?: number | undefined;
  children?: { to: string; label: string; icon: typeof ScanBarcode }[];
};

function SideNav({ path }: { path: string }) {
  const isCollapsed = false;
  const openGroup = "/laporan";
  const dark = false;

  const menu: Item[] = [
    { to: "/", label: "Kasir", icon: ScanBarcode },
    { to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
    { to: "/stok", label: "Stok", icon: Boxes, badge: 3 },
    {
      to: "/laporan",
      label: "Laporan",
      icon: FileSpreadsheet,
      children: [
        { to: "/laporan", label: "Ringkasan Laporan", icon: FileSpreadsheet },
        { to: "/penjualan-harian", label: "Penjualan Harian", icon: Receipt },
        { to: "/kartu-stok", label: "Kartu Stok", icon: Package },
        { to: "/spreadsheet", label: "Spreadsheet", icon: CalendarClock },
      ],
    },
    { to: "/pengeluaran", label: "Pengeluaran", icon: Wallet },
    { to: "/perencana", label: "Perencana Bisnis", icon: Lightbulb },
  ];

  const others: Item[] = [
    { to: "/supplier", label: "Supplier", icon: Truck },
    { to: "/kategori", label: "Kategori", icon: Tags },
    { to: "/pengaturan", label: "Pengaturan", icon: Settings },
    { to: "/karyawan", label: "Karyawan", icon: Users },
    { to: "/bantuan", label: "Bantuan", icon: MessageSquare },
  ];

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
      isCollapsed && "justify-center px-0",
      active
        ? "bg-primary text-primary-foreground shadow-soft"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );

  const renderItem = (item: Item) => {
    const active = path === item.to && !item.children;
    if (item.children) {
      const open = openGroup === item.to && !isCollapsed;
      const groupActive = path === item.to;
      return (
        <div key={`${item.to}-${item.label}`} className="space-y-1">
          <button
            type="button"
            className={cn(
              itemClass(false),
              "w-full",
              groupActive && "text-primary hover:text-primary",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "grid",
              open
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="ml-5 space-y-1 border-l pl-3 pt-1">
                {item.children.map((child) => (
                  <div
                    key={child.label}
                    className={itemClass(path === child.to)}
                  >
                    <child.icon className="size-4 shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={`${item.to}-${item.label}`} className={itemClass(active)}>
        <item.icon className="size-4.5 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge ? (
          <span className="grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {item.badge}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div className="flex h-full flex-col px-3 py-4">
        <div className="flex shrink-0 flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center">
              <Img
                src={staticFile("light-mode-logo.png")}
                alt="Crave"
                className="size-8 object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-extrabold tracking-tight">
                Crave
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Point Of Sales Management
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari"
              className="rounded-xl bg-muted pl-9 pr-9 border-transparent"
              readOnly
            />
            <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden space-y-4 py-2">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            {menu.map(renderItem)}
          </div>
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Lainnya
            </p>
            {others.map(renderItem)}
            <div className={itemClass(path === "/info")}>
              <Info className="size-4.5 shrink-0" />
              <span className="truncate">Info Aplikasi</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex shrink-0 flex-col gap-3 pt-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
                !dark ? "bg-card shadow-soft" : "text-muted-foreground",
              )}
            >
              <Sun className="size-4" /> Light
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
                dark ? "bg-card shadow-soft" : "text-muted-foreground",
              )}
            >
              <Moon className="size-4" /> Dark
            </button>
          </div>
          <button className="flex w-full items-center gap-2 rounded-2xl border bg-card p-2 shadow-soft outline-none">
            <div className="size-8 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
              <Img
                src={profileLogo}
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 leading-tight text-left">
              <p className="truncate text-xs font-bold">{USER.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {USER.email}
              </p>
            </div>
            <MoreVertical className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <Button
        variant="default"
        size="icon"
        className="absolute -right-3.5 top-7 z-40 hidden size-7 rounded-full shadow-soft lg:flex"
      >
        <ChevronLeft className="size-4" />
      </Button>
    </>
  );
}

export function AppShell({
  path,
  title,
  subtitle,
  actions,
  children,
  width,
  height,
  notifications = 3,
}: {
  path: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  width: number;
  height: number;
  notifications?: number;
}) {
  return (
    <div
      className="relative w-full overflow-hidden bg-background"
      style={{ width, height }}
    >
      <aside className="absolute inset-y-0 left-0 z-30 w-72 border-r bg-sidebar">
        <SideNav path={path} />
      </aside>

      <div className="pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-6 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold tracking-tight">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi atau produk"
                  className="w-64 rounded-xl pl-9"
                  readOnly
                />
              </div>
              {actions}
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-xl"
              >
                <Bell className="size-4" />
                {notifications > 0 && (
                  <Badge className="absolute -right-1 -top-1 size-4 justify-center rounded-full p-0 text-[10px]">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <button className="flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5 shadow-soft outline-none">
                <div className="size-7 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                  <Img
                    src={profileLogo}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                </div>
                <div className="leading-tight text-left">
                  <p className="text-xs font-bold">{USER.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {USER.email}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-6 pb-10 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
