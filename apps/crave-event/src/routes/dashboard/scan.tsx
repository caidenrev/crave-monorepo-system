import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  FileBadge,
  FlipHorizontal,
  KeyRound,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Copy,
  Upload,
  Video,
  Zap,
} from "lucide-react";
import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../components/aether/dashboard-shell";
import { Badge, Button, ButtonLink } from "../../components/aether/primitives";
import { useApp } from "../../lib/store";

type ScanSearchParams = {
  event?: string | undefined;
  code?: string | undefined;
};

export const Route = createFileRoute("/dashboard/scan")({
  validateSearch: (search: Record<string, unknown>): ScanSearchParams => {
    return {
      event: typeof search["event"] === "string" ? search["event"] : undefined,
      code: typeof search["code"] === "string" ? search["code"] : undefined,
    };
  },
  component: DashboardScanPage,
});

function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // audio context might be blocked by browser policy until interaction
  }
}

function DashboardScanPage() {
  const search = Route.useSearch();
  const { events, myEvents, checkInAttendance, isRegistered } = useApp();

  const registeredUpcoming = myEvents
    .map((me) => {
      const ev = events.find((e) => e.id === me.eventId);
      return ev ? { ...ev, myEvent: me } : null;
    })
    .filter(Boolean) as (typeof events[0] & { myEvent: typeof myEvents[0] })[];

  const initialEventId =
    search.event || registeredUpcoming[0]?.id || events[0]?.id || "";

  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [manualCode, setManualCode] = useState(search.code || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanSuccess, setScanSuccess] = useState<{
    eventTitle: string;
    certificateId: string;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasAutoProcessedRef = useRef(false);

  const selectedEvent = events.find((e) => e.id === selectedEventId || e.slug === selectedEventId);
  const isSelectedRegistered = selectedEvent ? isRegistered(selectedEvent.id) : false;

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Core verification and check-in routine
  const verifyAndCheckIn = useCallback(
    (targetEventId: string, attendanceCode?: string) => {
      const target = events.find((e) => e.id === targetEventId || e.slug === targetEventId);
      if (!target) {
        toast.error("Webinar tidak ditemukan", {
          description: "ID atau data event tidak valid.",
        });
        return false;
      }

      setIsProcessing(true);
      const res = checkInAttendance(target.id, attendanceCode);
      setIsProcessing(false);

      if (res.success) {
        playSuccessBeep();
        stopCamera();
        setScanSuccess({
          eventTitle: target.title,
          certificateId: res.certificateId || "CERT-2026-9042",
          message: res.message || "Presensi berhasil diverifikasi!",
        });
        toast.success("Kehadiran Berhasil Diverifikasi!", {
          description: `Presensi Anda pada "${target.title}" telah tercatat. Sertifikat siap diklaim!`,
        });
        return true;
      } else {
        toast.error("Verifikasi Presensi Gagal", {
          description:
            res.message ||
            "Kode presensi tidak sesuai atau QR code sudah tidak berlaku.",
        });
        return false;
      }
    },
    [events, checkInAttendance, stopCamera],
  );

  // Auto check-in if URL contains event & code params (e.g. from standard phone camera QR scan)
  useEffect(() => {
    if (hasAutoProcessedRef.current) return;
    const urlParams =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const paramEvent = search.event || urlParams?.get("event") || undefined;
    const paramCode = search.code || urlParams?.get("code") || undefined;

    if (paramEvent && paramCode && events.length > 0) {
      hasAutoProcessedRef.current = true;
      setSelectedEventId(paramEvent);
      setManualCode(paramCode);
      verifyAndCheckIn(paramEvent, paramCode);
    }
  }, [search.event, search.code, events, verifyAndCheckIn]);

  // Parse decoded text payload from QR code
  const handleDecodedQR = useCallback(
    (decodedText: string) => {
      let resolvedEventId = selectedEventId;
      let resolvedCode: string | undefined = decodedText.trim();

      // Case 1: Decoded URL with query parameters
      if (
        decodedText.includes("?") &&
        (decodedText.includes("event=") || decodedText.includes("code="))
      ) {
        try {
          const url = new URL(
            decodedText.startsWith("http")
              ? decodedText
              : `http://localhost/${decodedText}`,
          );
          const evParam = url.searchParams.get("event");
          const codeParam = url.searchParams.get("code");
          if (evParam) resolvedEventId = evParam;
          if (codeParam) resolvedCode = codeParam;
        } catch {
          // keep defaults
        }
      } else if (decodedText.startsWith("{") && decodedText.endsWith("}")) {
        // Case 2: JSON payload
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.event || parsed.eventId) {
            resolvedEventId = parsed.event || parsed.eventId;
          }
          if (parsed.code || parsed.attendanceCode) {
            resolvedCode = parsed.code || parsed.attendanceCode;
          }
        } catch {
          // ignore
        }
      }

      if (resolvedEventId) {
        setSelectedEventId(resolvedEventId);
      }
      if (resolvedCode) {
        setManualCode(resolvedCode);
      }

      verifyAndCheckIn(resolvedEventId, resolvedCode);
    },
    [selectedEventId, verifyAndCheckIn],
  );

  // Start continuous frame scanning loop
  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (qrCode && qrCode.data) {
          handleDecodedQR(qrCode.data);
          return; // stop loop once decoded
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop);
  }, [handleDecodedQR]);

  // Start device camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Browser Anda tidak mendukung akses kamera langsung.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }
      setCameraActive(true);
      animFrameRef.current = requestAnimationFrame(scanLoop);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Izin akses kamera ditolak. Silakan izinkan akses kamera pada browser Anda atau gunakan upload gambar / kode manual."
          : `Gagal mengakses kamera: ${err.message || "Perangkat kamera tidak tersedia"}`,
      );
      setCameraActive(false);
    }
  };

  // Toggle front/back camera
  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Process uploaded QR code image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data) {
          toast.info("Kode QR terdeteksi dari gambar!");
          handleDecodedQR(qrCode.data);
        } else {
          toast.error("Tidak dapat membaca QR code", {
            description:
              "Pastikan foto QR code terlihat jelas, terang, dan tidak terpotong.",
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // reset input value so user can upload the same file again if desired
    e.target.value = "";
  };

  // Form submit for manual code
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !manualCode.trim()) return;
    verifyAndCheckIn(selectedEvent.id, manualCode.trim());
  };

  // Quick simulation button for testing without camera
  const handleSimulateScan = () => {
    if (!selectedEvent) return;
    setIsProcessing(true);
    setTimeout(() => {
      const code = selectedEvent.attendanceCode || "SPEAK-9812";
      verifyAndCheckIn(selectedEvent.id, code);
      setIsProcessing(false);
    }, 800);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan Absensi Kehadiran"
        description="Arahkan kamera ke kode QR yang ditayangkan host di webinar Zoom, upload gambar QR, atau masukkan kode cadangan."
      />

      {/* Hidden offscreen canvas for frame and image decoding */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Camera Viewfinder Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
            {/* Event selection */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <label className="aether-meta block text-ink-tertiary">
                  Pilih Webinar yang Sedang Kamu Hadiri:
                </label>
                {selectedEvent && (
                  <Badge tone={isSelectedRegistered ? "success" : "neutral"}>
                    {isSelectedRegistered ? "✓ Sudah Terdaftar" : "Akan Terdaftar Otomatis"}
                  </Badge>
                )}
              </div>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  const ev = events.find((item) => item.id === e.target.value);
                  if (ev?.attendanceCode) {
                    setManualCode(ev.attendanceCode);
                  }
                }}
                className="w-full rounded-xl border border-hairline bg-surface/80 px-4 py-2.5 text-[14px] font-medium text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
              >
                {events.map((ev) => {
                  const reg = isRegistered(ev.id);
                  return (
                    <option key={ev.id} value={ev.id}>
                      {reg ? "✓ [Terdaftar] " : ""}{ev.title} ({ev.playlist})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Viewfinder Frame with Real Video / Camera Stream */}
            <div className="relative mx-auto flex h-72 w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-2xl bg-black text-white shadow-2xl sm:h-80 border border-hairline">
              {/* Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />

              {/* Corner brackets overlay */}
              <div className="pointer-events-none absolute inset-6 flex flex-col justify-between z-20">
                <div className="flex justify-between">
                  <div className="size-8 border-t-2 border-l-2 border-accent rounded-tl-lg shadow-[0_0_8px_var(--accent)]" />
                  <div className="size-8 border-t-2 border-r-2 border-accent rounded-tr-lg shadow-[0_0_8px_var(--accent)]" />
                </div>
                <div className="flex justify-between">
                  <div className="size-8 border-b-2 border-l-2 border-accent rounded-bl-lg shadow-[0_0_8px_var(--accent)]" />
                  <div className="size-8 border-b-2 border-r-2 border-accent rounded-br-lg shadow-[0_0_8px_var(--accent)]" />
                </div>
              </div>

              {/* Animated laser scanning line */}
              {(cameraActive || isProcessing) && (
                <div
                  className="pointer-events-none absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_12px_var(--accent)] z-20 animate-pulse"
                  style={{
                    animation: "bounce 2s infinite ease-in-out",
                  }}
                />
              )}

              {/* Fallback View when camera is inactive */}
              {!cameraActive && (
                <div className="z-10 flex flex-col items-center text-center p-6 bg-black/60 backdrop-blur-sm rounded-xl max-w-[280px]">
                  <QrCode className="size-12 text-accent/80 mb-2 animate-pulse" />
                  <p className="text-[13px] font-medium text-white/90">
                    Kamera Scanner Belum Aktif
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    Aktifkan kamera untuk memindai QR code host secara langsung.
                  </p>
                  <Button
                    onClick={startCamera}
                    variant="primary"
                    size="sm"
                    className="mt-4 gap-2"
                  >
                    <Video className="size-4" />
                    Buka Kamera Scanner
                  </Button>
                </div>
              )}

              {/* Camera Active Controls Bar */}
              {cameraActive && (
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between z-30 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="flex items-center gap-1.5 text-[11px] text-white/80 font-mono">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    Mendeteksi QR...
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleFacingMode}
                      title="Balik Kamera (Depan / Belakang)"
                      className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                    >
                      <FlipHorizontal className="size-4" />
                    </button>
                    <button
                      onClick={stopCamera}
                      title="Matikan Kamera"
                      className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                    >
                      <CameraOff className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message if camera permission was denied */}
            {cameraError && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[13px] text-destructive">
                {cameraError}
              </div>
            )}

            {/* Action Bar (Upload Photo & Test Simulation) */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="glass"
                size="sm"
                className="gap-2"
              >
                <Upload className="size-4 text-accent" />
                Upload Foto / Screenshot QR
              </Button>

              <Button
                onClick={handleSimulateScan}
                disabled={isProcessing}
                variant="glass"
                size="sm"
                className="gap-2"
              >
                <Zap className="size-4 text-amber-500" />
                {isProcessing ? "Memproses..." : "Simulasi Scan Cepat"}
              </Button>
            </div>

            <p className="mt-3 text-center text-[12px] text-ink-tertiary">
              Dapat discan langsung lewat webcam browser, atau gunakan kamera smartphone kamu untuk membuka tautan presensi.
            </p>
          </div>

          {/* Success Banner if check-in is verified */}
          {scanSuccess && (
            <div className="glass rounded-2xl border-2 border-success/40 bg-success/5 p-6 animate-in fade-in zoom-in-95 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-success text-white shadow-md">
                    <CheckCircle2 className="size-6" />
                  </span>
                  <div>
                    <Badge tone="success">Presensi Terverifikasi</Badge>
                    <h3 className="mt-2 text-[18px] font-bold text-ink">
                      {scanSuccess.message}
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-secondary">
                      {scanSuccess.eventTitle}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase bg-accent/10 text-accent font-semibold px-2.5 py-1 rounded-md border border-accent/20">
                        No. Sertifikat: {scanSuccess.certificateId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  <ButtonLink
                    to="/dashboard/certificates"
                    variant="primary"
                    className="w-full sm:w-auto justify-center"
                  >
                    <FileBadge className="size-4" />
                    Klaim Sertifikat
                  </ButtonLink>
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/dashboard/certificates`,
                        );
                        toast.success("Tautan sertifikat disalin ke clipboard!");
                      }
                    }}
                    variant="glass"
                    className="w-full sm:w-auto justify-center"
                  >
                    Salin Info
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Code Fallback Column */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-accent" />
              <h3 className="text-[17px] font-semibold text-ink">Kode Manual Cadangan</h3>
            </div>
            <p className="mt-2 text-[13px] text-ink-secondary leading-relaxed">
              Jika kamera tidak dapat memindai QR code pada layar webinar, masukkan kode presensi
              resmi yang dibacakan oleh host webinar.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-5 space-y-3">
              <div>
                <label className="aether-meta block text-ink-tertiary">
                  Kode Kehadiran (Attendance Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedEvent?.attendanceCode || "Misal: SPEAK-9812"}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-hairline bg-surface/90 px-4 py-2.5 font-mono text-[14px] uppercase tracking-wider text-ink focus:shadow-[var(--focus-ring)] focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={isProcessing || !manualCode.trim()}
                className="w-full"
              >
                {isProcessing ? "Memverifikasi..." : "Kirim Kode Presensi"}
              </Button>
            </form>

            {selectedEvent?.attendanceCode && (
              <div className="mt-3 p-2.5 rounded-xl bg-surface/60 border border-hairline flex items-center justify-between">
                <span className="text-[11px] text-ink-tertiary">Kode Host Event Ini:</span>
                <button
                  type="button"
                  onClick={() => setManualCode(selectedEvent.attendanceCode || "")}
                  className="text-[12px] font-mono font-bold text-accent hover:underline flex items-center gap-1"
                >
                  {selectedEvent.attendanceCode}
                  <Copy className="size-3" />
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-hairline pt-4 space-y-2 text-[12px] text-ink-tertiary">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-accent" />
                Presensi tervalidasi 1 kali per akun
              </p>
              <p className="flex items-center gap-1.5">
                <FileBadge className="size-4 text-accent" />
                Sertifikat langsung terbit &amp; dapat diverifikasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
