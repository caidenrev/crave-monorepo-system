import {
  CreditCard,
  Landmark,
  ShieldCheck,
  Wallet,
  X,
  QrCode,
  Clock,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "./primitives";
import { formatPrice, type EventItem } from "@/lib/mock-data";
import {
  checkPaymentGTHealth,
  createPaymentGTInvoice,
  getPaymentGTStatus,
  PAYMENTGT_DEFAULT_SESSION_JSON,
  PAYMENTGT_DEFAULT_STATIC_QRIS,
  type PaymentGTCreateResponse,
} from "@/lib/paymentgt-service";
import { createPaymentGuard, type PaymentVerdict } from "@/lib/payment-guard";
import { useMerchantSettings } from "@/lib/useMerchantSettings";

const methods = [
  { id: "qris", label: "QRIS Dinamis (ShopeePay / All E-Wallet)", hint: "BCA · Mandiri · ShopeePay · GoPay · Dana", icon: Wallet },
  { id: "va", label: "Virtual Account", hint: "BCA · Mandiri · BNI · BRI", icon: Landmark },
  { id: "card", label: "Kartu Kredit/Debit", hint: "Visa · Mastercard", icon: CreditCard },
];

export function PaymentDialog({
  event,
  open,
  onClose,
  onPaid,
}: {
  event: EventItem;
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [method, setMethod] = useState("qris");
  const [step, setStep] = useState<"select" | "qris_display" | "success">("select");
  const [loadingQris, setLoadingQris] = useState(false);
  const [qrisData, setQrisData] = useState<PaymentGTCreateResponse | null>(null);
  const [gatewayOnline, setGatewayOnline] = useState(false);
  const [merchantName, setMerchantName] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [pollingActive, setPollingActive] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Guard anti-duplicate: cegah onPaid() terpanggil dua kali dari polling & manual check
  const isSettlingRef = useRef(false);
  // Guard anti-PAID palsu dari mutasi transaksi sebelumnya (nominal sama)
  const paymentGuardRef = useRef<ReturnType<typeof createPaymentGuard> | null>(null);

  // Ambil merchant settings dari DB (jika user adalah merchant) untuk dapat
  // session_json ShopeePay. Jika user peserta biasa (tidak punya merchant settings),
  // fallback ke env VITE_PAYMENTGT_SESSION_JSON yang di-set admin penyelenggara.
  const { settings: merchantSettings } = useMerchantSettings();

  // Resolve session_json & static_qris: prioritaskan DB merchant settings milik user,
  // fallback ke env default crave-event.
  const sessionJson = useMemo(
    () => merchantSettings?.session_json || PAYMENTGT_DEFAULT_SESSION_JSON || undefined,
    [merchantSettings?.session_json],
  );
  const staticQris = useMemo(
    () => merchantSettings?.static_qris || PAYMENTGT_DEFAULT_STATIC_QRIS || undefined,
    [merchantSettings?.static_qris],
  );

  const totalAmount = event.price;

  // Reset state when dialog opens / closes
  useEffect(() => {
    if (open) {
      setStep("select");
      setQrisData(null);
      setPollingActive(false);
      setTimeLeft(600);
      // Reset guard anti-duplicate setiap kali dialog dibuka
      isSettlingRef.current = false;

      // Check if PaymentGT daemon is running in background
      checkPaymentGTHealth().then((res) => {
        setGatewayOnline(res.active);
        if (res.merchant) setMerchantName(res.merchant);
      });
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  // Countdown timer for QRIS expiration
  useEffect(() => {
    if (step === "qris_display") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Handle generating the Dynamic QRIS via PaymentGT
  const handleProceedToPayment = async () => {
    if (method !== "qris") {
      // Direct simulation for VA / Credit Card
      setStep("success");
      setTimeout(() => {
        onPaid();
      }, 1200);
      return;
    }

    setLoadingQris(true);
    isSettlingRef.current = false;
    const orderId = `CRV-${event.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}-${Date.now().toString().slice(-4)}`;

    // Validasi: session_json wajib ada agar gateway bisa cek mutasi ShopeePay realtime.
    // Tanpa session_json, status tidak akan pernah realtime PAID (bug krusial).
    if (!sessionJson) {
      toast.error("Session Merchant Belum Dikonfigurasi", {
        description: "Admin belum men-set session merchant ShopeePay. Hubungi penyelenggara atau set VITE_PAYMENTGT_SESSION_JSON.",
      });
      setLoadingQris(false);
      return;
    }

    try {
      const invoice = await createPaymentGTInvoice({
        orderId,
        amount: totalAmount,
        expiresInMinutes: 10,
        staticQris,
        sessionJson,
      });

      if (!invoice?.payment_id || !invoice?.qris_image_base64) {
        throw new Error("Gateway tidak mengembalikan QRIS valid. Pastikan session merchant ShopeePay sudah dikonfigurasi di gateway.");
      }

      setQrisData(invoice);
      setGatewayOnline(true);
      setStep("qris_display");
      void startPolling(invoice);
    } catch (err: any) {
      console.error("[PaymentGT Client] Gagal membuat invoice QRIS:", err.message);
      // JANGAN fallback ke mode simulasi — tampilkan error jelas ke user.
      // Mode simulasi silent sebelumnya menyembunyikan kegagalan gateway dan
      // memalsukan pembayaran, padahal dana belum masuk.
      setGatewayOnline(false);
      toast.error("Gagal Membuat QRIS", {
        description: err.message || "Gateway PaymentGT tidak merespons. Coba beberapa saat lagi.",
      });
    } finally {
      setLoadingQris(false);
    }
  };

  // Start polling status every 2 seconds (menyamakan dengan pos-system).
  // Guard isSettlingRef mencegah onPaid() dipanggil dua kali saat polling
  // tick cepat dan manual check terjadi hampir bersamaan.
  const settlePaid = () => {
    // Synchronous guard untuk mencegah eksekusi duplikat dari polling tick cepat
    if (isSettlingRef.current) return;
    isSettlingRef.current = true;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingActive(false);
    setStep("success");
    toast.success("Pembayaran Berhasil Terverifikasi!", {
      description: `Dana ${formatPrice(totalAmount)} telah diterima oleh ShopeePay merchant.`,
    });
    setTimeout(() => {
      onPaid();
    }, 1500);
  };

  /** Return true jika polling harus berhenti (lunas / tidak bisa diverifikasi). */
  const handleVerdict = (verdict: PaymentVerdict): boolean => {
    if (verdict.kind === "paid") {
      settlePaid();
      return true;
    }
    if (verdict.kind === "ambiguous") {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setPollingActive(false);
      toast.error("Pembayaran Tidak Bisa Diverifikasi Otomatis", {
        description: "Terdeteksi mutasi lama dengan nominal sama. Hubungi penyelenggara untuk konfirmasi manual.",
      });
      return true;
    }
    return false;
  };

  const startPolling = async (invoice: PaymentGTCreateResponse) => {
    setPollingActive(true);
    if (pollingRef.current) clearInterval(pollingRef.current);
    const amount = invoice.unique_amount || totalAmount;

    // Cek pertama SEBELUM pembeli sempat scan: mutasi PAID yang sudah ada
    // di titik ini pasti milik transaksi lama → dijadikan baseline.
    const guard = createPaymentGuard(invoice.created_at);
    paymentGuardRef.current = guard;
    try {
      const first = await getPaymentGTStatus(invoice.payment_id, amount, sessionJson);
      if (handleVerdict(guard.evaluate(first))) return;
    } catch {
      // gagal cek awal — guard paid_at & transaction_id tetap berlaku
    }

    pollingRef.current = setInterval(async () => {
      if (isSettlingRef.current) return;
      try {
        const res = await getPaymentGTStatus(invoice.payment_id, amount, sessionJson);
        handleVerdict(guard.evaluate(res));
      } catch {
        // Abaikan error transien saat polling, tetap lanjut
      }
    }, 2000);
  };

  const [checkingStatus, setCheckingStatus] = useState(false);

  // Manual Check Payment Status (Refresh / Re-verify button)
  const handleCheckPaymentStatus = async () => {
    if (!qrisData?.payment_id) {
      // Gateway gagal membuat invoice sebelumnya — tidak boleh memalsukan PAID.
      toast.error("QRIS belum dibuat", {
        description: "Gateway belum berhasil membuat invoice QRIS. Tutup dan coba lagi.",
      });
      return;
    }

    if (isSettlingRef.current) return;
    setCheckingStatus(true);
    try {
      const res = await getPaymentGTStatus(
        qrisData.payment_id,
        qrisData.unique_amount || totalAmount,
        sessionJson,
      );
      const guard = paymentGuardRef.current ?? createPaymentGuard(qrisData.created_at);
      paymentGuardRef.current = guard;
      if (!handleVerdict(guard.evaluate(res))) {
        toast.info("Pembayaran Masih Menunggu", {
          description: "Mutasi belum masuk ke ShopeePay. Jika sudah transfer di HP, tunggu beberapa detik lalu klik lagi.",
        });
      }
    } catch (err: any) {
      toast.error("Gagal memeriksa status pembayaran", {
        description: err.message || "Pastikan server paymentgt aktif.",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  if (!open) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,23,42,0.45)] p-4 backdrop-blur-md sm:items-center">
      <div
        className="frosted-glass-card w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-white/90 bg-white/95"
        style={{ animation: "aether-pop 220ms var(--ease-spring)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Pembayaran event"
      >
        {/* Step 1: Method Selection */}
        {step === "select" && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="aether-meta text-accent">Pembayaran Tiket</p>
                <h2 className="mt-1 text-[16px] font-bold text-ink">{event.title}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-full p-2 text-ink-tertiary hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                    method === m.id
                      ? "border-accent bg-accent-tint/60 shadow-[0_2px_12px_rgba(10,132,255,0.12)]"
                      : "border-hairline/80 bg-white/70 hover:border-accent-soft hover:bg-white"
                  }`}
                >
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center transition-colors ${
                      method === m.id ? "bg-accent text-white" : "bg-slate-100 text-ink-secondary"
                    }`}
                  >
                    <m.icon className="size-4.5" strokeWidth={2} />
                  </div>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-bold text-ink">{m.label}</span>
                    <span className="block text-[11.5px] text-ink-tertiary truncate">{m.hint}</span>
                  </span>
                  <span
                    className={`size-4 rounded-full border-2 transition-all ${
                      method === m.id ? "border-accent bg-accent shadow-xs" : "border-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <dl className="mt-4 space-y-2 rounded-2xl bg-slate-50/80 border border-hairline/70 p-3.5 text-[12.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Harga Tiket</dt>
                <dd className="font-semibold text-ink">{formatPrice(event.price)}</dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-[14px]">
                <dt className="font-bold text-ink">Total Tagihan</dt>
                <dd className="font-extrabold text-accent-strong">{formatPrice(totalAmount)}</dd>
              </div>
            </dl>

            <Button
              className="mt-5 w-full cursor-pointer"
              disabled={loadingQris}
              onClick={handleProceedToPayment}
            >
              {loadingQris ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  Menyiapkan QRIS Dinamis...
                </span>
              ) : (
                `Lanjut Bayar ${formatPrice(totalAmount)}`
              )}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-tertiary">
              <ShieldCheck className="size-3.5 text-accent" strokeWidth={2} />
              Enkripsi transaksi aman berstandar Bank Indonesia &amp; ASPI.
            </p>
          </>
        )}

        {/* Step 2: Dynamic QRIS Screen */}
        {step === "qris_display" && (
          <div className="text-center">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="neu-btn-glass flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-semibold text-ink-secondary hover:text-accent rounded-full cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                Ganti Metode
              </button>
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-full p-1.5 text-ink-tertiary hover:bg-slate-100 hover:text-ink cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-tint/70 border border-accent/20 text-accent-strong text-[11.5px] font-bold">
              <QrCode className="size-3.5" />
              <span>QRIS Dinamis — Nominal Otomatis Terkunci</span>
            </div>

            <h3 className="mt-2 text-[20px] font-extrabold text-ink tracking-tight">
              {formatPrice(totalAmount)}
            </h3>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              {merchantName ? `Merchant: ${merchantName}` : "ShopeePay Merchant Partner"}
            </p>

            {/* QR Code Container */}
            <div className="relative mx-auto my-3 w-56 h-56 rounded-2xl border-2 border-accent/40 bg-white p-2.5 shadow-md flex items-center justify-center overflow-hidden">
              {qrisData?.qris_image_base64 ? (
                <img
                  src={qrisData.qris_image_base64}
                  alt="QRIS Dinamis PaymentGT"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Fallback Graphic when daemon offline */
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <QrCode className="size-24 text-accent/80 animate-pulse" />
                  <p className="mt-2 text-[10.5px] text-ink-tertiary">
                    Mode Simulasi QRIS
                  </p>
                </div>
              )}
            </div>

            {/* Timer & Polling Status */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 border border-hairline text-[11px]">
              <div className="flex items-center gap-1.5 text-ink-secondary">
                <Clock className="size-3.5 text-accent" />
                <span>Berlaku hingga:</span>
                <span className="font-bold text-ink">{formattedTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-700">Auto-Detect</span>
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-ink-secondary leading-snug">
              Buka aplikasi <strong>BCA, Livin', GoPay, ShopeePay, Dana, atau OVO</strong> di HP Anda, lalu scan QR di atas. Nominal {formatPrice(qrisData?.unique_amount || totalAmount)} otomatis terkunci di HP.
            </p>

            {/* Action Buttons: Real Manual Check / Refresh */}
            <div className="mt-4 pt-3 border-t border-hairline/80 space-y-2">
              <Button
                variant="primary"
                className="w-full text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 py-2.5 shadow-sm"
                disabled={checkingStatus}
                onClick={handleCheckPaymentStatus}
              >
                <RefreshCw className={`size-4 ${checkingStatus ? "animate-spin" : ""}`} />
                {checkingStatus ? "Memeriksa Mutasi ShopeePay..." : "Saya Sudah Bayar (Cek Status)"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="py-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="size-8" strokeWidth={2.5} />
            </div>
            <h3 className="mt-3.5 text-[18px] font-extrabold text-ink">
              Pembayaran Berhasil!
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-secondary">
              Transaksi telah terverifikasi. Tiket webinar kamu telah aktif dan dapat diakses di Dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
