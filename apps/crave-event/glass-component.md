# Glass Components (React + Tailwind + shadcn)

Simpan semuanya di `components/ui/glass.tsx`. Butuh `cn` dari `@/lib/utils`, `class-variance-authority`, dan `lucide-react` (bawaan shadcn).

> Kaca hanya terlihat bagus kalau ada background berwarna/gambar di belakangnya.

## 1. Dasar kaca (dipakai semua komponen)

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const glassBase = [
  "relative isolate overflow-hidden text-white",
  "bg-white/10 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110",
  "border border-white/25",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),inset_0_-1px_0_0_rgba(255,255,255,0.12),inset_0_0_24px_0_rgba(255,255,255,0.08),0_8px_32px_-8px_rgba(0,0,0,0.35)]",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10",
  "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.05)_35%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.15)_100%)]",
].join(" ")
```

## 2. Button Action

Varian: `default`, `tinted` (aksi utama, biru), `danger`. Ukuran: `sm`, `md`, `lg`, `icon`.

```tsx
const glassButton = cva(
  [
    glassBase,
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-all duration-200 ease-out cursor-pointer select-none",
    "hover:bg-white/20",
    "active:scale-95 active:bg-white/25",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        tinted: "bg-sky-400/40 hover:bg-sky-400/50 active:bg-sky-400/60 border-sky-200/40",
        danger: "bg-red-500/35 hover:bg-red-500/45 active:bg-red-500/55 border-red-200/40",
      },
      size: {
        sm: "h-8 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-6 text-[15px]",
        lg: "h-14 rounded-full px-8 text-base",
        icon: "size-12 rounded-full [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButton> {}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(glassButton({ variant, size }), className)}
      {...props}
    />
  )
)
GlassButton.displayName = "GlassButton"
```

Pemakaian:

```tsx
<GlassButton variant="tinted">Aktifkan</GlassButton>
<GlassButton>Batal</GlassButton>
<GlassButton variant="danger">Hapus</GlassButton>
```

## 3. Button Notif

Tombol ikon bulat dengan badge jumlah notifikasi (disembunyikan kalau `count` = 0).

```tsx
interface GlassNotifButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number
}

export const GlassNotifButton = React.forwardRef<
  HTMLButtonElement,
  GlassNotifButtonProps
>(({ className, count = 0, ...props }, ref) => (
  <div className="relative inline-block">
    <GlassButton
      ref={ref}
      size="icon"
      aria-label={count > 0 ? `${count} notifikasi` : "Notifikasi"}
      className={className}
      {...props}
    >
      <Bell />
    </GlassButton>
    {count > 0 && (
      <span className="pointer-events-none absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-5 text-white shadow-[0_2px_8px_rgba(239,68,68,0.6)] ring-2 ring-white/40">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </div>
))
GlassNotifButton.displayName = "GlassNotifButton"
```

Pemakaian:

```tsx
<GlassNotifButton count={3} onClick={() => console.log("buka notif")} />
```

## 4. Card Glass

```tsx
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(glassBase, "rounded-3xl p-5", className)} {...props} />
))
GlassCard.displayName = "GlassCard"

export const GlassCardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold tracking-tight", className)} {...props} />
)

export const GlassCardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-1 text-sm text-white/70", className)} {...props} />
)
```

Pemakaian:

```tsx
<div className="min-h-screen bg-[url('/bg.jpg')] bg-cover p-8">
  <GlassCard className="max-w-sm">
    <div className="flex items-start justify-between">
      <div>
        <GlassCardTitle>Fokus</GlassCardTitle>
        <GlassCardDescription>Matikan notifikasi sementara.</GlassCardDescription>
      </div>
      <GlassNotifButton count={3} />
    </div>
    <div className="mt-4 flex gap-2">
      <GlassButton variant="tinted">Aktifkan</GlassButton>
      <GlassButton>Batal</GlassButton>
    </div>
  </GlassCard>
</div>
```