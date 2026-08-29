# Panduan Migrasi Section Falling Object

Kamu bisa langsung *copy-paste* prompt di bawah ini dan memberikannya ke AI (misalnya Cursor, ChatGPT, atau Claude) beserta file ini, agar AI tersebut dapat menyalin komponen dan section-nya secara otomatis.

***

## 1. Prompt untuk AI

> **Instruksi untuk AI:**
> Tolong bantu saya memindahkan section 'Falling Objects' (Interactive Keywords) dari dokumen ini ke halaman web saya (misalnya di `d:\canvas-chime-creation\src\routes\index.tsx` atau file tujuan lainnya).
> 
> Berikut adalah langkah-langkah yang harus kamu lakukan:
> 1. **Install Dependencies:** Pastikan library `matter-js` sudah terinstall di project tujuan. Jika belum, jalankan `npm install matter-js` (dan `npm install -D @types/matter-js` jika menggunakan TypeScript). Pastikan juga `lucide-react` sudah terinstall.
> 2. **Buat Komponen UI:** Buat file `FallingText.tsx` dan `FallingText.css` di dalam folder UI project tujuan (misalnya `src/components/ui/` atau lokasi yang sesuai). Salin kode referensi A dan B dari dokumen ini ke dalam file-file tersebut.
> 3. **Implementasi ke Halaman Tujuan:** Buka file halaman utama tujuan. Lakukan import untuk komponen `FallingText` dan ikon dari `lucide-react` (`ImageIcon`, `MessageSquare`, `FileText`, `Video`).
> 4. **Salin Kode Section:** Masukkan blok kode `<section>` referensi C ke dalam file tujuan tersebut. Jika di project tujuan belum ada komponen `BlurText`, ganti saja tag `<BlurText>` pada judul menjadi tag `<h2>` dan `<p>` biasa.
> 5. **Verifikasi:** Pastikan tidak ada error *import* atau *syntax* pada file tujuan setelah proses penyalinan selesai.

***

## 2. Referensi Kode untuk Disalin

### Referensi A: `FallingText.tsx`
```tsx
"use client";
import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import './FallingText.css';

const blueClasses = [
  'bg-blue-100 text-blue-900 border-blue-200',
  'bg-blue-200 text-blue-950 border-blue-300',
  'bg-blue-300 text-blue-950 border-blue-400',
  'bg-blue-400 text-white border-blue-500',
  'bg-blue-500 text-white border-blue-600',
  'bg-blue-600 text-white border-blue-700',
  'bg-blue-700 text-white border-blue-800',
  'bg-blue-800 text-blue-50 border-blue-900',
  'bg-blue-900 text-blue-50 border-blue-950',
  'bg-slate-800 text-blue-400 border-slate-700'
];

interface FallingTextProps {
  className?: string;
  text?: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: 'auto' | 'scroll' | 'click' | 'hover';
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
  children?: React.ReactNode;
}

const FallingText = ({
  className = '',
  text = '',
  highlightWords = [],
  highlightClass = 'highlighted',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '1rem',
  children
}: FallingTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [effectStarted, setEffectStarted] = useState(false);

  useEffect(() => {
    if (!textRef.current || children) return;
    const words = text.split(' ');
    const shuffledBlues = [...blueClasses].sort(() => Math.random() - 0.5);

    const newHTML = words
      .map((word, i) => {
        const isHighlighted = highlightWords.some(hw => word.startsWith(hw));
        const colorClass = shuffledBlues[i % shuffledBlues.length];
        return `<span class="word rounded-full px-5 py-2.5 border-2 shadow-lg font-bold transition-transform hover:scale-110 cursor-grab active:cursor-grabbing ${colorClass} ${isHighlighted ? highlightClass : ''}">${word}</span>`;
      })
      .join(' ');
    textRef.current.innerHTML = newHTML;
  }, [text, highlightWords, highlightClass]);

  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true);
      return;
    }
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  useEffect(() => {
    if (!effectStarted) return;
    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;
    const containerRect = containerRef.current!.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainerRef.current!,
      engine,
      options: { width, height, background: backgroundColor, wireframes }
    });

    const boundaryOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    const floor = Bodies.rectangle(width / 2, height + 50, width + 200, 100, boundaryOptions);
    const ceiling = Bodies.rectangle(width / 2, -50, width + 200, 100, boundaryOptions);
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height + 200, boundaryOptions);
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height + 200, boundaryOptions);

    const wordSpans = textRef.current!.querySelectorAll('.word, .matter-element');
    const wordBodies = [...wordSpans].map(elem => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      const isCircle = elem.classList.contains('rounded-full');
      const radius = isCircle ? rect.height / 2 : 16;
      
      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.02,
        friction: 0.1,
        chamfer: { radius: [radius, radius, radius, radius] }
      });

      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: 0 });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      return { elem: elem as HTMLElement, body };
    });

    wordBodies.forEach(({ elem }) => {
      elem.style.position = 'absolute';
      elem.style.left = `0px`;
      elem.style.top = `0px`;
      elem.style.margin = `0px`;
      elem.style.transform = 'none';
    });

    const mouse = Mouse.create(containerRef.current!);
    const m = mouse as any;
    mouse.element.removeEventListener("wheel", m.mousewheel);
    mouse.element.removeEventListener("mousewheel", m.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    mouse.element.removeEventListener("touchmove", m.mousemove);
    mouse.element.removeEventListener("touchstart", m.mousedown);
    mouse.element.removeEventListener("touchend", m.mouseup);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: mouseConstraintStiffness, render: { visible: false } }
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map(wb => wb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    let animationFrameId: number;
    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(scrollDelta) > 2) {
        wordBodies.forEach(({ body }) => {
          Matter.Body.setVelocity(body, {
            x: body.velocity.x + (Math.random() - 0.5) * 1.5,
            y: body.velocity.y + (scrollDelta * -0.05)
          });
          Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.1);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  const handleTrigger = () => {
    if (!effectStarted && (trigger === 'click' || trigger === 'hover')) {
      setEffectStarted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`falling-text-container ${className}`}
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
      style={{ position: 'relative', overflow: 'hidden' }}
      suppressHydrationWarning
    >
      <div
        ref={textRef}
        className="falling-text-target"
        style={{ fontSize: fontSize, lineHeight: 1.6 }}
      >
        {children}
      </div>
      <div ref={canvasContainerRef} className="falling-text-canvas pointer-events-none" />
    </div>
  );
};
export default FallingText;
```

