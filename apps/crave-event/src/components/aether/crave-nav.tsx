import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useApp } from "@/lib/store";
import { CraveSymbol } from "./brand";

/**
 * Landing navbar in the Crave style (same behaviour as the POS landing and Crave Pay):
 * transparent over the blue hero, then it shrinks into a floating white pill on scroll.
 * Uppercase numbered items with a hover highlight that slides between them; on phones a
 * large numbered menu.
 */

type NavItem = { label: string; to?: "/events" | "/blog"; hash?: string };

const NAV: NavItem[] = [
  { label: "Event", to: "/events" },
  { label: "Jadwal", hash: "jadwal" },
  { label: "Speaker", hash: "speaker" },
  { label: "FAQ", hash: "faq" },
  { label: "Blog", to: "/blog" },
];

const FLOATING_SHADOW =
  "0 0 24px rgba(34,42,53,0.06), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(34,42,53,0.04), 0 0 4px rgba(34,42,53,0.08), 0 16px 68px rgba(47,48,55,0.05)";

const num = (i: number) => String(i + 1).padStart(2, "0");

function scrollToHash(e: MouseEvent, hash: string, after?: () => void) {
  const el = document.getElementById(hash);
  if (!el) return;
  e.preventDefault();
  after?.();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${hash}`);
}

function MenuToggle({ open, onClick, className }: { open: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      aria-expanded={open}
      className={`relative flex size-9 cursor-pointer items-center justify-center ${className ?? ""}`}
    >
      <svg viewBox="0 0 32 32" className={`size-7 transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? "-rotate-45" : ""}`}>
        <path
          className="fill-none stroke-current stroke-[3] [stroke-linecap:round] [stroke-linejoin:round] transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ strokeDasharray: open ? "20 300" : "12 63", strokeDashoffset: open ? "-32.42" : "0" }}
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        />
        <path className="fill-none stroke-current stroke-[3] [stroke-linecap:round] [stroke-linejoin:round]" d="M7 16 27 16" />
      </svg>
    </button>
  );
}

function NavLink({
  item,
  className,
  onNavigate,
  onMouseEnter,
  children,
}: {
  item: NavItem;
  className: string;
  onNavigate?: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}) {
  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onNavigate} onMouseEnter={onMouseEnter}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={`#${item.hash}`}
      className={className}
      onMouseEnter={onMouseEnter}
      onClick={(e) => scrollToHash(e, item.hash!, onNavigate)}
    >
      {children}
    </a>
  );
}

function Brand({ light, compact }: { light: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 select-none">
      <CraveSymbol
        className={`transition-all duration-500 group-hover:scale-105 ${compact ? "size-7" : "size-8"} ${light ? "text-white" : "text-accent"}`}
      />
      <span
        className={`font-semibold tracking-[-0.02em] whitespace-nowrap transition-all duration-500 ${compact ? "text-[17px]" : "text-[19px]"} ${light ? "text-white" : "text-ink"}`}
      >
        Crave Event
      </span>
    </Link>
  );
}

