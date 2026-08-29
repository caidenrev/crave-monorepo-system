import { cn } from "@/lib/utils";

interface GridCrossProps {
  className?: string;
}

export function GridCross({ className }: GridCrossProps) {
  return (
    <svg
      className={cn("absolute text-foreground/25 hidden md:block", className)}
      width="31"
      height="31"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.5 0V31M0 15.5H31" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
