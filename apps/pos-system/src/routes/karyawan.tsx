import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck, UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { rolePermissions, type Role } from "@/lib/pos-data";
import { useEmployees } from "@/lib/useEmployees";

export const Route = createFileRoute("/karyawan")({
  head: () => ({
    meta: [
      { title: "Manajemen Akses Karyawan Berbasis Peran — Crave" },
      {
        name: "description",
        content:
          "Atur peran Owner, Manajer, Kasir, dan Gudang dengan izin akses granular agar data bisnis tetap aman.",
      },
    ],
  }),
  component: KaryawanPage,
});

const roles: Role[] = ["Owner", "Manajer", "Kasir", "Gudang"];

function KaryawanPage() {
  const {
    data: employees = [],
    isLoading,
    addEmployeeMutation,
    toggleActiveMutation,
  } = useEmployees();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    addEmployeeMutation.mutate(
      {
        name: String(formData.get("name")),
        email: formData.get("email") ? String(formData.get("email")) : null,
        role: String(formData.get("role")),
      },
      {
        onSuccess: () => {
          toast.success("Karyawan berhasil ditambahkan");
          setIsAddOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleToggleActive = (id: string, name: string, active: boolean) => {
    toggleActiveMutation.mutate(
      { id, active },
      {
        onSuccess: () => {
          toast.success(`Akses ${name} berhasil di${active ? "aktifkan" : "nonaktifkan"}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <AppShell
      title="Karyawan & Akses"
      subtitle={`${employees.length} akun terdaftar · 4 peran`}
      actions={
        <Button className="rounded-xl" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="size-4" /> <span className="hidden sm:inline">Undang karyawan</span>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="card-soft p-4 min-w-0">
          <p className="text-sm font-extrabold">Daftar karyawan</p>
          <div className="mt-3 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : employees.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada karyawan terdaftar.
              </div>
            ) : (
              employees.map((e) => (
                <div
                  key={e.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-muted/50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary uppercase">
                        {e.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{e.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {e.email || "Tanpa email"} ·{" "}
                        {e.last_active
                          ? new Date(e.last_active).toLocaleDateString("id-ID")
                          : "Belum pernah login"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {e.role}
                    </Badge>
                    <Switch
                      checked={e.active}
                      onCheckedChange={(v) => handleToggleActive(e.id, e.name, v)}
                      disabled={toggleActiveMutation.isPending}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-soft p-4 min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4.5 text-primary" />
            <p className="text-sm font-extrabold">Matriks izin peran</p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-40">Izin</TableHead>
                  {roles.map((r) => (
                    <TableHead key={r} className="text-center text-[11px]">
                      {r}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolePermissions.map((row) => (
                  <TableRow key={row.permission}>
                    <TableCell className="text-xs font-semibold">{row.permission}</TableCell>
                    {roles.map((r) => (
                      <TableCell key={r} className="text-center">
                        {row.roles.includes(r) ? (
                          <Check className="mx-auto size-4 text-success" />
                        ) : (
                          <X className="mx-auto size-4 text-muted-foreground/50" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Perubahan peran langsung berlaku pada perangkat kasir yang sedang aktif.
          </p>
        </div>
      </div>

      {}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Undang Karyawan Baru</DialogTitle>
              <DialogDescription>Tambahkan akses karyawan ke sistem Anda.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" placeholder="Misal: Dimas" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Misal: dimas@crave.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Peran (Role)</Label>
                <Select name="role" defaultValue="Kasir" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={addEmployeeMutation.isPending}>
                {addEmployeeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
