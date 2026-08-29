import { GridCross } from "@/components/landing/ui/GridCross";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { ImageFrame } from "@/components/ImageFrame";
import type { OperationItem } from "@/types/landingtypes";

const OPERATIONS: OperationItem[] = [
  {
    title: "Policy Lifecycle Management",
    body: "Create, edit, and renew policies in one place with fast, accurate workflows.",
    label: "your image — lifecycle chart",
    ratio: "4 / 3",
  },
  {
    title: "Document Tracking & Validation",
    body: "Easily upload and verify documents with AI checks for missing or expired files.",
    label: "your image — document validation",
    ratio: "4 / 3",
  },
  {
    title: "Smart Alerts & Renewals",
    body: "Stay on track with automated reminders, custom alerts, and bulk renewals.",
    label: "your image — smart alerts",
    ratio: "4 / 3",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <DotPattern className="!-z-10 text-foreground/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]" />
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-brand uppercase">
          About Us
        </p>
        <h2 className="mx-auto mt-4 max-w-xl text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Effortless Insurance Operations
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {OPERATIONS.map((item) => (
            <article key={item.title} className="text-center">
              <ImageFrame
                label={item.label}
                ratio={item.ratio}
                className="rounded-2xl bg-card shadow-card"
              />
              <h3 className="mt-8 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
