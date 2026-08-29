import type { BrandLogoItem } from "@/types/landingtypes";

const LOGOS: BrandLogoItem[] = [
  { src: "/logo/AWS Logo - Colored - zonalogo.com.svg", alt: "AWS" },
  { src: "/logo/Azure Logo - Colored - zonalogo.com.svg", alt: "Azure" },
  { src: "/logo/Google Cloud Icon - Colored - zonalogo.com.svg", alt: "Google Cloud" },
  { src: "/logo/Supabase Icon - Colored - zonalogo.com.svg", alt: "Supabase" },
];

export function LogosSection() {
  return (
    <section className="border-b border-border bg-background py-14">
      <p className="text-center text-[11px] font-bold tracking-[0.25em] text-brand uppercase">
        Trusted by leaders
      </p>
      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-10 px-6 sm:gap-20">
        {LOGOS.map((logo) => (
          <img
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            className="h-10 w-auto opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:brightness-200 dark:contrast-200 dark:grayscale dark:hover:brightness-100 dark:hover:contrast-100 dark:hover:grayscale-0"
          />
        ))}
      </div>
    </section>
  );
}
