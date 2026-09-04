import { createFileRoute } from "@tanstack/react-router";
import { Truck, UserPlus, Phone, Loader2, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSuppliers, type SupabaseSupplier } from "@/lib/useSuppliers";
import { useCategories } from "@/lib/useCategories";

export const Route = createFileRoute("/supplier")({
  head: () => ({
    meta: [
      { title: "Manajemen Supplier — Crave" },
      {
        name: "description",
        content: "Kelola data pemasok barang untuk kemudahan pemesanan ulang.",
      },
    ],
  }),
  component: SupplierPage,
});

function SupplierPage() {
  const {
    data: suppliers = [],
    isLoading,
    addSupplierMutation,
    updateSupplierMutation,
    deleteSupplierMutation,
  } = useSuppliers();
  const { data: categories = [] } = useCategories();
  const supplierCats = categories.filter((c) => c.type === "supplier" || c.type === "all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupabaseSupplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    addSupplierMutation.mutate(
      {
        name: String(formData.get("name")),
        phone: String(formData.get("phone")),
        category: String(formData.get("category")),
      },
      {
        onSuccess: () => {
          toast.success("Supplier berhasil ditambahkan");
          setIsAddOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editSupplier) return;
    const formData = new FormData(e.currentTarget);

    updateSupplierMutation.mutate(
      {
        ...editSupplier,
        name: String(formData.get("name")),
        phone: String(formData.get("phone")),
        category: String(formData.get("category")),
      },
      {
        onSuccess: () => {
          toast.success("Supplier berhasil diperbarui");
          setEditSupplier(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <AppShell
      title="Manajemen Supplier"
      subtitle={`${suppliers.length} supplier terdaftar`}
      actions={
        <Button className="rounded-xl" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="size-4" /> <span className="hidden sm:inline">Tambah Supplier</span>
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="card-soft p-4 min-w-0">
          <div className="flex items-center gap-2">
            <Truck className="size-4.5 text-primary" />
            <p className="text-sm font-extrabold">Daftar Pemasok</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="col-span-full p-8 text-center text-muted-foreground">
                Belum ada supplier terdaftar. Tambahkan supplier untuk memudahkan restok barang.
              </div>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4 shadow-sm border">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {s.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{s.name}</p>
                        <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
                          {s.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t flex items-center justify-between">
                    <a
                      href={`https://wa.me/${s.phone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-success hover:underline"
                    >
                      <Phone className="size-3.5" />
                      {s.phone}
                    </a>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg"
                        onClick={() => setEditSupplier(s)}
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Tambah Supplier Baru</DialogTitle>
              <DialogDescription>
                Masukkan data kontak supplier. Nomor telepon gunakan format internasional (misal: 62812...).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Supplier / PT</Label>
                <Input id="name" name="name" placeholder="Misal: PT Sembako Jaya" className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Misal: 628123456789"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Supplier</Label>
                <Select name="category" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {supplierCats.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="rounded-xl" disabled={addSupplierMutation.isPending}>
                {addSupplierMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSupplier} onOpenChange={(open) => !open && setEditSupplier(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            {editSupplier && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Supplier / PT</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editSupplier.name}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Nomor Telepon (WhatsApp)</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    type="text"
                    defaultValue={editSupplier.phone}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategori Supplier</Label>
                  <Select name="category" defaultValue={editSupplier.category} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {supplierCats.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditSupplier(null)}>
                Batal
              </Button>
              <Button type="submit" className="rounded-xl" disabled={updateSupplierMutation.isPending}>
                {updateSupplierMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Supplier yang dihapus tidak dapat dikembalikan. Data produk yang terhubung ke supplier ini tidak akan memiliki referensi supplier lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteSupplierMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppShell>
  );
}
