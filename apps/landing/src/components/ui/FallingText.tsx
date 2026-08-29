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
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
    return;
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
      style={{ position: 'relative' }}
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
