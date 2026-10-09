import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Loader2, LogOut, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useSessions, type LoginSession } from "@/lib/useSessions";
import { describeDevice } from "@/lib/deviceName";

const KindIcon = ({ kind }: { kind: "phone" | "tablet" | "desktop" }) =>
  kind === "phone" ? (
    <Smartphone className="size-5" />
  ) : kind === "tablet" ? (
    <Tablet className="size-5" />
  ) : (
    <Monitor className="size-5" />
  );

const ago = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: localeId });

/** Kartu "Perangkat & Sesi Login" di Pengaturan > Profil. */
export function DeviceSessions() {
  const {
    sessions,
    available,
    isLoading,
    error,
    refetch,
    revoke,
    revokingId,
    revokeOthers,
    isRevokingOthers,
  } = useSessions();
  const others = sessions.filter((s) => !s.is_current);

  const handleRevoke = async (s: LoginSession) => {
    try {
      await revoke(s.id);
      toast.success("Perangkat dikeluarkan", {
        description: "Perangkat itu akan otomatis keluar paling lambat dalam 1 jam.",
      });
    } catch (err: any) {
      toast.error("Gagal mengeluarkan perangkat: " + err.message);
    }
  };

  const handleRevokeOthers = async () => {
    try {
      await revokeOthers();
      toast.success("Semua perangkat lain dikeluarkan", {
        description:
          "Hanya perangkat ini yang tetap masuk. Yang lain keluar paling lambat dalam 1 jam.",
      });
    } catch (err: any) {
      toast.error("Gagal mengeluarkan perangkat lain: " + err.message);
    }
  };

  return (
    <div className="card-soft p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Perangkat & Sesi Login
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar perangkat yang sedang masuk ke akun ini. Keluarkan perangkat yang tidak Anda
            kenali.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Muat ulang
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Memuat daftar perangkat...
        </div>
      ) : error ? (
        <p className="py-4 text-sm text-destructive">
          Gagal memuat perangkat: {(error as Error).message}
        </p>
      ) : !available ? (
        <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
          Daftar perangkat aktif setelah pembaruan database (bagian 9 di supabase_schema.sql)
          dijalankan. Tombol di bawah tetap bisa dipakai untuk mengeluarkan semua perangkat lain.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {sessions.map((s) => {
            const d = describeDevice(s.user_agent);
            return (
              <li
                key={s.id}
                className={
                  "flex flex-wrap items-center gap-3 rounded-xl border p-3.5 " +
                  (s.is_current ? "border-primary/30 bg-primary/5" : "bg-card")
                }
              >
                <div
                  className={
                    "grid size-10 shrink-0 place-items-center rounded-xl " +
                    (s.is_current
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground")
                  }
                >
                  <KindIcon kind={d.kind} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold">
                      {d.device}
                      {d.browser ? ` · ${d.browser}` : ""}
                    </p>
                    {s.is_current && (
                      <Badge className="rounded-full text-[10px]">Perangkat ini</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.is_current ? "Aktif sekarang" : `Terakhir aktif ${ago(s.last_active_at)}`}
                    {s.ip ? ` · IP ${s.ip}` : ""} · Masuk {ago(s.created_at)}
                  </p>
                </div>
                {!s.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={revokingId === s.id}
                      >
                        {revokingId === s.id ? (
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <LogOut className="size-3.5 mr-1.5" />
                        )}
                        Keluarkan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl max-w-sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Keluarkan perangkat ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {d.device}
                          {d.browser ? ` (${d.browser})` : ""} harus login ulang untuk memakai akun
                          ini. Perangkat itu keluar paling lambat dalam 1 jam.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRevoke(s)}
                        >
                          Keluarkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
          {sessions.length === 0 && (
            <li className="py-4 text-sm text-muted-foreground">Tidak ada sesi aktif.</li>
          )}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {available && !isLoading
            ? others.length > 0
              ? `${others.length} perangkat lain sedang masuk.`
              : "Tidak ada perangkat lain yang masuk."
            : "Keluarkan semua perangkat selain yang sedang Anda pakai."}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={isRevokingOthers || (available && !isLoading && others.length === 0)}
            >
              {isRevokingOthers ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <LogOut className="size-3.5 mr-1.5" />
              )}
              Keluarkan semua perangkat lain
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Keluarkan semua perangkat lain?</AlertDialogTitle>
              <AlertDialogDescription>
                Semua perangkat selain yang sedang Anda pakai harus login ulang. Perangkat itu
                keluar paling lambat dalam 1 jam.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleRevokeOthers}
              >
                Keluarkan semua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
