import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";

export function BentoFeaturesSection() {
  return (
    <section className="border-b border-foreground/15 bg-secondary/40">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <div className="flex justify-center">
          <span className="border border-foreground/15 rounded-full bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Features
          </span>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Lakukan semua di satu tempat
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Lakukan pekerjaan tanpa banyak software yang di pakai
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <article className="shadow-card flex flex-col justify-between rounded-3xl bg-card p-8 lg:col-span-2">
            <div className="flex-1 flex items-center justify-center mb-8">
              <img
                src="/image/features/card.png"
                alt=""
                className="w-11/12 h-auto object-contain drop-shadow-xl"
              />
            </div>
            <div>
              <h3 className="text-center text-xl font-bold text-foreground">Update Stok</h3>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Peringatan update stok cepat untuk kamu yang sering lupa update stok item update
                progress in real-time.
              </p>
            </div>
          </article>

          <article className="shadow-card relative overflow-hidden flex flex-col rounded-3xl bg-card lg:col-span-3">
            <div className="p-8 pb-0 z-10 w-full sm:w-2/3">
              <h3 className="text-xl font-bold text-foreground">Live Spreadsheet</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Ga perlu lagi buka tutup excel untuk hitung semua nya, tinggal import dan export dan
                hitung di satu tempat
              </p>
            </div>
            <div className="flex-1 flex items-end justify-end mt-8">
              <img
                src="/image/features/spreadsheet.png"
                alt=""
                className="w-11/12 sm:w-[85%] max-w-none h-auto object-cover object-left-top rounded-tl-2xl drop-shadow-xl"
              />
            </div>
          </article>

          <article className="shadow-card relative overflow-hidden flex flex-col rounded-3xl bg-card lg:col-span-3">
            <div className="p-8 pb-0 z-10 w-full sm:w-2/3">
              <h3 className="text-xl font-bold text-foreground">Realtime Cust Tracker</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Pantau transaksi customer dan auto update keuangan harian
              </p>
            </div>
            <div className="flex-1 flex items-end justify-end mt-8">
              <img
                src="/image/features/kartu-stok.png"
                alt=""
                className="w-11/12 sm:w-[70%] max-w-none h-auto object-contain object-left-top rounded-tl-2xl drop-shadow-xl"
              />
            </div>
          </article>

          <article className="relative overflow-hidden flex flex-col justify-center items-center rounded-3xl lg:col-span-2">
            <div className="p-8 pb-0 z-10 w-full">
              <h3 className="text-center text-xl font-bold text-foreground">Scan barcode</h3>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Scan barcode untuk cepat auto <br /> update stok dan harga
              </p>
            </div>
            <img
              src="/image/features/terlaris.png"
              alt=""
              className="mt-8 w-full h-auto object-cover drop-shadow-md"
            />
          </article>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          and a lot more features...
        </p>
      </div>
    </section>
  );
}
