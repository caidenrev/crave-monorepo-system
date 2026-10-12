import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CreditCard,
  LayoutGrid,
  LogOut,
  Moon,
  Settings,
  Store,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import GlassNav from "@/components/GlassNav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

const NAV: { id: string; to: string; label: string; icon: LucideIcon }[] = [
  { id: "ringkasan", to: "/founder", label: "Ringkasan", icon: LayoutGrid },
  { id: "merchant", to: "/founder/merchant", label: "Merchant", icon: Store },
  { id: "pembayaran", to: "/founder/pembayaran", label: "Pembayaran", icon: CreditCard },
  { id: "pengaturan", to: "/founder/pengaturan", label: "Pengaturan", icon: Settings },
];

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return { dark, toggle: () => document.documentElement.classList.toggle("dark") };
}

/** Kerangka dashboard founder: navigasi sendiri, terpisah dari aplikasi kasir. */
export function FounderShell({ children }: { children: ReactNode }) {
  const rawPath = useRouterState({ select: (s) => s.location.pathname });
  const path = (rawPath.replace(/^\/pos-system/, "") || "/").replace(/\/$/, "") || "/";
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { dark, toggle } = useDark();
  const active = NAV.find((n) => n.to === path)?.id ?? "ringkasan";

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar p-4 lg:flex">
        <div className="flex items-center gap-3 px-2 py-1">
          <img
            src={`${import.meta.env.BASE_URL}${dark ? "dark" : "light"}-mode-logo.png`}
            alt=""
            className="size-9 rounded-xl object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-extrabold tracking-tight">Crave</p>
            <p className="truncate text-[11px] text-muted-foreground">Founder Console</p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active === item.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t pt-3">
          <p className="truncate px-2 text-xs text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-xl"
              onClick={toggle}
              aria-label={dark ? "Mode terang" : "Mode gelap"}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={signOut}>
              <LogOut className="size-4" /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight">Crave</p>
            <p className="text-[11px] text-muted-foreground">Founder Console</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={toggle}
              aria-label={dark ? "Mode terang" : "Mode gelap"}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl" onClick={signOut} aria-label="Keluar">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-3 pb-28 pt-4 sm:px-6 lg:pb-10 lg:pt-6">{children}</main>
      </div>

      <div className="fixed bottom-5 left-3 right-3 z-[9999] mx-auto lg:hidden" style={{ maxWidth: 480 }}>
        <GlassNav
          tabs={NAV.map(({ id, label, icon }) => ({ id, label, icon }))}
          value={active}
          theme={dark ? "dark" : "light"}
          onChange={(id) => {
            const item = NAV.find((n) => n.id === id);
            if (item) void navigate({ to: item.to });
          }}
        />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
