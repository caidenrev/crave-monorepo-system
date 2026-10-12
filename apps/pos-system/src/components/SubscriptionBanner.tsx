import { Link } from "@tanstack/react-router";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/useSubscription";

/**
 * Peringatan status langganan di atas setiap halaman. Hanya muncul bila perlu:
 * trial hampir habis, masa tenggang, atau akun dalam mode hanya-baca.
 */
export function SubscriptionBanner() {
  const { subscription: s } = useSubscription();
  if (!s || !s.available) return null;

  const readOnly = s.state === "expired" || s.state === "suspended";
  const warn = s.state === "grace" || (s.state === "trial" && s.days_left <= 3);
  if (!readOnly && !warn) return null;

  const title =
    s.state === "suspended"
      ? "Akun ditangguhkan"
      : s.state === "expired"
        ? "Langganan tidak aktif: mode hanya baca"
        : s.state === "grace"
          ? `Langganan sudah habis, ${s.days_left} hari lagi sebelum hanya baca`
          : s.days_left <= 0
            ? "Masa percobaan berakhir hari ini"
            : `Masa percobaan tinggal ${s.days_left} hari`;

  const detail =
    s.state === "suspended"
      ? "Data Anda aman. Hubungi support@craveservices.my.id untuk mengaktifkan kembali."
      : s.state === "expired"
        ? "Data dan laporan tetap bisa dilihat dan diekspor. Perpanjang untuk membuat transaksi baru."
        : "Perpanjang sekarang agar kasir tidak terhenti.";

  return (
    <div
      role={readOnly ? "alert" : "status"}
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center",
        readOnly ? "border-destructive/30 bg-destructive/5" : "border-warning/40 bg-warning/10",
      )}
    >
      {readOnly ? (
        <AlertCircle className="size-5 shrink-0 text-destructive" />
      ) : (
        <Clock className="size-5 shrink-0 text-warning-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {s.state !== "suspended" && (
        <Button asChild size="sm" className="shrink-0 rounded-xl font-bold">
          <Link to="/langganan">{s.state === "trial" ? "Pilih paket" : "Perpanjang"}</Link>
        </Button>
      )}
    </div>
  );
}
