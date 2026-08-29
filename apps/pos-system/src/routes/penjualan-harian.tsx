import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useReports } from "@/lib/useReports";
import { format } from "date-fns";

export const Route = createFileRoute("/penjualan-harian")({
  head: () => ({
    meta: [
      { title: "Penjualan Harian — Crave" },
      { name: "description", content: "Detail transaksi harian" },
    ],
  }),
  component: PenjualanHarianPage,
});

function PenjualanHarianPage() {
  const { data, isLoading } = useReports({ period: "hari", cashier: "semua" });
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("semua");

  const allTxs = data?.transactions || [];

  const txs = allTxs.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.cashier_name && t.cashier_name.toLowerCase().includes(search.toLowerCase()));

    let matchesMethod = true;
    if (method !== "semua") {
      if (method === "qris" && t.payment_method !== "QRIS") matchesMethod = false;
      if (method === "tunai" && t.payment_method !== "Tunai") matchesMethod = false;
      if (method === "kartu" && !["Kartu Kredit", "Kartu Debit"].includes(t.payment_method))
        matchesMethod = false;
      if (method === "utang" && t.payment_method !== "Utang") matchesMethod = false;
    }

    return matchesSearch && matchesMethod;
  });

  const totalPendapatan = txs.reduce((acc, curr) => acc + curr.total_amount, 0);
  const avg = txs.length > 0 ? Math.floor(totalPendapatan / txs.length) : 0;

  const handleExportCSV = () => {
    let csvContent = "ID,Tanggal Waktu,Kasir,Metode Pembayaran,Total Item,Total Harga\n";
    txs.forEach((t) => {
      csvContent += `${t.id},"${format(new Date(t.created_at), "yyyy-MM-dd HH:mm:ss")}",${t.cashier_name || "Tidak Diketahui"},${t.payment_method},${t.total_items},${t.total_amount}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Penjualan_Harian_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan penjualan harian berhasil diekspor");
  };

  return (
    <AppShell
      title="Penjualan Harian"
      subtitle="Detail seluruh transaksi kasir hari ini secara full page"
      actions={
        <Button className="rounded-xl" onClick={handleExportCSV}>
          <Download className="size-4" /> <span className="hidden sm:inline">Ekspor CSV</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card-soft p-4 flex flex-col gap-2 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <Activity className="size-5" />
              <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="size-3" /> Hari Ini
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black">{rupiah(totalPendapatan)}</p>
              <p className="text-xs font-medium opacity-80">Total Pendapatan</p>
            </div>
          </div>
          <div className="card-soft p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-bold">Total Transaksi</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground">{txs.length}</p>
              <p className="text-xs text-muted-foreground">Berhasil diproses</p>
            </div>
          </div>
          <div className="card-soft p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-bold">Rata-rata Transaksi</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground">{rupiah(avg)}</p>
              <p className="text-xs text-muted-foreground">Per struk belanja</p>
            </div>
          </div>
        </div>

        {}
        <div className="card-soft p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari no struk atau nama kasir..."
                className="pl-9 rounded-xl bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-background">
                <SelectValue placeholder="Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Metode</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="tunai">Tunai</SelectItem>
                <SelectItem value="kartu">Kartu Kredit/Debit</SelectItem>
                <SelectItem value="utang">Utang</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="rounded-xl gap-2 bg-background"
              onClick={() => {
                setSearch("");
                setMethod("semua");
              }}
            >
              <Filter className="size-4" /> Reset
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-background">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">No. Struk</TableHead>
                    <TableHead className="whitespace-nowrap">Waktu</TableHead>
                    <TableHead className="whitespace-nowrap">Kasir</TableHead>
                    <TableHead className="whitespace-nowrap">Metode</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Jumlah Item</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total Transaksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-bold">
                        {t.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{format(new Date(t.created_at), "dd/MM/yy HH:mm")}</TableCell>
                      <TableCell>{t.cashier_name || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={t.payment_method === "Utang" ? "destructive" : "secondary"}
                          className="rounded-full text-[10px]"
                        >
                          {t.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{t.total_items}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {rupiah(t.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {txs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Belum ada transaksi yang sesuai.
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
