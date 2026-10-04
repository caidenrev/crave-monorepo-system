import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  FileBadge,
  Home,
  LayoutGrid,
  ListMusic,
  type LucideIcon,
  Newspaper,
  QrCode,
  Settings,
  Ticket,
  Users,
  LogOut,
  Crown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useApp } from "../../lib/store";
import { assetUrl } from "../../lib/utils";

type NavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  exact?: boolean;
};

const userNav: NavItem[] = [
  { to: "/dashboard", label: "Ringkasan", shortLabel: "Ringkasan", icon: LayoutGrid, exact: true },
  { to: "/dashboard/upcoming", label: "Upcoming Event", shortLabel: "Upcoming", icon: CalendarClock },
  { to: "/dashboard/past", label: "Past Event", shortLabel: "Riwayat", icon: CalendarCheck },
  { to: "/dashboard/certificates", label: "Sertifikat", shortLabel: "Sertifikat", icon: FileBadge },
  { to: "/dashboard/scan", label: "Scan Absensi", shortLabel: "Scan", icon: QrCode },
  { to: "/dashboard/settings", label: "Pengaturan", shortLabel: "Akun", icon: Settings },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Ringkasan", shortLabel: "Ringkasan", icon: LayoutGrid, exact: true },
  { to: "/admin/events", label: "Kelola Event", shortLabel: "Event", icon: Ticket },
  { to: "/admin/attendees", label: "Peserta", shortLabel: "Peserta", icon: Users },
  { to: "/admin/playlists", label: "Playlist", shortLabel: "Playlist", icon: ListMusic },
  { to: "/admin/blog", label: "Blog", shortLabel: "Blog", icon: Newspaper },
];

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: "user" | "admin";
  user?: { name: string; email: string; role: string } | null;
  children?: ReactNode;
}) {
  const { logoutUser } = useApp();
  const location = useLocation();
  const nav = role === "admin" ? adminNav : userNav;

  const displayUser = user || {
    name: role === "admin" ? "Eka Revandi" : "Peserta",
    email: role === "admin" ? "host@crave.id" : "peserta@crave.id",
    role: role === "admin" ? "Speaker / Host" : "Peserta",
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile Top Bar: Clean Branding, Home Shortcut & Quick Logout */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline/80 bg-white/85 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex items-center gap-2 select-none group">
          <img
            src={assetUrl("/logo.png")}
            alt="Crave Event Logo"
            className="size-7 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[14.5px] font-bold text-ink">Crave Event</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="neu-btn-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-secondary hover:text-accent shadow-xs active:scale-95 transition-all"
          >
            <Home className="size-3.5 text-accent" strokeWidth={2.2} />
            <span className="hidden xs:inline">Beranda</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              window.location.href = "/";
            }}
            title="Keluar dari akun"
            className="neu-btn-glass flex size-8.5 items-center justify-center rounded-full text-ink-tertiary hover:text-rose-500 hover:border-rose-200 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-xl p-4 lg:flex">
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={assetUrl("/logo.png")}
                alt="Crave Event Logo"
                className="size-7.5 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-[15px] font-semibold text-ink">Crave Event</span>
            </Link>
            <Link
              to="/"
              title="Ke Beranda Utama"
              className="neu-btn-glass flex size-8 items-center justify-center rounded-lg text-ink-tertiary hover:text-accent transition-all"
            >
              <Home className="size-4" strokeWidth={2} />
            </Link>
          </div>

          {/* Quick Home Shortcut in Sidebar */}
          <Link
            to="/"
            className="neu-btn-glass mt-3.5 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-ink-secondary hover:text-accent group transition-all"
          >
            <span className="flex items-center gap-2">
              <Home className="size-3.5 text-accent" strokeWidth={2.2} />
              <span>Ke Halaman Utama</span>
            </span>
            <ArrowRight className="size-3 text-ink-tertiary group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <p className="aether-meta mt-5 px-3 text-ink-tertiary">
            {role === "admin" ? "Panel Speaker" : "Dashboard Peserta"}
          </p>

          <nav className="mt-2 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                activeProps={{ className: "bg-accent-tint !text-accent-strong" }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium text-ink-secondary transition-colors hover:bg-white/70 hover:text-ink"
              >
                <item.icon className="size-[18px]" strokeWidth={1.9} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            {Boolean(displayUser.role?.toLowerCase().includes("super")) && (
              <Link
                to={role === "admin" ? "/dashboard" : "/admin"}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-ink-tertiary hover:text-accent"
              >
                Beralih ke {role === "admin" ? "dashboard peserta" : "panel speaker"}
              </Link>
            )}
            <div className={`mt-2 flex items-center justify-between gap-2 rounded-xl p-2.5 shadow-xs border transition-all ${
              displayUser.role?.toLowerCase().includes("super")
                ? "bg-purple-50/70 border-purple-200/80"
                : "bg-white/70 border-white/80"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {displayUser.role?.toLowerCase().includes("super") ? (
                  <span className="flex size-8.5 shrink-0 items-center justify-center rounded-pill bg-purple-600 text-white shadow-xs">
                    <Crown className="size-4" />
                  </span>
                ) : (
                  <span className="flex size-8.5 shrink-0 items-center justify-center rounded-pill bg-accent-tint text-[12px] font-bold text-accent-strong">
                    {displayUser.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{displayUser.name}</p>
                    {displayUser.role?.toLowerCase().includes("super") && (
                      <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[8.5px] font-extrabold text-purple-700">
                        ROOT
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10.5px] text-ink-tertiary capitalize">
                    {displayUser.role?.toLowerCase().includes("super") ? "Super Admin" : displayUser.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  window.location.href = "/";
                }}
                title="Keluar dari akun"
                className="neu-btn-glass p-1.5 text-ink-tertiary hover:text-rose-500 rounded-lg shrink-0 transition-colors"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-28 lg:pb-6">
          {/* Desktop Breadcrumb & Pintasan Cepat ke Home */}
          <div className="mb-5 hidden items-center justify-between rounded-xl border border-hairline/60 bg-white/60 px-4 py-2.5 backdrop-blur-md lg:flex">
            <nav className="flex items-center gap-2 text-[13px] text-ink-tertiary">
              <Link
                to="/"
                className="flex items-center gap-1.5 font-medium text-ink-secondary hover:text-accent transition-colors"
              >
                <Home className="size-3.5 text-accent" strokeWidth={2.2} />
                <span>Beranda</span>
              </Link>
              <span className="text-ink-quaternary">/</span>
              <span className="font-semibold text-ink">
                {role === "admin" ? "Panel Speaker" : "Dashboard Peserta"}
              </span>
            </nav>
            <Link
              to="/"
              className="neu-btn-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink-secondary hover:text-accent transition-all hover:shadow-xs active:scale-95"
            >
              <Home className="size-3.5 text-accent" strokeWidth={2.2} />
              <span>Kembali ke Website</span>
            </Link>
          </div>

          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom nav with animated sliding capsule switch */}
      <MobileBottomNav items={nav.slice(0, 5)} />
    </div>
  );
}

function MobileBottomNav({ items }: { items: NavItem[] }) {
  const location = useLocation();
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Determine active item based on current pathname
  const activeItem =
    items.find((item) =>
      item.exact
        ? location.pathname === item.to
        : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    ) ?? items[0];

  const updateIndicator = useCallback(() => {
    if (!activeItem) return;
    const el = itemRefs.current.get(activeItem.to);
    if (el) {
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
        ready: true,
      });
    }
  }, [activeItem]);

  useEffect(() => {
    updateIndicator();
    const frame = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(frame);
  }, [updateIndicator, location.pathname]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div className="fixed inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 z-40 max-w-md mx-auto lg:hidden">
      <nav className="neu-capsule-track relative flex w-full items-center justify-between rounded-pill p-1.5 shadow-[0_14px_36px_-6px_rgba(15,23,42,0.18),0_2px_8px_rgba(0,0,0,0.04)] border border-white/85 bg-white/95 backdrop-blur-xl">
        {/* Animated Sliding Glider Thumb (iOS switch style with spring curve) */}
        {activeItem && (
          <span
            className="neu-capsule-thumb"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              top: "6px",
              bottom: "6px",
              opacity: indicator.ready ? 1 : 0,
            }}
          />
        )}

        {items.map((item) => {
          const isActive = activeItem?.to === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              ref={(el) => {
                if (el) itemRefs.current.set(item.to, el);
                else itemRefs.current.delete(item.to);
              }}
              className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-pill py-2 px-1 text-[10.5px] font-semibold transition-colors duration-200 select-none ${
                isActive ? "text-white" : "text-ink-secondary hover:text-ink"
              }`}
            >
              <item.icon
                className={`size-4 shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : "scale-100"}`}
                strokeWidth={isActive ? 2.3 : 1.9}
              />
              <span className="truncate leading-none">
                {item.shortLabel ?? item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.012em] text-ink sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1 text-[15px] text-ink-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
