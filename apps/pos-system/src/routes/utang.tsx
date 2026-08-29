import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CalendarClock, Phone, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rupiah } from "@/lib/pos-data";
import { useDebts, type DebtWithStatus, type SupabaseDebt } from "@/lib/useDebts";

export const Route = createFileRoute("/utang")({
  head: () => ({
    meta: [
      { title: "Pencatatan Utang Pelanggan & Pengingat Jatuh Tempo — Crave" },
      {
        name: "description",
        content:
          "Catat kasbon pelanggan, pantau sisa tagihan, dan kirim notifikasi push pengingat jatuh tempo otomatis.",
      },
    ],
  }),
  component: UtangPage,
});

const badgeVariant = (s: DebtWithStatus["status"]) =>
  s === "Terlambat" ? "destructive" : s === "Lunas" ? "secondary" : "default";

function UtangPage() {
  const {
    data: debts = [],
    isLoading,
    error,
    addDebtMutation,
    payDebtMutation,
  } = useDebts("utang");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [payDebt, setPayDebt] = useState<SupabaseDebt | null>(null);

  const outstanding = debts.reduce((s, d) => s + (d.amount - d.paid), 0);
  const dueToday = debts.filter((d) => d.status === "Jatuh tempo hari ini").length;
  const late = debts.filter((d) => d.status === "Terlambat").length;

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));

    addDebtMutation.mutate(
      {
        customer: String(formData.get("customer")),
        phone: String(formData.get("phone")),
        amount,
        due_date: formData.get("due_date") ? String(formData.get("due_date")) : null,
      },
      {
        onSuccess: () => {
          toast.success("Catatan utang berhasil ditambahkan");
          setIsAddOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handlePaySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payDebt) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));

    payDebtMutation.mutate(
      { id: payDebt.id, amount },
      {
        onSuccess: () => {
          toast.success(
            `Pembayaran Rp${amount.toLocaleString("id-ID")} dari ${payDebt.customer} dicatat`,
          );
          setPayDebt(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <AppShell
      title="Utang Pelanggan"
      subtitle="Kasbon tercatat rapi dengan pengingat otomatis"
      actions={
        <Button className="rounded-xl" onClick={() => setIsAddOpen(true)}>
          <Plus className="size-4" /> <span className="hidden sm:inline">Catat utang</span>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Total piutang berjalan", value: rupiah(outstanding) },
            { label: "Jatuh tempo hari ini", value: `${dueToday} pelanggan` },
            { label: "Terlambat bayar", value: `${late} pelanggan` },
          ].map((s, i) => (
            <div
              key={s.label}
              className={"card-soft p-4 " + (i === 0 ? "col-span-2 sm:col-span-1" : "")}
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xl font-extrabold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="card-soft grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BellRing className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Notifikasi push pengingat jatuh tempo</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Dikirim H-1 dan pada hari jatuh tempo, pukul 09.00
              </p>
            </div>
          </div>
          <Switch
            defaultChecked
            onCheckedChange={(v) => toast.info(v ? "Pengingat aktif" : "Pengingat nonaktif")}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : debts.length === 0 || error ? (
          <div className="card-soft p-8 text-center">
            <p className="text-muted-foreground">Belum ada catatan utang pelanggan.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {debts.map((d) => {
              const rest = d.amount - d.paid;
              return (
                <div key={d.id} className="card-soft p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{d.customer}</p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Phone className="size-3 shrink-0" /> {d.phone || "-"}
                      </p>
                    </div>
                    <Badge
                      variant={badgeVariant(d.status)}
                      className="shrink-0 rounded-full text-[10px]"
                    >
                      {d.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Sisa tagihan</p>
                      <p className="text-lg font-extrabold text-primary">{rupiah(rest)}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">dari {rupiah(d.amount)}</p>
                  </div>
                  <Progress
                    value={d.amount > 0 ? (d.paid / d.amount) * 100 : 0}
                    className="mt-2 h-2 rounded-full"
                  />

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0" /> Jatuh tempo{" "}
                    {d.due_date
                      ? new Date(d.due_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Tidak diset"}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl"
                      disabled={rest <= 0}
                      onClick={() => setPayDebt(d)}
                    >
                      Terima bayar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => toast.info(`Pengingat dikirim ke ${d.customer}`)}
                    >
                      Ingatkan
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Catat Utang Pelanggan</DialogTitle>
              <DialogDescription>Masukkan detail pelanggan dan jumlah utangnya.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Nama Pelanggan</Label>
                <Input id="customer" name="customer" placeholder="Misal: Budi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input id="phone" name="phone" placeholder="Misal: 0812..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Piutang (Rp)</Label>
                <Input id="amount" name="amount" type="number" min="0" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={addDebtMutation.isPending}>
                {addDebtMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!payDebt} onOpenChange={(open) => !open && setPayDebt(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {payDebt && (
            <form onSubmit={handlePaySubmit}>
              <DialogHeader>
                <DialogTitle>Terima Pembayaran</DialogTitle>
                <DialogDescription>
                  Mencatat cicilan/pelunasan dari {payDebt.customer}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Sisa Tagihan</Label>
                  <p className="text-xl font-bold">{rupiah(payDebt.amount - payDebt.paid)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_amount">Jumlah Dibayar (Rp)</Label>
                  <Input
                    id="pay_amount"
                    name="amount"
                    type="number"
                    min="1"
                    max={payDebt.amount - payDebt.paid}
                    defaultValue={payDebt.amount - payDebt.paid}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPayDebt(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={payDebtMutation.isPending}>
                  {payDebtMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Proses Bayar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
