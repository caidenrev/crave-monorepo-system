import { GridCross } from "@/components/landing/ui/GridCross";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { TestimonialCarousel, type TestimonialData } from "@/components/ui/TestimonialCarousel";

const TESTIMONIAL_DATA: TestimonialData[] = [
  {
    id: 1,
    name: "Mark Lee",
    role: "Illustrator",
    quote:
      "I couldn't have asked for more than this. Course is worth much more than I paid. Your company is truly upstanding and is behind its product 100%.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark&backgroundColor=transparent",
    bgColor: "bg-teal-400",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "UX Designer",
    quote:
      "The interface is so intuitive and beautiful. It completely changed how our team collaborates on projects daily. Highly recommended!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=transparent",
    bgColor: "bg-blue-400",
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Product Manager",
    quote:
      "We've seen a 40% increase in productivity since switching. The features are exactly what we needed to scale our operations effectively.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=transparent",
    bgColor: "bg-indigo-400",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-b border-foreground/15">
      <div className="relative z-0 mx-auto max-w-6xl md:border-x border-foreground/15 px-6 py-24">
        <GridCross className="absolute -bottom-[15.5px] -left-[15.5px] z-10" />
        <GridCross className="absolute -bottom-[15.5px] -right-[15.5px] z-10" />
        <StripedPattern className="!-z-10 text-foreground/20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)]" />
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-blue-500 uppercase">
          Testimonials
        </p>
        <div className="flex flex-col items-center mt-4">
          <h2 className="mx-auto max-w-xl text-center text-3xl font-bold tracking-tight text-blue-800 sm:text-4xl">
            Apa kata pengguna kita?
          </h2>
          <div className="w-16 h-1 mt-4 bg-teal-400 rounded-full"></div>
        </div>

        <div className="mt-4">
          <TestimonialCarousel testimonials={TESTIMONIAL_DATA} />
        </div>
      </div>
    </section>
  );
}
