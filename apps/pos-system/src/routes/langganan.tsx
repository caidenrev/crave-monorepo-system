import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { BadgeCheck, CreditCard, Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rupiah } from "@/lib/pos-data";
import {
  useSubscription,
  useSubscriptionBilling,
  type Subscription,
  type SubscriptionInvoice,
} from "@/lib/useSubscription";

export const Route = createFileRoute("/langganan")({
  head: () => ({
    meta: [
      { title: "Langganan — Crave" },
      {
        name: "description",
        content: "Status langganan, perpanjangan, dan riwayat tagihan Crave POS.",
      },
    ],
  }),
  component: LanggananPage,
});

const tanggal = (iso: string | null) =>
  iso ? format(new Date(iso), "d MMMM yyyy", { locale: id }) : "-";

const STATE_LABEL: Record<Subscription["state"], string> = {
  trial: "Masa percobaan",
  active: "Aktif",
  grace: "Masa tenggang",
  expired: "Tidak aktif",
  suspended: "Ditangguhkan",
};

const INVOICE_LABEL: Record<SubscriptionInvoice["status"], string> = {
  pending: "Menunggu pembayaran",
  paid: "Lunas",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

function statusText(s: Subscription) {
  switch (s.state) {
    case "trial":
      return `Gratis sampai ${tanggal(s.ends_at)} (${s.days_left} hari lagi).`;
    case "active":
      return `Aktif sampai ${tanggal(s.current_period_end)} (${s.days_left} hari lagi).`;
    case "grace":
      return `Masa aktif habis ${tanggal(s.current_period_end)}. Kasir masih bisa dipakai ${s.days_left} hari lagi.`;
    case "expired":
      return "Akun dalam mode hanya baca. Data dan laporan tetap bisa dilihat dan diekspor.";
    case "suspended":
      return "Akun ditangguhkan. Hubungi support@craveservices.my.id.";
  }
}

function LanggananPage() {
  const { subscription: s, isLoading } = useSubscription();
  const { plans, invoices, pay, sync, cancel } = useSubscriptionBilling();
  const [months, setMonths] = useState<number>(1);
  const synced = useRef(false);

  // Kembali dari halaman bayar: cek status tagihan terbaru ke Midtrans satu kali.
  const pendingOrderId = invoices.find((i) => i.status === "pending")?.order_id;
  useEffect(() => {
    if (synced.current || !s?.available) return;
    const fromUrl = new URLSearchParams(window.location.search).get("order_id");
    const orderId = fromUrl?.startsWith("CRV-") ? fromUrl : pendingOrderId;
    if (!orderId) return;
    synced.current = true;
    sync.mutate(orderId, {
      onSuccess: (res) => {
        if (res.status === "paid")
          toast.success("Pembayaran diterima. Langganan sudah diperpanjang.");
        else if (fromUrl && res.status === "pending") toast.info("Pembayaran belum kami terima.");
      },
      // gagal cek otomatis bukan masalah pengguna; tombol "Cek status" tetap ada
      onError: () => undefined,
    });
    if (fromUrl) window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.available, pendingOrderId]);

  const monthly = plans.find((p) => p.months === 1)?.price ?? 0;
  const selected = plans.find((p) => p.months === months);

  const handlePay = () => {
    pay.mutate(months, { onError: (err) => toast.error(err.message) });
  };

  const handleCheck = (orderId: string) => {
    sync.mutate(orderId, {
      onSuccess: (res) =>
        res.status === "paid"
          ? toast.success("Pembayaran diterima. Langganan sudah diperpanjang.")
          : toast.info(`Status tagihan: ${INVOICE_LABEL[res.status]}`),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleCancel = (orderId: string) => {
    if (!window.confirm("Batalkan tagihan ini? Kamu bisa membuat tagihan baru kapan saja.")) return;
    cancel.mutate(orderId, {
      onSuccess: (res) =>
        res.status === "paid"
          ? toast.success("Tagihan ini ternyata sudah dibayar. Langganan sudah diperpanjang.")
          : toast.success("Tagihan dibatalkan."),
      onError: (err) => toast.error(err.message),
    });
  };
  const busy = sync.isPending || cancel.isPending;

  return (
    <AppShell title="Langganan" subtitle="Status akun, perpanjangan, dan riwayat tagihan.">
      {isLoading || !s ? (
        <div className="card-soft grid place-items-center p-10 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !s.available ? (
        <div className="card-soft p-6 text-sm text-muted-foreground">
          Fitur langganan belum aktif untuk akun ini.
        </div>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <div className="min-w-0 space-y-4">
            <div className="card-soft flex items-start gap-4 p-5">
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl",
                  s.can_write ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                )}
              >
                <ShieldCheck className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-extrabold tracking-tight">Crave POS</p>
                  <Badge
                    variant={s.can_write ? "secondary" : "destructive"}
                    className="rounded-full"
                  >
                    {STATE_LABEL[s.state]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{statusText(s)}</p>
              </div>
            </div>

            {s.state !== "suspended" && (
              <div className="card-soft space-y-4 p-5">
                <div>
                  <p className="text-sm font-bold">
                    {s.state === "trial" ? "Mulai berlangganan" : "Perpanjang langganan"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Satu paket, semua fitur. Durasi baru ditambahkan setelah masa aktif yang sedang
                    berjalan.
                  </p>
                </div>

                <div
                  className="grid gap-3 sm:grid-cols-3"
                  role="radiogroup"
                  aria-label="Durasi langganan"
                >
                  {plans.map((p) => {
                    const saving = monthly * p.months - p.price;
                    const active = p.months === months;
                    return (
                      <button
                        key={p.months}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMonths(p.months)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:bg-accent",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">{p.label}</p>
                          {active && <BadgeCheck className="size-4 text-primary" />}
                        </div>
                        <p className="mt-2 text-xl font-extrabold tracking-tight">
                          {rupiah(p.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rupiah(Math.round(p.price / p.months))} / bulan
                        </p>
                        {saving > 0 && (
                          <p className="mt-2 text-xs font-semibold text-primary">
                            Hemat {rupiah(saving)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="w-full rounded-xl font-bold"
                  size="lg"
                  disabled={!selected || pay.isPending || pay.isSuccess}
                  onClick={handlePay}
                >
                  {pay.isPending || pay.isSuccess ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  {selected ? `Bayar ${rupiah(selected.price)}` : "Pilih durasi"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Pembayaran diproses oleh Midtrans (QRIS, transfer bank, e-wallet, kartu).
                </p>
              </div>
            )}
          </div>

          <div className="card-soft p-5">
            <p className="text-sm font-bold">Riwayat tagihan</p>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Belum ada tagihan.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {invoices.map((inv) => (
                  <li key={inv.id} className="space-y-2.5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {inv.months} bulan · {rupiah(inv.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tanggal(inv.created_at)}
                          {inv.status === "paid" && inv.period_end
                            ? ` · aktif s.d. ${tanggal(inv.period_end)}`
                            : ""}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {inv.order_id}
                        </p>
                      </div>
                      <Badge
                        variant={inv.status === "paid" ? "secondary" : "outline"}
                        className="shrink-0 rounded-full"
                      >
                        {INVOICE_LABEL[inv.status]}
                      </Badge>
                    </div>
                    {inv.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        {inv.snap_redirect_url && (
                          <Button asChild size="sm" className="rounded-xl">
                            <a href={inv.snap_redirect_url}>Lanjut bayar</a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          disabled={busy}
                          onClick={() => handleCheck(inv.order_id)}
                        >
                          <RefreshCw className={cn("size-3.5", sync.isPending && "animate-spin")} />
                          Cek status
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={busy}
                          onClick={() => handleCancel(inv.order_id)}
                        >
                          {cancel.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          Batalkan
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
