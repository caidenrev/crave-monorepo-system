import { GridCross } from "@/components/landing/ui/GridCross";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { PricingSection } from "@/components/ui/PricingSection";

export function PricingSectionLayout() {
  return (
    <section id="product" className="border-b border-foreground/15 bg-secondary/40">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <DotPattern className="!-z-10 text-foreground/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]" />
        <div className="flex justify-center">
          <span className="rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-xs font-medium text-[#1B5CFE]">
            Harga & Paket
          </span>
        </div>
        <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Paket yang bisa anda pilih sesuai kebutuhan anda
        </h2>

        <div className="mt-10 w-full">
          <PricingSection />
        </div>
      </div>
    </section>
  );
}
