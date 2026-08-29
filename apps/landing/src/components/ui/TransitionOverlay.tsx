"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function TransitionOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [isHome, setIsHome] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const { contextSafe } = useGSAP({ scope: containerRef });

  
  useGSAP(() => {
    setIsActive(true);
    setIsHome(true);
    
    const tl = gsap.timeline({
      onComplete: () => {
        setIsActive(false);
      },
    });

    gsap.set(containerRef.current, { autoAlpha: 1 });
    gsap.set([layer1Ref.current, layer2Ref.current, layer3Ref.current], { 
      yPercent: 100,
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "0%",
      borderBottomRightRadius: "0%"
    });
    
    gsap.set(textRef.current, { autoAlpha: 0, y: 20 });

    tl.to([layer1Ref.current, layer2Ref.current, layer3Ref.current], {
      yPercent: 0,
      borderTopLeftRadius: "0%",
      borderTopRightRadius: "0%",
      duration: 0.8,
      ease: "power4.inOut",
      stagger: 0.1,
    })
    .to(textRef.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2")
    .to(textRef.current, {
      autoAlpha: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in"
    }, "+=0.6")
    .to([layer3Ref.current, layer2Ref.current, layer1Ref.current], {
      yPercent: -100,
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      duration: 0.8,
      ease: "power4.inOut",
      stagger: 0.1, 
    }, "-=0.1")
    .set(containerRef.current, { autoAlpha: 0 });
  }, { scope: containerRef });

  const triggerTransition = contextSafe((href: string, name: string, isHomeParam = false) => {
    if (isActive) return;
    setIsActive(true);
    setText(name);
    setIsHome(isHomeParam);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsActive(false);
      },
    });

    gsap.set(containerRef.current, { autoAlpha: 1 });
    
    gsap.set([layer1Ref.current, layer2Ref.current, layer3Ref.current], { 
      yPercent: 100,
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "0%",
      borderBottomRightRadius: "0%"
    });
    
    gsap.set(textRef.current, { autoAlpha: 0, y: 20 });

    tl.to([layer1Ref.current, layer2Ref.current, layer3Ref.current], {
      yPercent: 0,
      borderTopLeftRadius: "0%",
      borderTopRightRadius: "0%",
      duration: 0.8,
      ease: "power4.inOut",
      stagger: 0.1,
    })
    .to(textRef.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2")
    .call(() => {
      if (href.startsWith("#")) {
        const id = href.substring(1);
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "instant" });
        }
      } else if (href === "/") {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }, [], "+=0.3")
    .to(textRef.current, {
      autoAlpha: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in"
    })
    .to([layer3Ref.current, layer2Ref.current, layer1Ref.current], {
      yPercent: -100,
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      duration: 0.8,
      ease: "power4.inOut",
      stagger: 0.1, 
    }, "-=0.1")
    .set(containerRef.current, { autoAlpha: 0 });

  });

  useEffect(() => {
    const handleTransition = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string; name: string; isHome?: boolean }>;
      triggerTransition(customEvent.detail.href, customEvent.detail.name, customEvent.detail.isHome);
    };

    window.addEventListener("start-page-transition", handleTransition);
    return () => window.removeEventListener("start-page-transition", handleTransition);
  }, [triggerTransition]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none invisible flex items-center justify-center overflow-hidden"
    >
      <div
        ref={layer1Ref}
        className="absolute inset-0 bg-blue-400 w-full h-full"
      />
      <div
        ref={layer2Ref}
        className="absolute inset-0 bg-blue-600 w-full h-full"
      />
      <div
        ref={layer3Ref}
        className="absolute inset-0 bg-[#1B5CFE] w-full h-full"
      />
      <div
        ref={textRef}
        className="relative z-10 flex flex-col items-center justify-center gap-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      >
        {isHome ? (
          <img src="/image/logo/dark-mode-logo.png" alt="Crave" className="h-16 md:h-24 w-auto object-contain" />
        ) : (
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            {text}
          </h2>
        )}
      </div>
    </div>
  );
}
