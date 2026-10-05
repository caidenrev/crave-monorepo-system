import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Menu, ScanBarcode, Boxes, Wallet, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import GlassNav from "@/components/GlassNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SideNav } from "@/components/SideNav";

const bottomTabs: { id: string; to: string; label: string; icon: LucideIcon }[] = [
  { id: "kasir", to: "/", label: "Kasir", icon: ScanBarcode },
  { id: "dasbor", to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
  { id: "stok", to: "/stok", label: "Stok", icon: Boxes },
  { id: "pengeluaran", to: "/pengeluaran", label: "Pengeluaran", icon: Wallet },
  { id: "lainnya", to: "#menu", label: "Lainnya", icon: Menu },
];

function useHtmlDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/**
 * Navigasi mobile persisten — dirender sekali di root layout.
 * Karena tidak ikut remount saat pindah route, state animasi GlassNav
 * (spring, lift, slide kenyal) tetap utuh selama transisi halaman.
 */
export function PersistentNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const dark = useHtmlDark();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthRoute = path === "/login" || path === "/pin";

  const isMainRoute = bottomTabs.some((item) => item.to !== "#menu" && item.to === path);
  const activeTab =
    mobileOpen || !isMainRoute
      ? "lainnya"
      : (bottomTabs.find((item) => item.to === path)?.id ?? "kasir");

  if (isAuthRoute) return null;

  return (
    <>
      <div
        className="lg:hidden fixed bottom-5 left-3 right-3 z-[9999] mx-auto"
        style={{ maxWidth: 480 }}
      >
        <GlassNav
          tabs={[
            { id: "kasir", label: "Kasir", icon: ScanBarcode },
            { id: "dasbor", label: "Dasbor", icon: LayoutDashboard },
            { id: "stok", label: "Stok", icon: Boxes },
            { id: "pengeluaran", label: "Pengeluaran", icon: Wallet },
            { id: "lainnya", label: "Lainnya", icon: Menu, noFill: true },
          ]}
          value={activeTab}
          theme={dark ? "dark" : "light"}
          onChange={(id) => {
            if (id === "lainnya") {
              setMobileOpen(true);
              return;
            }
            const tab = bottomTabs.find((item) => item.id === id);
            if (!tab || tab.to === "#menu") return;
            setMobileOpen(false);
            void navigate({ to: tab.to });
          }}
        />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          hideClose
          className="h-[80vh] flex flex-col p-0 rounded-t-3xl bg-background"
        >
          <SideNav collapsed={false} forceExpanded onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
