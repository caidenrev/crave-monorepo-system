import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, CalendarRange, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rupiah } from "@/lib/pos-data";
import { useReports, type ReportFilters } from "@/lib/useReports";
import { useDebts } from "@/lib/useDebts";
import { useEmployees } from "@/lib/useEmployees";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan Penjualan & Ekspor Excel / PDF — Crave" },
      {
        name: "description",
        content:
          "Unduh laporan penjualan, stok, dan piutang dalam format Excel atau PDF untuk pembukuan dan pengajuan modal.",
      },
    ],
  }),
  component: LaporanPage,
});

function LaporanPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: "hari", cashier: "semua" });

  const { data, isLoading } = useReports(filters);
  const { data: debts = [] } = useDebts("utang");
  const { data: employees = [] } = useEmployees();

  const txs = data?.transactions || [];
  const movs = data?.stockMovements || [];

  const reportTypes = [
    {
      title: "Rekap penjualan harian",
      desc: "Total transaksi, metode bayar, dan pajak",
      rows: txs.length,
    },
    { title: "Kartu stok barang", desc: "Mutasi masuk, keluar, dan sisa stok", rows: movs.length },
    { title: "Piutang pelanggan", desc: "Sisa tagihan dan jadwal jatuh tempo", rows: debts.length },
    {
      title: "Performa kasir",
      desc: "Penjualan per karyawan dan per shift",
      rows: employees.length,
    },
  ];

  const todayStr = format(new Date(), "d MMMM yyyy", { locale: id });

  const handleExportCSV = (title: string) => {
    let csvContent = "";
    if (title === "Rekap penjualan harian") {
      csvContent = "ID,Tanggal Waktu,Kasir,Metode Pembayaran,Total Item,Total Harga\n";
      txs.forEach((t) => {
        csvContent += `${t.id},"${format(new Date(t.created_at), "yyyy-MM-dd HH:mm:ss")}",${t.cashier_name || "Tidak Diketahui"},${t.payment_method},${t.total_items},${t.total_amount}\n`;
      });
    } else if (title === "Kartu stok barang") {
      csvContent = "ID,Nama Produk,Tipe,Qty,Deskripsi,Waktu\n";
      movs.forEach((m) => {
        csvContent += `${m.id},"${m.products?.name || "Produk dihapus"}",${m.type},${m.qty},"${m.description || ""}",${format(new Date(m.created_at), "yyyy-MM-dd HH:mm:ss")}\n`;
      });
    } else {
      toast.info(`Ekspor ${title} ke Excel belum tersedia.`);
      return;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/ /g, "_")}_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${title} berhasil diekspor ke format Excel (CSV)`);
  };

  return (
    <AppShell
      title="Laporan"
      subtitle="Ekspor data untuk pembukuan dan pengajuan modal"
      actions={
        <Button className="rounded-xl" onClick={() => handleExportCSV("Rekap penjualan harian")}>
          <Download className="size-4" /> <span className="hidden sm:inline">Unduh Rekap</span>
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="card-soft grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <CalendarRange className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Periode laporan</p>
              <p className="truncate text-[11px] text-muted-foreground">{todayStr}</p>
            </div>
          </div>
          <Select
            value={filters.period}
            onValueChange={(val: any) => setFilters((f) => ({ ...f, period: val }))}
          >
            <SelectTrigger className="rounded-xl sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hari">Hari ini</SelectItem>
              <SelectItem value="minggu">Minggu ini</SelectItem>
              <SelectItem value="bulan">Bulan ini</SelectItem>
              <SelectItem value="tahun">Tahun ini</SelectItem>
              <SelectItem value="semua">Semua Waktu</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.cashier}
            onValueChange={(val: string) => setFilters((f) => ({ ...f, cashier: val }))}
          >
            <SelectTrigger className="rounded-xl sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua kasir</SelectItem>
              {employees
                .filter((e) => e.role === "Kasir" || e.role === "Owner")
                .map((e) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {reportTypes.map((r) => (
            <div key={r.title} className="card-soft p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{r.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.desc}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">
                  {r.rows} baris
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => handleExportCSV(r.title)}
                >
                  <FileSpreadsheet className="size-4" /> Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    toast.success(`${r.title} PDF sedang disiapkan`);
                    setTimeout(() => window.print(), 1000);
                  }}
                >
                  <FileText className="size-4" /> PDF
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-soft p-4">
          <p className="text-sm font-extrabold">Pratinjau transaksi</p>
          <div className="mt-3 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Struk</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Item</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs font-bold">
                        {t.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(t.created_at), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs">{t.cashier_name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={t.payment_method === "Utang" ? "destructive" : "secondary"}
                          className="rounded-full text-[10px]"
                        >
                          {t.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">{t.total_items}</TableCell>
                      <TableCell className="text-right text-xs font-bold">
                        {rupiah(t.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {txs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Belum ada transaksi pada periode ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
