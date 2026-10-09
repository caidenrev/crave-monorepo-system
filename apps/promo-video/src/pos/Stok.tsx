/**
 * Salinan halaman Stok (apps/pos-system/src/routes/stok.tsx) — kartu produk,
 * badge Restok/Aman, progress stok, tombol "Order via WA", dan dialog
 * "Tambah Produk Baru". Dialog Radix (portal + fixed) diganti elemen biasa
 * dengan class yang sama agar berada di dalam layar virtual video.
 */
import { useCurrentFrame } from "remotion";
import {
  AlertTriangle,
  PackagePlus,
  ScanLine,
  Search,
  MessageCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { products, rupiah, type Product } from "@/lib/pos-data";
import { clamp, outExpo, progress } from "../lib/motion";
import { interpolate } from "remotion";

export const stokLowCount = products.filter(
  (p) => p.stock <= p.minStock,
).length;

/** Produk yang ditambahkan lewat dialog di video */
const NEW_PRODUCT: Product = {
  id: "new",
  name: "Es Teh Leci",
  sku: "89910013",
  category: "Minuman",
  price: 15000,
  stock: 50,
  minStock: 10,
};
const NEW_SUPPLIER = "PT Teh Nusantara (Bahan Baku)";

/** Jadwal alur tambah produk (frame relatif, setelah `start`). */
export type AddFlow = { openAt: number };

const flowTimes = (o: number) => ({
  overlay: [o, o + 12] as const,
  name: o + 16,
  sku: o + 42,
  price: o + 58,
  category: o + 72,
  stock: o + 80,
  min: o + 86,
  supplier: o + 94,
  save: o + 108,
  close: o + 112,
  added: o + 118,
});

/** Teks yang "diketik" bertahap: 1 karakter tiap `speed` frame. */
const typed = (text: string, frame: number, from: number, speed = 2) =>
  frame < from ? "" : text.slice(0, Math.floor((frame - from) / speed) + 1);

function Press({
  frame,
  at,
  children,
}: {
  frame: number;
  at: number;
  children: React.ReactNode;
}) {
  const pressed = Math.max(0, 1 - Math.abs(frame - at - 2) / 5);
  const rp = progress(frame, at, at + 18, outExpo);
  return (
    <span
      className="relative inline-flex"
      style={{ transform: `scale(${1 - pressed * 0.05})` }}
    >
      {children}
      {frame >= at && frame <= at + 20 ? (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-white/45"
          style={{
            width: 140,
            height: 140,
            marginLeft: -70,
            marginTop: -70,
            transform: `scale(${0.1 + rp})`,
            opacity: 1 - rp,
          }}
        />
      ) : null}
    </span>
  );
}

export function StokActions({
  start = 0,
  tapAt,
}: {
  start?: number;
  tapAt?: number;
}) {
  const frame = useCurrentFrame() - start;
  const btn = (
    <Button className="rounded-xl overflow-hidden">
      <PackagePlus className="size-4" /> <span>Produk baru</span>
    </Button>
  );
  return tapAt === undefined ? (
    btn
  ) : (
    <Press frame={frame} at={tapAt}>
      {btn}
    </Press>
  );
}

function SelectBox({
  value,
  placeholder,
  active,
}: {
  value: string;
  placeholder: string;
  active: boolean;
}) {
  // markup SelectTrigger dari pos-system (components/ui/select.tsx)
  return (
    <button
      type="button"
      data-placeholder={value ? undefined : ""}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1 rounded-xl",
        active && "ring-1 ring-ring",
      )}
    >
      <span>{value || placeholder}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

function AddProductDialog({ frame, o }: { frame: number; o: number }) {
  const t = flowTimes(o);
  const open = progress(frame, t.overlay[0], t.overlay[1], outExpo);
  const close = progress(frame, t.close, t.close + 12, outExpo);
  const vis = open * (1 - close);
  if (vis <= 0) return null;

  const name = typed(NEW_PRODUCT.name, frame, t.name);
  const sku = typed(NEW_PRODUCT.sku, frame, t.sku, 1.5);
  const price = typed(String(NEW_PRODUCT.price), frame, t.price);
  const category = frame >= t.category + 4 ? NEW_PRODUCT.category : "";
  const stock = typed(String(NEW_PRODUCT.stock), frame, t.stock);
  const min = typed(String(NEW_PRODUCT.minStock), frame, t.min);
  const supplier = frame >= t.supplier + 4 ? NEW_SUPPLIER : "";

  // field yang sedang aktif (fokus) mengikuti urutan pengisian
  const order = [
    t.name,
    t.sku,
    t.price,
    t.category,
    t.stock,
    t.min,
    t.supplier,
    t.save,
  ] as const;
  const activeIdx = order.findIndex(
    (at, i) => frame >= at && frame < (order[i + 1] ?? Infinity),
  );
  const focus = (i: number) =>
    activeIdx === i ? "ring-1 ring-ring border-ring" : "";

  return (
    <>
      <div
        className="absolute inset-0 z-[10000] bg-black/20 backdrop-blur-md"
        style={{ opacity: vis }}
      />
      <div
        className="absolute left-[50%] top-[50%] z-[10001] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:max-w-[425px] rounded-3xl"
        style={{
          opacity: vis,
          transform: `translate(-50%, -50%) scale(${0.95 + 0.05 * open - 0.03 * close})`,
        }}
      >
        <div>
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Tambah Produk Baru
            </h2>
            <p className="text-sm text-muted-foreground">
              Masukkan detail produk baru ke dalam sistem kasir.
            </p>
          </div>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Nama Produk</label>
              <Input
                readOnly
                className={cn("rounded-xl", focus(0))}
                placeholder="Es Kopi Susu"
                value={name}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">SKU / Barcode</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  className={cn("rounded-xl flex-1", focus(1))}
                  placeholder="899123456"
                  value={sku}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl shrink-0 font-semibold"
                >
                  Random
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Harga (Rp)</label>
                <Input
                  readOnly
                  className={cn("rounded-xl", focus(2))}
                  value={price}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Kategori</label>
                <SelectBox
                  value={category}
                  placeholder="Pilih Kategori"
                  active={activeIdx === 3}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Stok Awal</label>
                <Input
                  readOnly
                  className={cn("rounded-xl", focus(4))}
                  value={stock}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">
                  Min. Stok (Alert)
                </label>
                <Input
                  readOnly
                  className={cn("rounded-xl", focus(5))}
                  value={min}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">
                Supplier (Pemasok)
              </label>
              <SelectBox
                value={supplier}
                placeholder="Pilih Supplier"
                active={activeIdx === 6}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="button" variant="outline" className="rounded-xl">
              Batal
            </Button>
            <Press frame={frame} at={t.save}>
              <Button type="submit" className="rounded-xl overflow-hidden">
                Simpan Produk
              </Button>
            </Press>
          </div>
        </div>
        <span className="absolute right-4 top-4 rounded-sm opacity-70">
          <X className="h-4 w-4" />
        </span>
      </div>
    </>
  );
}

function ProductCard({
  p,
  frame,
  i,
  highlight,
}: {
  p: Product;
  frame: number;
  i: number;
  highlight?: number;
}) {
  const low = p.stock <= p.minStock;
  const pct = Math.min(
    100,
    Math.round((p.stock / Math.max(p.minStock * 4, 1)) * 100),
  );
  const enter =
    highlight !== undefined
      ? progress(frame, highlight, highlight + 24, outExpo)
      : progress(frame, i * 2, i * 2 + 22, outExpo);
  const fill =
    highlight !== undefined
      ? progress(frame, highlight + 6, highlight + 40, outExpo)
      : progress(frame, 12 + i * 2, 50 + i * 2, outExpo);
  const glow =
    highlight !== undefined
      ? interpolate(
          frame,
          [highlight, highlight + 20, highlight + 80],
          [0, 1, 0],
          clamp,
        )
      : 0;
  return (
    <div
      className="card-soft p-4"
      style={{
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px) scale(${highlight !== undefined ? 0.9 + enter * 0.1 : 1})`,
        boxShadow:
          glow > 0
            ? `0 0 0 ${2 + glow}px rgba(37,99,235,${0.55 * glow}), 0 18px 40px -12px rgba(37,99,235,${0.45 * glow})`
            : undefined,
      }}
    >
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
          <p className="text-lg font-extrabold text-primary">
            {rupiah(p.price)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Min. stok {p.minStock}
          </p>
        </div>
        <p className="text-sm font-bold">{p.stock} pcs</p>
      </div>
      <Progress value={pct * fill} className="mt-3 h-2 rounded-full" />
      <div className="mt-3 flex gap-2">
        {low ? (
          <Button
            variant="default"
            size="sm"
            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-soft"
          >
            <MessageCircle className="size-3.5 mr-1.5" /> Order via WA
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1 rounded-xl">
            Tambah stok
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/15"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

export function Stok({
  start = 0,
  columns,
  addFlow,
}: {
  start?: number;
  columns: number;
  addFlow?: AddFlow;
}) {
  const frame = useCurrentFrame() - start;
  // produk menipis ditampilkan lebih dulu agar langsung terlihat di video
  const list = [...products].sort(
    (a, b) => Number(b.stock <= b.minStock) - Number(a.stock <= a.minStock),
  );
  const alertP = progress(frame, 18, 40, outExpo);
  const added = addFlow ? flowTimes(addFlow.openAt).added : Infinity;

  return (
    <>
      <div className="space-y-4">
        <div
          className="flex items-start gap-3 rounded-2xl border bg-muted/50 p-4"
          style={{
            opacity: alertP,
            transform: `translateY(${(1 - alertP) * -14}px)`,
          }}
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {stokLowCount} produk di bawah stok minimum
            </p>
            <p className="text-xs text-muted-foreground">
              Notifikasi push otomatis dikirim ke pemilik dan staf gudang.
            </p>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-[minmax(0,1fr)_auto] items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Cari nama produk atau barcode"
              className="h-12 rounded-2xl border-none bg-card pl-11 shadow-soft"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value="semua">
              <TabsList className="rounded-xl">
                <TabsTrigger value="semua">Semua</TabsTrigger>
                <TabsTrigger value="menipis">Menipis</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ScanLine className="size-4.5" />
            </Button>
          </div>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {frame >= added ? (
            <ProductCard
              p={NEW_PRODUCT}
              frame={frame}
              i={0}
              highlight={added}
            />
          ) : null}
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} frame={frame} i={i} />
          ))}
        </div>
      </div>
      {addFlow ? <AddProductDialog frame={frame} o={addFlow.openAt} /> : null}
    </>
  );
}
