import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { DashboardShell } from "../components/aether/dashboard-shell";
import { useApp } from "../lib/store";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const isSuper = Boolean(currentUser?.role?.toLowerCase().includes("super"));
  const isSpeakerOrAdmin = Boolean(
    currentUser &&
      (isSuper ||
        currentUser.role?.toLowerCase().includes("speaker") ||
        currentUser.role?.toLowerCase().includes("host") ||
        currentUser.role?.toLowerCase().includes("admin") ||
        currentUser.email.toLowerCase().includes("speaker") ||
        currentUser.email.toLowerCase().includes("admin") ||
        currentUser.email.toLowerCase().includes("root")),
  );

  useEffect(() => {
    // 1. Unauthenticated Guard
    if (!currentUser) {
      toast.error("Akses Dibatasi", {
        description: "Silakan masuk ke akun Speaker atau Admin untuk mengakses panel ini.",
      });
      navigate({
        to: "/auth",
        search: { mode: "login", redirect: "/admin" },
      });
      return;
    }

    // 2. Role Authorization Guard (Peserta cannot access /admin)
    if (!isSpeakerOrAdmin) {
      toast.error("Akses Ditolak: Hanya untuk Speaker & Admin", {
        description: "Akun Anda terdaftar sebagai Peserta. Mengalihkan ke Dashboard Peserta...",
      });
      navigate({ to: "/dashboard" });
    }
  }, [currentUser, isSpeakerOrAdmin, navigate]);

  // While checking / redirecting
  if (!currentUser || !isSpeakerOrAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="frosted-glass-card max-w-sm rounded-3xl p-6 text-center border border-white/80 shadow-lg">
          <div className="mx-auto mb-3 size-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
            !
          </div>
          <p className="text-[14px] font-bold text-ink">Memeriksa Hak Akses</p>
          <p className="mt-1 text-[12px] text-ink-tertiary">
            Halaman ini khusus untuk Speaker dan Admin. Sedang memverifikasi izin akun...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell role="admin" user={currentUser}>
      <Outlet />
    </DashboardShell>
  );
}