### Referensi B: `FallingText.css`
```css
.falling-text-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: 2em;
}

.falling-text-target {
  display: inline-block;
}

.word {
  display: inline-block;
  margin: 0 4px;
  user-select: none;
  white-space: nowrap;
}

.falling-text-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
```

### Referensi C: Kode Halaman Section
```tsx
{/* 
  PENTING: Jangan lupa import ikon dan komponen UI di atas file tujuan:
  import { ImageIcon, MessageSquare, FileText, Video } from "lucide-react"
  import FallingText from "@/components/ui/FallingText" // sesuaikan import path
*/}

<section className="w-full py-24 relative z-10 bg-white dark:bg-slate-900 border-b border-border overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 text-center mb-12">
    <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight justify-center text-blue-600 dark:text-blue-500">
      Semua yang anda butuhkan
    </h2>
    <p className="text-xl text-muted-foreground justify-center text-center mt-2">
      Semua software untuk kebutuhan otomatisasi pekerjaan dan bisnis anda
    </p>
  </div>
  
  <div className="w-full h-[450px] md:h-[500px] relative border-y border-border bg-slate-50 dark:bg-slate-950/50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">
    <FallingText
      trigger="scroll"
      backgroundColor="transparent"
      gravity={0.56}
      mouseConstraintStiffness={0.9}
    >
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 max-w-5xl mx-auto pt-2 md:pt-4">
        
        {/* Alicia Lopez */}
        <div className="matter-element inline-flex items-center gap-3 md:gap-4 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 p-3 md:p-4 pr-8 md:pr-10 w-64 md:w-80 cursor-grab active:cursor-grabbing">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alicia&backgroundColor=f8fafc" className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-100 shrink-0 pointer-events-none" alt="Avatar" />
          <div className="text-left pointer-events-none">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-tight"><strong>Alicia Lopez</strong> downloaded your image <strong>Sidebar-bug.gif</strong></p>
            <span className="text-[10px] md:text-xs text-slate-400 block mt-1">March 26 02:16pm</span>
          </div>
        </div>
        <div className="matter-element rounded-2xl inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-indigo-500 text-white shadow-[0_8px_15px_rgba(99,102,241,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
          <ImageIcon className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" />
        </div>

        {/* Mark Whitney */}
        <div className="matter-element inline-flex items-center gap-4 md:gap-5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 p-4 md:p-5 pr-10 md:pr-12 w-72 md:w-96 cursor-grab active:cursor-grabbing">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mark&backgroundColor=f8fafc" className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-100 shrink-0 pointer-events-none" alt="Avatar" />
          <div className="text-left pointer-events-none">
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-tight"><strong>Mark Whitney</strong> left a comment on your video <strong>Onboard-explainer.mp4</strong></p>
            <span className="text-xs md:text-sm text-slate-400 block mt-1">March 14 05:06pm</span>
          </div>
        </div>
        <div className="matter-element rounded-2xl inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-purple-500 text-white shadow-[0_8px_15px_rgba(168,85,247,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8 pointer-events-none" />
        </div>

        {/* Eric James */}
        <div className="matter-element inline-flex items-center gap-4 md:gap-5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 p-4 md:p-5 pr-10 md:pr-12 w-72 md:w-96 cursor-grab active:cursor-grabbing">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Eric&backgroundColor=f8fafc" className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-100 shrink-0 pointer-events-none" alt="Avatar" />
          <div className="text-left pointer-events-none">
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-tight"><strong>Eric James</strong> Shared a document <strong>Contract-draft.pdf</strong> with you</p>
            <span className="text-xs md:text-sm text-slate-400 block mt-1">Nov 29 05:06pm</span>
          </div>
        </div>
        <div className="matter-element rounded-2xl inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-blue-500 text-white shadow-[0_8px_15px_rgba(59,130,246,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
          <FileText className="w-6 h-6 md:w-8 md:h-8 pointer-events-none" />
        </div>

        {/* Lisa Jones */}
        <div className="matter-element inline-flex items-center gap-3 md:gap-4 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800 p-3 md:p-4 pr-8 md:pr-10 w-64 md:w-80 cursor-grab active:cursor-grabbing">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=f8fafc" className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-100 shrink-0 pointer-events-none" alt="Avatar" />
          <div className="text-left pointer-events-none">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-tight"><strong>Lisa Jones</strong> viewed your video <strong>Promo-feb.mp4</strong></p>
            <span className="text-[10px] md:text-xs text-slate-400 block mt-1">March 14 11:36am</span>
          </div>
        </div>
        <div className="matter-element rounded-2xl inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-amber-500 text-white shadow-[0_8px_15px_rgba(245,158,11,0.4)] border-2 md:border-[3px] border-white dark:border-slate-900 cursor-grab active:cursor-grabbing">
          <Video className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" />
        </div>

      </div>
    </FallingText>
  </div>
</section>
```
