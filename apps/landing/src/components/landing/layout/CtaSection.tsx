import { Button } from "@/components/ui/button";
import { POS_URL } from "@/lib/utils";


export function CtaSection() {
  return (
    <section id="cta" className="pt-32 pb-24 md:pt-48 md:pb-32 bg-white relative overflow-visible">
      <div className="relative z-0 mx-auto max-w-6xl px-6 md:px-0">
        {}
        <div className="md:hidden relative z-10 w-full text-left mb-12">
          <div className="flex items-center gap-2 mb-6">
            <img
              src="/image/logo/light-mode-logo.png"
              alt="Crave Logo"
              className="h-9 sm:h-11 w-auto"
            />
            <span className="font-bold text-2xl sm:text-3xl tracking-tight text-slate-900">
              Crave
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8 leading-[1.1] text-slate-900">
            Mulailah otomatisasi bisnis anda
          </h2>
          <Button
            asChild
            className="h-12 sm:h-14 rounded-full bg-[#1B5CFE] px-8 sm:px-10 text-base sm:text-lg font-bold text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-xl"
          >
            <a href={POS_URL}>Coba Sekarang</a>
          </Button>
        </div>

        {}
        <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-[#1B5CFE] px-6 py-10 md:px-12 md:py-16 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between h-[180px] sm:h-[250px] md:h-auto mt-36 sm:mt-48 md:mt-0">
          {}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] sm:rounded-[3rem] pointer-events-none flex items-center justify-center">
            <h1 className="text-[40vw] md:text-[22rem] leading-none font-bold text-white/10 tracking-tighter select-none">
              crave
            </h1>
          </div>

          {}
          <div className="hidden md:block relative z-10 w-full md:w-[55%] text-left text-white">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/image/logo/dark-mode-logo.png"
                alt="Crave Logo"
                className="h-9 sm:h-11 w-auto"
              />
              <span className="font-bold text-2xl sm:text-3xl tracking-tight text-white">
                Crave
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] max-w-xl">
              Mulailah otomatisasi <br /> bisnis anda
            </h2>
            <Button
              asChild
              className="h-12 sm:h-14 rounded-full bg-white px-8 sm:px-10 text-base sm:text-lg font-bold text-[#1B5CFE] hover:bg-slate-50 hover:scale-105 transition-all shadow-xl"
            >
              <a href={POS_URL}>Coba Sekarang</a>
            </Button>
          </div>

          {}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex justify-center md:justify-end items-end h-[220%] sm:h-[180%] md:h-[125%] lg:h-[135%] rounded-b-[2rem] sm:rounded-b-[3rem] overflow-hidden">
            <img
              src="/image/model-phone.png"
              alt="Phone Mockup"
              className="h-full w-auto relative md:right-[-10%] lg:right-[-15%] drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] object-contain object-bottom pointer-events-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
