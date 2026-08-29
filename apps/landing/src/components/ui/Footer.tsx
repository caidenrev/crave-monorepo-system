"use client";

import React from 'react';
import { Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-transparent to-brand/90 pt-24 pb-8 border-t border-slate-100">

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col min-h-[400px]">

        {}
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">

          {}
          <div className="flex flex-col gap-8">

            {}
            <div className="flex items-center gap-4">
              <a href="#" className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" strokeWidth={2} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" strokeWidth={2} />
              </a>
            </div>

            {}
            <a href="mailto:hello@crave.com" className="text-2xl font-medium text-slate-900 hover:opacity-80 transition-opacity">
              hello@crave.com
            </a>

            {}
            <div className="text-sm text-slate-500 leading-relaxed font-medium max-w-xs">
              <p>Jl Jendral Sudirman</p>
              <p>MSIG Tower Floor 38</p>
              <p>Jakarta Selatan</p>
            </div>
            {}
            <div className="flex flex-col gap-2 text-xs font-medium text-slate-500 mt-4">
              <a href="#" className="hover:text-slate-900 underline decoration-slate-300 underline-offset-4">Terms and conditions</a>
              <a href="#" className="hover:text-slate-900 underline decoration-slate-300 underline-offset-4">Privacy Policy</a>
              <p className="mt-2">© {new Date().getFullYear()} Crave. All Rights Reserved</p>
            </div>

          </div>

          {}
          <div className="flex flex-col gap-4 text-left md:text-right">
            {['Platform', 'Use Cases', 'Resources', 'Services', 'About'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xl md:text-2xl text-slate-900 hover:text-blue-600 transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </div>

        </div>
      </div>

      {}
      <div className="absolute bottom-[-2%] md:bottom-[-10%] left-0 w-full flex justify-center items-end pointer-events-none select-none z-0">
        <h1 className="text-[35vw] md:text-[25vw] leading-none font-bold text-white/20 tracking-[0.05em] mix-blend-overlay">
          crave
        </h1>
      </div>

    </footer>
  );
}
