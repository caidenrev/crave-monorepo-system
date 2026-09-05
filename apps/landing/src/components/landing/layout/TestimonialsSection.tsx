import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { TestimonialCarousel, type TestimonialData } from "@/components/ui/TestimonialCarousel";

const TESTIMONIAL_DATA: TestimonialData[] = [
  {
    id: 1,
    name: "Mark Lee",
    role: "Pemilik Kedai Kopi",
    quote:
      "Aplikasi kasir paling gampang yang pernah saya coba. Tinggal masukin barang, dan laporan penjualan hariannya beres semua otomatis!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark&backgroundColor=transparent",
    bgColor: "bg-teal-400",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Manajer Toko Baju",
    quote:
      "Buku kas sama fitur stoknya bener-bener nolong banget. Fitur import spreadsheet-nya juara buat mindahin data barang lama ke sistem baru!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=transparent",
    bgColor: "bg-blue-400",
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Pengusaha Retail",
    quote:
      "Udah cobain banyak POS, tapi cuma Crave yang UI-nya cakep dan navigasinya nggak bikin bingung karyawan baru. Sistem PIN-nya juga bikin tenang.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=transparent",
    bgColor: "bg-indigo-400",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <div className="flex justify-center">
          <span className="rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-xs font-medium text-[#1B5CFE]">
            Testimoni
          </span>
        </div>
        <div className="flex flex-col items-center mt-4">
          <h2 className="mx-auto max-w-xl text-center text-3xl font-bold tracking-tight text-blue-800 sm:text-4xl">
            Apa kata pengguna kita?
          </h2>
          <div className="w-16 h-1 mt-4 bg-teal-400 rounded-full"></div>
        </div>

        <div className="mt-4">
          <TestimonialCarousel testimonials={TESTIMONIAL_DATA} />
        </div>
      </div>
    </section>
  );
}
