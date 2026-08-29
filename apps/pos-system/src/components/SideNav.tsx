import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanBarcode,
  Boxes,
  HandCoins,
  Users,
  FileSpreadsheet,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/useNotifications";
import { useAuth } from "@/lib/useAuth";

type Item = {
  to: string;
  label: string;
  icon: typeof ScanBarcode;
  badge?: number | undefined;
  children?: { to: string; hash: string; label: string; icon: typeof ScanBarcode }[];
};

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const set = (value: boolean) => {
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  };
  return { dark, set };
}

function Row({
  collapsed,
  active,
  children,
  label,
}: {
  collapsed: boolean;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  if (!collapsed) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function SideNav({
  collapsed,
  onToggle,
  onNavigate,
  forceExpanded,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  forceExpanded?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const isCollapsed = forceExpanded ? false : collapsed;
  const [openGroup, setOpenGroup] = useState<string | null>("/laporan");
  const { dark, set } = useDarkMode();
  const { user, signOut } = useAuth();

  const { data: notifications = [] } = useNotifications();
  const utangCount = notifications.filter((n) => n.type === "utang").length;
  const stokCount = notifications.filter((n) => n.type === "stok").length;

  const menu: Item[] = [
    { to: "/", label: "Kasir", icon: ScanBarcode },
    { to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
    { to: "/stok", label: "Stok", icon: Boxes, badge: stokCount > 0 ? stokCount : undefined },
    {
      to: "/laporan",
      label: "Laporan",
      icon: FileSpreadsheet,
      children: [
        { to: "/laporan", hash: "", label: "Ringkasan Laporan", icon: FileSpreadsheet },
        { to: "/penjualan-harian", hash: "", label: "Penjualan Harian", icon: Receipt },
        { to: "/kartu-stok", hash: "", label: "Kartu Stok", icon: Package },
        { to: "/spreadsheet", hash: "", label: "Spreadsheet", icon: CalendarClock },
      ],
    },
    {
      to: "/utang",
      label: "Utang",
      icon: HandCoins,
      badge: utangCount > 0 ? utangCount : undefined,
    },
  ];

  const others: Item[] = [
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
          <Row collapsed={isCollapsed} label={item.label}>
            <button
              type="button"
              onClick={() => (isCollapsed ? undefined : setOpenGroup(open ? null : item.to))}
              className={cn(
                itemClass(false),
                "w-full",
                groupActive && "text-primary hover:text-primary",
              )}
            >
              <item.icon className="size-4.5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronDown
                    className={cn("size-4 transition-transform", open && "rotate-180")}
                  />
                </>
              )}
            </button>
          </Row>
          <div
            className={cn(
              "grid transition-all duration-300 ease-out",
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="ml-5 space-y-1 border-l pl-3 pt-1">
                {item.children.map((child, i) => {
                  const childActive = path === child.to && hash === child.hash;
                  return (
                    <Link
                      key={child.label}
                      to={child.to}
                      hash={child.hash}
                      onClick={onNavigate}
                      className={cn(
                        itemClass(childActive),
                        "transition-all duration-300 ease-out",
                        open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                      )}
                      style={{ transitionDelay: open ? `${60 + i * 60}ms` : "0ms" }}
                    >
                      <child.icon className="size-4 shrink-0" />
                      <span className="truncate">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Row key={`${item.to}-${item.label}`} collapsed={isCollapsed} label={item.label}>
        <Link to={item.to} onClick={onNavigate} className={itemClass(active)}>
          <item.icon className="size-4.5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {item.badge}
                </span>
              ) : null}
            </>
          )}
          {isCollapsed && item.badge ? (
            <span className="absolute translate-x-3 -translate-y-3 size-2 rounded-full bg-destructive" />
          ) : null}
        </Link>
      </Row>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-full flex-col px-3 py-4">
        {}
        <div className="flex shrink-0 flex-col gap-4">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2.5")}>
            <div className="grid size-8 shrink-0 place-items-center">
              <img
                src={dark ? "/dark-mode-logo.png" : "/light-mode-logo.png"}
                alt="Crave"
                className="size-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-base font-extrabold tracking-tight">Crave</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Point Of Sales Management
                </p>
              </div>
            )}
          </div>

          {isCollapsed ? (
            <Row collapsed label="Cari">
              <Button variant="secondary" size="icon" className="mx-auto rounded-xl">
                <Search className="size-4" />
              </Button>
            </Row>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari"
                className="rounded-xl bg-muted pl-9 pr-9 border-transparent"
              />
              <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
        </div>

        {}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-1">
            <p
              className={cn(
                "px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                isCollapsed && "hidden",
              )}
            >
              Menu
            </p>
            {menu.map(renderItem)}
          </div>

          <div className="space-y-1">
            <p
              className={cn(
                "px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                isCollapsed && "hidden",
              )}
            >
              Lainnya
            </p>
            {others.map(renderItem)}
            <Row collapsed={isCollapsed} label="Info">
              <Link to="/info" className={itemClass(path === "/info")} onClick={onNavigate}>
                <Info className="size-4.5 shrink-0" />
                {!isCollapsed && <span className="truncate">Info Aplikasi</span>}
              </Link>
            </Row>
          </div>
        </div>

        {}
        <div className="mt-auto flex shrink-0 flex-col gap-3 pt-4">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => set(false)}
                className={cn("rounded-xl p-2", !dark && "bg-secondary text-secondary-foreground")}
              >
                <Sun className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => set(true)}
                className={cn("rounded-xl p-2", dark && "bg-secondary text-secondary-foreground")}
              >
                <Moon className="size-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
              <button
                type="button"
                onClick={() => set(false)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
                  !dark ? "bg-card shadow-soft" : "text-muted-foreground",
                )}
              >
                <Sun className="size-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => set(true)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
                  dark ? "bg-card shadow-soft" : "text-muted-foreground",
                )}
              >
                <Moon className="size-4" /> Dark
              </button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-2xl border bg-card p-2 shadow-soft outline-none hover:bg-accent transition-colors",
                  isCollapsed &&
                    "justify-center border-0 bg-transparent p-0 shadow-none hover:bg-transparent",
                )}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">
                    {user?.user_metadata?.["name"]
                      ? user.user_metadata["name"].substring(0, 2).toUpperCase()
                      : user?.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="min-w-0 flex-1 leading-tight text-left">
                      <p className="truncate text-xs font-bold">
                        {user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {user?.email || "No Email"}
                      </p>
                    </div>
                    <MoreVertical className="size-4 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={12} className="w-56 rounded-xl">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onNavigate && onNavigate()}
              >
                <UserIcon className="mr-2 size-4" />
                <span>Pengaturan Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {onToggle ? (
        <Button
          variant="default"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3.5 top-7 z-40 hidden size-7 rounded-full shadow-soft lg:flex"
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      ) : null}
    </TooltipProvider>
  );
}
