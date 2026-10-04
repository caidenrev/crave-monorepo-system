import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, Presentation, ShieldAlert, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useApp, getRegisteredUsers, saveRegisteredUser } from "../lib/store";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { authApi } from "../lib/supabase-services";

type AuthSearch = {
  mode?: "login" | "register" | undefined;
  redirect?: string | undefined;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    return {
      mode: search["mode"] === "register" ? "register" : "login",
      ...(typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
    };
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { loginUser } = useApp();
  const [mode, setMode] = useState<"login" | "register">(
    search?.mode === "register" ? "register" : "login",
  );
  const [selectedRole, setSelectedRole] = useState<"user" | "speaker">("user");

  useEffect(() => {
    if (search?.mode) {
      setMode(search.mode);
    }
  }, [search?.mode]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (mode === "login") {
        let authenticatedUser: { name: string; email: string; role: string } | null = null;
        let accountExistsInDatabase = false;

        // 1. Check with Supabase Auth if configured
        if (isSupabaseConfigured) {
          try {
            const res = await authApi.signIn(cleanEmail, cleanPassword);
            if (res?.data?.user) {
              accountExistsInDatabase = true;
              const user = res.data.user;

              // Fetch synced profile if available
              let dbRole: string | null = null;
              let dbName: string | null = null;
              try {
                const { data: prof } = await supabase
                  .from("profiles")
                  .select("name, role")
                  .eq("id", user.id)
                  .maybeSingle();
                if (prof) {
                  dbRole = prof.role;
                  dbName = prof.name;
                }
              } catch {}

              const metaRole = user.user_metadata?.["role"] as string | undefined;
              const metaName = user.user_metadata?.["full_name"] as string | undefined;
              const isSuper = cleanEmail.includes("superadmin") || cleanEmail.includes("root") || dbRole === "superadmin";
              const isSpeakerRole = isSuper || dbRole === "admin" || metaRole === "speaker" || metaRole === "admin";
              const roleName = isSuper
                ? "Super Admin"
                : isSpeakerRole
                  ? "Speaker / Host"
                  : "Peserta";
              const userName =
                dbName || metaName || (isSuper ? "Super Admin" : cleanEmail.split("@")[0] || "Peserta");

              authenticatedUser = {
                name: userName,
                email: user.email || cleanEmail,
                role: roleName,
              };

              saveRegisteredUser({
                email: cleanEmail,
                name: userName,
                password: cleanPassword,
                role: roleName,
                registeredAt: new Date().toISOString(),
              });
            } else if (res?.error) {
              // Check if account actually exists in Supabase profiles
              try {
                const { data: prof } = await supabase
                  .from("profiles")
                  .select("id, name, email, role")
                  .ilike("email", cleanEmail)
                  .maybeSingle();
                if (prof) {
                  accountExistsInDatabase = true;
                }
              } catch {}
            }
          } catch (err: any) {
            console.warn("[Auth Supabase Sync]:", err.message);
          }
        }

        // 2. Check in local registered users registry
        const localUsers = getRegisteredUsers();
        const found = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);

        if (found) {
          accountExistsInDatabase = true;
          if (!authenticatedUser) {
            if (!found.password || found.password === cleanPassword) {
              authenticatedUser = {
                name: found.name,
                email: found.email,
                role: found.role,
              };
            }
          }
        }

        // 3. Handle wrong password vs truly unregistered account
        if (!authenticatedUser) {
          if (accountExistsInDatabase) {
            const msg = "Kata sandi yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.";
            setErrorMessage(msg);
            toast.error("Kata Sandi Salah!", {
              description: "Periksa kembali kata sandi yang Anda masukkan.",
            });
            setLoading(false);
            return;
          }

          const msg = `Akun dengan email "${cleanEmail}" belum terdaftar! Silakan lakukan Registrasi terlebih dahulu untuk menentukan peran (Peserta atau Speaker).`;
          setErrorMessage(msg);
          toast.error("Akun Belum Terdaftar!", {
            description: "Silakan registrasi terlebih dahulu untuk menentukan peran akun Anda.",
            action: {
              label: "Daftar Akun",
              onClick: () => {
                setMode("register");
                setErrorMessage(null);
                window.history.replaceState(null, "", "/auth?mode=register");
              },
            },
            duration: 6000,
          });
          setMode("register");
          window.history.replaceState(null, "", "/auth?mode=register");
          setLoading(false);
          return;
        }

        // 4. Log in and route to role dashboard
        loginUser(authenticatedUser);

        const isSuper = authenticatedUser.role === "Super Admin";
        const isSpeaker = isSuper || authenticatedUser.role === "Speaker / Host";

        toast.success(
          isSuper ? "Akses Root Super Admin Aktif!" : "Berhasil masuk!",
          {
            description: isSuper
              ? "Hak akses penuh: Anda dapat mengelola seluruh event, playlist, dan blog."
              : `Selamat datang kembali, ${authenticatedUser.name}! Masuk ke ${isSpeaker ? "Panel Speaker" : "Dashboard Peserta"}.`,
          },
        );

        const performNavigation = (speakerOrSuper: boolean) => {
          if (search.redirect && search.redirect.startsWith("/")) {
            if (search.redirect.startsWith("/admin") && !speakerOrSuper) {
              navigate({ to: "/dashboard" });
              return;
            }
            if (search.redirect.startsWith("/dashboard") && speakerOrSuper) {
              navigate({ to: "/admin" });
              return;
            }
            navigate({ to: search.redirect as any });
            return;
          }

          if (speakerOrSuper) {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: "/dashboard" });
          }
        };

        performNavigation(isSpeaker || isSuper);
      } else {
        // Register Mode
        const cleanName = name.trim();
        if (!cleanName) {
          setErrorMessage("Nama lengkap wajib diisi.");
          toast.error("Nama Lengkap Wajib Diisi!");
          setLoading(false);
          return;
        }

        if (cleanPassword.length < 6) {
          setErrorMessage("Kata sandi minimal harus 6 karakter.");
          toast.error("Kata Sandi Terlalu Pendek!", {
            description: "Kata sandi minimal harus 6 karakter.",
          });
          setLoading(false);
          return;
        }

        const isSuper = cleanEmail.includes("superadmin") || cleanEmail.includes("root");
        const isSpeaker = isSuper || selectedRole === "speaker";
        const roleName = isSuper
          ? "Super Admin"
          : isSpeaker
            ? "Speaker / Host"
            : "Peserta";
        const userName = cleanName || (isSpeaker ? "Speaker Baru" : "Peserta Baru");

        if (isSupabaseConfigured) {
          try {
            const res = await authApi.signUp(cleanEmail, cleanPassword, userName, selectedRole);
            if (res.error) {
              if (
                res.error.message?.toLowerCase().includes("already registered") ||
                res.error.message?.toLowerCase().includes("already exists") ||
                res.error.message?.toLowerCase().includes("exists")
              ) {
                toast.info("Email Sudah Terdaftar!", {
                  description: "Akun ini sudah pernah didaftarkan. Silakan masuk dengan kata sandi Anda.",
                });
                setMode("login");
                window.history.replaceState(null, "", "/auth?mode=login");
                setLoading(false);
                return;
              }
              console.warn("[Auth Supabase Sync]:", res.error.message);
            }

            // Guarantee profile exists in Supabase
            if (res?.data?.user?.id) {
              const dbRole = isSuper ? "superadmin" : (selectedRole === "speaker" ? "admin" : "user");
              try {
                await supabase.from("profiles").upsert({
                  id: res.data.user.id,
                  name: userName,
                  email: cleanEmail,
                  role: dbRole,
                  updated_at: new Date().toISOString(),
                });
              } catch {}
            }
          } catch (err: any) {
            console.warn("[Auth Supabase Sync]:", err.message);
          }
        }

        // Save into local registered accounts store with password
        saveRegisteredUser({
          email: cleanEmail,
          name: userName,
          password: cleanPassword,
          role: roleName,
          registeredAt: new Date().toISOString(),
        });

        loginUser({
          name: userName,
          email: cleanEmail,
          role: roleName,
        });

        toast.success("Pendaftaran akun berhasil!", {
          description: `Akun ${userName} (${roleName}) aktif! Mengalihkan ke ${isSpeaker ? "Panel Speaker" : "Dashboard Peserta"}...`,
        });

        if (search.redirect && search.redirect.startsWith("/")) {
          if (search.redirect.startsWith("/admin") && !isSpeaker) {
            navigate({ to: "/dashboard" });
          } else if (search.redirect.startsWith("/dashboard") && isSpeaker) {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: search.redirect as any });
          }
        } else {
          if (isSpeaker) {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: "/dashboard" });
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent-tint/70 via-accent-soft/20 to-transparent blur-3xl"
      />

      <div className="w-full max-w-md">
        {/* Top Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Crave Event Logo"
              className="size-11 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_8px_16px_rgba(10,132,255,0.25)]"
            />
            <span className="text-2xl font-bold tracking-tight text-ink">Crave Event</span>
          </Link>
          <p className="mt-2.5 text-[14px] text-ink-secondary">
            {mode === "login"
              ? "Masuk untuk mengakses event, scan absensi, dan sertifikat"
              : "Buat akun baru untuk mulai mengikuti webinar"}
          </p>
        </div>

        {/* Auth Solid Glass Card */}
        <div className="frosted-glass-card rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/90 bg-white/85 backdrop-blur-2xl">
          {/* Mode Switcher Tabs with Sliding Glider */}
          <div className="neu-capsule-track relative flex w-full p-1 border border-hairline/80">
            <span
              className="neu-capsule-thumb absolute top-1 bottom-1 left-1 rounded-pill pointer-events-none"
              style={{
                width: "calc(50% - 4px)",
                transform: mode === "login" ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)",
                transition: "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode("login");
                window.history.replaceState(null, "", "/auth?mode=login");
              }}
              className={`relative z-10 flex-1 py-2 text-center text-[13px] font-semibold transition-colors duration-200 select-none ${
                mode === "login" ? "text-white" : "text-ink-secondary hover:text-ink"
              }`}
            >
              Masuk ke Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                window.history.replaceState(null, "", "/auth?mode=register");
              }}
              className={`relative z-10 flex-1 py-2 text-center text-[13px] font-semibold transition-colors duration-200 select-none ${
                mode === "register" ? "text-white" : "text-ink-secondary hover:text-ink"
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="aether-meta block text-[11px] font-semibold text-ink-tertiary mb-1.5 ml-1">
                    Nama Lengkap
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-hairline/80 bg-white/70 px-3.5 py-2.5 shadow-[inset_2px_2px_5px_rgba(165,175,190,0.18),inset_-2px_-2px_5px_#ffffff] focus-within:bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3.5px_rgba(10,132,255,0.15)] transition-all">
                    <div className="neu-icon-sphere size-8 shrink-0">
                      <User className="size-4 text-white" strokeWidth={2.2} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap Kamu"
                      className="w-full bg-transparent text-[14px] text-ink focus:outline-none placeholder:text-ink-tertiary"
                    />
                  </div>
                </div>

                {/* Role Selector: Peserta vs Speaker (Capsule Glider Switch) */}
                <div>
                  <label className="aether-meta block text-[11px] font-semibold text-ink-tertiary mb-1.5 ml-1">
                    Pilih Peran Akun (Menentukan Akses Dashboard)
                  </label>
                  <div className="neu-capsule-track relative flex w-full p-1 border border-hairline/80">
                    <span
                      className="neu-capsule-thumb absolute top-1 bottom-1 left-1 rounded-pill pointer-events-none"
                      style={{
                        width: "calc(50% - 4px)",
                        transform: selectedRole === "user" ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)",
                        transition: "transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedRole("user")}
                      className={`relative z-10 flex-1 py-2 text-center text-[13px] font-semibold transition-colors duration-200 select-none flex items-center justify-center gap-2 cursor-pointer ${
                        selectedRole === "user" ? "text-white" : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      <User className="size-4" strokeWidth={2.2} />
                      <span>Peserta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("speaker")}
                      className={`relative z-10 flex-1 py-2 text-center text-[13px] font-semibold transition-colors duration-200 select-none flex items-center justify-center gap-2 cursor-pointer ${
                        selectedRole === "speaker" ? "text-white" : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      <Presentation className="size-4" strokeWidth={2.2} />
                      <span>Speaker</span>
                    </button>
                  </div>

                  {/* Contextual description of selected role */}
                  <div className="mt-2 px-3.5 py-2.5 rounded-2xl bg-white/70 border border-hairline/80 flex items-center justify-between text-[11px] text-ink-secondary shadow-xs transition-all">
                    <span>
                      {selectedRole === "user"
                        ? "Ikuti webinar, presensi QR, dan klaim sertifikat belajar."
                        : "Kelola event, buat rundown, dan tayangkan QR presensi."}
                    </span>
                    <span className="font-semibold text-accent shrink-0 ml-2">
                      {selectedRole === "user" ? "→ Dashboard Peserta" : "→ Panel Speaker"}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="aether-meta block text-[11px] font-semibold text-ink-tertiary mb-1.5 ml-1">
                Alamat Email
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-hairline/80 bg-white/70 px-3.5 py-2.5 shadow-[inset_2px_2px_5px_rgba(165,175,190,0.18),inset_-2px_-2px_5px_#ffffff] focus-within:bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3.5px_rgba(10,132,255,0.15)] transition-all">
                <div className="neu-icon-sphere size-8 shrink-0">
                  <Mail className="size-4 text-white" strokeWidth={2.2} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-transparent text-[14px] text-ink focus:outline-none placeholder:text-ink-tertiary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="aether-meta text-[11px] font-semibold text-ink-tertiary">
                  Kata Sandi
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => toast.info("Gunakan demo login di bawah untuk langsung mencoba!")}
                    className="text-[11px] font-semibold text-accent hover:underline"
                  >
                    Lupa sandi?
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-hairline/80 bg-white/70 px-3.5 py-2.5 shadow-[inset_2px_2px_5px_rgba(165,175,190,0.18),inset_-2px_-2px_5px_#ffffff] focus-within:bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3.5px_rgba(10,132,255,0.15)] transition-all">
                <div className="neu-icon-sphere size-8 shrink-0">
                  <Lock className="size-4 text-white" strokeWidth={2.2} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-[14px] text-ink focus:outline-none placeholder:text-ink-tertiary"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-2xl bg-rose-50/90 border border-rose-200/90 p-4 text-[13px] text-rose-900 flex items-start gap-3 shadow-xs animate-in fade-in zoom-in-95">
                <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-950">Perhatian:</p>
                  <p className="text-rose-800 leading-relaxed">{errorMessage}</p>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setErrorMessage(null);
                        window.history.replaceState(null, "", "/auth?mode=register");
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-accent hover:underline"
                    >
                      <span>Daftar Akun Baru Sekarang &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neu-btn-blue w-full py-3.5 rounded-2xl text-[14px] font-semibold text-white shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-75 transition-all cursor-pointer"
            >
              <ArrowRight className="size-4 text-white" />
              <span>
                {loading
                  ? "Menyiapkan Akun..."
                  : mode === "login"
                    ? "Masuk ke Akun"
                    : selectedRole === "speaker"
                      ? "Daftar sebagai Speaker (Akses Panel)"
                      : "Daftar sebagai Peserta (Akses Dashboard)"}
              </span>
            </button>

            {/* Helper Switcher footer below submit */}
            <div className="pt-2 text-center text-[12.5px] text-ink-secondary">
              {mode === "login" ? (
                <p>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMessage(null);
                      window.history.replaceState(null, "", "/auth?mode=register");
                    }}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              ) : (
                <p>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage(null);
                      window.history.replaceState(null, "", "/auth?mode=login");
                    }}
                    className="font-bold text-accent hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="neu-btn-glass inline-flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-ink-secondary hover:text-accent shadow-xs"
          >
            <ArrowLeft className="size-3.5 text-accent" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
