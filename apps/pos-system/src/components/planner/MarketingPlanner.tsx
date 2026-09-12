import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rupiah } from "@/lib/pos-data";
import { Facebook, Instagram, Search, TrendingUp, Users, Save, Loader2 } from "lucide-react";
import { usePlanner } from "@/lib/usePlanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarketingPlanner() {
  const { marketingPlans, saveMarketingPlanMutation } = usePlanner();

  const [dailyBudget, setDailyBudget] = useState<number>(50000);
  const [activePlatform, setActivePlatform] = useState<string>("meta");

  const monthlyBudget = dailyBudget * 30;

  // Real-world benchmarks Indonesia (2024/2025)
  const platforms = {
    meta: {
      name: "Meta Ads (FB/IG)",
      cpc: 1000,
      cpm: 25000,
      minBudget: 20000,
      icon: <Facebook className="size-5 text-blue-600" />,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Ideal untuk kesadaran merek (brand awareness) dan penargetan visual di Instagram/Facebook."
    },
    tiktok: {
      name: "TikTok Ads",
      cpc: 800,
      cpm: 15000,
      minBudget: 15000, // Promote feature
      icon: <TrendingUp className="size-5 text-black" />, // fallback icon for tiktok
      color: "bg-zinc-100 text-zinc-900 border-zinc-200",
      description: "Video pendek viral. CPM termurah, sangat cocok untuk menjangkau Gen Z & Millenial."
    },
    google: {
      name: "Google Ads (Search)",
      cpc: 3500,
      cpm: 50000,
      minBudget: 50000,
      icon: <Search className="size-5 text-red-500" />,
      color: "bg-red-50 text-red-700 border-red-200",
      description: "Traffic dengan niat beli tinggi (high-intent). Orang yang secara aktif mencari produk Anda."
    }
  };

  const currentPlatform = platforms[activePlatform as keyof typeof platforms];

  // Calculations (Monthly)
  const estimatedReach = Math.floor(monthlyBudget / (currentPlatform.cpm / 1000));
  const estimatedClicks = Math.floor(monthlyBudget / currentPlatform.cpc);
  const estimatedConversions = Math.floor(estimatedClicks * 0.05); // Assuming 5% conversion rate

  const handleSave = () => {
    saveMarketingPlanMutation.mutate({
      platform: activePlatform,
      daily_budget: dailyBudget,
      duration_days: 30
    }, {
      onSuccess: () => toast.success(`Simulasi Iklan ${currentPlatform.name} tersimpan!`),
      onError: (err) => toast.error("Gagal menyimpan: " + err.message)
    });
  };

  const handleLoadPlan = (id: string) => {
    const loaded = marketingPlans.find(p => p.id === id);
    if (loaded) {
      setActivePlatform(loaded.platform);
      setDailyBudget(loaded.daily_budget);
      toast.info(`Simulasi Iklan dimuat`);
      
      const el = document.getElementById("marketing-slider");
      if (el) {
        if (loaded.platform === "meta") el.style.transform = "translateX(0)";
        if (loaded.platform === "tiktok") el.style.transform = "translateX(100%)";
        if (loaded.platform === "google") el.style.transform = "translateX(200%)";
      }
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div className="md:col-span-7 space-y-4">
        <Card className="rounded-xl shadow-soft h-full">
          <CardHeader>
            <CardTitle>Estimasi Biaya Marketing Media Sosial</CardTitle>
            <CardDescription>
              Gunakan parameter harga aktual pasar Indonesia (2024/2025) untuk mengestimasi hasil iklan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <Label>Pilih Platform Pemasaran</Label>
              <Tabs 
                value={activePlatform} 
                onValueChange={(v) => {
                  setActivePlatform(v);
                  const el = document.getElementById("marketing-slider");
                  if (el) {
                    if (v === "meta") el.style.transform = "translateX(0)";
                    if (v === "tiktok") el.style.transform = "translateX(100%)";
                    if (v === "google") el.style.transform = "translateX(200%)";
                  }
                }} 
                className="w-full"
              >
                <div className="w-full">
                  <TabsList className="relative z-0 flex h-auto sm:h-14 w-full rounded-2xl sm:rounded-full bg-slate-200 dark:bg-slate-800 p-1">
                    <div
                      id="marketing-slider"
                      className="absolute left-1 top-1 bottom-1 w-[calc(33.333%-2.6px)] rounded-xl sm:rounded-full bg-background shadow-md border border-black/5 dark:border-white/10 transition-transform duration-300 ease-in-out z-0 hidden sm:block"
                      style={{ transform: "translateX(0)" }}
                    />
                    <TabsTrigger value="meta" className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300">
                      <span className="text-[10px] sm:text-sm leading-none">Meta (FB/IG)</span>
                    </TabsTrigger>
                    <TabsTrigger value="tiktok" className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300">
                      <span className="text-[10px] sm:text-sm leading-none">TikTok</span>
                    </TabsTrigger>
                    <TabsTrigger value="google" className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300">
                      <span className="text-[10px] sm:text-sm leading-none">Google Search</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
              
              <div className={`p-4 rounded-xl border mt-4 flex items-start gap-3 ${currentPlatform.color}`}>
                <div className="mt-0.5 bg-white p-2 rounded-full shadow-sm shrink-0">
                  {currentPlatform.icon}
                </div>
                <div>
                  <h4 className="font-bold">{currentPlatform.name}</h4>
                  <p className="text-sm opacity-90 leading-relaxed mt-1">{currentPlatform.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <Label>Anggaran Iklan Harian</Label>
                <div className="relative w-full sm:w-1/2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
                  <Input 
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    min={currentPlatform.minBudget}
                    step={10000}
                    className="pl-10 rounded-xl font-bold"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Slider 
                  value={[dailyBudget]} 
                  onValueChange={(val) => setDailyBudget(val[0] || 0)} 
                  min={10000} 
                  max={500000} 
                  step={5000}
                  className="py-2"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Rp10rb</span>
                  <span>Rp500rb</span>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Target Harian</p>
                <p className="text-xl font-bold">{rupiah(dailyBudget)} <span className="text-sm font-normal text-muted-foreground">/ hari</span></p>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <p className="text-sm text-primary font-medium mb-1">Anggaran Bulanan (Opex)</p>
                <p className="text-xl font-black text-primary">{rupiah(monthlyBudget)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic text-center">
              * Anggaran bulanan ini dapat Anda tambahkan ke Biaya Operasional (Opex) di tab Proyeksi Keuntungan.
            </p>

          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-5 space-y-4">
        <Card className="rounded-xl shadow-soft h-full border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" /> Proyeksi Hasil (Per Bulan)
              </CardTitle>
              <CardDescription className="mt-1">
                Estimasi hasil pemasaran untuk {currentPlatform.name}.
              </CardDescription>
            </div>
            <Select onValueChange={handleLoadPlan}>
              <SelectTrigger className="w-[180px] rounded-xl bg-muted/50 border-transparent shadow-none">
                <SelectValue placeholder="Muat Simulasi" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {marketingPlans.length === 0 ? (
                  <SelectItem value="none" disabled>Belum ada simulasi</SelectItem>
                ) : (
                  marketingPlans.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {platforms[p.platform as keyof typeof platforms]?.name || p.platform} ({rupiah(p.daily_budget)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 border-t">
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Estimasi Jangkauan (Reach)</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{estimatedReach.toLocaleString('id-ID')}</span>
                  <span className="mb-1 text-muted-foreground text-sm">Orang</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Berdasarkan estimasi CPM {rupiah(currentPlatform.cpm)}</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-sm text-muted-foreground mb-1">Estimasi Klik (Traffic)</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary">{estimatedClicks.toLocaleString('id-ID')}</span>
                  <span className="mb-1 text-muted-foreground text-sm">Klik</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Berdasarkan estimasi CPC {rupiah(currentPlatform.cpc)}</p>
              </div>
            </div>

            <Separator />

            <div className="text-center pt-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">Potensi Konversi Penjualan (5%)</p>
              <p className="text-3xl font-bold text-primary">
                ~ {estimatedConversions.toLocaleString('id-ID')} Pembelian
              </p>
            </div>

          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              className="w-full rounded-xl text-lg font-bold h-12" 
              onClick={handleSave}
              disabled={saveMarketingPlanMutation.isPending}
            >
              {saveMarketingPlanMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Simpan Rencana Iklan</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
