# Aether UI — Reusable Design System Specification
### iOS-Inspired Tactile Glassmorphism & Soft Clay Web UI · Blue & White Theme

> Dokumen spesifikasi desain sistem **Aether UI** yang modular dan independen (product-agnostic). Dokumen ini mendokumentasikan seluruh bahasa visual, token CSS/Tailwind, arsitektur elevasi bevel/shadow, serta pola komponen reusable (Button, Card, Input, Glider Tabs, Navigation, Modal, dll) agar dapat langsung diimplementasikan pada aplikasi web baru apa pun dengan identitas visual yang identik dan konsisten.

---

## 1. Brand & Mission (Filosofi Desain)

### 1.1 Visi Desain
**Aether UI** menggabungkan estetika antarmuka mobile modern (iOS/iPadOS) dengan fleksibilitas web responsif. Fokus utamanya adalah **taktilitas (tactile feedback)**, **kedalaman optik kaca (frosted glass)**, dan **kesederhanaan palet warna (monochromatic ink + single electric blue accent)**.

### 1.2 5 Pilar Visual Utama
1. **Kaca di Atas Kertas (Glass on Paper)**:
   - Seluruh permukaan kartu, popover, dan panel melayang di atas kanvas terang/off-white dingin (`#F5F7FB`).
   - Efek kaca menggunakan `backdrop-filter: blur(20px) saturate(180%)` dengan background putih semi-transparan (`rgba(255, 255, 255, 0.65 - 0.75)`).
   - **Bukan Dark Glass**: Menghindari tema gelap kaku; kontras optik didapat dari bayangan halus dan highlight cahaya.
2. **Satu Warna Aksen Tunggal (Single Blue Accent)**:
   - Biru elektrik sistem (`#0A84FF`) adalah satu-satunya warna primer aplikasi untuk branding, link, fokus, dan indikator aktif.
   - Tidak ada warna sekunder (seperti ungu/oranye) untuk dekorasi. Warna hijau, kuning, dan merah dialokasikan secara ketat hanya untuk *status fungsional* (sukses, peringatan, bahaya).
3. **Bevel Taktil & Inset Highlights (Bukan Border Solid Tebal)**:
   - Meniru pantulan cahaya fisik pada kaca melengkung menggunakan bayangan ganda: cahaya terang di sisi atas-kiri (`inset 1.5px 1.5px ... #FFFFFF`) dan bayangan lembut di sisi bawah-kanan.
   - Komponen tombol taktil 3D terasa seperti tombol fisik yang dapat ditekan ke dalam (*pressable clay*).
4. **Pill & Rounded Konsisten**:
   - Seluruh elemen kontrol mandiri (Button, Segmented Tabs, Search Bar, Tag, Badge, Mobile Dock) menggunakan bentuk kapsul penuh (`rounded-pill` / `border-radius: 9999px`).
   - Seluruh kontainer data (Card, Dialog, Panel) menggunakan sudut membulat lebar (`16px`, `20px`, hingga `28px`).