export function CraveNav() {
  const { currentUser, logoutUser } = useApp();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hover, setHover] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loggedIn = mounted && !!currentUser;
  const role = currentUser?.role?.toLowerCase() ?? "";
  const isHost = /super|speaker|host|admin/.test(role);
  const dashboardTo = isHost ? "/admin" : "/dashboard";

  const onItemEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const nav = navRef.current?.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    if (nav) setHover({ left: r.left - nav.left, width: r.width });
  };

  const solid = scrolled || mobileOpen;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2.5 z-[100] w-full">
      {/* Desktop */}
      <div
        style={{ boxShadow: scrolled ? FLOATING_SHADOW : "none", minWidth: 800 }}
        className={`pointer-events-auto relative mx-auto hidden max-w-[1220px] items-center justify-between px-6 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] lg:flex ${
          scrolled ? "w-[80%] translate-y-2.5 rounded-full bg-white/90 backdrop-blur-md" : "w-full rounded-b-2xl bg-transparent"
        }`}
      >
        <div className="relative z-20">
          <Brand light={!scrolled} compact={scrolled} />
        </div>

        <nav
          ref={navRef}
          aria-label="Navigasi halaman"
          onMouseLeave={() => setHover(null)}
          className="absolute inset-0 flex items-center justify-center gap-1 text-[13px]"
        >
          <span
            aria-hidden="true"
            className={`absolute top-1/2 h-9 -translate-y-1/2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.5,1.4,0.4,1)] ${
              scrolled ? "bg-accent-tint" : "bg-white/15"
            } ${hover ? "opacity-100" : "opacity-0"}`}
            style={{ left: hover?.left ?? 0, width: hover?.width ?? 0 }}
          />
          {NAV.map((item, i) => (
            <NavLink key={item.label} item={item} onMouseEnter={onItemEnter} className="relative z-10 px-4 py-2">
              <span className="flex items-start">
                <span className={`font-black tracking-tight uppercase transition-colors ${scrolled ? "text-ink" : "text-white"}`}>
                  {item.label}
                </span>
                <span className={`mt-0.5 ml-0.5 text-[10px] font-bold ${scrolled ? "text-accent" : "text-white/60"}`}>{num(i)}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="relative z-20 flex items-center gap-2">
          {loggedIn ? (
            <Link
              to={dashboardTo}
              className={`rounded-full px-5 py-2 text-[13px] font-bold transition duration-200 hover:-translate-y-0.5 ${
                scrolled ? "bg-ink text-white" : "bg-white text-accent shadow-sm"
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition duration-200 hover:-translate-y-0.5 ${scrolled ? "text-ink" : "text-white"}`}
              >
                Masuk
              </Link>
              <Link
                to="/auth"
                className={`rounded-full px-5 py-2 text-[13px] font-bold transition duration-200 hover:-translate-y-0.5 ${
                  scrolled ? "bg-accent text-white shadow-[0_6px_16px_rgba(10,132,255,0.3)]" : "bg-white text-accent shadow-sm"
                }`}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Phone & tablet */}
      <div
        style={{ boxShadow: solid ? FLOATING_SHADOW : "none" }}
        className={`pointer-events-auto relative mx-auto flex flex-col overflow-hidden py-3 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] lg:hidden ${
          solid
            ? `w-[92%] translate-y-2.5 bg-white/95 px-3.5 backdrop-blur-md ${mobileOpen ? "rounded-3xl" : "rounded-[32px]"}`
            : "w-full bg-transparent px-5"
        }`}
      >
        <div className="flex w-full items-center justify-between">
          <Brand light={!solid} compact />
          <div className="flex items-center gap-2">
            {!solid && (
              <Link
                to={loggedIn ? dashboardTo : "/auth"}
                className="rounded-full border border-white/50 px-4 py-1.5 text-[12px] font-bold text-white"
              >
                {loggedIn ? "Dashboard" : "Daftar"}
              </Link>
            )}
            <MenuToggle open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} className={solid ? "text-ink" : "text-white"} />
          </div>
        </div>

        <div
          className={`grid w-full transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
            mobileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-5 pb-2">
              {NAV.map((item, i) => (
                <NavLink
                  key={item.label}
                  item={item}
                  onNavigate={() => setMobileOpen(false)}
                  className="flex items-start py-1.5 text-ink transition-colors hover:text-accent"
                >
                  <span
                    className={`text-[34px] leading-none font-black tracking-tighter uppercase transition-all duration-500 sm:text-[44px] ${
                      mobileOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: mobileOpen ? `${80 + i * 60}ms` : "0ms" }}
                  >
                    {item.label}
                  </span>
                  <span className="mt-1 ml-1 text-[13px] font-semibold text-ink-tertiary">{num(i)}</span>
                </NavLink>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2">
                {loggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        setMobileOpen(false);
                      }}
                      className="rounded-full border border-ink/15 py-2.5 text-center text-[13px] font-bold text-ink"
                    >
                      Keluar
                    </button>
                    <Link
                      to={dashboardTo}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-accent py-2.5 text-center text-[13px] font-bold text-white"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full border border-ink/15 py-2.5 text-center text-[13px] font-bold text-ink"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-accent py-2.5 text-center text-[13px] font-bold text-white"
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
