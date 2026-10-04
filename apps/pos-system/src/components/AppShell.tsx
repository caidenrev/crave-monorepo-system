import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanBarcode,
  Boxes,
  HandCoins,
  Menu,
  AlertTriangle,
  Receipt,
  Search,
  Bell,
  LogOut,
  Wallet,
  User as UserIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SideNav } from "@/components/SideNav";
import GlassNav from "@/components/ui/GlassNav";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNotifications } from "@/lib/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/lib/useAuth";
import profileLogo from "@/assets/profile-logo.jpeg";

const nav = [
  { id: "kasir", to: "/", label: "Kasir", icon: ScanBarcode },
  { id: "dashboard", to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { id: "stok", to: "/stok", label: "Stok", icon: Boxes },
  { id: "pengeluaran", to: "/pengeluaran", label: "Pengeluaran", icon: Wallet },
  { id: "menu", to: "#menu", label: "Lainnya", icon: Menu },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifications = [] } = useNotifications();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r bg-sidebar transition-[width] duration-300 lg:block",
          collapsed ? "w-20" : "w-72",
        )}
      >
        <SideNav collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari transaksi atau produk" className="w-64 rounded-xl pl-9" />
              </div>
              {actions}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative rounded-xl">
                    <Bell className="size-4.5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -right-1 -top-1 size-4 justify-center rounded-full p-0 text-[10px]">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" collisionPadding={16} className="w-80 p-0 rounded-2xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-bold text-sm">Notifikasi</h3>
                    {notifications.length > 0 && (
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        {notifications.length} Baru
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        Belum ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="flex items-start gap-3 rounded-xl p-2 hover:bg-muted/50 cursor-pointer"
                        >
                          <div
                            className={cn(
                              "mt-0.5 rounded-full p-1.5",
                              notif.type === "stok" && "bg-destructive/10 text-destructive",
                              notif.type === "pesanan" && "bg-primary/10 text-primary",
                            )}
                          >
                            {notif.type === "stok" && <AlertTriangle className="size-4" />}
                            {notif.type === "pesanan" && <Receipt className="size-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notif.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notif.time), {
                                addSuffix: true,
                                locale: id,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" className="w-full text-xs h-8 text-primary">
                      Tandai semua dibaca
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5 shadow-soft hover:bg-accent outline-none transition-colors">
                    <div className="size-7 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                      <img
                        src={profileLogo}
                        alt="Profile"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="hidden leading-tight text-left sm:block">
                      <p className="text-xs font-bold">
                        {user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {user?.email || "No Email"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="w-56 rounded-xl"
                >
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/pengaturan">
                      <UserIcon className="mr-2 size-4" />
                      <span>Pengaturan Profil</span>
                    </Link>
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
        </header>

        <main className="mx-auto max-w-[1400px] px-4 pb-28 pt-4 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <div className="lg:hidden">
        <GlassNav
          tabs={nav}
          value={mobileOpen ? "menu" : nav.find(n => n.to === path)?.id || "kasir"}
          onChange={(id) => {
            if (id === "menu") {
              setMobileOpen(true);
            } else {
              setMobileOpen(false);
            }
          }}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          hideClose
          className="h-[80vh] flex flex-col p-0 rounded-t-3xl bg-background lg:hidden"
        >
          <SideNav
            collapsed={false}
            forceExpanded
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
