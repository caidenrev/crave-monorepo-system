import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { HeroSection } from "@/components/landing/layout/HeroSection";
import { LogosSection } from "@/components/landing/layout/LogosSection";
import { SolutionsSection } from "@/components/landing/layout/SolutionsSection";
import { BentoFeaturesSection } from "@/components/landing/layout/BentoFeaturesSection";
import { AboutSection } from "@/components/landing/layout/AboutSection";
import { FallingObjectsSection } from "@/components/landing/layout/FallingObjectsSection";
import { CardSwapSection } from "@/components/landing/layout/CardSwapSection";
import { KeyFeaturesSection } from "@/components/landing/layout/KeyFeaturesSection";
import { PricingSectionLayout } from "@/components/landing/layout/PricingSectionLayout";
import { TestimonialsSection } from "@/components/landing/layout/TestimonialsSection";
import { FaqSection } from "@/components/landing/layout/FaqSection";
import { CtaSection } from "@/components/landing/layout/CtaSection";
import { Footer } from "@/components/ui/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crave — Kelola bisnis anda di dalam #1 Software" },
      {
        name: "description",
        content: "Crave mempermudah manajemen bisnis.",
      },
      { property: "og:title", content: "Crave — Kelola bisnis anda di dalam #1 Software" },
      {
        property: "og:description",
        content:
          "Track policies, monitor documents, and never miss a renewal with one insurance dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <LogosSection />
      <SolutionsSection />
      <BentoFeaturesSection />
      <AboutSection />
      <FallingObjectsSection />
      <CardSwapSection />
      <KeyFeaturesSection />
      <PricingSectionLayout />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
