import { createFileRoute } from "@tanstack/react-router";
import { Tags, Plus, Trash2, Loader2, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCategories } from "@/lib/useCategories";

export const Route = createFileRoute("/kategori")({
  head: () => ({
    meta: [{ title: "Manajemen Kategori — Crave" }],
  }),
  component: KategoriPage,
});

function KategoriPage() {
  const { data: categories = [], isLoading, addCategoryMutation, deleteCategoryMutation } = useCategories();
  const [newCatProduct, setNewCatProduct] = useState("");
  const [newCatSupplier, setNewCatSupplier] = useState("");

  const productCats = categories.filter((c) => c.type === "product" || c.type === "all");
  const supplierCats = categories.filter((c) => c.type === "supplier" || c.type === "all");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatProduct.trim()) return;

    addCategoryMutation.mutate(
      { name: newCatProduct.trim(), type: "product" },
      {
        onSuccess: () => {
          setNewCatProduct("");
          toast.success("Kategori produk berhasil ditambahkan");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatSupplier.trim()) return;

    addCategoryMutation.mutate(
      { name: newCatSupplier.trim(), type: "supplier" },
      {
        onSuccess: () => {
          setNewCatSupplier("");
          toast.success("Kategori supplier berhasil ditambahkan");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"?`)) return;
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => toast.success("Kategori berhasil dihapus"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <AppShell
      title="Manajemen Kategori"
      subtitle="Kelola kategori untuk produk dan supplier Anda."
    >
      <Tabs defaultValue="product" className="space-y-4">
        <TabsList className="rounded-xl h-12 p-1">
          <TabsTrigger value="product" className="rounded-lg h-full gap-2 px-6">
            <Package className="size-4" /> Produk
          </TabsTrigger>
          <TabsTrigger value="supplier" className="rounded-lg h-full gap-2 px-6">
            <Truck className="size-4" /> Supplier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-4">
          <div className="card-soft p-4">
            <form onSubmit={handleAddProduct} className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newCatProduct}
                onChange={(e) => setNewCatProduct(e.target.value)}
                placeholder="Kategori produk baru (misal: Minuman)"
                className="rounded-xl"
                required
              />
              <Button
                type="submit"
                className="rounded-xl shrink-0"
                disabled={addCategoryMutation.isPending}
              >
                {addCategoryMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="mr-2 size-4" />} Tambah
              </Button>
            </form>
          </div>

          <div className="card-soft p-4">
            <div className="flex items-center gap-2 mb-4">
              <Tags className="size-4.5 text-primary" />
              <p className="text-sm font-extrabold">Daftar Kategori Produk</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : productCats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Belum ada kategori produk.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productCats.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm hover:shadow-soft transition-shadow">
                    <span className="text-sm font-semibold truncate pr-2">{c.name}</span>
                    {c.type !== "all" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="supplier" className="space-y-4">
          <div className="card-soft p-4">
            <form onSubmit={handleAddSupplier} className="flex flex-col sm:flex-row gap-3">
              <Input
                value={newCatSupplier}
                onChange={(e) => setNewCatSupplier(e.target.value)}
                placeholder="Kategori supplier baru (misal: Pemasok Sayur)"
                className="rounded-xl"
                required
              />
              <Button
                type="submit"
                className="rounded-xl shrink-0"
                disabled={addCategoryMutation.isPending}
              >
                {addCategoryMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="mr-2 size-4" />} Tambah
              </Button>
            </form>
          </div>

          <div className="card-soft p-4">
            <div className="flex items-center gap-2 mb-4">
              <Tags className="size-4.5 text-primary" />
              <p className="text-sm font-extrabold">Daftar Kategori Supplier</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : supplierCats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Belum ada kategori supplier.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {supplierCats.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm hover:shadow-soft transition-shadow">
                    <span className="text-sm font-semibold truncate pr-2">{c.name}</span>
                    {c.type !== "all" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
