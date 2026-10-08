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
import { useTransactions, newTransactionId } from "@/lib/useTransactions";
import { useCart } from "@/lib/useCart";
import { useMerchantSettings } from "@/lib/useMerchantSettings";
import { useAuth } from "@/lib/useAuth";
import {
  createPaymentGTInvoice,
  getPaymentGTStatus,
  type PaymentGTCreateResponse,
} from "@/lib/paymentgt-service";
import { createPaymentGuard, type PaymentVerdict } from "@/lib/payment-guard";
import { unlockCashierSound } from "@/lib/cashier-sound";
import { PaymentSuccess } from "@/components/PaymentSuccess";

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
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isSuccess: productsLoaded,
    error: productsError,
  } = useProducts();
  const { data: catData = [] } = useCategories();
  const { checkoutMutation } = useTransactions();
  const { settings: merchantSettings, sessionValid } = useMerchantSettings();

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
  // Keranjang bertahan saat pindah menu / refresh, sampai dikosongkan atau transaksi selesai
  const [cart, setCart] = useCart();
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
  // ID transaksi untuk checkout yang sedang berjalan. Tetap sama saat diulang setelah
  // gagal (tidak tercatat ganda), baru diganti setelah transaksi tersimpan.
  const checkoutIdRef = useRef<string | null>(null);
  const getCheckoutId = () => (checkoutIdRef.current ??= newTransactionId());
  // Checkout QRIS yang sudah DIBAYAR tapi belum tersimpan ke database. Selama terisi,
  // sheet tidak boleh ditutup (agar kasir tidak membuat QRIS baru untuk pesanan yang sama).
  const pendingQrisCheckoutRef = useRef<{
    cart: CartLine[];
    transactionId: string;
  } | null>(null);
  const [qrisSave, setQrisSave] = useState<
    { status: "idle" | "saving" | "saved" } | { status: "failed"; message: string }
  >({ status: "idle" });
  // Guard anti-PAID palsu dari mutasi transaksi sebelumnya (nominal sama)
  const paymentGuardRef = useRef<ReturnType<typeof createPaymentGuard> | null>(null);

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "Semua" || p.category === cat) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q)),
      ),
    [cat, q, products],
  );

  // Keranjang tersimpan bisa berisi data produk lama: segarkan harga/nama dari data
  // terbaru dan buang produk yang sudah dihapus. Hanya setelah daftar produk BENAR-BENAR
  // berhasil dimuat: saat refresh, query produk bisa belum aktif (login belum terbaca) dengan
  // data kosong & tidak "loading" — kalau dipakai, seluruh keranjang ikut terbuang.
  useEffect(() => {
    if (!productsLoaded) return;
    setCart((current) => {
      let changed = false;
      const next = current.flatMap((line) => {
        const fresh = products.find((p) => p.id === line.product.id);
        if (!fresh) {
          changed = true;
          return [];
        }
        if (JSON.stringify(fresh) !== JSON.stringify(line.product)) {
          changed = true;
          return [{ ...line, product: fresh }];
        }
        return [line];
      });
      return changed ? next : current;
    });
  }, [products, productsLoaded, setCart]);

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
      setQrisSave({ status: "idle" });
    }
  }, [mobileCartOpen]);

  const startQrisPaymentFlow = async () => {
    // Dipanggil dari tap kasir → aktifkan audio sekarang agar suara sukses
    // (yang dipicu polling, bukan tap) diizinkan browser.
    unlockCashierSound();
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

    // Validasi session merchant: gateway harus konfirmasi session ShopeePay
    // masih aktif sebelum membuat invoice. Jika invalid, blok dan arahkan
    // user re-login OTP. Tanpa ini, invoice dibuat tapi gateway tidak bisa
    // cek mutasi → status tidak akan pernah PAID (bug saat pindah device).
    if (!merchantSettings.session_json) {
      setQrisError("Sesi ShopeePay Merchant belum disambungkan. Buka Pengaturan > QRIS Merchant untuk login OTP.");
      setQrisLoading(false);
      return;
    }
    if (sessionValid === false) {
      setQrisError("Sesi ShopeePay Merchant kedaluwarsa (mungkin karena pindah device). Buka Pengaturan > QRIS Merchant, lalu sambungkan ulang akun Anda.");
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

      // Cek pertama SEBELUM pembeli sempat scan: mutasi PAID yang sudah ada
      // di titik ini pasti milik transaksi lama → dijadikan baseline.
      const guard = createPaymentGuard(invoice.created_at);
      paymentGuardRef.current = guard;
      try {
        const first = await getPaymentGTStatus(
          invoice.payment_id,
          invoice.unique_amount || total,
          merchantSettings.session_json || undefined,
        );
        if (handleVerdict(guard.evaluate(first))) return;
      } catch {
        // gagal cek awal — guard paid_at & transaction_id tetap berlaku
      }

      // Start real-time settlement polling
      if (pollingRef.current) clearInterval(pollingRef.current);
      // Counter untuk error polling berturut-turut — kalau terlalu banyak error,
      // kemungkinan session expired (bukan network transient) → kasih tahu user.
      let consecutivePollErrors = 0;
      pollingRef.current = setInterval(async () => {
        if (isSettlingRef.current) return;
        try {
          const res = await getPaymentGTStatus(
            invoice.payment_id,
            invoice.unique_amount || total,
            merchantSettings?.session_json || undefined,
          );
          consecutivePollErrors = 0; // reset counter saat sukses
          handleVerdict(guard.evaluate(res));
        } catch (err: any) {
          consecutivePollErrors += 1;
          // Setelah 5x error berturut-turut (10 detik polling), hentikan polling
          // dan arahkan user re-login merchant. Silent ignore selama ini
          // menyembunyikan masalah session expired → user stuck menunggu PAID.
          if (consecutivePollErrors >= 5) {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setQrisError("Gateway tidak dapat memverifikasi pembayaran. Sesi merchant mungkin kedaluwarsa — buka Pengaturan > QRIS Merchant untuk sambungkan ulang.");
          }
        }
      }, 2000);
    } catch (err: any) {
      setQrisError(err.message || "Gagal membuat invoice QRIS");
      setQrisLoading(false);
    }
  };

  const stopQrisTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  /** Return true jika polling harus berhenti (lunas / tidak bisa diverifikasi). */
  const handleVerdict = (verdict: PaymentVerdict): boolean => {
    if (verdict.kind === "paid") {
      handleQrisSuccess();
      return true;
    }
    if (verdict.kind === "ambiguous") {
      stopQrisTimers();
      setQrisError(
        "Terdeteksi mutasi lama dengan nominal yang sama, sehingga pembayaran ini tidak bisa diverifikasi otomatis. Cek mutasi masuk langsung di aplikasi ShopeePay Merchant sebelum menyerahkan pesanan.",
      );
      return true;
    }
    return false;
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

    // Snapshot keranjang & ID: dipakai lagi persis sama bila perlu "Simpan ulang"
    pendingQrisCheckoutRef.current = { cart: [...cart], transactionId: getCheckoutId() };
    saveQrisCheckout();
  };

  /**
   * Simpan transaksi QRIS yang sudah dibayar. Aman diulang: ID transaksi sama, jadi
   * database tidak akan mencatatnya dua kali walau percobaan sebelumnya ternyata berhasil.
   */
  const saveQrisCheckout = () => {
    const pending = pendingQrisCheckoutRef.current;
    if (!pending) return;
    setQrisSave({ status: "saving" });
    checkoutMutation.mutate(
      { cart: pending.cart, method: "QRIS", cashierName: userName, transactionId: pending.transactionId },
      {
        onSuccess: () => {
          pendingQrisCheckoutRef.current = null;
          checkoutIdRef.current = null;
          setQrisSave({ status: "saved" });
          // Auto close sheet and reset state after displaying success animation
          setTimeout(() => {
            setCart([]);
            setMobileCartOpen(false);
            setCheckoutStep("cart");
            setQrisPaid(false);
            isSettlingRef.current = false;
          }, 2200);
        },
        onError: (err) => {
          // isSettlingRef tetap true: pembayaran ini sudah diterima, jangan diproses ulang
          setQrisSave({ status: "failed", message: err.message || "Gagal menyimpan transaksi" });
        },
      },
    );
  };

  const handleCartSheetChange = (open: boolean) => {
    if (!open && pendingQrisCheckoutRef.current) {
      toast.warning("Transaksi belum tersimpan", {
        description: "Pembayaran QRIS sudah diterima. Tekan Simpan ulang sebelum menutup.",
      });
      return;
    }
    setMobileCartOpen(open);
  };

  const handleManualCheck = async () => {
    if (isSettlingRef.current || !qrisData?.payment_id) return;
    setQrisChecking(true);
    try {
      const res = await getPaymentGTStatus(
        qrisData.payment_id,
        qrisData.unique_amount || total,
        merchantSettings?.session_json || undefined,
      );
      const guard = paymentGuardRef.current ?? createPaymentGuard(qrisData.created_at);
      paymentGuardRef.current = guard;
      if (!handleVerdict(guard.evaluate(res))) {
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

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 max-h-[32vh] sm:max-h-[40vh] xl:max-h-none">
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
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-1.5 text-xs font-bold transition-all sm:py-3 sm:px-2 " +
                    (method === p.key
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                  }
                >
                  <p.icon className="size-4 sm:size-4.5" />
                  {p.key}
                </button>
              ))}
            </div>

            {method === "QRIS" ? (
              <Button
                className="mt-3 h-12 w-full rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.99] sm:mt-4 sm:h-13 sm:text-[15px]"
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
                    className="mt-3 h-12 w-full rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white transition-all sm:mt-4 sm:h-13 sm:text-[15px]"
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
                          { cart, method, cashierName: userName, transactionId: getCheckoutId() },
                          {
                            onSuccess: () => {
                              checkoutIdRef.current = null;
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
              <div className="flex w-full flex-col items-center">
                <PaymentSuccess
                  amount={total}
                  format={rupiah}
                  description={
                    qrisSave.status === "saved"
                      ? undefined
                      : "Pembayaran QRIS diterima. Menyimpan transaksi ke laporan dan stok."
                  }
                />
                {qrisSave.status === "saving" && (
                  <div className="-mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Loader2 className="size-3.5 animate-spin" /> Menyimpan transaksi...
                  </div>
                )}
                {qrisSave.status === "failed" && (
                  <div
                    role="alert"
                    className="w-full max-w-[300px] rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold text-rose-700">Transaksi belum tersimpan</p>
                        <p className="text-xs text-rose-700/90">
                          Pembayaran sudah diterima, jangan minta pelanggan membayar lagi. Periksa
                          koneksi lalu simpan ulang.
                        </p>
                        <p className="break-words text-[11px] text-rose-600/80">{qrisSave.message}</p>
                      </div>
                    </div>
                    <Button
                      className="mt-3 h-10 w-full rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700"
                      onClick={saveQrisCheckout}
                    >
                      <RefreshCw className="size-4 mr-2" /> Simpan ulang
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-[280px]">
                <div className="text-center mb-3">
                  <p className="text-xs text-slate-500 font-medium">Total Tagihan</p>
                  <p className="text-2xl font-black text-blue-600 tracking-tight">{rupiah(total)}</p>
                </div>

                {qrisData?.qris_image_base64 && (
                  <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm sm:p-3">
                    <img
                      src={qrisData.qris_image_base64}
                      alt="QRIS"
                      className="size-40 sm:size-52 object-contain rounded-lg"
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
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:size-4.5" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari produk atau ketik kode barcode"
              className="h-11 rounded-2xl border-none bg-card pl-11 shadow-soft sm:h-12"
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

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                    className="card-soft group flex flex-col gap-1.5 p-2.5 text-left transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg sm:gap-2 sm:p-3"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <Badge variant="secondary" className="rounded-full text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">
                        {p.category}
                      </Badge>
                      <span
                        className={
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow-sm sm:text-[10px] sm:px-2 " +
                          (low
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-success text-success-foreground")
                        }
                      >
                        {p.stock} pcs
                      </span>
                    </div>
                    <p className="line-clamp-2 min-h-8 text-xs font-bold leading-tight sm:min-h-10 sm:text-sm">
                      {p.name}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-xs font-extrabold text-primary sm:text-sm">{rupiah(p.price)}</span>
                      <div className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110 sm:size-7">
                        <Plus className="size-3.5" />
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
        <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 mx-auto w-[calc(100%-24px)] max-w-[480px] sm:w-[calc(100%-48px)] lg:bottom-10 lg:left-[256px]">
          <Sheet open={mobileCartOpen} onOpenChange={handleCartSheetChange}>
            <SheetTrigger asChild>
              <button className="flex h-14 w-full items-center justify-between rounded-full bg-primary p-2 pl-3 transition-transform active:scale-[0.98] sm:h-16">
                <div className="flex items-center gap-2 text-primary-foreground sm:gap-3">
                  <div className="grid size-9 place-items-center rounded-2xl bg-white/20 sm:size-11">
                    <ShoppingCart className="size-4 sm:size-5" />
                  </div>
                  <div className="flex flex-col items-start text-left leading-tight">
                    <span className="text-[10px] font-medium text-primary-foreground/90 sm:text-[11px]">
                      {cart.length} Item
                    </span>
                    <span className="text-[13px] font-bold sm:text-[15px]">{rupiah(total)}</span>
                  </div>
                </div>
                <div className="flex h-full items-center gap-1.5 rounded-full bg-background px-3 text-xs font-extrabold text-primary shadow-sm sm:px-5 sm:text-sm">
                  Lanjut Bayar <ArrowRight className="size-3.5 sm:size-4" />
                </div>
              </button>
            </SheetTrigger>
            <SheetContent
              hideClose
              side={isMobile ? "bottom" : "right"}
              className={
                isMobile
                  ? "flex max-h-[92vh] min-h-[480px] flex-col rounded-t-[2rem] bg-white p-4 sm:p-6 shadow-2xl border-t sm:rounded-t-[2.5rem] sm:min-h-[520px]"
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
