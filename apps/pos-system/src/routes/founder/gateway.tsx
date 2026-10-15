import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, KeyRound, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/founder/FounderShell";
import { Empty, tanggal, Tile, TileTitle } from "@/components/founder/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/founder/gateway")({
  component: GatewayPage,
});

type GatewayMerchant = {
  id: string;
  name: string;
  shopee_merchant_id: string;
  store_id: string;
  status: "connected" | "disconnected";
  static_qris_set: boolean;
  updated_at: string;
};
type GatewayApp = { id: string; name: string; merchant_id: string; created_at: string };

/** Panggil admin gateway lewat server Crave POS (token admin tidak pernah ke browser). */
async function gateway<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/gateway/admin`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify({ action, payload: payload ?? {} }),
  });
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !body) throw new Error(body?.error || `Gateway membalas ${res.status}`);
  return body;
}

function GatewayPage() {
  return (
    <>
      <PageHeader
        title="Gateway QRIS"
        subtitle="Merchant Shopee yang dipegang gateway, dan API key untuk aplikasi lain."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <MerchantsCard />
        <ConnectCard />
        <div className="xl:col-span-2">
          <AppsCard />
        </div>
      </div>
    </>
  );
}

function useMerchants() {
  return useQuery({
    queryKey: ["gateway-merchants"],
    queryFn: async () => (await gateway<{ merchants: GatewayMerchant[] }>("merchants")).merchants ?? [],
  });
}

/* ------------------------------------------------------------------ */
function MerchantsCard() {
  const merchants = useMerchants();
  const [editing, setEditing] = useState<GatewayMerchant | null>(null);
  const [qris, setQris] = useState("");
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: () => gateway("set_static_qris", { merchant_id: editing?.id, static_qris: qris.trim() }),
    onSuccess: () => {
      toast.success("QRIS statis disimpan");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["gateway-merchants"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Tile>
      <TileTitle title="Merchant terhubung" hint="Sesi Shopee disimpan terenkripsi di gateway" />
      {merchants.isLoading ? (
        <Empty>Memuat...</Empty>
      ) : merchants.error ? (
        <p className="mt-4 text-sm text-destructive">{merchants.error.message}</p>
      ) : (merchants.data ?? []).length === 0 ? (
        <Empty>Belum ada merchant. Hubungkan lewat formulir di sebelah.</Empty>
      ) : (
        <ul className="mt-3 divide-y">
          {merchants.data!.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name || m.id}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">{m.id}</p>
                <p className="text-xs text-muted-foreground">
                  QRIS statis: {m.static_qris_set ? "sudah diatur" : "belum diatur"} · diperbarui{" "}
                  {tanggal(m.updated_at, "d MMM yyyy HH:mm")}
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5 rounded-full">
                <span
                  className="size-2 rounded-full"
                  style={{ background: m.status === "connected" ? "var(--color-success)" : "var(--color-destructive)" }}
                />
                {m.status === "connected" ? "Terhubung" : "Terputus, login ulang"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setEditing(m);
                  setQris("");
                }}
              >
                <QrCode className="size-3.5" /> QRIS statis
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>QRIS statis {editing?.name}</DialogTitle>
            <DialogDescription>
              Kode panjang yang diawali 000201, dari aplikasi Shopee Partner. Dipakai untuk membuat QR
              dengan nominal pas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={qris}
            onChange={(e) => setQris(e.target.value)}
            placeholder="Tempel kode QRIS statis toko di sini (diawali 000201...)"
            className="rounded-xl font-mono text-xs"
          />
          <DialogFooter>
            <Button
              className="rounded-xl"
              disabled={!qris.trim().startsWith("000201") || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending && <Loader2 className="size-4 animate-spin" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
type Step = "idle" | "requested" | "select";
type MerchantChoice = { id: string; name: string };

function ConnectCard() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("idle");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [channel, setChannel] = useState<1 | 3>(3);
  const [staticQris, setStaticQris] = useState("");
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState<unknown>(null);
  const [verification, setVerification] = useState<unknown>(null);
  const [choices, setChoices] = useState<MerchantChoice[]>([]);
  const [chosen, setChosen] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("idle");
    setOtp("");
    setChallenge(null);
    setVerification(null);
    setChoices([]);
    setChosen("");
  };

  const connected = (name?: string) => {
    toast.success(`Merchant ${name ?? ""} terhubung ke gateway`);
    reset();
    setPassword("");
    setStaticQris("");
    void queryClient.invalidateQueries({ queryKey: ["gateway-merchants"] });
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = () =>
    run(async () => {
      const res = await gateway<{ challenge: unknown }>("otp_request", { phone: phone.trim(), password, channel });
      setChallenge(res.challenge);
      setStep("requested");
    });

  type VerifyResult = {
    status: "CONNECTED" | "MERCHANT_SELECTION_NEEDED";
    merchant?: { name?: string };
    merchants?: MerchantChoice[];
    verification?: unknown;
  };
  const verify = () =>
    run(async () => {
      const res = await gateway<VerifyResult>("otp_verify", { challenge, otp, static_qris: staticQris.trim() });
      if (res.status === "MERCHANT_SELECTION_NEEDED") {
        setChoices(res.merchants ?? []);
        setVerification(res.verification);
        setStep("select");
        return;
      }
      connected(res.merchant?.name);
    });

  const complete = () =>
    run(async () => {
      const res = await gateway<VerifyResult>("otp_complete", {
        verification,
        merchant_id: chosen,
        static_qris: staticQris.trim(),
      });
      connected(res.merchant?.name);
    });

  return (
    <Tile>
      <TileTitle title="Hubungkan merchant Shopee" hint="Sekali saja; gateway memperbarui sesinya sendiri" />
      <div className="mt-4 space-y-4">
        {step === "idle" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="gw-phone">Nomor HP akun Shopee Partner</Label>
              <Input
                id="gw-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gw-password">
                Password akun Shopee <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="gw-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gw-qris">
                QRIS statis toko <span className="font-normal text-muted-foreground">(bisa diatur nanti)</span>
              </Label>
              <Textarea
                id="gw-qris"
                rows={3}
                value={staticQris}
                onChange={(e) => setStaticQris(e.target.value)}
                placeholder="Tempel kode QRIS statis toko di sini (diawali 000201...)"
                className="rounded-xl font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Kirim kode lewat</p>
              <Tabs value={String(channel)} onValueChange={(v) => setChannel(v === "1" ? 1 : 3)}>
                <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="3" className="h-9 rounded-lg font-semibold">
                    WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="1" className="h-9 rounded-lg font-semibold">
                    SMS
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button className="h-11 rounded-xl font-bold" onClick={requestOtp} disabled={busy || !phone.trim()}>
              {busy && <Loader2 className="size-4 animate-spin" />} Kirim kode OTP
            </Button>
          </>
        )}

        {step === "requested" && (
          <>
            <p className="text-sm text-muted-foreground">
              Kode 6 digit dikirim lewat {channel === 1 ? "SMS" : "WhatsApp"} ke{" "}
              <span className="font-semibold text-foreground">{phone}</span>.
            </p>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(v) => setOtp(v.replace(/\D/g, ""))}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              containerClassName="justify-start"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-11 text-lg font-bold tabular-nums first:rounded-l-xl last:rounded-r-xl sm:w-12"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex flex-wrap gap-2">
              <Button className="h-11 rounded-xl font-bold" onClick={verify} disabled={busy || otp.length < 4}>
                {busy && <Loader2 className="size-4 animate-spin" />} Verifikasi & hubungkan
              </Button>
              <Button variant="outline" className="h-11 rounded-xl" onClick={reset} disabled={busy}>
                Ganti nomor
              </Button>
            </div>
          </>
        )}

        {step === "select" && (
          <>
            <p className="text-sm text-muted-foreground">Akun ini punya beberapa merchant. Pilih yang dipakai gateway.</p>
            <RadioGroup value={chosen} onValueChange={setChosen} className="space-y-2">
              {choices.map((c) => (
                <Label
                  key={c.id}
                  htmlFor={`gw-m-${c.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 font-normal"
                >
                  <RadioGroupItem id={`gw-m-${c.id}`} value={c.id} />
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">{c.id}</span>
                </Label>
              ))}
            </RadioGroup>
            <div className="flex flex-wrap gap-2">
              <Button className="h-11 rounded-xl font-bold" onClick={complete} disabled={busy || !chosen}>
                {busy && <Loader2 className="size-4 animate-spin" />} Hubungkan merchant ini
              </Button>
              <Button variant="outline" className="h-11 rounded-xl" onClick={reset} disabled={busy}>
                Batal
              </Button>
            </div>
          </>
        )}
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
function AppsCard() {
  const queryClient = useQueryClient();
  const merchants = useMerchants();
  const apps = useQuery({
    queryKey: ["gateway-apps"],
    queryFn: async () => (await gateway<{ apps: GatewayApp[] }>("apps")).apps ?? [],
  });
  const [name, setName] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      gateway<{ api_key: string }>("create_app", {
        name: name.trim(),
        merchant_id: merchantId || merchants.data?.[0]?.id,
      }),
    onSuccess: (res) => {
      setNewKey(res.api_key);
      setCopied(false);
      setName("");
      void queryClient.invalidateQueries({ queryKey: ["gateway-apps"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const merchantName = (id: string) => merchants.data?.find((m) => m.id === id)?.name || id;
  const hasMerchant = (merchants.data ?? []).length > 0;

  return (
    <Tile>
      <TileTitle title="Aplikasi & API key" hint="Satu API key per aplikasi (SaaS) yang menagih lewat gateway" />
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="gw-app">Nama aplikasi</Label>
          <Input
            id="gw-app"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: SaaS Booking"
            className="h-11 rounded-xl"
          />
        </div>
        {(merchants.data ?? []).length > 1 && (
          <div className="space-y-1.5">
            <Label htmlFor="gw-app-merchant">Merchant</Label>
            <select
              id="gw-app-merchant"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            >
              {merchants.data!.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          className="h-11 rounded-xl font-bold"
          disabled={!name.trim() || !hasMerchant || create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Buat API
          key
        </Button>
      </div>
      {!hasMerchant && !merchants.isLoading && (
        <p className="mt-2 text-xs text-muted-foreground">Hubungkan merchant dulu sebelum membuat API key.</p>
      )}

      {apps.isLoading ? (
        <Empty>Memuat...</Empty>
      ) : apps.error ? (
        <p className="mt-4 text-sm text-destructive">{apps.error.message}</p>
      ) : (apps.data ?? []).length === 0 ? (
        <Empty>Belum ada aplikasi.</Empty>
      ) : (
        <ul className="mt-4 divide-y">
          {apps.data!.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{a.name}</p>
              <p className="text-xs text-muted-foreground">{merchantName(a.merchant_id)}</p>
              <p className="text-xs text-muted-foreground">{tanggal(a.created_at)}</p>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!newKey} onOpenChange={(open) => !open && setNewKey(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>API key baru</DialogTitle>
            <DialogDescription>
              Simpan sekarang di env server aplikasi itu (PAYMENT_GATEWAY_KEY). Key ini tidak akan ditampilkan lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="break-all rounded-xl border bg-muted/50 p-3 font-mono text-xs">{newKey}</div>
          <DialogFooter>
            <Button
              className="rounded-xl"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(newKey ?? "");
                  setCopied(true);
                } catch {
                  toast.error("Gagal menyalin, salin manual");
                }
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Tersalin" : "Salin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tile>
  );
}
