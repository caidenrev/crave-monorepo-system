import { createFileRoute } from "@tanstack/react-router";
import {
  Store,
  Percent,
  Printer,
  Bluetooth,
  Save,
  CheckCircle2,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan Toko & Perangkat — Crave" },
      { name: "description", content: "Atur Toko, pajak, dan koneksi printer thermal" },
    ],
  }),
  component: PengaturanPage,
});

function PengaturanPage() {
  const handleSave = () => {
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

  return (
    <AppShell
      title="Pengaturan"
      subtitle="Sesuaikan preferensi toko dan Perangkat keras"
      actions={
        <Button className="rounded-xl" onClick={handleSave}>
          <Save className="size-4" /> <span className="hidden sm:inline">Simpan Perubahan</span>
        </Button>
      }
    >
      <div className="space-y-6">
        <Tabs
          defaultValue="toko"
          className="w-full space-y-6"
          onValueChange={(v) => {
            const el = document.getElementById("pengaturan-slider");
            if (el) {
              if (v === "toko") el.style.transform = "translateX(0)";
              if (v === "pajak") el.style.transform = "translateX(100%)";
              if (v === "perangkat") el.style.transform = "translateX(200%)";
            }
          }}
        >
          <div className="w-full">
            <TabsList className="relative z-0 flex h-auto sm:h-14 w-full rounded-2xl sm:rounded-full bg-slate-200 dark:bg-slate-800 p-1">
              <div
                id="pengaturan-slider"
                className="absolute left-1 top-1 bottom-1 w-[calc(33.333%-2.6px)] rounded-xl sm:rounded-full bg-background shadow-md border border-black/5 dark:border-white/10 transition-transform duration-300 ease-in-out z-0"
                style={{ transform: "translateX(0)" }}
              />
              <TabsTrigger
                value="toko"
                className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
              >
                <Store className="size-4 sm:size-4.5 shrink-0" />
                <span className="text-[10px] sm:text-sm leading-none">Toko</span>
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
            {}
            <TabsContent value="toko" className="mt-0 space-y-4">
              <div className="card-soft p-5">
                <h3 className="text-lg font-bold">Informasi Bisnis</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Informasi ini akan tercetak di bagian atas (header) struk pelanggan.
                </p>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Nama Toko</label>
                    <Input
                      defaultValue="Crave - Point of Sales"
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Alamat</label>
                    <Input
                      defaultValue="Jl. Sudirman No. 123, Jakarta Selatan"
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Nomor Telepon / WhatsApp</label>
                    <Input defaultValue="0812-3456-7890" className="rounded-xl bg-background" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-sm font-semibold">Pesan Bawah Struk (Footer)</label>
                    <Input
                      defaultValue="Terima kasih atas kunjungannya!"
                      className="rounded-xl bg-background"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {}
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

                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-4 bg-muted/30 rounded-xl border">
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

            {}
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
