import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Percent,
  Printer,
  Bluetooth,
  Save,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  RefreshCw,
  LogOut,
  KeyRound,
  ShieldCheck,
  Loader2,
  Check,
  Delete,
  Mail,
  Calendar,
  Lock,
  Store,
  Shield,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";
import profileLogo from "@/assets/profile-logo.jpeg";
import {
  useMerchantSettings,
  type MerchantSettings,
} from "@/lib/useMerchantSettings";
import { useStoreProfile } from "@/lib/useStoreProfile";
import { DeviceSessions } from "@/components/DeviceSessions";
import {
  requestShopeeOtp,
  verifyShopeeOtp,
  completeShopeeLogin,
  type ShopeeOtpChallenge,
  type ShopeeMerchantSummary,
} from "@/lib/paymentgt-service";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Toko & QRIS Merchant — Crave" },
      {
        name: "description",
        content: "Atur Toko, QRIS ShopeePay Merchant, pajak, dan koneksi printer thermal",
      },
    ],
  }),
  component: PengaturanPage,
});

function PengaturanPage() {
  const { user, signOut, lockApp } = useAuth();
  const {
    settings,
    isLoading: isLoadingSettings,
    saveSettings,
    isSaving,
    disconnect,
    isDisconnecting,
    sessionValid,
    recheckSession,
  } = useMerchantSettings();

  // User Profile states
  const [userName, setUserName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Store & Business Info states (disimpan di database lewat useStoreProfile)
  const { profile: storeProfile, save: saveStoreProfile, isSaving: isSavingStore } = useStoreProfile();
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeFooter, setStoreFooter] = useState("");

  // QRIS & Shopee Merchant Form States
  const [staticQris, setStaticQris] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpChannel, setOtpChannel] = useState<3 | 1>(3); // 3 = WhatsApp, 1 = SMS
  const [otp, setOtp] = useState("");

  // OTP Wizard Flow States
  const [otpStep, setOtpStep] = useState<"idle" | "requested" | "merchant_select">("idle");
  const [challenge, setChallenge] = useState<ShopeeOtpChallenge | null>(null);
  const [merchantsList, setMerchantsList] = useState<ShopeeMerchantSummary[]>([]);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("");
  const [channelLabel, setChannelLabel] = useState<string>("WhatsApp");

  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      const metaName =
        (user.user_metadata?.["name"] as string) ||
        (user.user_metadata?.["full_name"] as string) ||
        "";
      if (metaName) setUserName(metaName);
    }
  }, [user]);

  // Isi form dari profil toko yang tersimpan
  useEffect(() => {
    if (!storeProfile) return;
    setStoreName(storeProfile.name);
    setStoreAddress(storeProfile.address);
    setStorePhone(storeProfile.phone);
    setStoreFooter(storeProfile.receipt_footer);
  }, [storeProfile]);

  useEffect(() => {
    if (settings) {
      if (settings.static_qris) setStaticQris(settings.static_qris);
      if (settings.phone) setPhone(settings.phone);
    }
  }, [settings]);

  // Focus OTP hidden input when step enters "requested"
  useEffect(() => {
    if (otpStep === "requested") {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [otpStep]);

  // Handle user profile update in Supabase
  const handleUpdateProfile = async () => {
    if (!userName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: userName.trim(), full_name: userName.trim() },
      });
      if (error) throw error;
      toast.success("Profil akun berhasil diperbarui!");
    } catch (err: any) {
      toast.error("Gagal memperbarui profil: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle user password update in Supabase
  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Kata sandi minimal harus 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Kata sandi berhasil diperbarui!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Gagal memperbarui kata sandi: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle saving store & business information
  const handleSaveStoreInfo = async () => {
    try {
      const saved = await saveStoreProfile({
        name: storeName,
        address: storeAddress,
        phone: storePhone,
        receipt_footer: storeFooter,
      });
      toast.success("Informasi bisnis & toko berhasil disimpan!", {
        description:
          saved.source === "db"
            ? "Tersimpan di akun Anda dan dipakai di semua perangkat."
            : "Tersimpan di perangkat ini saja. Minta admin menjalankan pembaruan database agar tersinkron.",
      });
    } catch (err: any) {
      toast.error("Gagal menyimpan info toko: " + err.message);
    }
  };

  // Request OTP from Shopee with channel selection
  const handleRequestOtp = async () => {
    if (!phone.trim()) {
      toast.error("Nomor telepon Shopee wajib diisi");
      return;
    }

    setIsRequestingOtp(true);
    try {
      const res = await requestShopeeOtp({
        phone: phone.trim(),
        password: password.trim() || undefined,
        channel: otpChannel,
      });

      setChallenge(res.challenge);
      setChannelLabel(res.channel_name || (otpChannel === 3 ? "WhatsApp" : "SMS"));
      setOtpStep("requested");
      setOtp("");
      toast.success("Kode OTP Berhasil Dikirim!", {
        description: res.message || `Silakan periksa ${res.channel_name || "WhatsApp"} di nomor ${phone}.`,
      });
    } catch (err: any) {
      toast.error("Gagal Meminta OTP", {
        description: err.message || "Terjadi kesalahan pada payment gateway",
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Verify OTP from Shopee
  const handleVerifyOtp = async () => {
    if (!challenge || !otp.trim()) {
      toast.error("Masukkan kode OTP yang Anda terima");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyShopeeOtp({
        challenge,
        otp: otp.trim(),
      });

      if (res.status === "MERCHANT_SELECTION_NEEDED" && res.merchants) {
        setMerchantsList(res.merchants);
        setVerificationData(res.verification);
        setOtpStep("merchant_select");
        if (res.merchants.length > 0 && res.merchants[0]) {
          setSelectedMerchantId(res.merchants[0].id);
        }
        toast.info("Pilih Merchant Anda", {
          description: "Akun Shopee Anda memiliki beberapa profil merchant.",
        });
      } else if (res.session) {
        // Save session directly to Supabase per-user
        await saveSettings({
          phone: challenge?.phoneNumber || phone,
          merchant_name: res.merchant?.name || "Shopee Merchant",
          merchant_id: res.merchant?.id || "",
          store_id: res.store_id || (res.stores?.[0]?.id ?? ""),
          store_name: res.stores?.[0]?.name || "",
          session_json: JSON.stringify(res.session),
          is_active: true,
        });

        setOtpStep("idle");
        setChallenge(null);
        setOtp("");
        toast.success("Akun ShopeePay Merchant Berhasil Terhubung!");
      }
    } catch (err: any) {
      toast.error("Verifikasi OTP Gagal", {
        description: err.message || "Kode OTP salah atau telah kedaluwarsa.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Complete Multi-Merchant Selection
  const handleCompleteMerchantSelection = async () => {
    if (!verificationData || !selectedMerchantId) return;

    setIsVerifyingOtp(true);
    try {
      const res = await completeShopeeLogin({
        verification: verificationData,
        merchantId: selectedMerchantId,
      });

      if (res.session) {
        await saveSettings({
          phone: challenge?.phoneNumber || phone,
          merchant_name: res.merchant?.name || "Shopee Merchant",
          merchant_id: res.merchant?.id || selectedMerchantId,
          store_id: res.store_id || (res.stores?.[0]?.id ?? ""),
          store_name: res.stores?.[0]?.name || "",
          session_json: JSON.stringify(res.session),
          is_active: true,
        });

        setOtpStep("idle");
        setChallenge(null);
        setVerificationData(null);
        setOtp("");
        toast.success("Merchant ShopeePay Berhasil Dihubungkan!");
      }
    } catch (err: any) {
      toast.error("Gagal Menyimpan Merchant", {
        description: err.message,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Check current session validity
  const handleCheckSession = async () => {
    if (!settings?.session_json) {
      toast.error("Belum ada sesi tersimpan");
      return;
    }

    setIsCheckingSession(true);
    try {
      // Lewat hook agar session hasil silent renewal ikut tersimpan ke DB.
      const { data: valid } = await recheckSession();
      if (valid === true) {
        toast.success("Sesi Shopee Merchant Aktif & Valid!", {
          description: `Merchant: ${settings.merchant_name} (ID: ${settings.merchant_id})`,
        });
      } else if (valid === false) {
        toast.error("Sesi Kedaluwarsa", {
          description: "Silakan hubungkan ulang akun Shopee Merchant Anda.",
        });
      } else {
        toast.error("Gateway tidak dapat dihubungi, coba lagi nanti.");
      }
    } catch (err: any) {
      toast.error("Gagal mengecek sesi: " + err.message);
    } finally {
      setIsCheckingSession(false);
    }
  };

  // Save Static QRIS string
  const handleSaveStaticQris = async () => {
    if (!staticQris.trim()) {
      toast.error("String payload QRIS tidak boleh kosong");
      return;
    }

    await saveSettings({
      static_qris: staticQris.trim(),
    });
  };

  const handleSaveGeneral = () => {
    toast.success("Pengaturan berhasil disimpan", {
      description: "Perubahan akan aktif pada transaksi berikutnya.",
    });
  };

  const handleTestPrint = () => {
    toast.info("Mengirim data ke printer...", {
      description: "Mencetak struk percobaan ke EPSON TM-T82.",
    });
    setTimeout(() => {
      toast.success("Struk berhasil dicetak!");
    }, 1500);
  };

  const hasMerchantSession = !!settings?.session_json;

  return (
    <AppShell
      title="Pengaturan"
      subtitle="Kelola Toko, QRIS Merchant UMKM, Pajak, dan Perangkat"
      actions={
        <Button className="rounded-xl" onClick={handleSaveGeneral}>
          <Save className="size-4" /> <span className="hidden sm:inline">Simpan Perubahan</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <Tabs
          defaultValue="profile"
          className="w-full space-y-6"
          onValueChange={(v) => {
            const el = document.getElementById("pengaturan-slider");
            if (el) {
              if (v === "profile") el.style.transform = "translateX(0)";
              if (v === "qris") el.style.transform = "translateX(100%)";
              if (v === "pajak") el.style.transform = "translateX(200%)";
              if (v === "perangkat") el.style.transform = "translateX(300%)";
            }
          }}
        >
          <div className="w-full">
            <TabsList className="relative z-0 flex h-auto sm:h-14 w-full rounded-2xl sm:rounded-full bg-slate-200 dark:bg-slate-800 p-1">
              <div
                id="pengaturan-slider"
                className="absolute left-1 top-1 bottom-1 w-[calc(25%-2px)] rounded-xl sm:rounded-full bg-background shadow-md border border-black/5 dark:border-white/10 transition-transform duration-300 ease-in-out z-0"
                style={{ transform: "translateX(0)" }}
              />
              <TabsTrigger
                value="profile"
                className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
              >
                <User className="size-4 sm:size-4.5 shrink-0" />
                <span className="text-[10px] sm:text-sm leading-none">Profil</span>
              </TabsTrigger>
              <TabsTrigger
                value="qris"
                className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
              >
                <Store className="size-4 sm:size-4.5 shrink-0" />
                <span className="text-[10px] sm:text-sm leading-none">Merchant</span>
              </TabsTrigger>
              <TabsTrigger
                value="pajak"
                className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
              >
                <Percent className="size-4 sm:size-4.5 shrink-0" />
                <span className="text-[10px] sm:text-sm leading-none">Pajak</span>
              </TabsTrigger>
              <TabsTrigger
                value="perangkat"
                className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
              >
                <Printer className="size-4 sm:size-4.5 shrink-0" />
                <span className="text-[10px] sm:text-sm leading-none">Perangkat</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full">
            {/* ========================================================= */}
            {/* TAB 1: QRIS & SHOPEEPAY MERCHANT SETTINGS (PER-USER UMKM) */}
            {/* ========================================================= */}
            <TabsContent value="qris" className="mt-0 space-y-6">
              {/* Card 1: Status Akun ShopeePay Merchant */}
              <div className="card-soft p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Integrasi ShopeePay Merchant (Real-Time Settlement)
                      </h3>
                      {hasMerchantSession ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-[11px] font-bold">
                          <Check className="size-3 stroke-[3]" /> Terhubung
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-[11px] font-semibold">
                          <AlertCircle className="size-3 text-amber-500" /> Belum Terhubung
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Setiap akun UMKM memiliki sesi Shopee Merchant mandiri untuk memantau mutasi
                      dan settlement pembayaran QRIS otomatis.
                    </p>
                  </div>

                  {hasMerchantSession && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs font-semibold gap-1.5"
                        onClick={handleCheckSession}
                        disabled={isCheckingSession}
                      >
                        {isCheckingSession ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3.5" />
                        )}
                        Cek Sesi
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-xl text-xs font-semibold gap-1.5"
                          >
                            <LogOut className="size-3.5" /> Putuskan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Putuskan Akun Merchant?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sesi Shopee Merchant pada akun Anda akan dihapus. Anda dapat
                              menghubungkan kembali akun kapan saja melalui login OTP.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => disconnect()}
                              disabled={isDisconnecting}
                            >
                              {isDisconnecting ? "Memutuskan..." : "Ya, Putuskan"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {hasMerchantSession ? (
                  /* TAMPILAN KETIKA AKUN MERCHANT SUDAH TERHUBUNG */
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {[
                      { label: "Nama Merchant", value: settings?.merchant_name || "Shopee Merchant" },
                      { label: "Merchant ID", value: settings?.merchant_id || "-", mono: true },
                      {
                        label: "Store ID / Cabang",
                        value: settings?.store_name || settings?.store_id || "-",
                        mono: !settings?.store_name,
                      },
                      { label: "No. Telepon Akun", value: settings?.phone || "-" },
                      {
                        label: "Terakhir Diperbarui",
                        value: settings?.updated_at
                          ? new Date(settings.updated_at).toLocaleString("id-ID")
                          : "-",
                      },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border bg-muted/30 p-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd
                          className={cn(
                            "mt-0.5 truncate text-sm font-bold text-foreground",
                            item.mono && "font-mono",
                          )}
                        >
                          {item.value}
                        </dd>
                      </div>
                    ))}
                    <div className="rounded-xl border bg-muted/30 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status Sesi
                      </dt>
                      <dd className="mt-1 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            sessionValid === false
                              ? "bg-destructive"
                              : sessionValid === true
                                ? "bg-success"
                                : "bg-muted-foreground/40",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            sessionValid === false
                              ? "text-destructive"
                              : sessionValid === true
                                ? "text-success"
                                : "text-muted-foreground",
                          )}
                        >
                          {sessionValid === true
                            ? "Aktif, siap menerima pembayaran"
                            : sessionValid === false
                              ? "Kedaluwarsa, sambungkan ulang akun"
                              : "Memeriksa..."}
                        </span>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  /* LOGIN OTP SHOPEE MERCHANT */
                  <div className="max-w-xl rounded-2xl border p-5">
                    {otpStep === "idle" && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">
                            Hubungkan akun Shopee Partner
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Masukkan nomor HP yang terdaftar di Shopee Partner. Kode verifikasi akan
                            dikirim ke nomor tersebut.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="merchant-phone"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Nomor HP akun Shopee
                          </label>
                          <Input
                            id="merchant-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08123456789"
                            className="h-11 rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="merchant-password"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Password akun Shopee{" "}
                            <span className="font-normal text-muted-foreground">(opsional)</span>
                          </label>
                          <Input
                            id="merchant-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Isi jika akun memakai password"
                            className="h-11 rounded-xl bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Kirim kode lewat
                          </p>
                          <Tabs
                            value={String(otpChannel)}
                            onValueChange={(v) => setOtpChannel(v === "1" ? 1 : 3)}
                          >
                            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl">
                              <TabsTrigger value="3" className="h-9 rounded-lg font-semibold">
                                WhatsApp
                              </TabsTrigger>
                              <TabsTrigger value="1" className="h-9 rounded-lg font-semibold">
                                SMS
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        <Button
                          className="h-11 w-full rounded-xl font-bold sm:w-auto"
                          onClick={handleRequestOtp}
                          disabled={isRequestingOtp || !phone.trim()}
                        >
                          {isRequestingOtp ? (
                            <>
                              <Loader2 className="size-4 animate-spin mr-2" /> Mengirim kode...
                            </>
                          ) : (
                            "Kirim kode OTP"
                          )}
                        </Button>
                      </div>
                    )}

                    {otpStep === "requested" && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">Masukkan kode OTP</h4>
                          <p className="text-xs text-muted-foreground">
                            Kode 6 digit telah dikirim lewat {channelLabel} ke{" "}
                            <span className="font-semibold text-foreground">{phone}</span>.
                          </p>
                        </div>

                        <InputOTP
                          ref={otpInputRef}
                          maxLength={6}
                          value={otp}
                          onChange={(val) => setOtp(val.replace(/\D/g, ""))}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          autoFocus
                          containerClassName="justify-start"
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }, (_, i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="h-12 w-11 bg-background text-lg font-bold tabular-nums first:rounded-l-xl last:rounded-r-xl sm:w-12"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                          <Button
                            className="h-11 flex-1 rounded-xl font-bold"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otp.length < 4}
                          >
                            {isVerifyingOtp ? (
                              <>
                                <Loader2 className="size-4 animate-spin mr-2" /> Memverifikasi...
                              </>
                            ) : (
                              "Verifikasi & hubungkan"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 rounded-xl"
                            onClick={() => {
                              setOtpStep("idle");
                              setOtp("");
                            }}
                          >
                            Ganti nomor
                          </Button>
                        </div>
                      </div>
                    )}

                    {otpStep === "merchant_select" && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-foreground">Pilih merchant</h4>
                          <p className="text-xs text-muted-foreground">
                            Akun Shopee ini punya beberapa merchant. Pilih yang dipakai di toko ini.
                          </p>
                        </div>

                        <RadioGroup
                          value={selectedMerchantId ?? ""}
                          onValueChange={setSelectedMerchantId}
                          className="gap-2"
                        >
                          {merchantsList.map((m) => (
                            <label
                              key={m.id}
                              htmlFor={`merchant-${m.id}`}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5",
                                selectedMerchantId === m.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50",
                              )}
                            >
                              <RadioGroupItem value={m.id} id={`merchant-${m.id}`} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">{m.name}</p>
                                <p className="truncate font-mono text-xs text-muted-foreground">
                                  ID {m.id}
                                </p>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                          <Button
                            className="h-11 flex-1 rounded-xl font-bold"
                            onClick={handleCompleteMerchantSelection}
                            disabled={isVerifyingOtp || !selectedMerchantId}
                          >
                            {isVerifyingOtp ? (
                              <>
                                <Loader2 className="size-4 animate-spin mr-2" /> Menghubungkan...
                              </>
                            ) : (
                              "Hubungkan merchant"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 rounded-xl"
                            onClick={() => {
                              setOtpStep("idle");
                              setOtp("");
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2: QRIS Statis Merchant (Payload EMVCo String) */}
              <div className="card-soft p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    String QRIS Statis Merchant UMKM
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Masukkan string payload EMVCo QRIS statis dari stiker / akun Shopee Partner toko
                    Anda. Sistem akan otomatis mengonversi string ini menjadi QRIS Dinamis ber-nominal
                    pas saat checkout.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Payload QRIS Statis (EMVCo String)
                    </label>
                    <Textarea
                      rows={3}
                      value={staticQris}
                      onChange={(e) => setStaticQris(e.target.value)}
                      placeholder="Contoh: 00020101021126610016ID.CO.SHOPEE.WWW01189360091800237970570208237970570303UMI51440014ID.CO.QRIS.WWW0215ID10266049176290303UMI5204572253033605802ID5923Crave Solutions Service6007TANGSEL61051531262070703A016304351F"
                      className="font-mono text-xs rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-md shadow-blue-500/20"
                      onClick={handleSaveStaticQris}
                      disabled={isSaving || !staticQris.trim()}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" /> Menyimpan...
                        </>
                      ) : (
                        "Simpan QRIS Statis"
                      )}
                    </Button>
                    <p className="text-xs text-slate-500">
                      Tersimpan khusus untuk akun pengguna Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Keamanan & Isolasi Data UMKM */}
              <div className="card-soft p-5 bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Isolasi Data 100% Mandiri Per Akun UMKM
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem Crave POS menerapkan kebijakan keamanan Row Level Security (RLS). Sesi
                      login ShopeePay, data QRIS, dan riwayat transaksi mutasi setiap UMKM tersimpan
                      terpisah pada database akun masing-masing dan <strong>tidak akan pernah</strong>{" "}
                      bercampur dengan merchant lain.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB: PROFIL AKUN & INFORMASI BISNIS                      */}
            {/* ========================================================= */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              {/* Card 1: Identitas Akun Pengguna */}
              <div className="card-soft p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full overflow-hidden shrink-0 ring-4 ring-blue-500/15 shadow-md border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={profileLogo}
                        alt="Profile"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {userName || user?.user_metadata?.["name"] || user?.email?.split("@")[0] || "Pengguna POS"}
                        </h3>
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                          <ShieldCheck className="size-3 mr-1" /> Terverifikasi
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="size-3.5 text-slate-400" /> {user?.email || "Tidak ada email"}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Badge variant="outline" className="text-[10px] font-medium text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                          Role: Owner / Admin UMKM
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold gap-1.5 flex-1 sm:flex-initial"
                      onClick={lockApp}
                    >
                      <Lock className="size-3.5" /> Kunci Aplikasi
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl text-xs font-semibold gap-1.5 flex-1 sm:flex-initial"
                      onClick={signOut}
                    >
                      <LogOut className="size-3.5" /> Keluar
                    </Button>
                  </div>
                </div>

                {/* Form Edit Data Akun */}
                <div className="pt-5 space-y-4 max-w-2xl">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Data Akun Pengguna
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nama Lengkap / Nama Tampilan
                      </label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Masukkan nama Anda"
                        className="rounded-xl bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Akun (Login)
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="rounded-xl bg-muted/50 text-muted-foreground font-mono text-xs cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        User ID (Supabase Auth UID)
                      </label>
                      <Input
                        value={user?.id || "-"}
                        disabled
                        className="rounded-xl bg-muted/50 text-muted-foreground font-mono text-xs cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tanggal Terdaftar
                      </label>
                      <Input
                        value={
                          user?.created_at
                            ? new Date(user.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "-"
                        }
                        disabled
                        className="rounded-xl bg-muted/50 text-muted-foreground text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-md shadow-blue-500/20"
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-2" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5 mr-1.5" /> Simpan Profil Akun
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card 2: Informasi Bisnis & Toko */}
              <div className="card-soft p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Informasi Bisnis & Outlet
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Informasi ini akan dicantumkan pada struk transaksi fisik dan laporan penjualan.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nama Toko / Brand
                      </label>
                      <Input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Contoh: Crave Cafe & Eatery"
                        className="rounded-xl bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Nomor Telepon / CS Toko
                      </label>
                      <Input
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="Contoh: 0812-3456-7890"
                        className="rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Alamat Toko
                    </label>
                    <Input
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 123, Jakarta Selatan"
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pesan Bawah Struk (Footer)
                    </label>
                    <Input
                      value={storeFooter}
                      onChange={(e) => setStoreFooter(e.target.value)}
                      placeholder="Contoh: Terima kasih atas kunjungannya!"
                      className="rounded-xl bg-background"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-md shadow-blue-500/20"
                      onClick={handleSaveStoreInfo}
                      disabled={isSavingStore}
                    >
                      {isSavingStore ? (
                        <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5 mr-1.5" />
                      )}
                      {isSavingStore ? "Menyimpan..." : "Simpan Info Toko"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card 3: Keamanan & Kata Sandi */}
              <div className="card-soft p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Keamanan & Kata Sandi Akun
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Perbarui kata sandi login Anda untuk menjaga keamanan akun toko.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kata Sandi Baru
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="rounded-xl bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Konfirmasi Kata Sandi
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl font-bold text-xs px-5 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !newPassword}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-2" /> Memperbarui...
                        </>
                      ) : (
                        <>
                          <KeyRound className="size-3.5 mr-1.5" /> Perbarui Kata Sandi
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {/* Card: Perangkat & Sesi Login */}
              <DeviceSessions />
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 3: PAJAK                                              */}
            {/* ========================================================= */}
            <TabsContent value="pajak" className="mt-0 space-y-4">
              <div className="card-soft p-5">
                <h3 className="text-lg font-bold">Pengaturan Pajak (PPN)</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Atur pengenaan pajak yang akan dihitung otomatis di kasir.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-xl border">
                  <div>
                    <p className="font-bold">Terapkan Pajak Pertambahan Nilai (PPN)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Semua item akan dikenakan persentase pajak ini.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-24">
                      <Input
                        type="number"
                        defaultValue="11"
                        className="rounded-xl pr-8 bg-background text-right font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                        %
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="card-soft p-5">
                <h3 className="text-lg font-bold">Biaya Layanan (Service Charge)</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Tambahan biaya layanan untuk transaksi makan di tempat (Dine In).
                </p>

                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-4 bg-muted-foreground/15 rounded-xl border">
                  <div>
                    <p className="font-bold">Terapkan Service Charge</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Biaya tambahan di luar PPN.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-24">
                      <Input
                        type="number"
                        defaultValue="5"
                        className="rounded-xl pr-8 bg-background text-right font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
                        %
                      </span>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* TAB 4: PERANGKAT                                          */}
            {/* ========================================================= */}
            <TabsContent value="perangkat" className="mt-0 space-y-4">
              <div className="card-soft p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold">Printer Thermal / Struk</h3>
                    <p className="text-xs text-muted-foreground">
                      Hubungkan aplikasi dengan printer bluetooth terdekat.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={() => toast.info("Memindai perangkat Bluetooth...")}
                  >
                    <Bluetooth className="size-4" /> Pindai
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-sm">
                        <Printer className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">EPSON TM-T82</p>
                          <Badge className="bg-success text-success-foreground hover:bg-success h-5 px-1.5 text-[9px]">
                            Terkoneksi
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Bluetooth MAC: 00:11:22:33:44:55
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl text-xs font-semibold"
                      onClick={handleTestPrint}
                    >
                      Test Print
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted-foreground/15 border rounded-xl opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted text-muted-foreground rounded-lg">
                        <Printer className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">Zjiang POS-5809</p>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[9px]">
                            Disimpan
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Tidak terdeteksi di sekitar
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold"
                      disabled
                    >
                      Hubungkan
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card-soft p-5">
                <h3 className="text-lg font-bold">Laci Uang (Cash Drawer)</h3>
                <p className="text-xs text-muted-foreground mb-5">
                  Pengaturan trigger laci uang yang terkoneksi ke printer.
                </p>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-4 bg-muted-foreground/15 rounded-xl border">
                    <div>
                      <p className="font-bold">Buka Otomatis</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Laci akan terbuka saat struk pembayaran dicetak.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={() => toast.success("Sinyal pembuka laci dikirim")}
                    >
                      <CreditCard className="size-4" /> Test Buka Laci
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}
