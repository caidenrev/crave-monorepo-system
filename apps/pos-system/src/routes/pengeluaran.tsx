import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Wallet, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenses } from "@/lib/useExpenses";
import { rupiah } from "@/lib/pos-data";

export const Route = createFileRoute("/pengeluaran")({
  head: () => ({
    meta: [
      { title: "Buku Kas & Pengeluaran — Crave" },
      {
        name: "description",
        content: "Catat pengeluaran operasional toko seperti belanja bahan baku, listrik, dan lainnya.",
      },
    ],
  }),
  component: PengeluaranPage,
});

function PengeluaranPage() {
  const [q, setQ] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data: expenses = [], isLoading, addExpenseMutation, deleteExpenseMutation } = useExpenses();

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: 0,
    category: "Bahan Baku",
    notes: "",
  });

  const totalPengeluaran = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.title.toLowerCase().includes(q.toLowerCase()) ||
      exp.category.toLowerCase().includes(q.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || newExpense.amount <= 0) {
      toast.error("Judul dan nominal harus diisi dengan benar.");
      return;
    }
    
    const loadingToast = toast.loading("Mencatat pengeluaran...");
    addExpenseMutation.mutate(
      {
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        notes: newExpense.notes || null,
      },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success("Pengeluaran berhasil dicatat!");
          setIsAddOpen(false);
          setNewExpense({ title: "", amount: 0, category: "Bahan Baku", notes: "" });
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error("Gagal mencatat: " + err.message);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan pengeluaran ini?")) {
      const loadingToast = toast.loading("Menghapus...");
      deleteExpenseMutation.mutate(id, {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success("Catatan berhasil dihapus.");
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error("Gagal menghapus: " + err.message);
        },
      });
    }
  };

  return (
    <AppShell
      title="Buku Kas (Pengeluaran)"
      subtitle="Kelola arus kas keluar untuk pencatatan laba bersih yang lebih akurat."
      actions={
        <Button className="rounded-xl" onClick={() => setIsAddOpen(true)}>
          <Plus className="size-4" /> <span className="hidden sm:inline">Catat Pengeluaran</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Ringkasan */}
        <div className="grid gap-3 sm:grid-cols-1">
          <div className="card-soft flex items-center p-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <Wallet className="size-6" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-bold text-muted-foreground">Total Pengeluaran</p>
              <p className="truncate text-2xl font-extrabold tracking-tight">
                {rupiah(totalPengeluaran)}
              </p>
            </div>
          </div>
        </div>

        {/* Pencarian */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari berdasarkan judul atau kategori..."
            className="h-12 rounded-2xl border-none bg-card pl-11 shadow-soft"
          />
        </div>

        {/* Daftar Pengeluaran */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Memuat data pengeluaran...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Belum ada catatan pengeluaran.
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="card-soft relative p-4 group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="mb-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                  {exp.category}
                </div>
                <h3 className="font-extrabold text-foreground truncate pr-8">{exp.title}</h3>
                <p className="text-xl font-bold text-destructive mt-1">-{rupiah(exp.amount)}</p>
                {exp.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    Catatan: {exp.notes}
                  </p>
                )}
                <div className="mt-4 text-[10px] text-muted-foreground font-medium">
                  {format(new Date(exp.created_at), "d MMMM yyyy, HH:mm", { locale: id })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
              <DialogDescription>
                Masukkan rincian biaya operasional atau bahan baku.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul Pengeluaran</Label>
                <Input
                  id="title"
                  className="rounded-xl"
                  placeholder="Misal: Beli Kopi Susu 1kg, Bayar Listrik"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Nominal (Rp)</Label>
                  <Input
                    id="amount"
                    className="rounded-xl"
                    type="number"
                    min="100"
                    placeholder="0"
                    value={newExpense.amount || ""}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(val) => setNewExpense({ ...newExpense, category: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Bahan Baku">Bahan Baku</SelectItem>
                      <SelectItem value="Operasional">Operasional (Listrik/Air dll)</SelectItem>
                      <SelectItem value="Gaji Karyawan">Gaji Karyawan</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Catatan Opsional</Label>
                <Input
                  id="notes"
                  className="rounded-xl"
                  placeholder="Opsional..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
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
              <Button type="submit" className="rounded-xl" disabled={addExpenseMutation.isPending}>
                {addExpenseMutation.isPending ? "Menyimpan..." : "Simpan Pengeluaran"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
