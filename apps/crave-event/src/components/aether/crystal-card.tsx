import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CrystalBenefitCardProps {
  title: string;
  subtitle: string;
  price?: string;
  badge?: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "primary" | "glass";
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export function CrystalBenefitCard({
  title,
  subtitle,
  price,
  badge,
  features,
  buttonText,
  buttonVariant = "primary",
  onAction,
  className,
  children,
}: CrystalBenefitCardProps) {
  return (
    <div
      className={cn(
        "frosted-glass-card group flex flex-col justify-between p-6 sm:p-8",
        className,
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">{title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{subtitle}</p>
          </div>
          {badge && (
            <span
              className={cn(
                "aether-meta rounded-pill px-3 py-1 font-semibold text-[11px] shrink-0",
                badge.toLowerCase().includes("populer")
                  ? "neu-btn-blue text-white shadow-xs"
                  : "neu-badge-glass text-ink-secondary",
              )}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Pricing Highlight */}
        {price && (
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-ink">{price}</span>
            <span className="text-[12px] font-medium text-ink-tertiary">/ akses penuh</span>
          </div>
        )}

        {children}

        <hr className="my-5 border-hairline" />

        {/* Feature Checklist Items */}
        <ul className="space-y-3">
          {features.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-2">
        <button
          onClick={onAction}
          type="button"
          className={cn(
            "w-full py-3 text-[14px] font-semibold transition-all",
            buttonVariant === "glass"
              ? "neu-btn-glass text-ink hover:text-accent shadow-sm"
              : "neu-btn-blue text-white shadow-md",
          )}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
