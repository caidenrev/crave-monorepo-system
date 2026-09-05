import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { DashboardGallery } from "@/components/ui/DashboardGallery";

export function KeyFeaturesSection() {
  return (
    <section id="fitur" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <div className="flex justify-center">
          <span className="rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-xs font-medium text-[#1B5CFE]">
            Galeri Aplikasi
          </span>
        </div>
        <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Intip kemudahan memakai <br /> Crave Software
        </h2>

        <div className="mt-14 w-full">
          <DashboardGallery />
        </div>
      </div>
    </section>
  );
}
