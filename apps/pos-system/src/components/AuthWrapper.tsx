import { useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import { Loader2 } from "lucide-react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { session, loading, isUnlocked } = useAuth();
  const navigate = useNavigate();
  const rawPathname = useRouterState({ select: (s) => s.location.pathname });
  const pathname = rawPathname.startsWith("/pos-system")
    ? rawPathname.replace("/pos-system", "") || "/"
    : rawPathname;

  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname === "/login" || pathname === "/pin";

      if (!session && pathname !== "/login") {
        navigate({ to: "/login" });
      } else if (session && !isUnlocked && pathname !== "/pin") {
        navigate({ to: "/pin" });
      } else if (session && isUnlocked && isAuthRoute) {
        navigate({ to: "/" });
      }
    }
  }, [session, loading, isUnlocked, pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session && pathname !== "/login") return null;
  if (session && !isUnlocked && pathname !== "/pin") return null;

  return <>{children}</>;
}
