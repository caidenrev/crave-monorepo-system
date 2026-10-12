import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowUpDown, Download, Loader2, Search } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { confirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/founder/FounderShell";
import {
  angka,
  Empty,
  InvoiceBadge,
  merchantName,
  Segmented,
  STATE_LABEL,
  StateBadge,
  tanggal,
  tooltipStyle,
} from "@/components/founder/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { rupiah } from "@/lib/pos-data";
import {
  downloadCsv,
  useFounderActions,
  useMerchantDetail,
  useMerchants,
  type FounderAction,
  type Merchant,
} from "@/lib/useFounder";
import type { SubscriptionState } from "@/lib/useSubscription";

export const Route = createFileRoute("/founder/merchant")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  component: MerchantPage,
});

type Filter = "all" | "paying" | "trial" | "inactive";
type SortKey = "registered_at" | "sales_30d" | "ends" | "last_sign_in_at";

const berakhir = (m: Merchant) => m.current_period_end ?? m.trial_ends_at;
const matches = (m: Merchant, f: Filter) =>
  f === "all" ||
  (f === "paying" && (m.state === "active" || m.state === "grace")) ||
  (f === "trial" && m.state === "trial") ||
  (f === "inactive" && (m.state === "expired" || m.state === "suspended"));

function MerchantPage() {
  const search = Route.useSearch();
  const merchants = useMerchants();
  const [q, setQ] = useState(search.q ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("registered_at");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (search.q) setQ(search.q);
  }, [search.q]);

  const list = merchants.data ?? [];
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const value = (m: Merchant): number =>
      sort === "sales_30d"
        ? m.sales_30d
        : sort === "ends"
          ? -new Date(berakhir(m) ?? 0).getTime()
          : new Date((sort === "last_sign_in_at" ? m.last_sign_in_at : m.registered_at) ?? 0).getTime();
    return list
      .filter((m) => matches(m, filter))
      .filter((m) => !needle || [m.email, m.name, m.store_name].some((v) => v.toLowerCase().includes(needle)))
      .sort((x, y) => value(y) - value(x));
  }, [list, q, filter, sort]);

  const selected = list.find((m) => m.user_id === selectedId) ?? null;
  const count = (f: Filter) => list.filter((m) => matches(m, f)).length;

  const exportCsv = () =>
    downloadCsv(
      `merchant-crave-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Toko", "Nama", "Email", "Status", "Berakhir", "Daftar", "Login terakhir", "Transaksi 30 hari", "Omzet 30 hari", "Total transaksi", "Total bayar langganan", "Catatan"],
      rows.map((m) => [
        m.store_name,
        m.name,
        m.email,
        STATE_LABEL[m.state],
        tanggal(berakhir(m), "yyyy-MM-dd"),
        tanggal(m.registered_at, "yyyy-MM-dd"),
        tanggal(m.last_sign_in_at, "yyyy-MM-dd HH:mm"),
        m.tx_30d,
        m.sales_30d,
        m.tx_total,
        m.paid_total,
        m.note,
      ]),
    );

  const SortHead = ({ k, children, right }: { k: SortKey; children: string; right?: boolean }) => (
    <th className={"px-4 py-3 font-bold " + (right ? "text-right" : "")} aria-sort={sort === k ? "descending" : "none"}>
      <button
        type="button"
        onClick={() => setSort(k)}
        className={"inline-flex items-center gap-1 hover:text-foreground " + (sort === k ? "text-foreground" : "")}
      >
        {children}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  );

  return (
    <>
      <PageHeader
        title="Merchant"
        subtitle="Semua akun toko, status langganan, dan aktivitasnya."
        actions={
          <Button variant="outline" className="rounded-xl" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="size-4" /> Ekspor CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari email, nama, atau nama toko"
            aria-label="Cari merchant"
            className="rounded-xl pl-11"
          />
        </div>
        <Segmented
          label="Saring status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `Semua ${count("all")}` },
            { value: "paying", label: `Berbayar ${count("paying")}` },
            { value: "trial", label: `Trial ${count("trial")}` },
            { value: "inactive", label: `Tidak aktif ${count("inactive")}` },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border bg-card shadow-soft">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-bold">Merchant</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <SortHead k="ends">Berakhir</SortHead>
              <th className="px-4 py-3 text-right font-bold">Transaksi 30 hari</th>
              <SortHead k="sales_30d" right>
                Omzet 30 hari
              </SortHead>
              <SortHead k="last_sign_in_at">Login terakhir</SortHead>
              <SortHead k="registered_at">Daftar</SortHead>
            </tr>
          </thead>
          <tbody className="divide-y">
            {merchants.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : merchants.error ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-destructive">
                  {merchants.error.message}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {list.length === 0 ? "Belum ada merchant yang mendaftar." : "Tidak ada merchant yang cocok."}
                </td>
              </tr>
            ) : (
              rows.map((m) => (
                <tr
                  key={m.user_id}
                  tabIndex={0}
                  onClick={() => setSelectedId(m.user_id)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedId(m.user_id)}
                  className="cursor-pointer outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <td className="max-w-64 px-4 py-3">
                    <p className="truncate font-semibold">{merchantName(m)}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    {m.note && <p className="mt-0.5 truncate text-xs italic text-muted-foreground">{m.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StateBadge state={m.state} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tanggal(berakhir(m))}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{angka(m.tx_30d)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{rupiah(m.sales_30d)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.last_sign_in_at
                      ? formatDistanceToNow(new Date(m.last_sign_in_at), { addSuffix: true, locale: id })
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tanggal(m.registered_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && <MerchantPanel key={selected.user_id} merchant={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function MerchantPanel({ merchant: m }: { merchant: Merchant }) {
  const detail = useMerchantDetail(m.user_id);
  const { update } = useFounderActions();
  const [note, setNote] = useState(m.note ?? "");
  const [trialDays, setTrialDays] = useState("7");
  const d = detail.data;
  const days = Number(trialDays);

  const run = (action: FounderAction, value: number | undefined, message: string) =>
    update.mutate(
      { userId: m.user_id, action, value, note },
      { onSuccess: () => toast.success(message), onError: (err) => toast.error(err.message) },
    );

  const stats: { label: string; value: string }[] = [
    { label: "Total omzet", value: d ? rupiah(d.gmv_total) : "-" },
    { label: "Total transaksi", value: d ? angka(d.tx_total) : angka(m.tx_total) },
    { label: "Produk", value: d ? angka(d.products) : "-" },
    { label: "Karyawan", value: d ? angka(d.employees) : "-" },
    { label: "Perangkat login", value: d ? angka(d.devices) : "-" },
    { label: "QRIS", value: d ? (d.qris_connected ? "Terhubung" : "Belum") : "-" },
  ];

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="pr-8">{merchantName(m)}</SheetTitle>
        <SheetDescription>
          {m.email} · daftar {tanggal(m.registered_at)}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-wrap items-center gap-2">
        <StateBadge state={m.state} />
        <span className="text-xs text-muted-foreground">
          {m.current_period_end
            ? `Masa aktif sampai ${tanggal(m.current_period_end)}`
            : `Trial sampai ${tanggal(m.trial_ends_at)}`}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-muted/60 p-3">
            <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
            <dd className="truncate text-sm font-extrabold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h3 className="text-sm font-bold">Transaksi 30 hari terakhir</h3>
        <p className="text-xs text-muted-foreground">
          {d?.last_tx_at
            ? `Transaksi terakhir ${formatDistanceToNow(new Date(d.last_tx_at), { addSuffix: true, locale: id })}`
            : "Belum pernah bertransaksi"}
        </p>
        <div className="mt-2 h-28 w-full">
          {detail.error ? (
            <p className="text-xs text-destructive">{detail.error.message}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d?.daily ?? []} barCategoryGap={2}>
                <XAxis dataKey="date" hide />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  formatter={(v: number, _n, item) => [
                    `${angka(v)} transaksi · ${rupiah((item.payload as { gmv: number }).gmv)}`,
                    "",
                  ]}
                  labelFormatter={(l: string) => tanggal(l, "EEEE, d MMM")}
                  contentStyle={tooltipStyle}
                  separator=""
                />
                <Bar dataKey="tx" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} minPointSize={2} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-4">
        <h3 className="text-sm font-bold">Kelola langganan</h3>

        <div className="space-y-1.5">
          <Label htmlFor="founder-note">Catatan (hanya terlihat founder)</Label>
          <div className="flex gap-2">
            <Input
              id="founder-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: bayar transfer manual 12 Okt"
              className="rounded-xl"
            />
            <Button
              variant="outline"
              className="shrink-0 rounded-xl"
              disabled={update.isPending || note === (m.note ?? "")}
              onClick={() => run("set_note", undefined, "Catatan disimpan")}
            >
              Simpan
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Aktifkan manual</Label>
          <p className="text-xs text-muted-foreground">
            Menambah masa aktif dan mencatatnya sebagai pembayaran manual seharga paket.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 6, 12].map((n) => (
              <Button
                key={n}
                variant="outline"
                className="rounded-xl"
                disabled={update.isPending}
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: `Tambah ${n} bulan?`,
                    description: `Masa aktif ${m.email} ditambah ${n} bulan dan dicatat sebagai pembayaran manual.`,
                    confirmLabel: `Tambah ${n} bulan`,
                  });
                  if (ok) run("add_months", n, `Masa aktif ditambah ${n} bulan`);
                }}
              >
                +{n} bulan
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="founder-trial">Perpanjang trial (hari)</Label>
          <div className="flex gap-2">
            <Input
              id="founder-trial"
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className="rounded-xl"
            />
            <Button
              variant="outline"
              className="shrink-0 rounded-xl"
              disabled={update.isPending || !(Number.isInteger(days) && days >= 1 && days <= 365)}
              onClick={() => run("extend_trial", days, `Trial diperpanjang ${days} hari`)}
            >
              Perpanjang
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          {m.state === "suspended" ? (
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={update.isPending}
              onClick={() => run("unsuspend", undefined, "Akun diaktifkan kembali")}
            >
              Aktifkan kembali akun
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full rounded-xl"
              disabled={update.isPending}
              onClick={async () => {
                const ok = await confirmDialog({
                  title: "Tangguhkan akun ini?",
                  description: `${m.email} menjadi hanya baca sampai kamu aktifkan kembali. Datanya tidak dihapus.`,
                  confirmLabel: "Tangguhkan",
                  destructive: true,
                });
                if (ok) run("suspend", undefined, "Akun ditangguhkan");
              }}
            >
              Tangguhkan akun
            </Button>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold">Riwayat tagihan</h3>
        {!d ? (
          <Empty>{detail.isLoading ? "Memuat..." : "-"}</Empty>
        ) : d.invoices.length === 0 ? (
          <Empty>Belum ada tagihan.</Empty>
        ) : (
          <ul className="mt-2 divide-y">
            {d.invoices.map((inv) => (
              <li key={inv.order_id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {inv.months} bulan · {rupiah(inv.amount)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tanggal(inv.created_at)} · {inv.source === "manual" ? "manual" : (inv.payment_type ?? "Midtrans")} ·{" "}
                    {inv.order_id}
                  </p>
                </div>
                <InvoiceBadge status={inv.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
