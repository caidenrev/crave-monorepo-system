"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestimonialData {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  bgColor: string;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialData[];
  className?: string;
}

export function TestimonialCarousel({ testimonials, className }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className={cn("relative w-full max-w-6xl mx-auto py-10 overflow-hidden min-h-[500px]", className)}>
      <div className="relative h-[450px] w-full flex justify-center items-center">
        {testimonials.map((item, index) => {
          
          let offset = index - activeIndex;
          if (offset < -1) offset += testimonials.length;
          if (offset > 1) offset -= testimonials.length;
          
          
          const isActive = offset === 0;
          const isPrev = offset === -1 || (offset < -1 && index === testimonials.length - 1);
          const isNext = offset === 1 || (offset > 1 && index === 0);

          
          if (!isActive && !isPrev && !isNext) return null;

          
          let transformStyle = '';
          let zIndex = 10;
          let opacity = 1;

          if (isActive) {
            transformStyle = 'translateX(0) scale(1)';
            zIndex = 30;
          } else if (isPrev) {
            transformStyle = 'translateX(-30%) scale(0.85)';
            zIndex = 20;
          } else if (isNext) {
            transformStyle = 'translateX(30%) scale(0.85)';
            zIndex = 20;
          }

          return (
            <div
              key={item.id}
              className={cn(
                "absolute top-0 w-full max-w-4xl h-full transition-all duration-500 ease-in-out cursor-pointer",
                isActive ? "shadow-[0_20px_50px_rgba(0,0,0,0.1)]" : "shadow-md"
              )}
              style={{
                transform: transformStyle,
                zIndex: zIndex,
                opacity: opacity,
              }}
              onClick={() => {
                if (isPrev) handlePrev();
                if (isNext) handleNext();
              }}
            >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white flex flex-col md:flex-row border border-slate-100">
                
                {}
                {!isActive && (
                  <div className="absolute inset-0 bg-blue-500/80 z-50 transition-opacity duration-500 rounded-[2rem]" />
                )}

                {}
                <div 
                  className={cn("w-full md:w-[40%] h-48 md:h-full relative overflow-hidden flex items-end justify-center", item.bgColor)}
                >
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="w-[85%] h-auto max-h-[95%] object-contain object-bottom drop-shadow-2xl mix-blend-luminosity opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {}
                <div className="w-full md:w-[60%] p-8 md:p-14 flex flex-col justify-center relative">
                  <Quote className="absolute top-10 right-10 w-28 h-28 text-slate-100 -z-10" fill="currentColor" />
                  
                  <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium mb-8 relative z-10">
                    "{item.quote}"
                  </p>
                  
                  <div className="mt-auto relative z-10">
                    <h4 className="text-2xl font-bold text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-500 italic mt-1">{item.role}</p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 z-40">
        <button 
          onClick={handlePrev}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all hover:scale-105 border border-blue-100 focus:outline-none"
        >
          <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 z-40">
        <button 
          onClick={handleNext}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all hover:scale-105 border border-blue-100 focus:outline-none"
        >
          <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

    </div>
  );
}
