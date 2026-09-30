import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rupiah } from "@/lib/pos-data";
import {
  createPaymentGTInvoice,
  getPaymentGTStatus,
  type PaymentGTCreateResponse,
} from "@/lib/paymentgt-service";
import {
  Loader2,
  CheckCircle2,
  QrCode,
  RefreshCw,
  Copy,
  Download,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface PosQrisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  orderId: string;
  onPaid: () => void;
}

export function PosQrisModal({
  open,
  onOpenChange,
  totalAmount,
  orderId,
  onPaid,
}: PosQrisModalProps) {
  const [loading, setLoading] = useState(true);
  const [qrisData, setQrisData] = useState<PaymentGTCreateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isPaid, setIsPaid] = useState(false);
  const [checking, setChecking] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and generate dynamic QRIS when modal opens
  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      setQrisData(null);
      setIsPaid(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const generateInvoice = async () => {
      setLoading(true);
      setError(null);
      setIsPaid(false);
      setTimeLeft(600);

      try {
        const invoice = await createPaymentGTInvoice({
          orderId,
          amount: totalAmount,
          expiresInMinutes: 10,
        });

        if (isMounted) {
          setQrisData(invoice);
          setLoading(false);
          startTimer();
          startPolling(invoice.payment_id);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Gagal menghubungkan ke Crave Payment Gateway");
          setLoading(false);
        }
      }
    };

    generateInvoice();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [open, orderId, totalAmount]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (pollingRef.current) clearInterval(pollingRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = (paymentId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await getPaymentGTStatus(paymentId, totalAmount);
        const status = (res.status || "").toUpperCase();
        if (status === "PAID" || status === "SETTLED" || status === "SUCCESS") {
          handleSuccessPayment();
        }
      } catch {
        // Continue polling silently
      }
    }, 2000);
  };

  const handleSuccessPayment = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    setIsPaid(true);
    toast.success("Pembayaran QRIS Berhasil Terverifikasi!", {
      description: `Dana ${rupiah(totalAmount)} telah diterima merchant.`,
    });
    setTimeout(() => {
      onPaid();
      onOpenChange(false);
    }, 1200);
  };

  const handleManualCheck = async () => {
    if (!qrisData?.payment_id) return;
    setChecking(true);
    try {
      const res = await getPaymentGTStatus(qrisData.payment_id, totalAmount);
      const status = (res.status || "").toUpperCase();
      if (status === "PAID" || status === "SETTLED" || status === "SUCCESS") {
        handleSuccessPayment();
      } else {
        toast.info("Pembayaran Belum Terdeteksi", {
          description: "Pastikan pelanggan sudah menyelesaikan transfer di aplikasi bank/e-wallet.",
        });
      }
    } catch {
      toast.error("Gagal memeriksa status ke payment gateway.");
    } finally {
      setChecking(false);
    }
  };

  const copyQrisPayload = () => {
    if (qrisData?.qris_string) {
      navigator.clipboard.writeText(qrisData.qris_string);
      toast.success("String QRIS berhasil disalin!");
    }
  };

  const downloadQr = () => {
    if (qrisData?.qris_image_base64) {
      const a = document.createElement("a");
      a.href = qrisData.qris_image_base64;
      a.download = `qris-${orderId}.png`;
      a.click();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border bg-card">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <QrCode className="size-4.5" />
              </div>
              <DialogTitle className="text-lg font-bold">QRIS Pembayaran Kasir</DialogTitle>
            </div>
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-semibold">
              <Zap className="size-3 fill-emerald-500" /> Auto Settlement
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan dengan BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA & semua bank.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <Loader2 className="size-10 animate-spin text-primary" />
              <Sparkles className="size-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Menghubungkan ke Crave Payment Gateway...</p>
              <p className="text-xs text-muted-foreground">Menyiapkan QRIS Dinamis nominal pas</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="size-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Gagal Menyiapkan QRIS</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl mt-2"
              onClick={() => {
                setError(null);
                setLoading(true);
                createPaymentGTInvoice({
                  orderId,
                  amount: totalAmount,
                  expiresInMinutes: 10,
                })
                  .then((inv) => {
                    setQrisData(inv);
                    setLoading(false);
                    startTimer();
                    startPolling(inv.payment_id);
                  })
                  .catch((e) => {
                    setError(e.message);
                    setLoading(false);
                  });
              }}
            >
              <RefreshCw className="size-3.5 mr-1.5" /> Coba Lagi
            </Button>
          </div>
        ) : isPaid ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in-50 zoom-in-95">
            <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="size-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">Pembayaran Berhasil!</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Dana sebesar <strong className="text-foreground">{rupiah(totalAmount)}</strong> telah terverifikasi secara otomatis.
              </p>
            </div>
            <Badge className="bg-emerald-500 text-white font-medium text-xs">
              Menyimpan Transaksi POS...
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Amount Pill */}
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-3.5 border">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total Tagihan</p>
                <p className="text-2xl font-black text-primary tracking-tight">{rupiah(totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Batas Waktu</p>
                <p className={`text-sm font-bold font-mono ${timeLeft < 120 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                  {formatTimer(timeLeft)}
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="relative flex flex-col items-center justify-center p-5 rounded-2xl bg-white border shadow-inner">
              <div className="w-full flex items-center justify-between mb-2 text-slate-800">
                <span className="text-[11px] font-bold tracking-wider uppercase">QRIS STANDAR NASIONAL</span>
                <span className="text-[10px] font-semibold text-slate-500">CRAVE SOLUTIONS SERVICE</span>
              </div>

              {qrisData?.qris_image_base64 ? (
                <div className="relative rounded-xl p-2 bg-white border border-slate-200 shadow-sm">
                  <img
                    src={qrisData.qris_image_base64}
                    alt="QRIS Payment"
                    className="size-52 sm:size-56 object-contain rounded-lg"
                  />
                  {/* Subtle scanning effect line */}
                  <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75 animate-pulse" />
                </div>
              ) : (
                <div className="size-52 flex items-center justify-center text-xs text-muted-foreground">
                  Gagal menampilkan gambar QR
                </div>
              )}

              {/* Supported Payment Logos / Badges */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-600 font-medium">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">BCA</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">Mandiri</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">BRI</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">GoPay</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">OVO</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">ShopeePay</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">DANA</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full h-11 rounded-xl text-sm font-bold shadow-soft"
                onClick={handleManualCheck}
                disabled={checking}
              >
                {checking ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Memeriksa Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4 mr-2" /> Saya Sudah Bayar (Cek Status)
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs h-9"
                  onClick={copyQrisPayload}
                >
                  <Copy className="size-3.5 mr-1.5" /> Salin String QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs h-9"
                  onClick={downloadQr}
                >
                  <Download className="size-3.5 mr-1.5" /> Unduh QR
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground text-center pt-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Diverifikasi otomatis secara real-time</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
