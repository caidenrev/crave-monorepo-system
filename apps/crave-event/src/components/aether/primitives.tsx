import { createLink, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Surfaces ---------------- */

export function GlassCard({
  className,
  children,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode }) {
  return (
    <div className={cn("glass relative overflow-hidden rounded-lg", className)} {...props}>
      {children}
    </div>
  );
}

export function NeuCard({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("neu rounded-lg", className)} {...props}>
      {children}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

type ButtonVariant = "primary" | "glass" | "ghost" | "danger" | "neu-blue" | "neu-glass";
type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
  children: ReactNode;
};

function buttonClasses(opts?: {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
}) {
  const variant = opts?.variant ?? "primary";
  const size = opts?.size ?? "md";
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-pill font-medium select-none cursor-pointer",
    size === "sm"
      ? "px-4 py-2 text-[13px]"
      : size === "lg"
        ? "px-8 py-3.5 text-[16px]"
        : "px-6 py-2.5 text-[14px] sm:text-[15px]",
    (variant === "primary" || variant === "neu-blue") && "neu-btn-blue font-semibold",
    (variant === "glass" || variant === "neu-glass") && "neu-btn-glass font-medium",
    variant === "ghost" && "text-ink-secondary hover:text-accent hover:bg-accent-tint lift",
    variant === "danger" && "bg-danger text-white lift",
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonBaseProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={cn(buttonClasses({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

const BasicButtonLink = forwardRef<
  HTMLAnchorElement,
  ButtonBaseProps & ComponentProps<"a">
>(({ variant, size, className, children, ...props }, ref) => {
  return (
    <a ref={ref} className={cn(buttonClasses({ variant, size }), className)} {...props}>
      {children}
    </a>
  );
});
BasicButtonLink.displayName = "ButtonLink";

export const ButtonLink = createLink(BasicButtonLink);

/** Arrow button from components.md §2 — label + round accent chip. */
export function ArrowButton({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "neu-btn-glass group inline-flex items-center gap-3 rounded-pill py-1.5 pr-2 pl-6 text-[15px] font-semibold text-ink transition-all hover:text-accent shadow-sm",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <span className="flex size-9 items-center justify-center rounded-pill neu-btn-blue text-white transition-transform duration-200 group-hover:scale-105 shadow-sm">
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}

/* ---------------- Badges & chips ---------------- */

export function Badge({
  tone = "accent",
  children,
  className,
}: {
  tone?: "accent" | "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "aether-meta inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-semibold transition-all",
        tone === "accent" && "neu-badge-accent",
        tone === "neutral" && "neu-badge-glass text-ink-secondary",
        tone === "success" && "neu-badge-success font-semibold",
        tone === "warning" && "neu-badge-warning font-semibold",
        tone === "danger" && "neu-badge-glass text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Filter tabs (glider) ---------------- */

export function FilterTabs({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateIndicator = useCallback(() => {
    const btn = buttonRefs.current.get(value);
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        ready: true,
      });
    }
  }, [value]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, options]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      className={cn(
        "neu-capsule-track relative inline-flex items-center w-auto",
        className,
      )}
    >
      <span
        className="neu-capsule-thumb"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          ref={(el) => {
            if (el) buttonRefs.current.set(o.value, el);
            else buttonRefs.current.delete(o.value);
          }}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 rounded-pill px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer select-none",
            o.value === value ? "text-white" : "text-ink-secondary hover:text-ink",
          )}
        >
          <span>{o.label}</span>
          {typeof o.count === "number" && (
            <span
              className={cn(
                "aether-meta rounded-pill px-1.5 py-0.5 text-[10px]",
                o.value === value ? "bg-white/25 text-white" : "bg-black/5 text-ink-tertiary",
              )}
            >
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Search ---------------- */

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-pill bg-white/75 backdrop-blur-md border border-white/90 px-4 py-2.5 sm:px-5 sm:py-3 transition-all cursor-text",
        "shadow-[0_4px_14px_rgba(15,23,42,0.06),inset_2px_2px_4px_rgba(165,175,190,0.25),inset_-2px_-2px_4px_#ffffff]",
        "focus-within:bg-white/95 focus-within:border-white focus-within:shadow-[0_6px_20px_rgba(15,23,42,0.1),inset_2px_2px_4px_rgba(165,175,190,0.2),inset_-2px_-2px_4px_#ffffff]",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        className="size-[18px] shrink-0 text-ink-tertiary"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] sm:text-[15px] text-ink placeholder:text-ink-tertiary border-none outline-none ring-0 shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0"
      />
      <kbd className="aether-meta hidden rounded-sm bg-neu px-2 py-1 text-ink-tertiary sm:block">
        ⌘K
      </kbd>
    </label>
  );
}

/* ---------------- Stat card (neumorphic user design) ---------------- */

export function StatCard({
  label,
  value,
  trend,
  progress = 75,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  progress?: number;
  icon: ReactNode;
}) {
  return (
    <div className="neu-stat-card flex flex-col justify-between">
      {/* Top row: Icon on left, Trend badge on right */}
      <div className="flex items-center justify-between gap-1.5 w-full">
        <span className="neu-stat-icon shrink-0">
          <span className="flex size-4 items-center justify-center text-white [&>svg]:size-3.5">
            {icon}
          </span>
        </span>
        {trend && (
          <p className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#02972f] shrink-0 rounded-pill bg-[#02972f]/10 px-2 py-0.5 whitespace-nowrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1792 1792"
              fill="currentColor"
              className="size-2.5 shrink-0"
            >
              <path d="M1408 1216q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45 19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45z" />
            </svg>
            <span>{trend}</span>
          </p>
        )}
      </div>

      {/* Content: Label & Value */}
      <div className="data mt-3 flex flex-col justify-start">
        <p className="text-[12px] sm:text-[13px] font-semibold text-[#4b5563] leading-snug">
          {label}
        </p>
        <p className="mt-1 text-[24px] sm:text-[32px] font-bold leading-tight tracking-tight text-[#111827] text-left">
          {value}
        </p>
        <div className="neu-stat-range mt-2.5">
          <div
            className="neu-stat-fill"
            style={{ width: `${Math.min(Math.max(progress ?? 75, 5), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionHeading({
  overline,
  title,
  description,
  action,
}: {
  overline?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        {overline && <p className="aether-meta text-accent">{overline}</p>}
        <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-[28px]">{title}</h2>
        {description && <p className="mt-2 text-[15px] text-ink-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
