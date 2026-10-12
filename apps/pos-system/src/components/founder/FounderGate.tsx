import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { readAdminHint, useSubscription } from "@/lib/useSubscription";

/**
 * Memisahkan akun founder dari aplikasi kasir: akun founder selalu diarahkan ke
 * /founder dan tidak melihat fitur merchant; akun merchant tidak bisa membuka /founder.
 * Ini hanya pengatur tampilan. Hak akses data founder diperiksa di database.
 */
export function FounderGate({ children }: { children: ReactNode }) {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [hint] = useState(readAdminHint);
  const rawPathname = useRouterState({ select: (s) => s.location.pathname });
  const pathname = rawPathname.startsWith("/pos-system")
    ? rawPathname.replace("/pos-system", "") || "/"
    : rawPathname;

  const isAuthRoute = pathname === "/login" || pathname === "/pin";
  const onFounder = pathname === "/founder" || pathname.startsWith("/founder/");
  const isAdmin = subscription ? subscription.is_admin : hint;

  const toFounder = isAdmin && !onFounder && !isAuthRoute;
  const toApp = !!subscription && !subscription.is_admin && onFounder;

  useEffect(() => {
    if (toFounder) void navigate({ to: "/founder", replace: true });
    else if (toApp) void navigate({ to: "/", replace: true });
  }, [toFounder, toApp, navigate]);

  if (toFounder || toApp || (onFounder && !subscription)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
