import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "../components/aether/dashboard-shell";
import { useApp } from "../lib/store";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const isSuper = Boolean(currentUser?.role?.toLowerCase().includes("super"));
  const isSpeakerOnly = Boolean(
    currentUser &&
      !isSuper &&
      (currentUser.role?.toLowerCase().includes("speaker") ||
        currentUser.role?.toLowerCase().includes("host") ||
        currentUser.email.toLowerCase().includes("speaker")),
  );

  useEffect(() => {
    // 1. Unauthenticated Guard
    if (!currentUser) {
      toast.error("Akses Dibatasi", {
        description: "Silakan masuk terlebih dahulu untuk mengakses Dashboard Peserta.",
      });
      navigate({
        to: "/auth",
        search: { mode: "login", redirect: "/dashboard" },
      });
      return;
    }

    // 2. Speaker Role Separation Guard (Speaker is routed to /admin)
    if (isSpeakerOnly) {
      toast.info("Mengalihkan ke Panel Speaker", {
        description: "Akun Anda terdaftar sebagai Speaker/Host.",
      });
      navigate({ to: "/admin" });
    }
  }, [currentUser, isSpeakerOnly, navigate]);

  if (!currentUser || isSpeakerOnly) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="frosted-glass-card max-w-sm rounded-3xl p-6 text-center border border-white/80 shadow-lg">
          <div className="mx-auto mb-3 size-10 rounded-2xl bg-accent-tint/60 border border-accent/20 flex items-center justify-center text-accent-strong font-bold">
            !
          </div>
          <p className="text-[14px] font-bold text-ink">Memeriksa Sesi Akun</p>
          <p className="mt-1 text-[12px] text-ink-tertiary">
            Sedang memverifikasi akses Dashboard Peserta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell role="user" user={currentUser}>
      <Outlet />
    </DashboardShell>
  );
}
