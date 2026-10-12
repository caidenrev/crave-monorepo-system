import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DeviceSessions } from "@/components/DeviceSessions";
import { PageHeader } from "@/components/founder/FounderShell";
import { Tile, TileTitle } from "@/components/founder/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rupiah } from "@/lib/pos-data";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useFounderActions } from "@/lib/useFounder";
import { useSubscriptionBilling } from "@/lib/useSubscription";

export const Route = createFileRoute("/founder/pengaturan")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Akun founder, harga paket, dan status sistem pembayaran." />
      <div className="grid gap-4 xl:grid-cols-2">
        <PasswordCard />
        <PlansCard />
        <SystemCard />
        <div className="xl:col-span-2">
          <DeviceSessions />
        </div>
      </div>
    </>
  );
}

function PasswordCard() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const problem =
    next.length > 0 && next.length < 10
      ? "Minimal 10 karakter."
      : next.length > 0 && next === current
        ? "Kata sandi baru harus berbeda dari yang lama."
        : confirm.length > 0 && confirm !== next
          ? "Konfirmasi tidak cocok."
          : null;
  const ready = !!current && next.length >= 10 && next === confirm && next !== current;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !user?.email) return;
    setSaving(true);
    try {
      // pastikan yang mengganti memang pemilik akun, bukan orang yang menemukan sesi terbuka
      const check = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (check.error) throw new Error("Kata sandi saat ini salah.");
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw new Error(error.message);
      toast.success("Kata sandi diganti.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tile>
      <TileTitle title="Kata sandi akun founder" hint={user?.email ?? ""} />
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pw-current">Kata sandi saat ini</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-next">Kata sandi baru</Label>
          <Input
            id="pw-next"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-confirm">Ulangi kata sandi baru</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!!problem}
            aria-describedby="pw-help"
            className="rounded-xl"
          />
        </div>
        <p id="pw-help" className={"text-xs " + (problem ? "text-destructive" : "text-muted-foreground")}>
          {problem ?? "Akun ini bisa melihat data semua merchant. Pakai kata sandi panjang yang tidak dipakai di tempat lain."}
        </p>
        <Button type="submit" className="rounded-xl" disabled={!ready || saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Ganti kata sandi
        </Button>
      </form>
    </Tile>
  );
}

function PlansCard() {
  const { plans } = useSubscriptionBilling();
  const { updatePlan } = useFounderActions();
  const [draft, setDraft] = useState<Record<number, string>>({});

  // kunci teks, bukan array: `plans` adalah array baru di setiap render
  const planKey = plans.map((p) => `${p.months}:${p.price}`).join(",");
  useEffect(() => {
    setDraft(Object.fromEntries(plans.map((p) => [p.months, String(p.price)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  const monthly = Number(draft[1] ?? 0);
  const save = (months: number) => {
    const price = Number(draft[months]);
    updatePlan.mutate(
      { months, price },
      { onSuccess: () => toast.success(`Harga ${months} bulan diperbarui`), onError: (err) => toast.error(err.message) },
    );
  };

  return (
    <Tile>
      <TileTitle title="Harga paket" hint="Berlaku untuk tagihan baru. Tagihan yang sudah dibuat tidak berubah." />
      {plans.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Memuat...</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {plans.map((p) => {
            const value = Number(draft[p.months]);
            const valid = Number.isInteger(value) && value >= 1000 && value <= 100_000_000;
            const saving = monthly * p.months - value;
            return (
              <li key={p.months}>
                <Label htmlFor={`plan-${p.months}`}>{p.label}</Label>
                <div className="mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      id={`plan-${p.months}`}
                      type="number"
                      inputMode="numeric"
                      min={1000}
                      step={1000}
                      value={draft[p.months] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [p.months]: e.target.value }))}
                      className="rounded-xl pl-10 tabular-nums"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="shrink-0 rounded-xl"
                    disabled={!valid || value === p.price || updatePlan.isPending}
                    onClick={() => save(p.months)}
                  >
                    Simpan
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {valid ? `${rupiah(Math.round(value / p.months))} per bulan` : "Harga Rp1.000 sampai Rp100.000.000"}
                  {valid && p.months > 1 && saving > 0 ? ` · hemat ${rupiah(saving)} dibanding bulanan` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

type Health = { configured: boolean; midtrans: boolean; supabase: boolean; production: boolean };

function SystemCard() {
  const health = useQuery({
    queryKey: ["founder-health"],
    retry: false,
    queryFn: async (): Promise<Health> => {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/billing/health`, {
        headers: { authorization: `Bearer ${data.session?.access_token ?? ""}` },
      });
      const body = (await res.json().catch(() => null)) as (Health & { error?: string }) | null;
      if (!res.ok || !body) throw new Error(body?.error ?? "Server penagihan tidak merespons");
      return body;
    },
  });
  const h = health.data;

  const Row = ({ ok, label, hint }: { ok: boolean; label: string; hint: string }) => (
    <li className="flex items-start gap-3">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <div>
        <p className="text-sm font-semibold">
          {label}: {ok ? "terpasang" : "belum terpasang"}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </li>
  );

  return (
    <Tile className="xl:col-span-2">
      <TileTitle title="Sistem pembayaran" hint="Kunci disimpan di Vercel, tidak pernah ditampilkan di sini." />
      {health.isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Memeriksa...</p>
      ) : health.error || !h ? (
        <p className="mt-4 text-sm text-destructive">{health.error?.message ?? "Tidak bisa memeriksa."}</p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          <Row ok={h.midtrans} label="Server Key Midtrans" hint="Variabel MIDTRANS_SERVER_KEY" />
          <Row ok={h.supabase} label="Kunci server Supabase" hint="Variabel SUPABASE_SERVICE_ROLE_KEY" />
          <li className="flex items-start gap-3">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ background: h.production ? "var(--color-success)" : "var(--color-warning)" }}
            />
            <div>
              <p className="text-sm font-semibold">Mode: {h.production ? "Production" : "Sandbox (uji coba)"}</p>
              <p className="text-xs text-muted-foreground">
                {h.production
                  ? "Pembayaran memakai uang sungguhan."
                  : "Pembayaran belum memakai uang sungguhan. Ubah MIDTRANS_IS_PRODUCTION ke true saat siap."}
              </p>
            </div>
          </li>
        </ul>
      )}
    </Tile>
  );
}
