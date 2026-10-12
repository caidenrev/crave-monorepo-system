import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

/**
 * Pengganti window.confirm() dengan dialog bergaya aplikasi.
 *   if (!(await confirmDialog({ title: "Hapus kategori?", destructive: true }))) return;
 * <ConfirmHost /> dipasang sekali di root layout.
 */
export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** aksi yang menghapus / membatalkan → tombol merah */
  destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };
let show: ((p: Pending) => void) | null = null;

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // host belum terpasang (mis. dipanggil di luar aplikasi) → anggap dibatalkan, jangan lanjut diam-diam
    if (!show) return resolve(false);
    show({ ...options, resolve });
  });
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    show = (p) => {
      setPending((prev) => {
        prev?.resolve(false);
        return p;
      });
      setOpen(true);
    };
    return () => {
      show = null;
    };
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && close(false)}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
          {pending?.description && <AlertDialogDescription>{pending.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" onClick={() => close(false)}>
            {pending?.cancelLabel ?? "Batal"}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "rounded-xl",
              pending?.destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={() => close(true)}
          >
            {pending?.confirmLabel ?? "Lanjutkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
