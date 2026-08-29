import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ScanLine,
  Search,
  Trash2,
  Wallet,
  QrCode,
  CreditCard,
  HandCoins,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { categories, rupiah, type CartLine, type Product } from "@/lib/pos-data";
import { useProducts } from "@/lib/useProducts";
import { useTransactions } from "@/lib/useTransactions";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crave — Aplikasi Kasir POS Digital untuk UMKM" },
      {
        name: "description",
        content:
          "Kasir digital dengan pemindaian barcode, stok otomatis, catatan utang pelanggan, dan laporan penjualan real-time untuk UMKM.",
      },
      { property: "og:title", content: "Crave — Kasir POS Digital untuk UMKM" },
      {
        property: "og:description",
        content:
          "Ganti pencatatan manual dengan kasir digital: barcode, stok otomatis, dan laporan real-time.",
      },
    ],
  }),
  component: KasirPage,
});

const payments = [
  { key: "QRIS", icon: QrCode },
  { key: "Kartu", icon: CreditCard },
  { key: "Tunai", icon: Wallet },
  { key: "Utang", icon: HandCoins },
] as const;

function KasirPage() {
  const isMobile = useIsMobile();
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useProducts();
  const { checkoutMutation } = useTransactions();
  const { user } = useAuth();
  const userName = user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "User";

  if (productsError) {
    console.error("Error fetching products:", productsError);
  }

  const [cat, setCat] = useState<string>("Semua");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<"QRIS" | "Kartu" | "Tunai" | "Utang">("QRIS");

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "Semua" || p.category === cat) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q)),
      ),
    [cat, q, products],
  );

  const add = (p: Product) => {
    setCart((c) => {
      const found = c.find((l) => l.product.id === p.id);
      if (found) return c.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { product: p, qty: 1 }];
    });
  };
  const step = (id: string, d: number) =>
    setCart((c) =>
      c.map((l) => (l.product.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0),
    );

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const cartContent = (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold">Keranjang</p>
            <p className="text-[11px] text-muted-foreground">Struk #27363</p>
          </div>
          {cart.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl text-destructive">
                  <Trash2 className="size-4" /> Kosongkan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Kosongkan Keranjang?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin membatalkan transaksi ini? Semua produk di keranjang
                    akan dihapus.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => setCart([])}
                  >
                    Ya, Kosongkan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
        <Separator className="my-3" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 max-h-[200px] xl:max-h-none">
        {cart.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Pilih produk atau pindai barcode untuk mulai transaksi.
          </p>
        ) : (
          <div className="space-y-2">
            {cart.map((l) => (
              <div
                key={l.product.id}
                className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.product.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {rupiah(l.product.price)} × {l.qty}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 rounded-lg"
                    onClick={() => step(l.product.id, -1)}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                  <Button
                    size="icon"
                    className="size-7 rounded-lg"
                    onClick={() => step(l.product.id, 1)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 mt-auto">
        <Separator className="my-3" />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{rupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Pajak 11%</span>
            <span className="font-semibold text-foreground">{rupiah(tax)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-base">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-primary">{rupiah(total)}</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Metode pembayaran
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {payments.map((p) => (
            <button
              key={p.key}
              onClick={() => setMethod(p.key)}
              className={
                "flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] font-bold transition-colors " +
                (method === p.key
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-muted-foreground hover:bg-accent")
              }
            >
              <p.icon className="size-4" />
              {p.key}
            </button>
          ))}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mt-4 h-12 w-full rounded-2xl text-base" disabled={cart.length === 0}>
              Bayar {cart.length > 0 ? rupiah(total) : ""}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
              <AlertDialogDescription>
                Selesaikan pembayaran sebesar{" "}
                <strong className="text-foreground">{rupiah(total)}</strong> dengan metode{" "}
                <strong>{method}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl"
                disabled={checkoutMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  checkoutMutation.mutate(
                    { cart, method, cashierName: userName },
                    {
                      onSuccess: () => {
                        setCart([]);
                        setMobileCartOpen(false);
                      },
                    },
                  );
                }}
              >
                {checkoutMutation.isPending ? "Memproses..." : "Konfirmasi"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <AppShell
      title="Kasir"
      subtitle="Kamis, 13 Agustus 2026 · Shift pagi"
      actions={
        <Button
          className="rounded-xl"
          onClick={() =>
            toast.success("Pemindai barcode siap", {
              description: "Arahkan kamera ke barcode produk.",
            })
          }
        >
          <ScanLine className="size-4" /> <span className="hidden sm:inline">Scan barcode</span>
        </Button>
      }
    >
      <div className="grid gap-4">
        <section className="space-y-4 min-w-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari produk atau ketik kode barcode"
              className="h-12 rounded-2xl border-none bg-card pl-11 shadow-soft"
            />
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={cat === c ? "default" : "outline"}
                  onClick={() => setCat(c)}
                  className="shrink-0 rounded-full"
                >
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
            {isLoadingProducts ? (
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
                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    className="card-soft group flex flex-col gap-2 p-3 text-left transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        {p.category}
                      </Badge>
                      <span
                        className={
                          low
                            ? "rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm"
                            : "rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-success-foreground shadow-sm"
                        }
                      >
                        {p.stock} pcs
                      </span>
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm font-bold leading-tight">
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-primary">{rupiah(p.price)}</span>
                      <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
                        <Plus className="size-4" />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-[88px] left-0 right-0 z-40 mx-auto w-[calc(100%-32px)] max-w-[480px] sm:w-[calc(100%-48px)] lg:bottom-10 lg:left-[256px]">
          <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
            <SheetTrigger asChild>
              <button className="flex h-16 w-full items-center justify-between rounded-full bg-primary p-2 pl-3 shadow-xl shadow-primary/25 transition-transform active:scale-[0.98]">
                <div className="flex items-center gap-3 text-primary-foreground">
                  <div className="grid size-11 place-items-center rounded-2xl bg-white/20">
                    <ShoppingCart className="size-5" />
                  </div>
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="text-[11px] font-medium text-primary-foreground/90">
                      {cart.length} Item
                    </span>
                    <span className="text-[15px] font-bold">{rupiah(total)}</span>
                  </div>
                </div>
                <div className="flex h-full items-center gap-1.5 rounded-full bg-background px-5 text-sm font-extrabold text-primary shadow-sm">
                  Lanjut Bayar <ArrowRight className="size-4" />
                </div>
              </button>
            </SheetTrigger>
            <SheetContent
              hideClose
              side={isMobile ? "bottom" : "right"}
              className={
                isMobile
                  ? "flex max-h-[90vh] flex-col rounded-t-3xl bg-background p-4"
                  : "flex h-full w-[380px] sm:max-w-[400px] flex-col bg-background p-4"
              }
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Pembayaran</SheetTitle>
                <SheetDescription>Selesaikan pembayaran</SheetDescription>
              </SheetHeader>
              {cartContent}
            </SheetContent>
          </Sheet>
        </div>
      )}
    </AppShell>
  );
}
