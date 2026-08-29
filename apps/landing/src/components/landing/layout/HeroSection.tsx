import { Button } from "@/components/ui/button";
import { ImageFrame } from "@/components/ImageFrame";
import { POS_URL } from "@/lib/utils";


export function HeroSection() {
  return (
    <header className="bg-hero relative overflow-hidden pb-24">
      {}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/image/cloud.png"
          alt=""
          className="absolute -top-[5%] -left-[5%] w-[500px] opacity-20 blur-[2px]"
        />
        <img
          src="/image/cloud (2).png"
          alt=""
          className="absolute top-[10%] right-[-5%] w-[400px] opacity-30"
        />
        <img
          src="/image/cloud.png"
          alt=""
          className="absolute top-[30%] left-[10%] w-[300px] opacity-15 blur-[1px]"
        />
        <img
          src="/image/cloud (2).png"
          alt=""
          className="absolute top-[40%] right-[15%] w-[450px] opacity-20 blur-[3px]"
        />
        <img
          src="/image/cloud.png"
          alt=""
          className="absolute top-[60%] left-[-10%] w-[600px] opacity-25"
        />
        <img
          src="/image/cloud (2).png"
          alt=""
          className="absolute top-[75%] right-[-10%] w-[550px] opacity-20 blur-[2px]"
        />
        <img
          src="/image/cloud.png"
          alt=""
          className="absolute top-[80%] left-[20%] w-[350px] opacity-30 blur-[1px]"
        />
      </div>

      {}
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 text-center">
        <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-brand-foreground sm:text-5xl md:text-6xl">
          Kelola bisnis anda di dalam #1 Software
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm text-brand-foreground/85 sm:text-base">
          Otomatisasi pengelolaan bisnis ada dengan crave yang mampu memangkas waktu workflow dan
          managemen dengan satu software yang anda bisa kelola dimanapun
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            className="h-11 rounded-full bg-white px-7 text-sm font-bold text-[#1B5CFE] hover:bg-slate-50 shadow-md transition-colors"
          >
            <a href={POS_URL}>Coba Sekarang</a>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-14 max-w-[1120px] px-6">
        {}
        <div className="shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] relative rounded-[2rem] border border-white/10 bg-white/10 p-2 backdrop-blur-2xl sm:p-3">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/5 to-transparent"></div>

          {}
          <div className="relative z-10 overflow-hidden rounded-[1.25rem] bg-card shadow-2xl border border-white/10">
            {}
            <ImageFrame src="/image/hero.png" ratio="16 / 10" className="w-full" />
          </div>
        </div>
      </div>

      {}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-50 h-[250px] w-full bg-gradient-to-t from-background via-background/95 to-transparent"></div>
    </header>
  );
}
