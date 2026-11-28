import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/founder/FounderShell";
import { angka, INVOICE_LABEL, InvoiceBadge, METHOD_LABEL, Segmented, tanggal, Tile } from "@/components/founder/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rupiah } from "@/lib/pos-data";
import {
  downloadCsv,
  useAdminInvoices,
  useFounderActions,
  useHrmAnalytics,
  type AdminInvoice,
  type HrmInvoice,
} from "@/lib/useFounder";

export const Route = createFileRoute("/founder/pembayaran")({
  component: PaymentsPage,
});

type Filter = "all" | "paid" | "pending" | "failed";
type ProductFilter = "all" | "pos" | "hrm";

type UnifiedInvoice = {
  order_id: string;
  sourceApp: "pos" | "hrm";
  appName: string;
  targetName: string;
  email: string;
  months: number;
  amount: number;
  status: AdminInvoice["status"];
  source: string;
  payment_type: string | null;
  created_at: string;
  paid_at: string | null;
};

const matchesStatus = (status: UnifiedInvoice["status"], f: Filter) =>
  f === "all" ||
  (f === "paid" && status === "paid") ||
  (f === "pending" && status === "pending") ||
  (f === "failed" && (status === "expired" || status === "cancelled"));

const metode = (i: UnifiedInvoice) =>
  i.source === "manual" ? METHOD_LABEL["manual"] : i.payment_type ? (METHOD_LABEL[i.payment_type] ?? i.payment_type) : "-";

