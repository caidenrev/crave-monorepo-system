import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Search,
  Filter,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
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
import { useProducts } from "@/lib/useProducts";
import { useReports } from "@/lib/useReports";

export const Route = createFileRoute("/kartu-stok")({
  head: () => ({
    meta: [
      { title: "Kartu Stok — Crave" },
      { name: "description", content: "Laporan pergerakan stok barang" },
    ],
  }),
  component: KartuStokPage,
});

function KartuStokPage() {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: reports, isLoading: loadingReports } = useReports();
  const movements = reports?.stockMovements || [];

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("semua");

  const totalBarang = products.length;
  const stokMenipis = products.filter((p) => p.stock <= p.minStock).length;
  const totalNilaiStok = products.reduce((acc, curr) => acc + curr.stock * curr.price, 0);

  const totalBarangMasuk = movements
    .filter((m) => m.type === "IN")
    .reduce((acc, curr) => acc + curr.qty, 0);

  const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");
  const isLoading = loadingProducts || loadingReports;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQ =
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.toLowerCase().includes(q.toLowerCase());
      const matchCategory =
        category === "semua" || p.category.toLowerCase() === category.toLowerCase();
      return matchQ && matchCategory;
    });
  }, [products, q, category]);

  return (
    <AppShell
      title="Kartu Stok"
      subtitle="Pantau pergerakan masuk keluar dan sisa barang"
      actions={
        <Button
          className="rounded-xl"
          onClick={() => toast.success("Mengekspor kartu stok ke PDF...")}
        >
          <Download className="size-4" /> <span className="hidden sm:inline">Ekspor PDF</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card-soft p-4 flex flex-col gap-2 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <Package className="size-5" />
              <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                {totalBarang} Item
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black">{rupiah(totalNilaiStok)}</p>
              <p className="text-xs font-medium opacity-80">Estimasi Nilai Stok Tersedia</p>
            </div>
          </div>
          <div className="card-soft p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-bold">Barang Masuk</span>
              <span className="flex items-center gap-1 text-xs font-bold text-success">
                <ArrowUpRight className="size-3" /> Total Riwayat
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground">{totalBarangMasuk}</p>
              <p className="text-xs text-muted-foreground">Stok masuk (sejak awal)</p>
            </div>
          </div>
          <div className="card-soft p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-bold">Stok Menipis</span>
              <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                <ArrowDownRight className="size-3" /> Perlu aksi
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-destructive">{stokMenipis}</p>
              <p className="text-xs text-muted-foreground">Item di bawah batas minimum</p>
            </div>
          </div>
        </div>

        {}
        <div className="card-soft p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama barang atau SKU..."
                className="pl-9 rounded-xl bg-background"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-background">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                <SelectItem value="minuman">Minuman</SelectItem>
                <SelectItem value="makanan">Makanan</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-xl gap-2 bg-background">
              <Filter className="size-4" /> Filter
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
                    <TableHead className="whitespace-nowrap">SKU</TableHead>
                    <TableHead className="whitespace-nowrap">Nama Produk</TableHead>
                    <TableHead className="whitespace-nowrap">Kategori</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Stok Minimum</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Sisa Stok</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => {
                    const low = p.stock <= p.minStock;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-xs">{p.sku}</TableCell>
                        <TableCell className="font-semibold">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full text-[10px]">
                            {p.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{p.minStock}</TableCell>
                        <TableCell className="text-right font-bold">{p.stock}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={low ? "destructive" : "secondary"}
                            className="rounded-full text-[10px]"
                          >
                            {low ? "Menipis" : "Aman"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Belum ada data produk atau filter tidak cocok.
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
