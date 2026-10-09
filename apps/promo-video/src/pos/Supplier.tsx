/**
 * Salinan halaman Supplier (apps/pos-system/src/routes/supplier.tsx):
 * kartu pemasok dengan avatar, kategori, tombol WhatsApp, edit & hapus.
 */
import { useCurrentFrame } from "remotion";
import { Truck, UserPlus, Phone, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { outExpo, progress } from "../lib/motion";

export const SUPPLIERS = [
  {
    id: "s1",
    name: "PT Kopi Nusantara",
    category: "Bahan Baku",
    phone: "6281200000001",
  },
  {
    id: "s2",
    name: "CV Susu Segar Abadi",
    category: "Dairy",
    phone: "6281200000002",
  },
  {
    id: "s3",
    name: "UD Roti Mandiri",
    category: "Bakery",
    phone: "6281200000003",
  },
  {
    id: "s4",
    name: "Toko Kemasan Jaya",
    category: "Kemasan",
    phone: "6281200000004",
  },
  {
    id: "s5",
    name: "PT Teh Nusantara",
    category: "Bahan Baku",
    phone: "6281200000005",
  },
  {
    id: "s6",
    name: "CV Gula Aren Lestari",
    category: "Bahan Baku",
    phone: "6281200000006",
  },
  {
    id: "s7",
    name: "PT Air Murni Sejahtera",
    category: "Minuman",
    phone: "6281200000007",
  },
  {
    id: "s8",
    name: "UD Snack Kriuk",
    category: "Snack",
    phone: "6281200000008",
  },
];

export const supplierActions = (
  <Button className="rounded-xl">
    <UserPlus className="size-4" /> <span>Tambah Supplier</span>
  </Button>
);

export function Supplier({
  start = 0,
  columns,
  waTapAt,
}: {
  start?: number;
  columns: number;
  waTapAt?: number;
}) {
  const frame = useCurrentFrame() - start;
  return (
    <div className="grid gap-4">
      <div className="card-soft p-4 min-w-0">
        <div className="flex items-center gap-2">
          <Truck className="size-4.5 text-primary" />
          <p className="text-sm font-extrabold">Daftar Pemasok</p>
        </div>
        <div
          className="mt-4 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {SUPPLIERS.map((s, i) => {
            const p = progress(frame, 4 + i * 3, 28 + i * 3, outExpo);
            const tapped = waTapAt !== undefined && i === 0;
            const tp = tapped
              ? progress(frame, waTapAt, waTapAt + 18, outExpo)
              : 0;
            const pressed = tapped
              ? Math.max(0, 1 - Math.abs(frame - waTapAt - 2) / 5)
              : 0;
            return (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm border"
                style={{
                  opacity: p,
                  transform: `translateY(${(1 - p) * 26}px) scale(${0.96 + p * 0.04})`,
                }}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 font-bold text-primary">
                        {s.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      <Badge
                        variant="secondary"
                        className="mt-1 rounded-full text-[10px]"
                      >
                        {s.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t flex items-center justify-between">
                  <span
                    className="relative overflow-hidden inline-flex h-8 items-center justify-center rounded-lg bg-[#25D366] px-3 text-xs font-bold text-white gap-1.5 shadow-sm"
                    style={{ transform: `scale(${1 - pressed * 0.06})` }}
                  >
                    {tapped && frame >= waTapAt && frame <= waTapAt + 20 ? (
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-white/40"
                        style={{
                          width: 120,
                          height: 120,
                          marginLeft: -60,
                          marginTop: -60,
                          transform: `scale(${0.1 + tp})`,
                          opacity: 1 - tp,
                        }}
                      />
                    ) : null}
                    <Phone className="size-3.5" />
                    WhatsApp
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                    >
                      <Edit2 className="size-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
