import { createFileRoute } from "@tanstack/react-router";
import { Info, ShieldCheck, FileText, Cpu, Github } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/info")({
  head: () => ({
    meta: [
      { title: "Info Aplikasi — Crave" },
      { name: "description", content: "Informasi tentang aplikasi Crave Point of Sales" },
    ],
  }),
  component: InfoPage,
});

function InfoPage() {
  return (
    <AppShell title="Info Aplikasi" subtitle="Detail versi dan lisensi Crave Point of Sales">
      <div className="max-w-2xl space-y-6">
        {}
        <div className="card-soft p-8 text-center flex flex-col items-center gap-4">
          <div className="size-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
            <Cpu className="size-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Crave POS</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Versi 1.0.4 (Build 20260813)
            </p>
          </div>
          <div className="flex gap-2 justify-center mt-2">
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <ShieldCheck className="size-4" /> Kebijakan Privasi
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <FileText className="size-4" /> Syarat & Ketentuan
            </Button>
          </div>
        </div>

        {}
        <div className="card-soft p-6">
          <h3 className="text-lg font-bold mb-4">Sistem & Pembaruan</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
              <div className="p-2 bg-success/10 text-success rounded-lg">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="font-bold">Sistem Anda sudah yang terbaru</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Semua fitur berjalan optimal dengan dukungan pembaruan otomatis yang aktif.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Github className="size-5" />
              </div>
              <div>
                <p className="font-bold">Dukungan Pengembang</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dibuat khusus untuk mendukung operasional bisnis UMKM lokal dengan antarmuka yang
                  modern dan responsif.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
