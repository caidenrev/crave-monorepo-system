import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim();

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim() || cleanEmail.split("@")[0],
          },
        },
      });
      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user) {
        toast.success("Pendaftaran berhasil! Anda akan langsung diarahkan ke PIN.");
        navigate({ to: "/pin" });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      setLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user) {
        toast.success("Login berhasil!");
        navigate({ to: "/pin" });
      }
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86 8.87028 4.75 12.0003 4.75Z"
        fill="#EA4335"
      />
      <path
        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
        fill="#4285F4"
      />
      <path
        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
        fill="#FBBC05"
      />
      <path
        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
        fill="#34A853"
      />
    </svg>
  );

  const strength = password.length > 8 ? 3 : password.length > 5 ? 2 : password.length > 0 ? 1 : 0;

  return (
    <div className="relative min-h-screen bg-slate-50 md:flex md:items-center overflow-x-hidden">
      {}
      <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between text-white/90">
        <button className="flex items-center justify-center size-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
          <ChevronLeft className="size-5" />
        </button>
      </div>

      {}
      <div className="absolute top-0 inset-x-0 h-[45%] md:h-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 md:rounded-r-[3rem] transition-all duration-500 z-0 overflow-hidden pointer-events-none">
        {}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-48 h-48 bg-blue-400/40 rounded-full blur-2xl"></div>

        {}
        <div className="relative z-10 flex flex-col items-center justify-start pt-[60px] md:pt-0 md:items-start md:justify-center h-full px-6 md:px-16 md:-translate-y-12">
          <div className="flex items-center md:gap-5">
            <img
              src="/dark-mode-logo.png"
              alt="Crave Logo"
              className="h-24 md:h-28 object-contain"
            />
            <h1 className="hidden md:block text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Crave
            </h1>
          </div>
          <p className="hidden md:block mt-6 text-white/80 text-left max-w-sm text-base leading-relaxed font-medium">
            Solusi POS Digital untuk UMKM. Kelola penjualan, stok, dan utang dengan mudah.
          </p>

          <div className="absolute top-6 right-6 md:top-auto md:bottom-12 md:left-16 md:right-auto flex items-center gap-3 text-sm pointer-events-auto z-50">
            <span className="hidden sm:inline text-white/90">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRegistering(!isRegistering)}
              className="rounded-full bg-white/20 hover:bg-white/30 border-none text-white shadow-none h-8 px-4 text-xs font-semibold cursor-pointer"
            >
              {isRegistering ? "Sign in" : "Get Started"}
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="w-full max-w-md mx-auto relative z-10 md:w-full md:max-w-2xl xl:max-w-3xl md:ml-[calc(50%-2.5rem)] lg:ml-[calc(50%-3rem)] xl:ml-[calc(50%-6rem)] 2xl:ml-[calc(50%-8rem)] md:mr-10 lg:mr-12 xl:mr-24 2xl:mr-32 mt-[28vh] sm:mt-[32vh] md:mt-0 px-0 sm:px-6 md:px-0">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl px-6 py-8 sm:px-10 flex flex-col min-h-[70vh] md:min-h-0 md:py-10">
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              {isRegistering ? "Get started free." : "Welcome Back"}
            </h2>
            <p className="text-[15px] text-slate-500 mt-1">
              {isRegistering
                ? "Gratis ya, Ga sampe foto sambil megang KTP"
                : "Enter your details below"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 px-4 text-[15px]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 px-4 text-[15px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 pl-4 pr-12 text-[15px] tracking-widest font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              {isRegistering && password.length > 0 && (
                <div className="flex items-center gap-2 mt-2 ml-1">
                  <div className="flex gap-1 flex-1 max-w-[120px]">
                    <div
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        strength >= 1 ? "bg-red-400" : "bg-slate-200",
                      )}
                    />
                    <div
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        strength >= 2 ? "bg-amber-400" : "bg-slate-200",
                      )}
                    />
                    <div
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        strength >= 3 ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      strength === 3
                        ? "text-emerald-500"
                        : strength === 2
                          ? "text-amber-500"
                          : "text-red-400",
                    )}
                  >
                    {strength === 3 ? "Strong" : strength === 2 ? "Medium" : "Weak"}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01]"
              >
                {loading ? "Processing..." : isRegistering ? "Sign up" : "Sign in"}
              </Button>
            </div>

            {!isRegistering && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or sign {isRegistering ? "up" : "in"} with
            </span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 pb-4">
            <Button
              variant="outline"
              className="h-14 rounded-2xl text-[14px] font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <GoogleIcon />
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
