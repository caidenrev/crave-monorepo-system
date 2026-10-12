import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubscriptionState } from "@/lib/useSubscription";
import type { InvoiceStatus } from "@/lib/useFounder";

export const STATE_LABEL: Record<SubscriptionState, string> = {
  trial: "Trial",
  active: "Aktif",
  grace: "Tenggang",
  expired: "Tidak aktif",
  suspended: "Ditangguhkan",
};

/** Warna status dipakai konsisten di donat, lencana, dan legenda. */
export const STATE_COLOR: Record<SubscriptionState, string> = {
  active: "var(--color-success)",
  trial: "var(--color-chart-2)",
  grace: "var(--color-warning)",
  expired: "var(--color-destructive)",
  suspended: "var(--color-muted-foreground)",
};

export const INVOICE_LABEL: Record<InvoiceStatus, string> = {
  pending: "Menunggu",
  paid: "Lunas",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export const METHOD_LABEL: Record<string, string> = {
  manual: "Manual (founder)",
  qris: "QRIS",
  bank_transfer: "Transfer bank",
  echannel: "Mandiri Bill",
  gopay: "GoPay",
  shopeepay: "ShopeePay",
  credit_card: "Kartu kredit",
  cstore: "Minimarket",
  lainnya: "Lainnya",
};

export const tanggal = (iso: string | null | undefined, pattern = "d MMM yyyy") =>
  iso ? format(new Date(iso), pattern, { locale: id }) : "-";

/** Rp ringkas untuk sumbu grafik & angka besar: 1,2 jt · 850 rb */
export function rupiahShort(value: number): string {
  const abs = Math.abs(value);
  const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: n >= 100 ? 0 : 1 });
  if (abs >= 1_000_000_000) return `${fmt(value / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `${fmt(value / 1_000_000)} jt`;
  if (abs >= 1_000) return `${fmt(value / 1_000)} rb`;
  return String(Math.round(value));
}

export const angka = (n: number) => n.toLocaleString("id-ID");

export const merchantName = (m: { store_name?: string; name?: string; email: string }) =>
  m.store_name || m.name || m.email.split("@")[0] || m.email;

export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  color: "var(--color-popover-foreground)",
  fontSize: 12,
} as const;

export function Tile({
  className,
  children,
  tone = "card",
}: {
  className?: string | undefined;
  children: ReactNode;
  tone?: "card" | "primary";
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-3xl border p-5",
        tone === "primary"
          ? "border-transparent bg-primary text-primary-foreground shadow-soft"
          : "bg-card shadow-soft",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function TileTitle({
  title,
  hint,
  right,
  inverted,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-extrabold tracking-tight">{title}</h2>
        {hint && (
          <p className={cn("text-[11px]", inverted ? "text-primary-foreground/75" : "text-muted-foreground")}>
            {hint}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

/** Perubahan terhadap periode sebelumnya. Tanpa pembanding → tidak menampilkan persen palsu. */
export function Delta({
  current,
  previous,
  inverted,
}: {
  current: number;
  previous: number;
  inverted?: boolean;
}) {
  if (previous === 0 && current === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs", inverted ? "text-primary-foreground/75" : "text-muted-foreground")}>
        <Minus className="size-3" /> belum ada data
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", inverted ? "text-primary-foreground" : "text-success")}>
        <ArrowUpRight className="size-3.5" /> baru
      </span>
    );
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
        inverted ? "text-primary-foreground" : up ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" />
      {Math.abs(pct).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
    </span>
  );
}

export function StateBadge({ state }: { state: SubscriptionState }) {
  return (
    <Badge variant="outline" className="gap-1.5 rounded-full font-semibold">
      <span className="size-2 rounded-full" style={{ background: STATE_COLOR[state] }} />
      {STATE_LABEL[state]}
    </Badge>
  );
}

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const color =
    status === "paid"
      ? "var(--color-success)"
      : status === "pending"
        ? "var(--color-warning)"
        : "var(--color-muted-foreground)";
  return (
    <Badge variant="outline" className="gap-1.5 rounded-full font-semibold">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {INVOICE_LABEL[status]}
    </Badge>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border bg-muted p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
            o.value === value
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
