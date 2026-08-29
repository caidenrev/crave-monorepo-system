# Crave — #1 Software Pengelolaan Bisnis & POS untuk UMKM

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1-FF4154.svg)](https://tanstack.com/start)

**Crave** adalah landing page modern untuk platform otomasi pengelolaan bisnis dan kasir (*Point of Sale*) yang dirancang khusus untuk mempermudah operasional pelaku UMKM (Usaha Mikro, Kecil, dan Menengah). Dengan antarmuka yang elegan, responsif, dan kaya akan animasi premium, Crave membantu pebisnis memangkas waktu manajemen operasional menjadi lebih efektif dan efisien.

---

## 🚀 Fitur Utama

- **Pencatatan Keuangan Otomatis**: Catat pemasukan dan pengeluaran secara real-time dari setiap transaksi penjualan tanpa perlu input manual.
- **Manajemen Inventaris Cepat**: Pantau ketersediaan stok barang dan penjualan item secara instan langsung dari perangkat seluler atau desktop Anda.
- **Invoice & Struk Instan**: Hasilkan struk penjualan atau invoice otomatis dalam format PDF yang dapat dihubungkan ke perangkat cetak (*printer thermal*) pribadi.
- **Desain Interaktif & Premium**: Dilengkapi dengan berbagai modul interaktif seperti *Bento Features Grid*, *Card Swap*, *Falling Objects Animation*, *Testimonial Carousel*, dan efek scroll halus menggunakan Lenis.

---

## 🛠️ Tech Stack

Landing page ini dibangun menggunakan teknologi web modern:

- **Core Framework**: [React 19](https://react.dev) & [TanStack Start](https://tanstack.com/start) (Full-stack React framework dengan Server-Side Rendering & File-based routing)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org) (Type-safe JavaScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Utility-first CSS framework)
- **Bundler & Server**: [Vite](https://vite.dev) & [Nitro](https://nitro.unjs.io)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.darkroom.engineering) (Smooth Scroll)
- **Icons**: [Lucide React](https://lucide.dev)

---

## 📁 Struktur Proyek

Proyek ini menggunakan struktur direktori yang modular dan berbasis komponen:

```text
/
├── src/
│   ├── components/       # Komponen UI
│   │   ├── landing/      # Komponen khusus halaman landing (layout & UI)
│   │   ├── ui/           # Komponen UI global (button, card, dialog, dll.)
│   │   └── magicui/      # Komponen dekoratif bermotif
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitas global dan konfigurasi error-handling
│   ├── providers/        # Provider konteks (scroll-provider, dsb.)
│   ├── routes/           # Routing halaman berbasis file (TanStack Router)
│   ├── types/            # Definisi tipe TypeScript
│   ├── router.tsx        # Konfigurasi router utama
│   ├── server.ts         # Entry point server untuk SSR
│   ├── start.ts          # Entry point client
│   └── styles.css        # File CSS utama
├── public/               # Aset statis (logo, ikon, gambar 3D)
├── vite.config.ts        # Konfigurasi build Vite & plugin
└── package.json          # Manajemen dependensi dan script proyek
```

---

## 🏁 Memulai Pengembangan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal Anda:

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18 ke atas disarankan) dan **npm** di sistem Anda.

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal pada direktori utama proyek:
```bash
npm install
```

### 3. Jalankan Server Pengembangan
Untuk memulai server lokal dengan fitur Hot Module Replacement (HMR):
```bash
npm run dev
```
Buka browser Anda dan akses alamat `http://localhost:8080`.

### 4. Build untuk Produksi
Untuk mengompilasi dan mengoptimalkan aset proyek untuk rilis produksi:
```bash
npm run build
```
Hasil build akan tersimpan di direktori `.output/`.

### 5. Preview Hasil Build
Untuk menjalankan server lokal guna meninjau hasil kompilasi produksi secara langsung:
```bash
npm run preview
```
