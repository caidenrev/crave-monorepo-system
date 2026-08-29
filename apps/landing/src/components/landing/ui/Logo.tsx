import { cn } from "@/lib/utils";

interface LogoProps {
  isScrolled?: boolean;
  className?: string;
}

export function Logo({ isScrolled, className }: LogoProps) {
  return (
    <a
      href="/"
      className={cn("relative z-50 flex items-center gap-2 cursor-pointer", className)}
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("start-page-transition", {
            detail: { href: "/", name: "Crave", isHome: true },
          }),
        );
      }}
    >
      <img
        src={isScrolled ? "/image/logo/light-mode-logo.png" : "/image/logo/dark-mode-logo.png"}
        alt="Crave Logo"
        className="h-6 w-auto"
      />
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          isScrolled ? "text-slate-900" : "text-white",
        )}
      >
        Crave
      </span>
    </a>
  );
}
