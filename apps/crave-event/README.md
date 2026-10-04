# Crave Event 🎟️
> **Platform Webinar Interaktif, Absensi QR Real-Time & Penerbitan Sertifikat Digital Otomatis**

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=flat-square)](https://github.com/caidenrev/crave-event)
[![Framework](https://img.shields.io/badge/Framework-React%2019%20%7C%20TanStack%20Start-blue?style=flat-square)](https://tanstack.com/start)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%28PostgreSQL%29-3ecf8e?style=flat-square)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## 📖 Tentang Crave Event

**Crave Event** adalah platform *Event Management System* (EMS) all-in-one yang dirancang untuk mengatasi inefisiensi pendaftaran webinar melalui Google Form, lambatnya pengiriman sertifikat manual, dan rumitnya pencatatan kehadiran peserta webinar.

Didesain dengan antarmuka modern bernuansa **Aether Glassmorphism**, Crave Event menyediakan ekosistem terintegrasi baik bagi **Speaker/Host** maupun **Peserta**:
- **Bagi Host**: Buat webinar berbayar/gratis dalam hitungan detik, tayangkan kode QR presensi interaktif saat share screen di Zoom, kelola peserta secara live, dan publikasikan materi edukasi lewat blog markdown.
- **Bagi Peserta**: Daftar webinar dengan satu klik, scan absensi langsung lewat kamera ponsel atau webcam browser, dan langsung klaim serta unduh sertifikat resmi terverifikasi saat itu juga.

---

## ✨ Fitur Utama

### 🎙️ 1. Panel Speaker & Host
- **Manajemen Event Terintegrasi**: Formulir pembuatan webinar dengan upload gambar cover, penentuan harga (Gratis / Berbayar), kuota peserta, jadwal waktu, platform Zoom, dan playlist.
- **Host Live Presentation Screen**: Modal layar penuh kode QR absensi standar ISO/IEC 18004 beresolusi tinggi + kode 8-digit cadangan yang siap di-share screen saat sesi webinar Zoom berlangsung.
- **Pelacakan Presensi Real-Time**: Pantau kehadiran peserta yang berhasil melakukan check-in secara live.
- **Manajemen Peserta & Transaksi**: Filter data pendaftar, status pembayaran, dan kontrol manual check-in kehadiran.
- **Sistem Playlist & Kurasi**: Pengelompokan event ke dalam topik terstruktur seperti `#TechTalk`, `#BelajarBareng`, `#EnglishClub`, dan `#CareerLab`.
- **Editor Blog Markdown Terintegrasi**: Tulis dan bagikan ringkasan materi webinar dengan rich markdown editor lengkap dengan live preview, image cover, dan tag kategori.

### 📱 2. Dashboard Peserta
- **Ringkasan Aktivitas**: Metrik event terdaftar, webinar yang telah selesai diikuti, dan koleksi sertifikat digital.
- **Upcoming & Riwayat Event**: Detail jadwal webinar dan akses langsung ke tautan Zoom room setelah pendaftaran/pembayaran berhasil.
- **Multi-Method QR Scanner**:
  - **Auto Check-in via Kamera Ponsel**: Peserta cukup mengarahkan kamera HP ke QR Code host di layar Zoom, dan sistem langsung mencatat presensi secara otomatis.
  - **Live Webcam Scanner**: Pemindaian kamera langsung di browser dengan kontrol kamera depan/belakang serta audio beep feedback.
  - **Upload Foto/Screenshot QR**: Pemindaian dari gambar bagi peserta yang mengikuti webinar di perangkat yang sama.
  - **Input Kode Manual 8-Digit**: Solusi presensi jika kamera peserta mengalami kendala teknis.
- **Penerbitan Sertifikat Otomatis**: Sertifikat langsung aktif begitu presensi tervalidasi, lengkap dengan nomor seri kredensial unik (`CERT-2026-xxxx` / `CRV-xxxx`) serta fitur pratinjau dan unduh PDF.

### 🌐 3. Katalog Publik & Autentikasi
- **Eksplorasi Webinar**: Filter berdasarkan playlist, pencarian judul, dan status webinar (Mendatang / Selesai).
- **Detail Event & Rundown**: Informasi lengkap pembicara, fasilitas, agenda rundown, dan FAQ interaktif.
- **Checkout & Simulasi Pembayaran**: Alur checkout instan dengan dukungan tiket gratis dan berbayar (simulasi QRIS & Transfer Bank).
- **Autentikasi Fleksibel & RBAC**: Login dan registrasi akun dengan peran **Peserta**, **Speaker / Host**, atau **Super Admin**. Panduan lengkap kredensial akun dan hak akses dapat dilihat di [ACCOUNTS.md](file:///d:/zone-event/ACCOUNTS.md).

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/), [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict type-safety) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons |
| **QR Engine** | `qrcode` (Generator ISO/IEC 18004 SVG), `jsqr` (Video/canvas frame decoder) |
| **State & Data** | Context API Store terpadu + Supabase Database Sync |
| **Backend & Auth**| [Supabase](https://supabase.com/) (PostgreSQL, RLS Policies, Stored Procedures, Auth, Storage) |
| **Build & SSR** | Vite, Nitro Engine |

---

## 🚀 Memulai (Quick Start)

### Prasyarat
- **Node.js**: Versi `>= 20.x`
- **npm** atau **bun**

### 1. Clone Repositori
```bash
git clone https://github.com/caidenrev/crave-event.git
cd crave-event
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel berikut dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup Database Supabase
Jalankan query SQL berikut pada Supabase SQL Editor:
1. `supabase/schema.sql` — Menyiapkan tabel `events`, `registrations`, `certificates`, `profiles`, RLS security, dan RPC presensi otomatis.
2. `supabase/seed.sql` — Menyiapkan data awal webinar, pembicara, playlist, dan rundown.

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka peramban di `http://localhost:8080`.

---

## 📦 Skrip NPM

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan local development server dengan hot module reload |
| `npm run build` | Melakukan compile dan bundling aplikasi untuk produksi (Client, SSR, Nitro) |
| `npx tsc --noEmit` | Memeriksa validitas tipe TypeScript di seluruh codebase |

---

## 📁 Struktur Direktori

```plaintext
zone-event/
├── public/                 # Aset statis & logo
├── src/
│   ├── components/
│   │   ├── aether/         # Komponen tema Aether (QR Code, Header, EventCard, Markdown, Shell)
│   │   └── ui/             # Primitives UI (Buttons, Badges, Dialogs, Toaster)
│   ├── lib/
│   │   ├── mock-data.ts    # Model tipe data & mock data fallback
│   │   ├── store.tsx       # Global application state context
│   │   ├── supabase.ts     # Supabase client initialization
│   │   └── supabase-services.ts # REST API & RPC service functions
│   └── routes/             # File-based routing (TanStack Router)
│       ├── __root.tsx      # Root layout, meta tags & providers
│       ├── index.tsx       # Landing page utama
│       ├── auth.tsx        # Login & registrasi akun
│       ├── events/         # Detail & katalog webinar publik
│       ├── blog/           # Artikel & insight publik
│       ├── dashboard/      # Panel peserta (Scan, Sertifikat, Riwayat)
│       └── admin/          # Panel host/speaker (Kelola Event, Peserta, Blog)
├── supabase/
│   ├── schema.sql          # Schema DDL, RLS policies, & stored functions
│   └── seed.sql            # Initial mock dataset
└── vite.config.ts          # Konfigurasi bundler Vite & Nitro
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE). Dikembangkan oleh **[Eka Revandi / Caiden](https://github.com/caidenrev)**.
