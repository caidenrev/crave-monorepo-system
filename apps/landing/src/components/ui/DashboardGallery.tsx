import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 0,
    image: "/image/hero.png",
    title: "Crave POS",
    desc: "Keep every policy audit-ready with automated document monitoring.",
  },
  {
    id: 1,
    image: "/image/solution.png",
    title: "Crave HRM",
    desc: "View total usage, remaining capacity, and detailed breakdowns.",
  },
  {
    id: 2,
    image: "/image/hero.png",
    title: "Crave ITSM",
    desc: "Instantly see which files are valid, pending review, or expired.",
  },
];

export function DashboardGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full flex flex-col gap-6">
      {}
      <div className="relative w-full rounded-2xl border border-foreground/15 bg-card overflow-hidden shadow-2xl flex flex-col">
        {}
        <div className="flex h-10 w-full items-center gap-2 border-b border-foreground/15 bg-muted/30 px-4">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
        </div>

        {}
        <div className="relative flex-1 bg-background/50">
          {}
          <img
            src={slides[activeIndex]?.image || ""}
            alt="placeholder"
            className="w-full h-auto opacity-0 pointer-events-none"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, filter: "blur(8px)", scale: 1.02 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={slides[activeIndex]?.image || ""}
                alt={slides[activeIndex]?.title || ""}
                className="w-full h-full object-contain object-top"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {slides.map((slide, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "group relative text-left flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-2 sm:p-4 transition-all duration-300",
                isActive
                  ? "border-brand bg-brand/5 shadow-md"
                  : "border-foreground/10 bg-card hover:border-foreground/30 hover:bg-muted/50"
              )}
            >
              <div className="w-full aspect-[16/9] overflow-hidden rounded-md sm:rounded-lg border border-foreground/10">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={cn(
                    "w-full h-full object-cover object-top transition-transform duration-500",
                    isActive ? "scale-100" : "scale-105 opacity-60 group-hover:opacity-100 group-hover:scale-100"
                  )}
                />
              </div>
              <div>
                <h4 className={cn("font-semibold text-[10px] leading-tight sm:text-base", isActive ? "text-brand" : "text-foreground")}>
                  {slide.title}
                </h4>
                <div className="hidden sm:block mt-1">
                  <p className="text-[9px] leading-tight sm:text-xs text-muted-foreground line-clamp-2">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