function PaymentsPage() {
  const invoices = useAdminInvoices();
  const hrmQuery = useHrmAnalytics(30);
  const { syncInvoice } = useFounderActions();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [product, setProduct] = useState<ProductFilter>("all");

  const posList: UnifiedInvoice[] = useMemo(() => {
    return (invoices.data ?? []).map((i) => ({
      order_id: i.order_id,
      sourceApp: "pos",
      appName: "Crave POS",
      targetName: i.email,
      email: i.email,
      months: i.months,
      amount: i.amount,
      status: i.status,
      source: i.source,
      payment_type: i.payment_type,
      created_at: i.created_at,
      paid_at: i.paid_at,
    }));
  }, [invoices.data]);

  const hrmList: UnifiedInvoice[] = useMemo(() => {
    return (hrmQuery.data?.invoices ?? []).map((i) => ({
      order_id: i.order_id,
      sourceApp: "hrm",
      appName: "Crave HRM",
      targetName: i.company_name,
      email: i.email,
      months: i.months,
      amount: i.amount,
      status: i.status,
      source: i.source,
      payment_type: i.payment_type,
      created_at: i.created_at,
      paid_at: i.paid_at,
    }));
  }, [hrmQuery.data?.invoices]);

  const allInvoices = useMemo(() => {
    return [...posList, ...hrmList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [posList, hrmList]);

  const currentList = useMemo(() => {
    if (product === "pos") return posList;
    if (product === "hrm") return hrmList;
    return allInvoices;
  }, [product, posList, hrmList, allInvoices]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return currentList
      .filter((i) => matchesStatus(i.status, filter))
      .filter(
        (i) =>
          !needle ||
          i.email.toLowerCase().includes(needle) ||
          i.order_id.toLowerCase().includes(needle) ||
          i.targetName.toLowerCase().includes(needle),
      );
  }, [currentList, q, filter]);

  const paid = currentList.filter((i) => i.status === "paid");
  const sum = (xs: UnifiedInvoice[]) => xs.reduce((s, i) => s + i.amount, 0);
  const online = paid.filter((i) => i.source === "midtrans");
  const manual = paid.filter((i) => i.source === "manual");
  const pending = currentList.filter((i) => i.status === "pending");

  const check = (orderId: string) =>
    syncInvoice.mutate(orderId, {
      onSuccess: (res) =>
        res.status === "paid"
          ? toast.success("Pembayaran sudah masuk. Langganan diperpanjang.")
          : toast.info(`Status di Midtrans: ${INVOICE_LABEL[res.status]}`),
      onError: (err) => toast.error(err.message),
    });

  const exportCsv = () =>
    downloadCsv(
      `pembayaran-crave-${product}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Aplikasi", "Order ID", "Tenant / Pelanggan", "Email", "Durasi (bulan)", "Nominal", "Status", "Sumber", "Metode", "Dibuat", "Dibayar"],
      rows.map((i) => [
        i.appName,
        i.order_id,
        i.targetName,
        i.email,
        i.months,
        i.amount,
        INVOICE_LABEL[i.status],
        i.source,
        i.payment_type,
        tanggal(i.created_at, "yyyy-MM-dd HH:mm"),
        tanggal(i.paid_at, "yyyy-MM-dd HH:mm"),
      ]),
    );

  return (
    <>
      <PageHeader
        title="Pembayaran"
        subtitle="Riwayat tagihan langganan Crave POS dan Crave HRM."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Produk"
              value={product}
              onChange={setProduct}
              options={[
                { value: "all", label: `Semua (${allInvoices.length})` },
                { value: "pos", label: `Crave POS (${posList.length})` },
                { value: "hrm", label: `Crave HRM (${hrmList.length})` },
              ]}
            />
            <Button variant="outline" className="rounded-xl" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="size-4" /> Ekspor CSV
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total lunas", value: rupiah(sum(paid)), hint: `${angka(paid.length)} tagihan` },
          { label: "Lewat Midtrans", value: rupiah(sum(online)), hint: `${angka(online.length)} tagihan` },
          { label: "Aktivasi manual", value: rupiah(sum(manual)), hint: `${angka(manual.length)} tagihan, langsung aktif` },
          { label: "Menunggu pembayaran", value: rupiah(sum(pending)), hint: `${angka(pending.length)} tagihan` },
        ].map((s) => (
          <Tile key={s.label}>
            <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
            <p className="mt-1 truncate text-xl font-extrabold tracking-tight tabular-nums">{s.value}</p>
            <p className="truncate text-[11px] text-muted-foreground">{s.hint}</p>
          </Tile>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari order ID, email, atau nama pelanggan"
            aria-label="Cari tagihan"
            className="rounded-xl pl-11"
          />
        </div>
        <Segmented
          label="Saring status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "paid", label: "Lunas" },
            { value: "pending", label: "Menunggu" },
            { value: "failed", label: "Batal" },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border bg-card shadow-soft">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-bold">Tenant / Pelanggan</th>
              <th className="px-4 py-3 font-bold">Produk</th>
              <th className="px-4 py-3 font-bold">Durasi</th>
              <th className="px-4 py-3 text-right font-bold">Nominal</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Metode</th>
              <th className="px-4 py-3 font-bold">Dibuat</th>
              <th className="px-4 py-3 font-bold">Dibayar</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.isLoading || hrmQuery.isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  {currentList.length === 0 ? "Belum ada tagihan." : "Tidak ada tagihan yang cocok."}
                </td>
              </tr>
            ) : (
              rows.map((i) => (
                <tr key={`${i.sourceApp}-${i.order_id}`}>
                  <td className="max-w-64 px-4 py-3">
                    <p className="truncate font-semibold">{i.targetName}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{i.order_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold " +
                        (i.sourceApp === "hrm" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")
                      }
                    >
                      {i.appName}
                    </span>
                  </td>
                  <td className="px-4 py-3">{i.months} bulan</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{rupiah(i.amount)}</td>
                  <td className="px-4 py-3">
                    <InvoiceBadge status={i.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{metode(i)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tanggal(i.created_at, "d MMM yyyy HH:mm")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tanggal(i.paid_at, "d MMM yyyy HH:mm")}</td>
                  <td className="px-4 py-3 text-right">
                    {i.sourceApp === "pos" && i.status === "pending" && i.source === "midtrans" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        disabled={syncInvoice.isPending}
                        onClick={() => check(i.order_id)}
                      >
                        <RefreshCw
                          className={
                            "size-3.5 " +
                            (syncInvoice.isPending && syncInvoice.variables === i.order_id ? "animate-spin" : "")
                          }
                        />
                        Cek status
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {currentList.length >= 500 && (
        <p className="mt-2 text-xs text-muted-foreground">Menampilkan 500 tagihan terbaru.</p>
      )}
    </>
  );
}
