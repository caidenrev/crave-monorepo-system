import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Minus,
  Plus,
  ScanLine,
  Search,
  Trash2,
  Wallet,
  QrCode,
  CreditCard,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
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
import { rupiah, type CartLine, type Product } from "@/lib/pos-data";
import { useProducts } from "@/lib/useProducts";
import { useCategories } from "@/lib/useCategories";
import { useTransactions } from "@/lib/useTransactions";
import { useMerchantSettings } from "@/lib/useMerchantSettings";
import { useAuth } from "@/lib/useAuth";
import {
  createPaymentGTInvoice,
  getPaymentGTStatus,
  type PaymentGTCreateResponse,
} from "@/lib/paymentgt-service";

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
] as const;

function KasirPage() {
  const isMobile = useIsMobile();
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useProducts();
  const { data: catData = [] } = useCategories();
  const { checkoutMutation } = useTransactions();
  const { settings: merchantSettings } = useMerchantSettings();

  const productCats = useMemo(() => {
    return ["Semua", ...catData.filter((c) => c.type === "product" || c.type === "all").map((c) => c.name)];
  }, [catData]);

  const { user } = useAuth();
  const userName = user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "User";

  if (productsError) {
    console.error("Error fetching products:", productsError);
  }

  const [cat, setCat] = useState<string>("Semua");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<"QRIS" | "Kartu" | "Tunai">("QRIS");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // In-Sheet QRIS Payment States (No extra modals/AI slop)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "qris">("cart");
  const [qrisLoading, setQrisLoading] = useState(false);
  const [qrisData, setQrisData] = useState<PaymentGTCreateResponse | null>(null);
  const [qrisError, setQrisError] = useState<string | null>(null);
  const [qrisTimeLeft, setQrisTimeLeft] = useState(600);
  const [qrisPaid, setQrisPaid] = useState(false);
  const [qrisChecking, setQrisChecking] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("27363");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isSettlingRef = useRef<boolean>(false);

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

  // Cleanup timers & polling when sheet closes
  useEffect(() => {
    if (!mobileCartOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      isSettlingRef.current = false;
      setCheckoutStep("cart");
      setQrisData(null);
      setQrisPaid(false);
      setQrisError(null);
    }
  }, [mobileCartOpen]);

  const startQrisPaymentFlow = async () => {
    const orderId = `POS-${Date.now().toString().slice(-6)}`;
    setCurrentOrderId(orderId);
    setCheckoutStep("qris");
    setQrisLoading(true);
    setQrisError(null);
    setQrisPaid(false);
    setQrisTimeLeft(600);
    isSettlingRef.current = false;

    if (!merchantSettings?.static_qris?.trim()) {
      setQrisError("QRIS Statis toko belum diatur. Silakan masukkan String QRIS toko Anda di menu Pengaturan > QRIS Merchant.");
      setQrisLoading(false);
      return;
    }

    try {
      const invoice = await createPaymentGTInvoice({
        orderId,
        amount: total,
        expiresInMinutes: 10,
        staticQris: merchantSettings.static_qris.trim(),
        sessionJson: merchantSettings.session_json || undefined,
      });

      setQrisData(invoice);
      setQrisLoading(false);

      // Start countdown timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setQrisTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start real-time settlement polling
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        if (isSettlingRef.current) return;
        try {
          const res = await getPaymentGTStatus(
            invoice.payment_id,
            total,
            merchantSettings?.session_json || undefined,
          );
          const status = (res.status || "").toUpperCase();
          if (status === "PAID" || status === "SETTLED" || status === "SUCCESS") {
            handleQrisSuccess();
          }
        } catch {
          // ignore transient poll errors
        }
      }, 2000);
    } catch (err: any) {
      setQrisError(err.message || "Gagal membuat invoice QRIS");
      setQrisLoading(false);
    }
  };

  const handleQrisSuccess = () => {
    // Synchronous guard to prevent duplicate executions from fast polling ticks
    if (isSettlingRef.current) return;
    isSettlingRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setQrisPaid(true);
    toast.success("Pembayaran Berhasil!", {
      description: `Dana ${rupiah(total)} telah diterima.`,
    });

    // Capture the cart snapshot for checkout mutation
    const currentCart = [...cart];
    checkoutMutation.mutate(
      { cart: currentCart, method: "QRIS", cashierName: userName },
      {
        onSuccess: () => {
          // Auto close sheet and reset state after displaying success animation
          setTimeout(() => {
            setCart([]);
            setMobileCartOpen(false);
            setCheckoutStep("cart");
            setQrisPaid(false);
            isSettlingRef.current = false;
          }, 2200);
        },
        onError: () => {
          isSettlingRef.current = false;
        },
      },
    );
  };

  const handleManualCheck = async () => {
    if (isSettlingRef.current || !qrisData?.payment_id) return;
    setQrisChecking(true);
    try {
      const res = await getPaymentGTStatus(
        qrisData.payment_id,
        total,
        merchantSettings?.session_json || undefined,
      );
      const status = (res.status || "").toUpperCase();
      if (status === "PAID" || status === "SETTLED" || status === "SUCCESS") {
        handleQrisSuccess();
      } else {
        toast.info("Belum Ada Pembayaran Masuk", {
          description: "Silakan selesaikan scan & transfer di aplikasi bank/e-wallet pembeli.",
        });
      }
    } catch {
      toast.error("Gagal menghubungi payment gateway");
    } finally {
      setQrisChecking(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // SHEET CONTENT: CART VIEW vs QRIS PAYMENT VIEW
  // --------------------------------------------------------------------------
  const cartContent = (
    <div className="flex flex-1 min-h-0 flex-col">
      {checkoutStep === "cart" ? (
        // VIEW 1: REGULAR CART VIEW (GAMBAR 2)
        <>
          <div className="shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold text-foreground">Keranjang</p>
                <p className="text-xs text-muted-foreground">Struk #{currentOrderId}</p>
              </div>
              {cart.length > 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors p-1">
                      <Trash2 className="size-4" /> Kosongkan
                    </button>
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

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 max-h-[35vh] sm:max-h-[40vh] xl:max-h-none">
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Pilih produk atau pindai barcode untuk mulai transaksi.
              </p>
            ) : (
              <div className="space-y-2.5">
                {cart.map((l) => (
                  <div
                    key={l.product.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100/80"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{l.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rupiah(l.product.price)} × {l.qty}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        className="flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
                        onClick={() => step(l.product.id, -1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-slate-800">{l.qty}</span>
                      <button
                        className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95 shadow-sm"
                        onClick={() => step(l.product.id, 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 mt-auto pt-2">
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
                <span className="font-extrabold text-blue-600 text-lg">{rupiah(total)}</span>
              </div>
            </div>

            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Metode Pembayaran
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {payments.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setMethod(p.key)}
                  className={
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-bold transition-all " +
                    (method === p.key
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  <p.icon className="size-4.5" />
                  {p.key}
                </button>
              ))}
            </div>

            {method === "QRIS" ? (
              <Button
                className="mt-4 h-13 w-full rounded-2xl text-[15px] font-bold shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.99]"
                disabled={cart.length === 0}
                onClick={startQrisPaymentFlow}
              >
                <QrCode className="size-5 mr-2" />
                Bayar QRIS {cart.length > 0 ? rupiah(total) : ""}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="mt-4 h-13 w-full rounded-2xl text-[15px] font-bold shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    disabled={cart.length === 0}
                  >
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
            )}
          </div>
        </>
      ) : (
        // VIEW 2: IN-SHEET QRIS PAYMENT (CLEAN, NO AI SLOP)
        <div className="flex flex-1 flex-col justify-between py-1">
          <div className="shrink-0">
            <div className="flex items-center justify-between">
              {!qrisPaid ? (
                <>
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <ChevronLeft className="size-4" /> Kembali ke Keranjang
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {formatTimer(qrisTimeLeft)}
                  </span>
                </>
              ) : (
                <div className="w-full text-center py-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Konfirmasi Transaksi
                  </span>
                </div>
              )}
            </div>
            <Separator className="my-3" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-2">
            {qrisLoading ? (
              <div className="py-12 flex flex-col items-center space-y-3">
                <Loader2 className="size-8 animate-spin text-blue-600" />
                <p className="text-sm font-semibold text-slate-700">Menyiapkan QRIS Pembayaran...</p>
              </div>
            ) : qrisError ? (
              <div className="py-8 flex flex-col items-center space-y-3">
                <AlertCircle className="size-8 text-rose-500" />
                <p className="text-sm font-semibold text-slate-800">{qrisError}</p>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={startQrisPaymentFlow}>
                  <RefreshCw className="size-3.5 mr-1.5" /> Coba Lagi
                </Button>
              </div>
            ) : qrisPaid ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in-75 duration-300">
                <div className="relative flex items-center justify-center">
                  <div className="absolute size-24 rounded-full bg-emerald-100 animate-ping opacity-75" />
                  <div className="relative size-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 text-white animate-in zoom-in duration-300">
                    <Check className="size-10 stroke-[3.5] text-white animate-in zoom-in-50 duration-500" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Pembayaran Berhasil!
                  </h3>
                  <p className="text-base font-extrabold text-emerald-600">{rupiah(total)}</p>
                  <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                    Transaksi telah terverifikasi dan stok otomatis terpotong.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-[280px]">
                <div className="text-center mb-3">
                  <p className="text-xs text-slate-500 font-medium">Total Tagihan</p>
                  <p className="text-2xl font-black text-blue-600 tracking-tight">{rupiah(total)}</p>
                </div>

                {qrisData?.qris_image_base64 && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <img
                      src={qrisData.qris_image_base64}
                      alt="QRIS"
                      className="size-48 sm:size-52 object-contain rounded-lg"
                    />
                  </div>
                )}

                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Menunggu pembayaran pelanggan...</span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 mt-auto pt-3 space-y-2">
            {!qrisPaid && (
              <>
                <Button
                  className="h-12 w-full rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                  onClick={handleManualCheck}
                  disabled={qrisChecking || qrisLoading}
                >
                  {qrisChecking ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Memeriksa Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4 mr-2" /> Cek Status Pembayaran
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
                >
                  Batalkan & Kembali ke Keranjang
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
              {productCats.map((c) => (
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
                  ? "flex max-h-[92vh] min-h-[520px] flex-col rounded-t-[2.5rem] bg-white p-5 sm:p-6 shadow-2xl border-t"
                  : "flex h-full w-[400px] sm:max-w-[440px] flex-col bg-white p-6 shadow-2xl border-l"
              }
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Pembayaran Kasir</SheetTitle>
                <SheetDescription>Selesaikan transaksi kasir POS</SheetDescription>
              </SheetHeader>
              {cartContent}
            </SheetContent>
          </Sheet>
        </div>
      )}
    </AppShell>
  );
}
