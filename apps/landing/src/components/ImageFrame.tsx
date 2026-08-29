import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageFrameProps = {
  label?: string;
  ratio?: string;
  className?: string;
  
  src?: string;
  alt?: string;
};

export function ImageFrame({
  label = "your image",
  ratio = "16 / 9",
  className,
  src,
  alt,
}: ImageFrameProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? label}
        loading="lazy"
        style={{ aspectRatio: ratio }}
        className={cn("w-full rounded-xl object-cover", className)}
      />
    );
  }

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn("frame-placeholder w-full rounded-xl", className)}
    >
      <div className="flex flex-col items-center gap-2 px-4">
        <ImageIcon className="h-6 w-6 opacity-60" aria-hidden />
        <span className="text-xs font-semibold tracking-[0.18em] uppercase opacity-80">
          {label}
        </span>
      </div>
    </div>
  );
}