5. **Mikro-interaksi Spring (Pegas)**:
   - Interaksi tidak menggunakan easing linier statis. Saat tombol ditekan (`:active`), elemen mengecil secara elastis (`scale(0.97)` atau `scale(0.98)`).
   - Indikator tab yang berpindah menggunakan kurva pegas iOS (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

---

## 2. Color Palette & Design Tokens

Semua token warna terdaftar sebagai CSS Variables di `:root` dan dapat diakses melalui utility Tailwind.

### 2.1 Canvas & Surfaces (Latar & Permukaan)
| Token CSS | Tailwind Variable | Hex / RGBA Value | Fungsi & Panduan Penggunaan |
|---|---|---|---|
| `--canvas` | `bg-canvas` | `#F5F7FB` | **Latar wajib** halaman aplikasi. Off-white kebiruan dingin yang membuat efek glass terlihat kontras. |
| `--surface` | `bg-surface` | `#FFFFFF` | Permukaan solid murni untuk kartu datar, dropdown menu putih, dan popover. |
| `--surface-glass` | `bg-glass-light` | `rgba(255, 255, 255, 0.55)` | Lapisan kaca tipis sekunder (misal background header sekunder / chip). |
| `--surface-glass-strong` | `bg-glass-strong` | `rgba(255, 255, 255, 0.75)` | Permukaan kartu kaca utama, dialog modal, dan panel frosted. |
| `--neu-base` | `bg-neu` | `#F0F4FA` | Latar netral untuk track segmented control dan kartu statistik taktil. |

### 2.2 Inks (Tipografi & Kontras Teks)
| Token CSS | Tailwind Variable | Hex / RGBA Value | Fungsi & Panduan Penggunaan |
|---|---|---|---|
| `--ink` | `text-ink` | `#1D1D1F` | Teks utama, judul heading, label tombol, angka display. |
| `--ink-secondary` | `text-ink-secondary` | `#54545A` | Teks paragraf, deskripsi sub-judul, ikon pasif. |
| `--ink-tertiary` | `text-ink-tertiary` | `#86868B` | Label overline/meta, placeholder input, timestamp, hint teks. |
| `--ink-inverse` | `text-ink-inverse` | `#F5F5F7` | Teks putih di atas tombol biru atau kartu aksen gelap. |
| `--hairline` | `border-hairline` | `rgba(15, 23, 42, 0.08)` | Border pembatas tipis, divider baris tabel, pemisah navigasi. |

### 2.3 System Blue Accent (Skala Aksen Biru)
| Token CSS | Tailwind Variable | Hex / RGBA Value | Fungsi & Panduan Penggunaan |
|---|---|---|---|
| `--accent` | `text-accent` / `bg-accent` | `#0A84FF` | Aksen primer, icon aktif, link, switch checkmark. |
| `--accent-strong` | `text-accent-strong` | `#0056B3` | Teks tebal aktif, border aktif, kontras tinggi di atas putih. |
| `--accent-soft` | `bg-accent-soft` | `#4C9BEB` | Elemen ilustrasi, avatar fallback, dekorasi visual. |
| `--accent-tint` | `bg-accent-tint` | `#E6EEF9` | Latar chip/pill terpilih, hover state item menu, badge aktif. |
| `--accent-ring` | `ring-accent-ring` | `rgba(10, 132, 255, 0.32)` | Ring fokus glow saat elemen difokuskan keyboard (`:focus-visible`). |
| `--accent-glass` | `bg-accent-glass` | `rgba(0, 122, 255, 0.40)` | Overlay biru translucent. |

### 2.4 Gradient Khusus
- **3D Blue Tactile Gradient (`.neu-btn-blue`, `.neu-icon-sphere`)**:
  ```css
  background: linear-gradient(135deg, #1c8eff 0%, #0a84ff 60%, #0070e6 100%);
  ```
- **Range / Progress Bar Fill (`.neu-stat-fill`)**:
  ```css
  background: linear-gradient(90deg, #0a84ff 0%, #00b4d8 100%);
  ```
- **Headline Gradient Text**:
  ```html
  <span class="bg-gradient-to-r from-[#0A84FF] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
  ```
- **Ambient Ambient Light (Latar Hero)**:
  `bg-gradient-to-b from-accent-tint/70 via-blue-100/30 to-transparent blur-3xl`

### 2.5 Status & Semantics (Terbatas Hanya untuk Status)
| Status | Token / Hex | Latar Badge (`neu-badge-*`) | Teks Badge | Penggunaan |
|---|---|---|---|---|
| **Success** | `#22C55E` / `#10B981` | `rgba(16, 185, 129, 0.12)` | `#059669` | Validasi berhasil, status aktif/selesai, checklist. |
| **Warning** | `#FCBB04` / `#F59E0B` | `rgba(245, 158, 11, 0.12)` | `#D97706` | Pending, limit mendekati kuota, perhatian. |
| **Danger** | `#FF3B30` / `#EF4444` | `rgba(255, 242, 242, 0.75)` | `#DC2626` | Error form, hapus data, peringatan kritis, reset filter. |

### 2.6 Pemetaan Shadcn UI Token
```css
--radius: 1.375rem; /* 22px */
--background: var(--canvas);
--foreground: var(--ink);
--card: var(--surface);
--card-foreground: var(--ink);
--popover: var(--surface);
--popover-foreground: var(--ink);
--primary: var(--accent);
--primary-foreground: #ffffff;
--secondary: var(--accent-tint);
--secondary-foreground: var(--accent-strong);
--muted: var(--neu-base);
--muted-foreground: var(--ink-tertiary);
--destructive: var(--danger);
--destructive-foreground: #ffffff;
--border: var(--hairline);
--input: var(--hairline);
--ring: var(--accent-ring);
```

---

## 3. Typography (Tipografi)

### 3.1 Font Family
```css
/* Utama */
--font-sans: "SF Pro Display", -apple-system, "SF Pro Text", "Inter", system-ui, sans-serif;
/* Data / Monospace */
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

### 3.2 Hirarki Skala Tipografi
| Level / Peran | Ukuran Mobile | Ukuran Desktop | Weight | Tracking | Line Height | Keterangan & Class |
|---|---|---|---|---|---|---|
| **Display / Hero** | `30px` (`text-3xl`) | `60px` (`sm:text-6xl`) | 800 (Extrabold) | `-0.02em` | `1.14` | Headline utama halaman publik / landing |
| **Page Title (H1)**| `24px` (`text-2xl`) | `28px` (`sm:text-[28px]`)| 700 / 600 | `-0.012em` | `1.2` | Judul halaman dashboard / header form |
| **Section Title (H2)**| `20px` (`text-xl`) | `24px` (`sm:text-2xl`) | 600 (Semibold) | `-0.012em` | `1.25` | Judul bagian / sub-seksi utama |
| **Card Title (H3)** | `16px` (`text-[16px]`)| `17px` (`text-[17px]`) | 600 (Semibold) | `-0.012em` | `1.3` | Judul kartu konten, widget, list item |
| **Body Large** | `15px` (`text-[15px]`)| `18px` (`sm:text-[18px]`)| 400 / 500 | `-0.002em` | `1.6` | Paragraf pembuka / lead paragraph |
| **Body Regular** | `14px` (`text-[14px]`)| `15px` (`text-[15px]`)| 400 / 500 | `-0.002em` | `1.5` | Konten artikel, input form, isi tabel |
| **Body Small** | `13px` (`text-[13px]`)| `13px` (`text-[13px]`)| 500 / 600 | `0` | `1.4` | Deskripsi card, sub-teks, item list |
| **Caption / Sub** | `12px` (`text-[12px]`)| `12px` (`text-[12px]`)| 500 / 600 | `0` | `1.35` | Teks tombol kecil, tooltip, sub-info |
| **Overline / Meta** | `11px` (`text-[11px]`)| `11px` (`text-[11px]`)| 600 (Semibold) | `0.06em` | `1` | Utility `.aether-meta` (UPPERCASE) |
| **Micro Badge** | `10px` (`text-[10px]`)| `10.5px` | 700 (Bold) | `0.04em` | `1` | Counter angka, status pill kecil |

#### Utility Overline Class:
```css
.aether-meta, .overline {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none !important;
}
```

---

## 4. Spacing & Layout Architecture

### 4.1 Skala Spacing & Padding
Sistem mengikuti kelipatan 4px:
- Padding Card: `p-5` hingga `p-6` (`20px` - `24px`), pada desktop `sm:p-8` (`32px`).
- Padding Kontainer Halaman: `px-4 py-6` s/d `px-4 py-10`.
- Padding Button Pill:
  - `sm`: `px-4 py-2 text-[13px]`
  - `md`: `px-6 py-2.5 text-[14px] sm:text-[15px]`
  - `lg`: `px-8 py-3.5 text-[16px]`

### 4.2 Batas Kontainer (Max-Width)
- `max-w-md` (`448px`): Form Auth, Modal Dialog, Floating Dock Mobile.
- `max-w-4xl` (`896px`): Formulir entri data panjang, editor konten.
- `max-w-5xl` (`1024px`): Landing page hero & grid fitur.
- `max-w-6xl` (`1152px`): Katalog & galeri kartu konten.
- `max-w-[1400px]`: Dashboard layout shell dengan sidebar desktop.

### 4.3 Breakpoints Responsif
- `md` (`768px`): Transisi navigasi publik (Mobile Accordion Drawer $\leftrightarrow$ Desktop Navbar Glider).
- `lg` (`1024px`): Transisi navigasi app shell (Mobile Floating Bottom Dock $\leftrightarrow$ Desktop Sticky Sidebar).

---

## 5. Border Radius & Elevation (Bevels & Shadows)

### 5.1 Skala Border Radius
| Token | Nilai | Tailwind | Elemen Terapan |
|---|---|---|---|
| `--radius-sm` | `8px` | `rounded-sm` / `rounded-lg` | Kbd shortcut, checkmark chip, tag internal |
| `--radius-md` | `16px` | `rounded-xl` / `rounded-2xl` | Input form, item dropdown, panel menu dalam |
| `--radius-lg` | `20px` - `22px` | `rounded-2xl` / `rounded-[22px]` | Card standar, stat widget, container konten |
| `--radius-xl` | `24px` - `28px` | `rounded-[24px]` / `rounded-[28px]` | Modal dialog, benefit pricing card, auth frame |
| `--radius-2xl` | `32px` | `rounded-[32px]` | Frame mockup showcase besar |
| `--radius-pill` | `9999px` | `rounded-pill` / `rounded-full` | **Semua** Button, switch capsule, search bar, badge |

### 5.2 Sistem Bevel & Elevation (Shadow Formulas)

#### 1. Liquid Glass Inset & Shadow (`.glass`, `.frosted-glass-card`, `.crystal-card`)
```css
/* Surface Frosted Glass */
background: rgba(255, 255, 255, 0.65 - 0.75);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1.5px solid rgba(255, 255, 255, 0.85);

/* Elevasi Resting */
box-shadow: 
  inset 1.5px 1.5px 0 0 rgba(255, 255, 255, 0.9),  /* highlight atas-kiri */
  inset -1px -1px 0 0 rgba(255, 255, 255, 0.55),   /* highlight bawah-kanan */
  inset 0 0 0 1px rgba(15, 23, 42, 0.04),          /* hairline */
  0 1px 2px rgba(15, 23, 42, 0.04), 
  0 12px 28px -10px rgba(15, 23, 42, 0.16);

/* Elevasi Hover (Raised) */
box-shadow: 
  inset 1.5px 1.5px 0 0 rgba(255, 255, 255, 0.9),
  0 2px 4px rgba(15, 23, 42, 0.06), 
  0 22px 44px -14px rgba(15, 23, 42, 0.22);
```

#### 2. Tactile Blue Button 3D (`.neu-btn-blue`)
```css
background: linear-gradient(135deg, #1c8eff 0%, #0a84ff 60%, #0070e6 100%);
border-radius: 9999px;
border: 2px solid rgba(255, 255, 255, 0.45);
color: #ffffff;
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

/* Double Inset Taktil */
box-shadow: 
  inset 3px 3px 8px rgba(0, 50, 130, 0.45),
  inset -3px -3px 8px rgba(130, 205, 255, 0.5),
  0 4px 14px rgba(10, 132, 255, 0.35);

/* Hover State */
&:hover {
  transform: translateY(-1px);
  box-shadow: 
    inset 2px 2px 5px rgba(0, 50, 130, 0.45),
    inset -2px -2px 5px rgba(130, 205, 255, 0.55),
    2px 2px 8px rgba(0, 50, 130, 0.25),
    -2px -2px 8px rgba(255, 255, 255, 0.7),
    0 6px 20px rgba(10, 132, 255, 0.45);
}

/* Active / Pressed State */
&:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    inset 4px 4px 10px rgba(0, 40, 100, 0.6),
    inset -2px -2px 6px rgba(130, 205, 255, 0.3);
}
```

#### 3. Tactile Glass Button (`.neu-btn-glass`)
```css
background: rgba(255, 255, 255, 0.65);
backdrop-filter: blur(12px);
border-radius: 9999px;
border: 2px solid rgba(255, 255, 255, 0.85);
color: #1d1d1f;

box-shadow: 
  inset 3px 3px 8px rgba(165, 175, 190, 0.45),
  inset -3px -3px 8px #ffffff,
  0 2px 8px rgba(0, 0, 0, 0.04);

&:hover {
  background: rgba(255, 255, 255, 0.85);
  color: #0a84ff;
  transform: translateY(-1px);
}
&:active {
  transform: translateY(0) scale(0.98);
}
```

#### 4. Focus Ring Global
```css
--focus-ring: 0 0 0 3px rgba(10, 132, 255, 0.32);
```

---

## 6. Reusable Component Patterns & Code Recipes

### 6.1 Buttons

#### A. Primary Tactile Blue (`.neu-btn-blue`)
Tombol aksi utama (Submit, Buat Baru, Lanjut Bayar).
```tsx
<button
  type="button"
  className="neu-btn-blue px-6 py-2.5 text-[14px] sm:text-[15px] font-semibold text-white shadow-sm"
>
  Simpan Perubahan
</button>
```

#### B. Glass White Tactile (`.neu-btn-glass`)
Tombol sekunder, filter pasif, aksi batal.
```tsx
<button
  type="button"
  className="neu-btn-glass px-5 py-2.5 text-[14px] font-medium text-ink hover:text-accent shadow-xs"
>
  Batal / Kembali
</button>
```

#### C. Arrow CTA Button (Glass + 3D Blue Chip)
Tombol promosi hero atau navigasi utama dengan chip panah berputar/scale.
```tsx
<a
  href="/catalog"
  className="neu-btn-glass group inline-flex items-center gap-3 rounded-pill py-1.5 pr-2 pl-6 text-[15px] font-semibold text-ink transition-all hover:text-accent shadow-sm"
>
  <span>Mulai Sekarang</span>
  <span className="neu-btn-blue flex size-9 items-center justify-center rounded-pill text-white transition-transform duration-200 group-hover:scale-105 shadow-sm">
    <ArrowRight className="size-4" strokeWidth={2.5} />
  </span>
</a>
```

#### D. Danger Glass Button (`.neu-btn-danger-glass`)
Aksi destruktif (Hapus, Reset Filter).
```tsx
<button
  type="button"
  className="neu-btn-danger-glass cursor-pointer"
>
  <Trash2 className="size-3.5" />
  <span>Hapus Item</span>
</button>
```

---

### 6.2 Form Inputs

#### A. Pill Search Bar dengan Shortcut Key (`<SearchInput>`)
```tsx
<label className="flex items-center gap-3 rounded-pill bg-white/75 backdrop-blur-md border border-white/90 px-4 py-2.5 shadow-[0_4px_14px_rgba(15,23,42,0.06),inset_2px_2px_4px_rgba(165,175,190,0.25),inset_-2px_-2px_4px_#ffffff] focus-within:bg-white/95 focus-within:border-white focus-within:shadow-[0_6px_20px_rgba(15,23,42,0.1)] transition-all cursor-text">
  <Search className="size-[18px] text-ink-tertiary shrink-0" strokeWidth={2} />
  <input
    type="text"
    placeholder="Cari sesuatu..."
    className="w-full bg-transparent text-[14px] sm:text-[15px] text-ink placeholder:text-ink-tertiary border-none outline-none ring-0"
  />
  <kbd className="aether-meta hidden rounded-sm bg-neu px-2 py-1 text-ink-tertiary sm:block">
    ⌘K
  </kbd>
</label>
```

#### B. Tactile Input Form dengan Spherical Icon Chip
Digunakan pada form otentikasi, checkout, atau modal data.
```tsx
<div>
  <label className="aether-meta block text-[11px] font-semibold text-ink-tertiary mb-1.5 ml-1">
    Alamat Email
  </label>
  <div className="flex items-center gap-3 rounded-2xl border border-hairline/80 bg-white/70 px-3.5 py-2.5 shadow-[inset_2px_2px_5px_rgba(165,175,190,0.18),inset_-2px_-2px_5px_#ffffff] focus-within:bg-white focus-within:border-accent focus-within:shadow-[0_0_0_3.5px_rgba(10,132,255,0.15)] transition-all">
    <div className="neu-icon-sphere size-8 shrink-0">
      <Mail className="size-4 text-white" strokeWidth={2.2} />
    </div>
    <input
      type="email"
      placeholder="nama@domain.com"
      className="w-full bg-transparent text-[14px] text-ink focus:outline-none placeholder:text-ink-tertiary"
    />
  </div>
</div>
```

---

### 6.3 Segmented Controls & Sliding Glider Tabs

Pola khas Aether UI: Track kapsul taktil di mana indikator aktif meluncur mulus secara fisik menggunakan transisi spring.

```tsx
<div className="neu-capsule-track relative inline-flex items-center p-1 rounded-pill">
  {/* Sliding Thumb Glider */}
  <span
    className="neu-capsule-thumb"
    style={{
      transform: `translateX(${indicatorLeft}px)`,
      width: `${indicatorWidth}px`,
      transition: "transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}
  />

  {options.map((opt) => (
    <button
      key={opt.value}
      type="button"
      onClick={() => onChange(opt.value)}
      className={cn(
        "relative z-10 flex items-center gap-1.5 rounded-pill px-4.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 cursor-pointer select-none",
        active === opt.value ? "text-white" : "text-ink-secondary hover:text-ink"
      )}
    >
      <span>{opt.label}</span>
      {opt.count !== undefined && (
        <span className={cn(
          "aether-meta rounded-pill px-1.5 py-0.5 text-[10px]",
          active === opt.value ? "bg-white/25 text-white" : "bg-black/5 text-ink-tertiary"
        )}>
          {opt.count}
        </span>
      )}
    </button>
  ))}
</div>
```

---

### 6.4 Cards & Surfaces

#### A. Standard Content Card (`.glass.lift`)
```tsx
<div className="glass lift group flex flex-col overflow-hidden rounded-2xl p-5">
  <div className="flex items-center justify-between">
    <span className="aether-meta neu-badge-accent rounded-pill px-3 py-1">Kategori</span>
    <span className="text-[13px] font-semibold text-ink-tertiary">Meta Info</span>
  </div>
  <h3 className="mt-3 text-[17px] font-semibold text-ink">Judul Konten Card</h3>
  <p className="mt-1.5 text-[13px] text-ink-secondary line-clamp-2">
    Deskripsi singkat elemen kartu dengan kontras tipografi yang nyaman dibaca.
  </p>
  <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between">
    <span className="text-[12px] text-ink-tertiary">Footer Info</span>
    <button className="neu-btn-blue px-3.5 py-1 text-[12px] font-semibold text-white">
      Lihat Detail
    </button>
  </div>
</div>
```

#### B. Neumorphic Stat Widget Card (`.neu-stat-card`)
```tsx
<div className="neu-stat-card flex flex-col justify-between">
  <div className="flex items-center justify-between gap-1.5 w-full">
    <span className="neu-stat-icon shrink-0">
      <Users className="size-3.5 text-white" />
    </span>
    <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#02972f] shrink-0 rounded-pill bg-[#02972f]/10 px-2 py-0.5">
      +18% naik
    </p>
  </div>

  <div className="mt-3 flex flex-col justify-start">
    <p className="text-[12px] sm:text-[13px] font-semibold text-[#4b5563]">
      Total Pengguna Aktif
    </p>
    <p className="mt-1 text-[24px] sm:text-[32px] font-bold leading-tight tracking-tight text-[#111827]">
      14,820
    </p>
    {/* Animated Tactile Progress Bar */}
    <div className="neu-stat-range mt-2.5">
      <div className="neu-stat-fill" style={{ width: "75%" }} />
    </div>
  </div>
</div>
```

#### C. Crystal Benefit / Pricing Card (`.frosted-glass-card`)
```tsx
<div className="frosted-glass-card flex flex-col justify-between p-6 sm:p-8 rounded-[28px]">
  <div>
    <div className="flex items-start justify-between">
      <h3 className="text-xl font-bold text-ink">Paket Pro</h3>
      <span className="neu-btn-blue text-[11px] font-semibold text-white px-3 py-1 rounded-pill">
        Populer
      </span>
    </div>
    <div className="mt-4 flex items-baseline gap-1.5">
      <span className="text-3xl font-extrabold text-ink">Rp 199.000</span>
      <span className="text-[12px] text-ink-tertiary">/ bulan</span>
    </div>
    <hr className="my-5 border-hairline" />
    <ul className="space-y-3">
      {["Fitur Lengkap 1", "Akses Prioritas 2", "Export Data Unlimited"].map((f, i) => (
        <li key={i} className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent text-white shadow-xs shrink-0">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  </div>
  <button className="neu-btn-blue mt-6 w-full py-3 text-[14px] font-semibold text-white shadow-md">
    Pilih Paket
  </button>
</div>
```

---

### 6.5 Navigasi & App Layout Architecture

#### A. Floating Public Header Bar
- **Wadah**: Kontainer mengambang berlatar putih solid pekat (`.nav-solid-white: bg-white border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.08)]`).
- **Tengah (Desktop)**: Indikator glider sliding tabs (`DesktopNavGlider`).
- **Dropdown Menu**: Panel mengambang putih pekat beradius `26px` dengan hover-bridge halus tanpa delay kaku.
- **Mobile Menu**: Drawer ekspansi mulus menggunakan CSS Grid Accordion:
  ```css
  grid-template-rows: 0fr -> 1fr;
  transition: grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease;
  ```

#### B. Dashboard Sticky Sidebar (Desktop $\ge$ 1024px)
- **Struktur**: `sticky top-6 h-[calc(100vh-3rem)] w-64 glass rounded-xl p-4 flex flex-col`.
- **Item Aktif**: `bg-accent-tint !text-accent-strong font-semibold`.
- **Item Pasif**: `text-ink-secondary hover:bg-white/70 hover:text-ink`.
- **Profil Bawah**: Card profil kecil dengan avatar chip dan role badge.

#### C. Mobile Floating Bottom Navigation Dock (Mobile $<$ 1024px)
- **Struktur**: Kapsul melayang di bagian bawah layar:
  ```html
  <div className="fixed inset-x-3 bottom-3 z-40 max-w-md mx-auto lg:hidden">
    <nav className="neu-capsule-track relative flex w-full items-center justify-between rounded-pill p-1.5 border border-white/85 bg-white/95 backdrop-blur-xl shadow-lg">
      <!-- Sliding active thumb glider + Tab buttons -->
    </nav>
  </div>
  ```

---

### 6.7 Badges & Capsule Tags (`<Badge>`)
Komponen badge status berbasis utility `.aether-meta` dan bentuk full-pill.

```tsx
<span className="aether-meta inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-semibold neu-badge-accent">
  Aktif
</span>
```

| Varian Tone | Class Khusus | Visual |
|---|---|---|
| `accent` | `neu-badge-accent` | Background `rgba(10, 132, 255, 0.12)`, border biru 35%, teks `#0A84FF`. |
| `neutral` | `neu-badge-glass` | Background `white/65`, border `white/85`, teks `text-ink-secondary`. |
| `success` | `neu-badge-success` | Background `rgba(16, 185, 129, 0.12)`, border hijau 35%, teks `#059669`. |
| `warning` | `neu-badge-warning` | Background `rgba(245, 158, 11, 0.12)`, border kuning 35%, teks `#D97706`. |
| `danger` | `neu-badge-glass text-danger` | Background kaca putih dengan teks merah `#FF3B30`. |

---

### 6.8 Section Heading (`<SectionHeading>`)
Template standar kepala seksi halaman dengan overline, judul, deskripsi, dan slot tombol aksi.

```tsx
<div className="flex flex-wrap items-end justify-between gap-4">
  <div className="max-w-xl">
    <p className="aether-meta text-accent">Kategori Utama</p>
    <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-[28px]">
      Judul Bagian Seksi
    </h2>
    <p className="mt-2 text-[15px] text-ink-secondary">
      Deskripsi penjelasan tujuan seksi atau modul ini.
    </p>
  </div>
  <div className="flex items-center gap-2">
    {/* Tombol aksi opsional */}
  </div>
</div>
```

---

### 6.9 Step Indicator Circle (`.neu-step-circle`)
Lingkaran angka tahapan proses (onboarding, checkout, langkah tutorial) bergaya clay 3D biru.

```tsx
<div className="flex items-center gap-3">
  <div className="neu-step-circle text-white font-bold text-[14px]">
    1
  </div>
  <div>
    <h4 className="text-[14px] font-bold text-ink">Langkah Pertama</h4>
    <p className="text-[12px] text-ink-secondary">Lengkapi data profil akun</p>
  </div>
</div>
```

- **CSS Specs**: Diameter `2.5rem` (`40px`), `border-radius: 9999px`, gradient biru 135deg, border `1.5px solid rgba(255,255,255,0.6)`, dan inset highlight ganda.

---

### 6.10 Tactile Media / Image Uploader (`<ImageUploader>`)
*Lokasi: `src/components/aether/image-uploader.tsx`*  
Komponen selector media visual lengkap dengan:
1. **Live Preview Card**: Preview banner responsif dengan overlay judul dan badge kategori.
2. **Tab Selector Segmented**: 3 mode input: Preset Gradient, Upload Cloud Storage, dan Remote URL.
3. **Preset Gradient Grid**: 8 opsi palet gradien modern (Ocean Blue, Deep Navy, Soft Frost, Cyber Violet, Emerald Dusk, Sunset Amber, Midnight Tech, Clean Minimalist).
4. **Drag & Drop / File Input**: Dilengkapi loading spinner (`Loader2`) dan indikator status cloud storage.

```tsx
<ImageUploader
  value={thumbnail}
  onChange={setThumbnail}
  label="Thumbnail / Banner Konten"
  previewTitle="Judul Item Anda"
  previewBadge="#Kategori"
  folder="media"
/>
```

---

### 6.11 Markdown Editor & Toolbar (`<MarkdownEditor>`)
*Lokasi: `src/components/aether/markdown-editor.tsx`*  
Editor konten kaya kustom tanpa library WYSIWYG eksternal yang berat:
1. **Interactive Toolbar**: Bold, Italic, H1, H2, H3, Bullet List, Numbered List, Blockquote, Inline Code, Code Block, Horizontal Divider, Link, Image.
2. **3 View Modes**:
   - `write`: Fokus pada penulisan textarea.
   - `preview`: Menampilkan hasil render penuh via `MarkdownRenderer`.
   - `split`: Tampilan berdampingan (side-by-side) 2 kolom (editor di kiri, preview live di kanan).
3. **Real-time Counter**: Menghitung jumlah kata (`wordCount`), karakter, dan estimasi waktu baca (`~N menit baca`).

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  label="Isi Konten Artikel / Deskripsi"
  placeholder="Tuliskan materi atau ringkasan di sini..."
  minHeight="280px"
/>
```

---

### 6.12 Lightweight Markdown Renderer (`<MarkdownRenderer>`)
*Lokasi: `src/components/aether/markdown-renderer.tsx`*  
Parser dan renderer Markdown kustom yang memetakan sintaks Markdown ke kelas desain Aether UI:
- **Heading**: Heading 1 (`24px font-bold`), Heading 2 (`18px font-bold border-b`), Heading 3 (`16px font-semibold`).
- **Code Block**: Box gelap `bg-slate-900 text-slate-100 rounded-xl` dengan header bahasa pemrograman uppercase.
- **Inline Code**: `rounded-md bg-accent-tint/60 px-1.5 py-0.5 font-mono text-[12.5px] text-accent-strong`.
- **Blockquote**: `border-l-4 border-accent bg-accent-tint/30 px-4 py-2.5 rounded-r-xl italic text-ink-secondary`.
- **Link**: `text-accent font-semibold hover:underline`.

```tsx
<MarkdownRenderer content={markdownContent} className="prose-custom" />
```

---

### 6.13 Vector QR Code Matrix Card (`<QrMatrix>`)
*Lokasi: `src/components/aether/qr-code.tsx`*  
Komponen pembungkus QR Code standar ISO/IEC 18004 menjadi elemen grafis vektor SVG bersih yang diwadahi dalam kartu beradius `22px` dengan bayangan lembut:

```tsx
<QrMatrix
  value="https://app.domain.com/verify/item-123"
  size={220}
  className="neu-btn-glass p-3"
/>
```

---

### 6.14 Multi-Column Site Footer (`<SiteFooter>`)
*Lokasi: `src/components/aether/site-header.tsx`*  
Komponen footer modular yang mencakup:
1. **Pre-Footer CTA Card**: Kartu frosted kaca besar melayang dengan judul persuasif dan dual button aksi.
2. **4-Column Links Grid**: Kolom brand info, kolom navigasi produk, kolom layanan pengguna, dan kolom administratif.
3. **Tactile Social Icons**: Ikon sosial media (GitHub, Instagram, LinkedIn, Email) dalam tombol kapsul taktil `.neu-btn-glass` dengan hover scale.
4. **Verified SSL Badge**: Badge jaminan keamanan terverifikasi dengan ikon shield aksen biru.
5. **Sub-Footer Legal Bar**: Copyright dan tautan syarat layanan / privasi.

---

### 6.15 Dialog & Modal Overlay

- **Backdrop**: `fixed inset-0 z-50 bg-[rgba(15,23,42,0.45)] backdrop-blur-md flex items-end sm:items-center justify-center p-4`.
- **Modal Box**: `frosted-glass-card w-full max-w-md rounded-[28px] p-6 bg-white/95 border border-white/90 shadow-2xl`.
- **Keyframe Entry**:
  ```css
  animation: aether-pop 220ms cubic-bezier(0.5, 1.6, 0.4, 1);
  ```

---

## 7. Motion & Transition Tokens

```css
:root {
  --dur-fast: 140ms; /* Hover, scale micro-chip, color fade */
  --dur-med: 220ms;  /* Perubahan shadow, modal pop */
  
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-spring: cubic-bezier(0.5, 1.6, 0.4, 1);
}
```

- **Hover Lift Utility (`.lift`)**:
  ```css
  .lift {
    transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-med) var(--ease-out);
  }
  .lift:hover {
    transform: translateY(-1px);
    box-shadow: var(--glass-bevel-inset), var(--glass-shadow-raised);
  }
  .lift:active {
    transform: scale(0.97);
    box-shadow: var(--glass-bevel-pressed);
  }
  ```
- **Pop Emergence Keyframe**:
  ```css
  @keyframes aether-pop {
    from { transform: scale(0.94); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  ```

---

## 8. Do's and Don'ts (Aturan Implementasi UI Baru)

### DO (Wajib Diikuti):
1. **Latar Kanvas Harus `#F5F7FB`**: Pastikan tag `<body>` atau root kontainer selalu diberi class `bg-canvas`. Efek frosted glass putih dan bevel cahaya tidak akan memiliki kontras jika diletakkan di atas `#FFFFFF` polos.
2. **Pill untuk Kontrol, Rounded Lebar untuk Kontainer**:
   - Seluruh kontrol interaktif mandiri (Button, Capsule Tab, Search Bar, Pill Badge) **wajib pill** (`rounded-pill`).
   - Seluruh kontainer data (Card, Dialog, Panel) **wajib rounded lebar** (`rounded-2xl` s/d `rounded-[28px]`).
3. **Gunakan Spherical Icon (`.neu-icon-sphere`)**: Ikon fitur pada list dan input form wajib ditaruh di dalam lingkaran 3D biru untuk menjaga gaya visual taktil.
4. **Sertakan `:active` Scale Feedback**: Setiap tombol harus memiliki feedback elastis saat diklik (`active:scale-98` atau `active:scale-97`).
5. **Gunakan Spring Curve pada Glider Tabs**: Glider aktif pada tab wajib menggunakan easing pegas `cubic-bezier(0.34, 1.56, 0.64, 1)`.
6. **Focus Ring Aksesibilitas**: Pastikan elemen form mempertahankan ring fokus `var(--focus-ring)` (`0 0 0 3px rgba(10,132,255,0.32)`).

### DON'T (Dilarang):
1. **Dilarang Dark Mode Menyeluruh**: Jangan mendesain halaman dengan latar hitam/abu pekat gelap. Aether UI adalah *light-canvas tactile system*. Latar gelap hanya diizinkan untuk spotlight showcase tertentu.
2. **Dilarang Menambah Warna Aksen Kedua**: Jangan memakai ungu, hijau tosca, merah, atau kuning sebagai aksen branding primer. Satu-satunya aksen primer adalah **Biru Sistem (`#0A84FF`)**.
3. **Dilarang Menggunakan Border Solid Gelap & Tebal**: Jangan gunakan `border-2 border-slate-700` atau border kaku lainnya. Kedalaman optik diciptakan melalui inset highlight putih (`border-white/80` + specular shadow).
4. **Dilarang Neumorphic Abu Semen**: Hindari gaya neumorphism lama yang berbasis warna abu-abu kotor (`#e0e0e0`). Semua base neumorphic harus menggunakan putih kebiruan bersih (`#F0F4FA`).
5. **Dilarang Sudut Tajam (Sharp Corners)**: Jangan gunakan elemen kotak tajam (`rounded-none` atau `rounded-xs`). Seluruh sudut harus melengkung lembut sesuai pedoman iOS.
6. **Dilarang Menghilangkan Outline Tanpa Fokus Alternatif**: Jangan memasang `outline-none` tanpa menyertakan `focus-visible:ring` atau shadow fokus yang jelas.
