import { Users, UserCog, LayoutTemplate, Store } from "lucide-react";
import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import FallingText from "@/components/ui/FallingText";

export function FallingObjectsSection() {
  return (
    <section className="border-b border-foreground/15 overflow-hidden">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Semua yang anda butuhkan
          </h2>
          <p className="text-lg text-muted-foreground justify-center text-center mt-2">
            Semua software untuk kebutuhan otomatisasi pekerjaan dan bisnis anda
          </p>
        </div>

        <div className="relative -mx-6 mt-12 border-y border-foreground/15">
          <GridCross className="absolute -top-[15.5px] -left-[15.5px] z-10" />
          <GridCross className="absolute -top-[15.5px] -right-[15.5px] z-10" />
          <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
          <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
          <div className="h-[450px] md:h-[500px] relative overflow-hidden">
            <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
            <FallingText
              trigger="scroll"
              backgroundColor="transparent"
              gravity={0.56}
              mouseConstraintStiffness={0.9}
            >
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 max-w-5xl mx-auto pt-2 md:pt-4">
                {}
                <div className="matter-element inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl md:text-4xl px-8 md:px-12 py-4 md:py-6 rounded-[50px] rounded-full shadow-lg cursor-grab active:cursor-grabbing">
                  CRM
                </div>
                <div className="matter-element rounded-2xl inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-indigo-500 text-white shadow-[0_8px_15px_rgba(99,102,241,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
                  <Users className="w-8 h-8 md:w-10 md:h-10 pointer-events-none" />
                </div>

                {}
                <div className="matter-element inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl md:text-4xl px-8 md:px-12 py-4 md:py-6 rounded-[50px] rounded-full shadow-lg cursor-grab active:cursor-grabbing">
                  HRM
                </div>
                <div className="matter-element rounded-2xl inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-purple-500 text-white shadow-[0_8px_15px_rgba(168,85,247,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
                  <UserCog className="w-8 h-8 md:w-10 md:h-10 pointer-events-none" />
                </div>

                {}
                <div className="matter-element inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl md:text-4xl px-8 md:px-12 py-4 md:py-6 rounded-[50px] rounded-full shadow-lg cursor-grab active:cursor-grabbing">
                  CMS
                </div>
                <div className="matter-element rounded-2xl inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-emerald-500 text-white shadow-[0_8px_15px_rgba(16,185,129,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
                  <LayoutTemplate className="w-8 h-8 md:w-10 md:h-10 pointer-events-none" />
                </div>

                {}
                <div className="matter-element inline-flex items-center justify-center bg-blue-600 text-white font-black text-2xl md:text-4xl px-8 md:px-12 py-4 md:py-6 rounded-[50px] rounded-full shadow-lg cursor-grab active:cursor-grabbing">
                  POS
                </div>
                <div className="matter-element rounded-2xl inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-amber-500 text-white shadow-[0_8px_15px_rgba(245,158,11,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
                  <Store className="w-8 h-8 md:w-10 md:h-10 pointer-events-none" />
                </div>
              </div>
            </FallingText>
          </div>
        </div>
      </div>
    </section>
  );
}
