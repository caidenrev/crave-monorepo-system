import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { DashboardGallery } from "@/components/ui/DashboardGallery";

export function KeyFeaturesSection() {
  return (
    <section id="features" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-brand uppercase">
          Key features
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Dashboard untuk semua kebutuhan workflow
        </h2>

        <div className="mt-14 w-full">
          <DashboardGallery />
        </div>
      </div>
    </section>
  );
}
