import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn, POS_URL } from "@/lib/utils";

// Harus sama dengan tabel subscription_plans di database Crave POS (lihat supabase_schema.sql bagian 10).
const FEATURES = [
  "Kasir, barcode & pembayaran QRIS",
  "Stok, supplier & kartu stok",
  "Laporan, buku kas & spreadsheet",
  "Karyawan, struk & multi-perangkat",
];

const PLANS: {
  name: string;
  price: string;
  perMonth: string;
  saving: string | null;
  note: string;
  listTitle: string;
  items: string[];
  featured: boolean;
}[] = [
  {
    name: "1 Bulan",
    price: "Rp 150rb",
    perMonth: "Rp 150.000 / bulan",
    saving: null,
    note: "Bayar per bulan, cocok untuk mencoba dulu tanpa komitmen panjang.",
    listTitle: "SEMUA FITUR CRAVE POS:",
    items: FEATURES,
    featured: false,
  },
  {
    name: "6 Bulan",
    price: "Rp 765rb",
    perMonth: "Setara Rp 127.500 / bulan",
    saving: "Hemat Rp 135.000",
    note: "Sekali bayar untuk setengah tahun, lebih hemat dari bulanan.",
    listTitle: "SEMUA FITUR CRAVE POS:",
    items: FEATURES,
    featured: true,
  },
  {
    name: "12 Bulan",
    price: "Rp 1,5jt",
    perMonth: "Setara Rp 125.000 / bulan",
    saving: "Hemat Rp 300.000",
    note: "Harga per bulan paling rendah untuk toko yang sudah berjalan.",
    listTitle: "SEMUA FITUR CRAVE POS:",
    items: FEATURES,
    featured: false,
  },
];

export function PricingSection() {
  return (
    <div className="w-full">
      <div className="mt-8 max-w-5xl mx-auto pt-4 relative px-4 sm:px-0">
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
                    </p>
                    <p className="mt-1 text-sm font-semibold opacity-80">{p.perMonth}</p>
                    <p
                      className={cn(
                        "mx-auto mt-3 w-fit rounded-full px-3 py-1 text-[11px] font-bold",
                        !p.saving && "invisible",
                        p.featured ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {p.saving ?? "-"}
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
                    <a href={POS_URL}>Coba Gratis 14 Hari</a>
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
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted-foreground">
        Semua akun baru gratis 14 hari tanpa kartu kredit. Setelah masa aktif habis, data dan laporan tetap
        bisa dilihat dan diekspor.
      </p>
    </div>
  );
}
