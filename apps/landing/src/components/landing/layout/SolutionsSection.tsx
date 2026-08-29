import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { cn } from "@/lib/utils";
import type { SolutionItem } from "@/types/landingtypes";

const SOLUTIONS: SolutionItem[] = [
  {
    icon: "/3D-icon/3D-icon-2/listbook.png",
    body: "Catat pemasukan dan pengeluaran otomatis dari penjualan tanpa harus klik",
  },
  {
    icon: "/3D-icon/3D-icon-2/calendar.png",
    body: "Pantau stok dan penjualan item atau manajemen barang secara cepat di perangkat anda",
  },
  {
    icon: "/3D-icon/3D-icon-2/invoice.png",
    body: "Invoice otomatis dengan PDF atau struk yang bisa di koneksi kan ke perangkat cetak pribadi mu",
  },
];

export function SolutionsSection() {
  return (
    <section id="solution" className="relative border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl overflow-hidden md:border-x border-foreground/15 px-6 pb-0 pt-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:linear-gradient(to_bottom,black_5%,transparent_25%)]" />

        <div className="flex justify-center">
          <span className="rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Solutions
          </span>
        </div>
        <h2 className="mx-auto mt-8 max-w-xl text-center text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          Masih kelola bisnis pakai cara manual?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          Hadirnya crave mampu memberikan kemudahan bagi para pelaku UMKM dalam mengelola bisnis
          dengan lebih efisien dan efektif.
        </p>

        <div className="relative -mx-6 mt-14 grid border-y border-foreground/30 md:grid-cols-3">
          {}
          <div className="absolute -top-[1.5px] -left-[1.5px] z-10 hidden h-4 w-4 border-l-[3px] border-t-[3px] border-foreground/40 md:block" />
          <div className="absolute -top-[1.5px] -right-[1.5px] z-10 hidden h-4 w-4 border-r-[3px] border-t-[3px] border-foreground/40 md:block" />

          {}
          <div className="absolute -top-[1.5px] left-[calc(33.333%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
            <div className="absolute top-0 h-[3px] w-full bg-foreground/40" />
            <div className="h-full w-[3px] bg-foreground/40" />
          </div>
          <div className="absolute -top-[1.5px] left-[calc(66.667%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
            <div className="absolute top-0 h-[3px] w-full bg-foreground/40" />
            <div className="h-full w-[3px] bg-foreground/40" />
          </div>

          {}
          <div className="absolute -bottom-[1.5px] -left-[1.5px] z-10 hidden h-4 w-4 border-b-[3px] border-l-[3px] border-foreground/40 md:block" />
          <div className="absolute -bottom-[1.5px] -right-[1.5px] z-10 hidden h-4 w-4 border-b-[3px] border-r-[3px] border-foreground/40 md:block" />

          {}
          <div className="absolute -bottom-[1.5px] left-[calc(33.333%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
            <div className="absolute bottom-0 h-[3px] w-full bg-foreground/40" />
            <div className="h-full w-[3px] bg-foreground/40" />
          </div>
          <div className="absolute -bottom-[1.5px] left-[calc(66.667%-15.5px)] z-10 hidden h-[15.5px] w-[31px] justify-center md:flex">
            <div className="absolute bottom-0 h-[3px] w-full bg-foreground/40" />
            <div className="h-full w-[3px] bg-foreground/40" />
          </div>

          {SOLUTIONS.map(({ icon, body }, idx) => (
            <div
              key={body}
              className={cn(
                "px-6 py-10 md:px-12",
                idx > 0 && "md:border-l md:border-foreground/30",
              )}
            >
              <img
                src={icon}
                alt=""
                className="h-16 w-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]"
                aria-hidden
              />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          {}
          <img
            src="/3D-icon/calendar.png"
            alt="Calendar"
            className="absolute -left-6 top-[35%] z-20 w-24 -rotate-6 transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:rotate-0 drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)] sm:-left-16 sm:w-40"
          />

          {}
          <img
            src="/3D-icon/business-report.png"
            alt="Business Report"
            className="absolute -right-4 top-[25%] z-20 w-20 rotate-6 transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:rotate-0 drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] drop-shadow-[0_5px_10px_rgba(0,0,0,0.2)] sm:-right-14 sm:w-36"
          />

          {}
          <div className="relative z-10 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-b from-[#24b2ff] to-[#018df8] px-4 pt-4 sm:px-10 sm:pt-10">
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-t-2xl shadow-2xl">
              <img src="/image/solution.png" alt="App Dashboard" className="w-full object-cover" />
            </div>

            {}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
