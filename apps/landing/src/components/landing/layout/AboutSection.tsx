import { GridCross } from "@/components/landing/ui/GridCross";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <DotPattern className="!-z-10 text-foreground/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]" />
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-brand uppercase">
          About Us
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
          Misi Kami: Membantu Pelaku UMKM Naik Kelas dengan Digitalisasi Sederhana
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {/* Card 1: Masalah Buku Kas Manual */}
          <article className="text-center group">
            <div className="rounded-2xl bg-card shadow-card flex flex-col items-center justify-center p-8 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-tr from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50 aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5 blur-xl pointer-events-none rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
              <AlertTriangle className="size-16 text-red-500/80 relative z-10 drop-shadow-sm group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <h3 className="mt-8 text-lg font-bold text-foreground">Tantangan Pembukuan Manual</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Banyak pelaku UMKM kehilangan profit akibat kesalahan hitung manual, catatan utang kertas yang terselip, dan minimnya kontrol stok barang.
            </p>
          </article>

          {/* Card 2: Crave POS Solusinya */}
          <article className="text-center group">
            <div className="rounded-2xl bg-card shadow-card flex items-center justify-center p-8 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-tr from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50 aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl pointer-events-none rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
              <img 
                src="/light-mode-logo.png" 
                alt="Crave Logo" 
                className="h-16 w-auto relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
              />
            </div>
            <h3 className="mt-8 text-lg font-bold text-foreground">Mengapa Crave Dibuat?</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Crave hadir untuk merombak pencatatan konvensional menjadi digital secara gratis, instan, dan super mudah digunakan oleh siapa saja.
            </p>
          </article>

          {/* Card 3: Efisiensi Hasil Akhir */}
          <article className="text-center group">
            <div className="rounded-2xl bg-card shadow-card flex flex-col items-center justify-center p-8 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-tr from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50 aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 blur-xl pointer-events-none rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
              <TrendingUp className="size-16 text-green-500/80 relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="mt-8 text-lg font-bold text-foreground">Bisnis Lebih Terkontrol</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Pantau laporan keuangan harian, riwayat stok masuk-keluar secara otomatis, dan kelola utang pelanggan langsung dari satu dashboard.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
