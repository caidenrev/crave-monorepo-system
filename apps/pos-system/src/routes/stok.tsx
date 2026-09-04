import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, PackagePlus, ScanLine, Search, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rupiah } from "@/lib/pos-data";
import { useProducts, SupabaseProduct } from "@/lib/useProducts";
import { useSuppliers } from "@/lib/useSuppliers";
import { useCategories } from "@/lib/useCategories";

export const Route = createFileRoute("/stok")({
  head: () => ({
    meta: [
      { title: "Manajemen Stok Barang Otomatis — Crave" },
      {
        name: "description",
        content:
          "Stok berkurang otomatis setiap transaksi, dengan peringatan restok dan pencarian cepat lewat barcode.",
      },
      { property: "og:title", content: "Manajemen Stok Otomatis — Crave" },
      {
        property: "og:description",
        content: "Kelola stok, harga, dan peringatan restok produk UMKM Anda.",
      },
    ],
  }),
  component: StokPage,
});

function StokPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("semua");
  const {
    data: products = [],
    isLoading,
    addProductMutation,
    updateProductMutation,
  } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { data: categories = [] } = useCategories();
  const productCats = categories.filter((c) => c.type === "product" || c.type === "all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<SupabaseProduct, "id">>({
    name: "",
    sku: "",
    category: "Makanan",
    price: 0,
    stock: 0,
    min_stock: 10,
    supplier_id: null,
  });

  const [editProduct, setEditProduct] = useState<SupabaseProduct | null>(null);
  const [addStockProduct, setAddStockProduct] = useState<SupabaseProduct | null>(null);
  const [addStockQty, setAddStockQty] = useState(0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) {
      toast.error("Nama dan SKU wajib diisi");
      return;
    }
    const loadingToast = toast.loading("Menyimpan produk...");
    addProductMutation.mutate(newProduct, {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        toast.success("Produk berhasil ditambahkan");
        setIsAddOpen(false);
        setNewProduct({
          name: "",
          sku: "",
          category: "Makanan",
          price: 0,
          stock: 0,
          min_stock: 10,
          supplier_id: null,
        });
      },
      onError: (err) => {
        toast.dismiss(loadingToast);
        toast.error("Gagal menambahkan produk: " + err.message);
      },
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    const loadingToast = toast.loading("Menyimpan perubahan...");
    updateProductMutation.mutate(editProduct, {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        toast.success("Produk berhasil diperbarui");
        setEditProduct(null);
      },
      onError: (err) => {
        toast.dismiss(loadingToast);
        toast.error("Gagal memperbarui produk: " + err.message);
      },
    });
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStockProduct || addStockQty <= 0) return;
    const loadingToast = toast.loading("Menambah stok...");
    updateProductMutation.mutate(
      {
        ...addStockProduct,
        stock: addStockProduct.stock + addStockQty,
      },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success("Stok berhasil ditambahkan");
          setAddStockProduct(null);
          setAddStockQty(0);
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error("Gagal menambah stok: " + err.message);
        },
      },
    );
  };

  const list = useMemo(
    () =>
      products.filter((p) => {
        const match = p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q);
        if (tab === "menipis") return match && p.stock <= p.minStock;
        return match;
      }),
    [q, tab, products],
  );

  const lowCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <AppShell
      title="Stok Barang"
      subtitle={`${products.length} produk aktif · ${lowCount} perlu restok`}
      actions={
        <Button className="rounded-xl" onClick={() => {
          setNewProduct({
            name: "",
            sku: Math.floor(10000000 + Math.random() * 90000000).toString(),
            category: "Makanan",
            price: 0,
            stock: 0,
            min_stock: 10,
            supplier_id: null,
          });
          setIsAddOpen(true);
        }}>
          <PackagePlus className="size-4" /> <span className="hidden sm:inline">Produk baru</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {lowCount > 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/50 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {lowCount} produk di bawah stok minimum
              </p>
              <p className="text-xs text-muted-foreground">
                Notifikasi push otomatis dikirim ke pemilik dan staf gudang.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama produk atau barcode"
              className="h-12 rounded-2xl border-none bg-card pl-11 shadow-soft"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="semua">Semua</TabsTrigger>
                <TabsTrigger value="menipis">Menipis</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => toast.info("Pemindai aktif")}
            >
              <ScanLine className="size-4.5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center items-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>Tidak ada produk ditemukan.</p>
            </div>
          ) : (
            list.map((p) => {
              const low = p.stock <= p.minStock;
              const pct = Math.min(100, Math.round((p.stock / Math.max(p.minStock * 4, 1)) * 100));
              return (
                <div key={p.id} className="card-soft p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{p.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {p.category} · SKU {p.sku}
                      </p>
                    </div>
                    <Badge
                      variant={low ? "destructive" : "secondary"}
                      className="shrink-0 rounded-full text-[10px]"
                    >
                      {low ? "Restok" : "Aman"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-lg font-extrabold text-primary">{rupiah(p.price)}</p>
                      <p className="text-[11px] text-muted-foreground">Min. stok {p.minStock}</p>
                    </div>
                    <p className="text-sm font-bold">{p.stock} pcs</p>
                  </div>
                  <Progress value={pct} className="mt-3 h-2 rounded-full" />
                  <div className="mt-3 flex gap-2">
                    {low ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-soft"
                        onClick={() => {
                          if (!p.supplier_id) {
                            toast.error("Supplier belum di-set!", {
                              description: "Silakan edit produk ini untuk memilih supplier terlebih dahulu.",
                            });
                            return;
                          }
                          const supplier = suppliers.find((s) => s.id === p.supplier_id);
                          if (!supplier) return;
                          
                          const text = `Halo ${supplier.name}, saya mau pesan ulang stok produk: *${p.name}* (SKU: ${p.sku}) sebanyak 10 pcs ya. Terima kasih!`;
                          window.open(`https://wa.me/${supplier.phone}?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageCircle className="size-3.5 mr-1.5" /> Order via WA
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={() =>
                          setAddStockProduct({
                            ...p,
                            min_stock: p.minStock,
                          })
                        }
                      >
                        Tambah stok
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/15"
                      onClick={() =>
                        setEditProduct({
                          ...p,
                          min_stock: p.minStock,
                        })
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail produk baru ke dalam sistem kasir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Nama Produk</label>
                <Input
                  className="rounded-xl"
                  placeholder="Es Kopi Susu"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">SKU / Barcode</label>
                <div className="flex gap-2">
                  <Input
                    className="rounded-xl flex-1"
                    placeholder="899123456"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl shrink-0 font-semibold"
                    onClick={() => setNewProduct({ ...newProduct, sku: Math.floor(10000000 + Math.random() * 90000000).toString() })}
                  >
                    Random
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Harga (Rp)</label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    min="0"
                    value={newProduct.price || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Kategori</label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(val: any) => {
                      setNewProduct({ ...newProduct, category: val });
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {productCats.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Stok Awal</label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    min="0"
                    value={newProduct.stock || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Min. Stok (Alert)</label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    min="0"
                    value={newProduct.min_stock || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, min_stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Supplier (Pemasok)</label>
                <Select
                  value={newProduct.supplier_id || "none"}
                  onValueChange={(val: any) => setNewProduct({ ...newProduct, supplier_id: val === "none" ? null : val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih Supplier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">Tanpa Supplier</SelectItem>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsAddOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="rounded-xl" disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
              <DialogDescription>Ubah informasi produk ini.</DialogDescription>
            </DialogHeader>
            {editProduct && (
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Nama Produk</label>
                  <Input
                    className="rounded-xl"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">SKU / Barcode</label>
                  <Input
                    className="rounded-xl"
                    value={editProduct.sku}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Harga (Rp)</label>
                    <Input
                      className="rounded-xl"
                      type="number"
                      min="0"
                      value={editProduct.price || ""}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, price: parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Kategori</label>
                    <Select
                      value={editProduct.category}
                      onValueChange={(val: any) => {
                        setEditProduct({ ...editProduct, category: val })
                      }}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {productCats.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Stok Saat Ini</label>
                    <Input
                      className="rounded-xl"
                      type="number"
                      min="0"
                      value={editProduct.stock || ""}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Min. Stok</label>
                    <Input
                      className="rounded-xl"
                      type="number"
                      min="0"
                      value={editProduct.min_stock || ""}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, min_stock: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Supplier (Pemasok)</label>
                  <Select
                    value={editProduct.supplier_id || "none"}
                    onValueChange={(val: any) =>
                      setEditProduct({ ...editProduct, supplier_id: val === "none" ? null : val })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Supplier" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Tanpa Supplier</SelectItem>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.category})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setEditProduct(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addStockProduct} onOpenChange={(open) => !open && setAddStockProduct(null)}>
        <DialogContent className="sm:max-w-[350px] rounded-3xl">
          <form onSubmit={handleAddStockSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Stok</DialogTitle>
              <DialogDescription>
                {addStockProduct?.name} (Stok saat ini: {addStockProduct?.stock})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Jumlah ditambahkan</label>
                <Input
                  className="rounded-xl text-center text-lg h-14"
                  type="number"
                  min="1"
                  placeholder="Misal: 10"
                  value={addStockQty || ""}
                  onChange={(e) => setAddStockQty(parseInt(e.target.value) || 0)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setAddStockProduct(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={updateProductMutation.isPending || addStockQty <= 0}
              >
                {updateProductMutation.isPending ? "Menyimpan..." : "Tambah Stok"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
