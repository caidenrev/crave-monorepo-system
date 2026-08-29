import { useState } from "react";
import { Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Basic Plan",
    price: "Rp 150rb",
    note: "Untuk individu atau tim kecil yang baru mulai.",
    listTitle: "TERMASUK:",
    items: [
      "Pelacakan polis otomatis",
      "Pemantauan status dokumen",
      "Notifikasi pintar",
    ],
    featured: false,
  },
  {
    name: "Business Plan",
    price: "Rp 299rb",
    note: "Untuk tim yang butuh alat compliance tingkat lanjut.",
    listTitle: "BASIC, DITAMBAH:",
    items: [
      "Dashboard kolaborasi tim",
      "Alur kerja yang bisa disesuaikan",
      "Laporan & analitik tingkat lanjut",
      "Prioritas dukungan",
    ],
    featured: true,
  },
  {
    name: "Enterprise Plan",
    price: "Rp 749rb",
    note: "Untuk perusahaan besar dengan ribuan polis.",
    listTitle: "BUSINESS, DITAMBAH:",
    items: ["Manajer sukses dedikasi", "Integrasi khusus", "Penyimpanan tak terbatas"],
    featured: false,
  },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [usersCount, setUsersCount] = useState<number>(5);

  const pricePerUserMonthly = 150000;
  
  const totalAnnualPrice = usersCount * pricePerUserMonthly * 12;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full">
      {}
      <div className="mt-8 flex justify-center">
        <div className="relative flex items-center rounded-full bg-muted/50 p-1 shadow-inner border border-foreground/10 w-fit">
          <div
            className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-background shadow-md border border-foreground/10 transition-all duration-300 ease-in-out"
            style={{
              transform: billingCycle === "annual" ? "translateX(100%)" : "translateX(0)",
            }}
          />
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors w-28",
              billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={cn(
              "relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors w-28",
              billingCycle === "annual" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
          </button>
        </div>
      </div>

      <div className="mt-12 relative min-h-[500px]">
        <AnimatePresence mode="wait">
          {billingCycle === "monthly" ? (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto pt-4 relative px-4 sm:px-0"
            >
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 sm:-ml-8">
                  {PLANS.map((p) => (
                    <CarouselItem key={p.name} className="pl-4 sm:pl-8 md:basis-1/2 lg:basis-1/3 pt-6 pb-2">
                      <div
                        className={cn(
                          "relative rounded-[2rem] p-8 pt-12 text-center flex flex-col justify-between shadow-xl transition-transform hover:-translate-y-1 h-full",
                          p.featured
                            ? "bg-[#5584ff] text-white"
                            : "bg-white text-slate-900 border border-slate-100"
                        )}
                      >
                        {}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/10 to-transparent rounded-t-[2rem] pointer-events-none z-0" />

                        {}
                        <div className="absolute -top-4 left-8 right-8 flex justify-between pointer-events-none z-20">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="relative w-4 flex justify-center">
                              {}
                              <div className={cn(
                                "absolute top-4 w-3.5 h-3.5 rounded-full shadow-[inset_0_3px_5px_rgba(0,0,0,0.25)]",
                                p.featured ? "bg-white" : "bg-slate-200/70"
                              )} />
                              {}
                              <div className="absolute top-0 w-2 h-7 bg-gradient-to-b from-slate-200 to-slate-500 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.3)] z-10" />
                            </div>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-base font-bold">{p.name}</h3>
                          <p className="mt-4 text-[2.5rem] font-bold tracking-tight">
                            {p.price}
                            <span className="text-sm font-semibold opacity-80">/bln</span>
                          </p>
                          <p
                            className={cn(
                              "mt-4 text-xs mx-auto max-w-[200px] leading-relaxed",
                              p.featured ? "text-white/90" : "text-slate-500"
                            )}
                          >
                            {p.note}
                          </p>
                          <p className="mt-8 text-[10px] font-bold tracking-widest uppercase opacity-80">
                            {p.listTitle}
                          </p>
                          <ul className="mt-5 space-y-3 text-xs font-medium text-left px-4">
                            {p.items.map((i) => (
                              <li key={i} className="flex items-start gap-3">
                                <Check className="h-4 w-4 shrink-0 opacity-80 mt-0.5" aria-hidden />
                                <span>{i}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button
                          asChild
                          className={cn(
                            "mt-10 h-12 w-full rounded-full text-sm font-bold shadow-lg transition-all",
                            p.featured
                              ? "bg-white text-[#5584ff] hover:bg-slate-50"
                              : "bg-[#0a0f25] text-white hover:bg-slate-800"
                          )}
                        >
                          <a href="#cta">Pilih Paket</a>
                        </Button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="md:hidden">
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </div>
              </Carousel>
            </motion.div>
          ) : (
            <motion.div
              key="annual"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative flex flex-col md:flex-row items-stretch justify-center bg-blue-600 rounded-[2.5rem] p-3 md:p-8 shadow-2xl">
                
                {}
                <div className="flex-1 bg-white rounded-3xl p-8 md:p-12 relative z-0 text-slate-900 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 mb-6">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Enterprise Plan</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                      Best Value For<br />Your Budget
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-sm text-sm">
                      Kalkulator Pay-as-you-go yang sangat fleksibel. Bayar hanya untuk pengguna yang Anda butuhkan secara tahunan dan hemat lebih banyak biaya.
                    </p>
                    
                    <h4 className="font-bold text-xl mb-4">Yang Anda Dapatkan</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm font-semibold text-slate-700">
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> Advanced Security</li>
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> Team Collaboration</li>
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> All Fill Access</li>
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> Custom Integrations</li>
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> Priority Support</li>
                      <li className="flex items-center gap-2"><div className="bg-emerald-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /></div> Unlimited Storage</li>
                    </ul>
                  </div>
                </div>

                {}
                <div className="hidden md:flex flex-col justify-evenly py-16 -mx-4 z-10 w-24">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between relative">
                      {}
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] shadow-[inset_0_3px_5px_rgba(0,0,0,0.15)] z-0 ml-1" />
                      {}
                      <div className="absolute left-1/2 -translate-x-1/2 w-[72px] h-5 bg-[#8cb4ff] rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_-3px_5px_rgba(0,0,0,0.2),inset_0_3px_5px_rgba(255,255,255,0.6)] z-10 border border-[#a6c7ff]" />
                      {}
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] shadow-[inset_0_3px_5px_rgba(0,0,0,0.15)] z-0 mr-1" />
                    </div>
                  ))}
                </div>

                {}
                <div className="md:hidden flex justify-evenly px-12 -my-4 z-10 h-16 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center justify-between relative">
                      {}
                      <div className="w-5 h-5 rounded-full bg-[#f1f5f9] shadow-[inset_0_3px_5px_rgba(0,0,0,0.15)] z-0 mt-1" />
                      {}
                      <div className="absolute top-1/2 -translate-y-1/2 h-14 w-4 bg-[#8cb4ff] rounded-full shadow-[4px_0_6px_rgba(0,0,0,0.3),inset_-3px_0_5px_rgba(0,0,0,0.2),inset_3px_0_5px_rgba(255,255,255,0.6)] z-10 border border-[#a6c7ff]" />
                      {}
                      <div className="w-5 h-5 rounded-full bg-[#f1f5f9] shadow-[inset_0_3px_5px_rgba(0,0,0,0.15)] z-0 mb-1" />
                    </div>
                  ))}
                </div>

                {}
                <div className="flex-1 bg-white rounded-3xl p-8 md:p-12 relative z-0 text-slate-900 shadow-xl flex flex-col justify-center text-center">
                  
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full text-xs font-bold text-emerald-700 mb-8 mx-auto">
                    <span className="text-lg leading-none">💸</span>
                    <span>Skema Pay-as-you-go</span>
                  </div>

                  <p className="text-4xl md:text-[3.25rem] font-black tracking-tight mb-3 text-slate-900 drop-shadow-sm">
                    {formatRupiah(totalAnnualPrice)}
                  </p>
                  
                  <div className="mb-10 text-left max-w-sm mx-auto w-full px-2">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold text-slate-700 text-sm">Jumlah Pengguna (Users)</span>
                      <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-sm">{usersCount}</span>
                    </div>
                    <Slider
                      defaultValue={[5]}
                      max={100}
                      min={1}
                      step={1}
                      onValueChange={(val) => setUsersCount(val[0] ?? 5)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-3 font-semibold">
                      <span>1 User</span>
                      <span>100+ Users</span>
                    </div>
                  </div>

                  <button className="bg-blue-600 text-white font-bold text-base py-4 px-8 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full max-w-[280px] mx-auto flex items-center justify-center gap-2">
                    Hubungi Sales &rarr;
                  </button>
                  
                  <p className="text-[11px] font-medium text-slate-500 mt-5 max-w-xs mx-auto leading-relaxed">
                    Setara dengan {formatRupiah(pricePerUserMonthly)} / pengguna / bulan.
                    Sudah termasuk fitur prioritas keamanan dan dukungan 24/7.
                  </p>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
