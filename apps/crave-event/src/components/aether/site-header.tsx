import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useApp } from "../../lib/store";
import { assetUrl } from "../../lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Code2,
  Globe,
  Layers,
  ArrowRight,
  Zap,
  ShieldCheck,
  Github,
  Instagram,
  Linkedin,
  Mail,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";

function DesktopNavGlider({
  isDesktopEventOpen,
  setIsDesktopEventOpen,
  desktopDropdownRef,
  eventCategories,
  closeAllMenus,
}: {
  isDesktopEventOpen: boolean;
  setIsDesktopEventOpen: React.Dispatch<React.SetStateAction<boolean>>;
  desktopDropdownRef: React.RefObject<HTMLDivElement | null>;
  eventCategories: {
    title: string;
    desc: string;
    to: string;
    icon: any;
    badge: string;
  }[];
  closeAllMenus: () => void;
}) {
  const location = useLocation();
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Determine active tab based on current pathname
  const currentTab =
    location.pathname === "/"
      ? "home"
      : location.pathname.startsWith("/events")
        ? "events"
        : location.pathname.startsWith("/blog")
          ? "blog"
          : null;

  const updateIndicator = useCallback(() => {
    if (!currentTab || !containerRef.current) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }
    const el = itemRefs.current.get(currentTab);
    if (el) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        ready: true,
      });
    }
  }, [currentTab]);

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
    <div
      ref={containerRef}
      className="relative inline-flex items-center p-1 rounded-pill bg-slate-200/55 backdrop-blur-md border border-white/85 shadow-[inset_1.5px_1.5px_3px_rgba(165,175,190,0.22),inset_-1.5px_-1.5px_3px_#ffffff] !overflow-visible"
    >
      {/* Animated Sliding Glider Thumb (iOS spring switch) */}
      {currentTab && (
        <span
          className="neu-capsule-thumb absolute rounded-pill transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: `${indicator.width}px`,
            top: "4px",
            bottom: "4px",
            opacity: indicator.ready ? 1 : 0,
          }}
        />
      )}

      {/* 1. Beranda */}
      <Link
        to="/"
        onClick={closeAllMenus}
        activeOptions={{ exact: true }}
        ref={(el) => {
          if (el) itemRefs.current.set("home", el);
          else itemRefs.current.delete("home");
        }}
        className={`relative z-10 rounded-pill px-4.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 select-none ${currentTab === "home" ? "text-white" : "text-ink-secondary hover:text-ink"
          }`}
      >
        Beranda
      </Link>

      {/* 2. Event with Dropdown */}
      <div
        ref={desktopDropdownRef}
        className="relative"
        onMouseEnter={() => setIsDesktopEventOpen(true)}
        onMouseLeave={() => setIsDesktopEventOpen(false)}
      >
        <button
          type="button"
          ref={(el) => {
            if (el) itemRefs.current.set("events", el);
            else itemRefs.current.delete("events");
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsDesktopEventOpen((prev) => !prev);
          }}
          className={`relative z-10 flex items-center gap-1.5 rounded-pill px-4.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 cursor-pointer select-none ${currentTab === "events"
            ? "text-white"
            : isDesktopEventOpen
              ? "text-accent-strong"
              : "text-ink-secondary hover:text-ink"
            }`}
        >
          <span>Event</span>
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${isDesktopEventOpen ? "rotate-180" : ""
              } ${currentTab === "events"
                ? "text-white"
                : isDesktopEventOpen
                  ? "text-accent-strong"
                  : "text-ink-tertiary"
              }`}
            strokeWidth={2.4}
          />
        </button>

        {/* Desktop Dropdown Panel with Seamless Hover Bridge */}
        {isDesktopEventOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-84 rounded-[26px] p-2.5 border border-slate-200/90 bg-white shadow-[0_24px_50px_-8px_rgba(15,23,42,0.22),0_6px_18px_rgba(15,23,42,0.06)]">
              <div className="px-3.5 py-1.5 mb-1.5 border-b border-hairline/80 flex items-center justify-between">
                <span className="aether-meta text-[10.5px] font-bold text-ink-tertiary tracking-wider uppercase">
                  Jelajahi Program
                </span>
                <Link
                  to="/events"
                  onClick={closeAllMenus}
                  className="text-[11.5px] font-semibold text-accent hover:text-accent-strong flex items-center gap-1"
                >
                  Katalog <ArrowRight className="size-3" strokeWidth={2.5} />
                </Link>
              </div>
              <div className="space-y-1">
                {eventCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={idx}
                      to={cat.to}
                      onClick={closeAllMenus}
                      className="flex items-start gap-3 rounded-2xl p-2.5 text-left transition-all hover:bg-slate-50/90 group"
                    >
                      <div className="neu-icon-sphere size-8.5 shrink-0">
                        <Icon className="size-4 text-white" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[13px] font-semibold text-ink leading-snug group-hover:text-accent-strong transition-colors">
                            {cat.title}
                          </span>
                          <span className="text-[10px] rounded-pill bg-accent-tint/60 px-2 py-0.5 font-bold text-accent-strong">
                            {cat.badge}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-ink-secondary truncate mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Blog */}
      <Link
        to="/blog"
        onClick={closeAllMenus}
        ref={(el) => {
          if (el) itemRefs.current.set("blog", el);
          else itemRefs.current.delete("blog");
        }}
        className={`relative z-10 rounded-pill px-4.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 select-none ${currentTab === "blog" ? "text-white" : "text-ink-secondary hover:text-ink"
          }`}
      >
        Blog
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const { currentUser, logoutUser } = useApp();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktopEventOpen, setIsDesktopEventOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileEventOpen, setIsMobileEventOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoggedIn = isMounted && !!currentUser;

  const isSuper = currentUser?.role?.toLowerCase().includes("super");
  const isSpeaker =
    isSuper ||
    currentUser?.role?.toLowerCase().includes("speaker") ||
    currentUser?.role?.toLowerCase().includes("host") ||
    currentUser?.role?.toLowerCase().includes("admin");
  const dashboardTarget = isSpeaker ? "/admin" : "/dashboard";
  const dashboardLabel = isSuper
    ? "Super Admin"
    : isSpeaker
      ? "Panel Speaker"
      : "Dashboard";

  // Auto-close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDesktopEventOpen(false);
    setIsMobileEventOpen(false);
  }, [location.pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDesktopEventOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDesktopEventOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobileEventOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeAllMenus = () => {
    setIsDesktopEventOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileEventOpen(false);
  };

  const eventCategories = [
    {
      title: "Semua Event",
      desc: "Katalog lengkap jadwal webinar & workshop",
      to: "/events",
      icon: Calendar,
      badge: "Katalog",
    },
    {
      title: "Tech & Architecture",
      desc: "Diskusi backend, cloud, dan AI engineering",
      to: "/events",
      icon: Code2,
      badge: "#TECHTALK",
    },
    {
      title: "English Club",
      desc: "Praktik speaking & pronunciation lab",
      to: "/events",
      icon: Globe,
      badge: "#ENGLISHCLUB",
    },
    {
      title: "Workshop & Lab",
      desc: "Pelatihan teknis intensif langsung praktik",
      to: "/events",
      icon: Layers,
      badge: "Hands-on",
    },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Mobile backdrop scrim when menu is open */}
      {isMobileMenuOpen && (
        <div
          onClick={closeAllMenus}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <div className="relative z-50 mx-auto max-w-6xl px-4 pt-3 sm:pt-4">
        {/* Reservation wrapper so page layout below never shifts/reflows during animation */}
        <div className="h-[48px] sm:h-auto relative">
          {/* Unified Expandable Capsule Navbar */}
          <nav
            className={`w-full rounded-[26px] border border-white/80 bg-white md:bg-white/70 md:backdrop-blur-xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.08),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_#ffffff] transition-shadow duration-200 overflow-hidden transform-gpu absolute top-0 left-0 right-0 md:relative md:top-auto md:left-auto md:right-auto ${
              isMobileMenuOpen ? "shadow-2xl ring-1 ring-slate-900/5" : ""
            }`}
          >
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between w-full">
          {/* Left Side: Brand Logo */}
          <div className="flex items-center min-w-0 flex-1 justify-start">
            <Link
              to="/"
              onClick={closeAllMenus}
              className="flex items-center gap-2.5 px-1 py-1 select-none group"
            >
              <img
                src={assetUrl("/logo.png")}
                alt="Crave Event Logo"
                className="size-8 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-[15px] sm:text-[16px] font-bold tracking-tight text-ink">
                Crave Event
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links with Animated Glider Switch */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <DesktopNavGlider
              isDesktopEventOpen={isDesktopEventOpen}
              setIsDesktopEventOpen={setIsDesktopEventOpen}
              desktopDropdownRef={desktopDropdownRef}
              eventCategories={eventCategories}
              closeAllMenus={closeAllMenus}
            />
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            {isLoggedIn ? (
              <>
                <Link
                  to={dashboardTarget}
                  onClick={closeAllMenus}
                  className="neu-btn-blue px-3.5 sm:px-4 py-1.5 text-[12.5px] sm:text-[13px] font-semibold text-white flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>{dashboardLabel}</span>
                </Link>
                <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-slate-200/90">
                  <span
                    className="hidden md:inline-block text-[12px] font-semibold text-ink max-w-[85px] truncate"
                    title={currentUser?.name}
                  >
                    {currentUser?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logoutUser();
                      toast.info("Anda telah keluar dari akun.");
                    }}
                    title="Keluar dari akun"
                    className="neu-btn-glass px-2.5 py-1 text-[11.5px] font-semibold text-ink-tertiary hover:text-rose-500 hover:border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth"
                  search={{ mode: "login" }}
                  onClick={closeAllMenus}
                  className="neu-btn-glass px-3.5 sm:px-4 py-1.5 text-[12.5px] sm:text-[13px] font-semibold text-ink-secondary hover:text-accent transition-all"
                >
                  Masuk
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "register" }}
                  onClick={closeAllMenus}
                  className="neu-btn-blue px-4 sm:px-5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold text-white shadow-sm hover:shadow transition-all"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
              className="md:hidden neu-btn-glass flex size-8.5 items-center justify-center rounded-full text-ink hover:text-accent active:scale-95 transition-transform cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="size-4.5 text-accent-strong" />
              ) : (
                <Menu className="size-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Expanding Drawer - Butter-smooth 60fps CSS Grid Accordion */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[grid-template-rows,opacity] md:hidden ${
            isMobileMenuOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pt-3 mt-3 pb-1 border-t border-hairline/80 space-y-1.5 px-0.5">
            {/* Beranda */}
            <Link
              to="/"
              onClick={closeAllMenus}
              activeOptions={{ exact: true }}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-accent-tint text-accent-strong font-bold"
                  : "text-ink hover:bg-slate-50/80"
              }`}
            >
              <div className="neu-icon-sphere size-8 shrink-0">
                <Home className="size-4 text-white" strokeWidth={2.2} />
              </div>
              <span>Beranda</span>
            </Link>

            {/* Event Dropdown Accordion */}
            <div className="rounded-2xl border border-hairline/80 bg-slate-50/60 overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => setIsMobileEventOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-[14px] font-medium text-ink hover:bg-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="neu-icon-sphere size-8 shrink-0">
                    <Calendar className="size-4 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Event &amp; Webinar</span>
                </div>
                <ChevronDown
                  className={`size-4 text-ink-tertiary transition-transform duration-200 ${
                    isMobileEventOpen ? "rotate-180 text-accent-strong" : ""
                  }`}
                />
              </button>

              {/* Submenu for Event */}
              {isMobileEventOpen && (
                <div className="px-3 pb-2.5 pt-1 space-y-1 border-t border-hairline/60 bg-white">
                  {eventCategories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={idx}
                        to={cat.to}
                        onClick={closeAllMenus}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px] text-ink-secondary hover:text-accent hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="neu-icon-sphere size-7 shrink-0">
                            <Icon className="size-3.5 text-white" strokeWidth={2.2} />
                          </div>
                          <span className="font-medium text-ink">{cat.title}</span>
                        </div>
                        <span className="text-[10px] rounded-pill bg-accent-tint/60 px-2 py-0.5 font-bold text-accent-strong">
                          {cat.badge}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Blog */}
            <Link
              to="/blog"
              onClick={closeAllMenus}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                location.pathname.startsWith("/blog")
                  ? "bg-accent-tint text-accent-strong font-bold"
                  : "text-ink hover:bg-slate-50/80"
              }`}
            >
              <div className="neu-icon-sphere size-8 shrink-0">
                <BookOpen className="size-4 text-white" strokeWidth={2.2} />
              </div>
              <span>Blog &amp; Artikel</span>
            </Link>

            {/* Dashboard Link (if logged in) */}
            {isLoggedIn && (
              <Link
                to={dashboardTarget}
                onClick={closeAllMenus}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium text-ink hover:bg-slate-50/80 transition-colors"
              >
                <div className="neu-icon-sphere size-8 shrink-0">
                  <LayoutDashboard className="size-4 text-white" strokeWidth={2.2} />
                </div>
                <span>{dashboardLabel}</span>
              </Link>
            )}

            {/* Bottom Actions inside same capsule */}
            <div className="border-t border-hairline/80 pt-2.5 mt-2">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div>
                      <p className="text-[13px] font-bold text-ink">{currentUser?.name}</p>
                      <p className="text-[11px] text-ink-tertiary capitalize">{currentUser?.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        closeAllMenus();
                        toast.info("Anda telah keluar dari akun.");
                      }}
                      className="neu-btn-glass px-3 py-1.5 text-[11.5px] font-semibold text-rose-500 hover:border-rose-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                  <Link
                    to="/auth"
                    search={{ mode: "login" }}
                    onClick={closeAllMenus}
                    className="neu-btn-glass py-2 text-center text-[13px] font-semibold text-ink rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="size-3.5 text-accent" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    to="/auth"
                    search={{ mode: "register" }}
                    onClick={closeAllMenus}
                    className="neu-btn-blue py-2 text-center text-[13px] font-semibold text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Daftar Akun</span>
                  </Link>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </nav>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-slate-200/80 bg-gradient-to-b from-white/40 via-slate-50/70 to-slate-100/90 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow accents */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 size-96 rounded-full bg-accent/8 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 right-10 size-80 rounded-full bg-indigo-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top Pre-Footer Callout / Quick CTA Card */}

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-200/80">
          {/* Brand & Description (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
              <img
                src={assetUrl("/logo.png")}
                alt="Crave Event Logo"
                className="size-8.5 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-[18px] font-bold tracking-tight text-ink">
                Crave Event
              </span>
            </Link>
            <p className="text-[13.5px] leading-relaxed text-ink-secondary max-w-sm">
              Platform event management modern generasi baru untuk host webinar &amp; workshop. Presensi kilat via QR code dan penerbitan sertifikat digital berkeamanan tinggi.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Crave Event"
                className="neu-btn-glass flex size-8.5 items-center justify-center p-0 text-ink-secondary hover:text-accent hover:scale-105 transition-transform"
              >
                <Github className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Crave Event"
                className="neu-btn-glass flex size-8.5 items-center justify-center p-0 text-ink-secondary hover:text-accent hover:scale-105 transition-transform"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn Crave Event"
                className="neu-btn-glass flex size-8.5 items-center justify-center p-0 text-ink-secondary hover:text-accent hover:scale-105 transition-transform"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href="mailto:contact@craveevent.id"
                aria-label="Email Support"
                className="neu-btn-glass flex size-8.5 items-center justify-center p-0 text-ink-secondary hover:text-accent hover:scale-105 transition-transform"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Program & Event */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-ink uppercase tracking-wider">
              Program Event
            </h4>
            <ul className="space-y-2 text-[13px] text-ink-secondary">
              <li>
                <Link to="/events" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Semua Webinar
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Tech &amp; Architecture
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  English Speaking Club
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Hands-on Workshop
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Jadwal Mendatang
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fitur & Peserta */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-ink uppercase tracking-wider">
              Layanan Peserta
            </h4>
            <ul className="space-y-2 text-[13px] text-ink-secondary">
              <li>
                <Link to="/dashboard" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Dashboard Saya
                </Link>
              </li>
              <li>
                <Link to="/dashboard/certificates" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Koleksi Sertifikat
                </Link>
              </li>
              <li>
                <Link to="/dashboard/upcoming" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Tiket Terdaftar
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Blog &amp; Artikel Edukasi
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Masuk / Daftar Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Host & Admin */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-bold text-ink uppercase tracking-wider">
              Host &amp; Manajemen
            </h4>
            <ul className="space-y-2 text-[13px] text-ink-secondary">
              <li>
                <Link to="/admin" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Panel Admin Event
                </Link>
              </li>
              <li>
                <Link to="/admin/events/new" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Publikasi Acara Baru
                </Link>
              </li>
              <li>
                <Link to="/dashboard/scan" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Scanner Presensi QR
                </Link>
              </li>
              <li>
                <Link to="/admin/attendees" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Data &amp; Ekspor Peserta
                </Link>
              </li>
              <li>
                <Link to="/admin/playlists" className="hover:text-accent hover:translate-x-0.5 inline-block transition-all">
                  Kurasi Playlist Acara
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-ink-tertiary">
          <div className="flex items-center gap-2">
            <img src={assetUrl("/logo.png")} alt="Crave Event" className="size-5 object-contain" />
            <p>© 2026 Crave Event. Seluruh hak cipta dilindungi.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium">
            <span className="hover:text-ink cursor-pointer transition-colors">Privasi &amp; Keamanan</span>
            <span className="text-slate-300">·</span>
            <span className="hover:text-ink cursor-pointer transition-colors">Syarat Layanan</span>
            <span className="text-slate-300">·</span>
            <span className="hover:text-ink cursor-pointer transition-colors">Bantuan 24/7</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-accent font-semibold">
              <ShieldCheck className="size-3.5" /> Terverifikasi SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
