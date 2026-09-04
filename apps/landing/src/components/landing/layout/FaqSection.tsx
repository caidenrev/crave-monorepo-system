import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types/landingtypes";

const FAQS: FaqItem[] = [
  {
    q: "Apakah saya bisa memasukkan data barang lama saya?",
    a: "Tentu saja. Kamu bisa langsung mengimpor data barang dan laporan sebelumnya menggunakan fitur Spreadsheet kami melalui file Excel/CSV.",
  },
  {
    q: "Apakah ada batasan pengguna atau karyawan?",
    a: "Crave sepenuhnya gratis tanpa batasan jumlah pengguna, barang, maupun transaksi.",
  },
  {
    q: "Apakah data toko saya aman?",
    a: "Data kamu tersimpan aman di cloud dengan sistem keamanan modern. Ditambah lagi, kamu bisa membatasi akses karyawan ke menu tertentu menggunakan fitur keamanan PIN.",
  },
  {
    q: "Apakah bisa digunakan tanpa internet?",
    a: "Saat ini Crave membutuhkan koneksi internet agar data penjualan, stok, dan pengeluaran bisa selalu sinkron dan terpantau secara realtime dari mana saja.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-b border-foreground/15 bg-secondary/40">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <div className="mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {}
          <div className="flex flex-col w-full max-w-xl mx-auto lg:mx-0">
            {}
            <div className="mb-8">
              <div className="flex justify-start mb-4">
                <span className="rounded-full border border-foreground/15 bg-white px-4 py-1.5 text-xs font-medium text-[#1B5CFE] shadow-sm">
                  FAQ
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Pertanyaan yang Sering Diajukan
              </h2>
              <div className="w-16 h-1 mt-4 bg-blue-500 rounded-full"></div>
            </div>

            {}
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {FAQS.map((f) => (
                <AccordionItem
                  key={f.q}
                  value={f.q}
                  className="bg-white rounded-2xl shadow-sm border border-slate-50 px-6"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-slate-900 hover:no-underline py-5">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-slate-500 leading-relaxed pb-6">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-end justify-center pb-0">
            {}
            <div className="absolute inset-0 overflow-hidden flex items-end justify-center">
              <div className="w-[95%] aspect-square bg-[#E8F0FE] rounded-full translate-y-[10%] z-0 shadow-inner"></div>
            </div>

            {}
            <img
              src="/image/model.png"
              alt="Model looking curious"
              className="relative z-10 w-full h-auto object-contain object-bottom drop-shadow-2xl scale-[1.25] origin-bottom"
            />

            {}
            {}
            <div className="absolute top-[10%] left-[5%] w-20 h-28 sm:w-24 sm:h-32 bg-[#1B5CFE] rounded-[50%] flex items-center justify-center shadow-xl animate-[bounce_6s_infinite] z-20">
              <span className="text-white font-bold text-4xl sm:text-5xl">?</span>
            </div>

            {}
            <div className="absolute top-[50%] left-[0%] w-16 h-16 sm:w-20 sm:h-20 bg-[#0F172A] rounded-full flex items-center justify-center shadow-lg animate-[bounce_5s_infinite_1s] z-20">
              <span className="text-white font-bold text-3xl sm:text-4xl">?</span>
            </div>

            {}
            <div className="absolute top-[35%] right-[-5%] w-16 h-16 sm:w-24 sm:h-24 bg-[#0F172A] rounded-full flex items-center justify-center shadow-lg animate-[bounce_7s_infinite_0.5s] z-20">
              <span className="text-white font-bold text-3xl sm:text-5xl">?</span>
            </div>

            {}
            <div className="absolute bottom-[10%] right-[5%] w-16 h-16 sm:w-24 sm:h-24 bg-[#4A9DFF] rounded-full flex items-center justify-center shadow-lg animate-[bounce_4s_infinite_1.5s] z-20">
              <span className="text-white font-bold text-3xl sm:text-5xl">?</span>
            </div>

            {}
            <div className="absolute top-[25%] left-[25%] w-4 h-4 bg-[#60A5FA] rounded-full animate-pulse z-20"></div>
            <div className="absolute bottom-[20%] left-[25%] w-6 h-6 bg-[#1B5CFE] rounded-full animate-pulse delay-100 z-20"></div>
            <div className="absolute bottom-[35%] right-[10%] w-4 h-4 bg-[#334155] rounded-full animate-pulse delay-300 z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
