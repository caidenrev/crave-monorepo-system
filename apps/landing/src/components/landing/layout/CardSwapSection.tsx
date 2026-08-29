import { GridCross } from "@/components/landing/ui/GridCross";
import CardSwap, { Card } from "@/components/ui/CardSwap";

export function CardSwapSection() {
  return (
    <section id="card-swap" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

        <div className="relative bg-hero overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
          {}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src="/image/cloud.png"
              alt=""
              className="absolute -top-[5%] -left-[5%] w-[400px] opacity-20 blur-[2px]"
            />
            <img
              src="/image/cloud (2).png"
              alt=""
              className="absolute top-[20%] right-[-5%] w-[350px] opacity-30"
            />
            <img
              src="/image/cloud.png"
              alt=""
              className="absolute top-[60%] left-[10%] w-[450px] opacity-15 blur-[1px]"
            />
          </div>

          {}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 h-[150px] w-full bg-gradient-to-t from-background to-transparent"></div>

          <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-16 md:py-0 z-10">
            <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl mb-4 max-w-md">
              Semua bisa pakai
            </h2>
            <p className="text-lg text-brand-foreground/85 max-w-md">
              Dashboard mudah <br /> dipahami untuk semua pengguna
            </p>
          </div>

          <div className="flex-1 relative min-h-[400px]">
            <CardSwap
              width={700}
              height={500}
              cardDistance={60}
              verticalDistance={70}
              delay={3000}
              pauseOnHover={true}
            >
              <Card className="overflow-hidden bg-black border border-white/20 shadow-2xl">
                <img
                  src="/image/hero.png"
                  alt="Dashboard Mockup"
                  className="w-full h-full object-cover object-left-top opacity-70"
                />
              </Card>
              <Card className="overflow-hidden bg-black border border-white/20 shadow-2xl">
                <img
                  src="/image/solution.png"
                  alt="Solution Mockup"
                  className="w-full h-full object-cover object-left-top opacity-70"
                />
              </Card>
              <Card className="overflow-hidden bg-black border border-white/20 shadow-2xl">
                <img
                  src="/image/hero.png"
                  alt="Dashboard Alternative"
                  className="w-full h-full object-cover object-left-top opacity-70"
                />
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
