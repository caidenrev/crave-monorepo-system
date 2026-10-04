# PRD — Crave Event (Event Management System)

**Pemilik:** Eka Revandi (native speaker / host webinar)  
**Versi:** 2.0 · **Status:** Fullstack Architecture Ready (Supabase PostgreSQL + RLS + Client SDK + Local Fallback)  
**Terakhir Diperbarui:** 27 September 2026

---

## 1. Ringkasan Status Progres (Executive Summary)

Seluruh arsitektur **Frontend, Desain Visual Aether Glassmorphism, serta Backend BaaS (Supabase PostgreSQL, RLS Policies, Database Functions, dan Service Layer)** telah **100% selesai disiapkan**. Sistem mendukung arsitektur hybrid modern: langsung tersinkronisasi dengan Supabase Cloud saat kredensial `.env` diisi, dan memiliki mekanisme fallback otomatis ke persistent local store saat offline atau pada lingkungan demo tanpa error.

### Status Matriks Fitur

| Modul | Ruang Lingkup | Status | Keterangan |
|---|---|:---:|---|
| **Publik & Auth** | Landing Page, Katalog Event, Detail Event, Blog CMS, Auth Role Select | ✅ **100%** | Pemilihan peran (Peserta -> Dashboard / Speaker -> Panel Host), CTA taktil |
| **Peserta** | Dashboard Ringkasan, Upcoming Events, Past Events, Sertifikat | ✅ **100%** | Kartu tiket berpenampilan frosted clay, chip meta taktil |
| **Presensi QR** | Halaman Scan QR Peserta, Modal Live QR Admin, Kode Manual | ✅ **100%** | Validasi instan ke store, unlock sertifikat otomatis |
| **Admin** | Ringkasan KPI, Kelola Event (CRUD), Daftar Peserta, Playlists, Blog | ✅ **100%** | Chart tren pendaftaran, filter, modal QR presensi |
| **Navigasi** | Header Frosted Glass, Center Glider, Dropdown Solid, Mobile Murni | ✅ **100%** | Centered 3-column, spring glider (`getBoundingClientRect`), solid 100% opaque |
| **Pintasan Dashboard** | Akses Balik ke Beranda (`/`) dari Dashboard & Admin Panel | ✅ **100%** | Header mobile sticky, shortcut sidebar desktop, breadcrumb bar |
| **Footer** | Pre-footer CTA, Status Live 99.9%, Multi-kolom, Verified SSL | ✅ **100%** | Frosted glass card, link rute terverifikasi TanStack Router |
| **Backend & Database** | PostgreSQL Schema, RLS, Trigger Auth, Presensi RPC, SDK Sync | ✅ **100%** | `@supabase/supabase-js`, `schema.sql`, `seed.sql`, `supabase-services.ts` |
| **Desain UI** | Glassmorphism, Clay UI 3D, Spherical Icons, Micro-animations | ✅ **100%** | Specular bevel inset, `.neu-btn-blue`, `.neu-btn-glass` |

---

## 2. Latar Belakang & Masalah

Sebelum adanya sistem ini, operasional webinar dan event berjalan manual:
1. **Pendaftaran terpisah-pisah via Google Form** → data tercecer, peserta tidak punya histori atau dashboard akun.
2. **Presensi manual / link form terpisah** → rentan kecurangan, memakan waktu, tingkat validitas rendah.
3. **Penerbitan e-sertifikat manual** → admin harus membuat sertifikat satu per satu melalui template grafis/mail merge yang lambat.
4. **Kurasi konten & rekaman tidak terpusat** → materi dan rekaman tercecer di grup chat.

---

## 3. Persona Pengguna

1. **Peserta (Learner / Attendee)**
   - Menjelajahi katalog event berdasarkan playlist topik (misal: `#EnglishClub`, `#TechTalk`).
   - Mendaftar webinar gratis atau membeli tiket berbayar secara instan.
   - Mengakses link Zoom langsung dari dashboard atau halaman tiket.
   - Melakukan scan QR kehadiran saat sesi berlangsung (< 5 detik).
   - Mengunduh sertifikat resmi terverifikasi dan materi sesi.
2. **Admin / Host Webinar**
   - Menjadwalkan webinar baru, mengatur kuota, harga, rundown, dan link Zoom.
   - Menayangkan QR code absensi secara live di layar webinar.
   - Memantau tingkat kehadiran (attendance rate) dan status pembayaran secara real-time.
   - Mengelola playlist topik dan artikel edukasi blog.

---

## 4. Rincian Fitur & Progres Terkini

### 4.1 Halaman Publik (Public Facing) — [STATUS: SELESAI ✅]
- **Landing Page (`/`)**:
  - **Slogan & Headline Startup**: *"Kelola Event Tanpa Ribet Dimanapun & Kapanpun."* dengan aksen tipografi gradien elektrik biru-indigo.
  - **Announcement Pill Taktil**: Kapsul `.neu-btn-glass` dengan badge taktil `.neu-btn-blue` ("Baru") tanpa animasi kedip berlebih.
  - **Social Proof Bar**: Rating bintang 4.9/5 dari 1,200+ peserta terverifikasi dengan avatar bertumpuk.
  - **Hero Product Mockup Showcase (Pengganti Widget Stat Lama)**:
    - Window frame frosted glass dengan window buttons & status siaran langsung aktif (*"LIVE SESI SEKARANG · 248 Peserta Terhubung"*).
    - Kartu spotlight webinar unggulan dengan pembicara Caiden Rev dan tombol langsung masuk ruang sesi Zoom.
    - Kartu taktil clay: **Presensi QR Kilat** (`< 3.2 Detik`) dan **E-Sertifikat Otomatis** dengan ID unik terverifikasi.
    - Ribbon keunggulan di bagian bawah: Pendaftaran QRIS terpusat, integrasi Zoom/YouTube, dan ekspor data CSV sekali klik.
  - Playlist Explorer dengan filter glider interaktif.
  - Upcoming Events Highlight & Blog preview.
- **Katalog Event (`/events`)**:
  - Live search bar dengan inset glass styling.
  - Filter kategori segmented capsule (Semua, English Club, Tech, dll) dengan animated sliding glider.
  - Filter tipe event (Semua, Gratis, Berbayar).
- **Detail Event (`/events/$slug`)**:
  - Banner thumbnail dinamis dengan badge playlist & harga.
  - Author/Host bar dengan 3D spherical avatar icon (`.neu-icon-sphere`) dan meta chips.
  - Susunan acara (Rundown) berjangka waktu detail.
  - Benefit checklist.
  - Sidebar registrasi adaptif: Tombol "Daftar Sekarang (Gratis)" atau "Beli Tiket", serta widget status "Kamu Sudah Terdaftar!" berpenampilan `.neu-stat-card`.
- **Blog Publik (`/blog` & `/blog/$slug`)**:
  - Daftar artikel dengan kategori dan estimasi waktu baca.
  - Halaman baca artikel dengan tipografi editorial bersih dan rekomendasi bacaan lain.
- **Autentikasi Mock (`/auth`)**:
  - Frosted Glass Card `rounded-[32px]` dengan backdrop blur 24px.
  - Segmented capsule switcher ("Masuk" vs "Daftar Baru") dengan tactile blue slider.
  - 3D Spherical Icon header dan tombol login `.neu-btn-blue`.

### 4.2 Dashboard Peserta (`/dashboard`) — [STATUS: SELESAI ✅]
- **Ringkasan (`/dashboard`)**:
  - KPI Cards: Event Diikuti, Jam Belajar, Sertifikat Diraih, Tingkat Kehadiran.
  - Highlight Webinar Terdekat Kamu dengan kartu frosted glass clay, pill meta waktu/platform, dan tombol aksi "Masuk Zoom Meeting".
- **Upcoming Events (`/dashboard/upcoming`)**:
  - Kartu tiket berdesain **Glass & Clay UI**:
    - Container frosted glass `rounded-[32px]` dengan inset shadow ganda dan ambient drop shadow.
    - Badges kapsul taktil: `#PLAYLIST`, Countdown `8 HARI 21 JAM LAGI` (`.neu-badge-glass`), dan status `TIKET TERKONFIRMASI` (`.neu-badge-success`).
    - Chips meta: Tanggal, Waktu + Durasi, dan Platform Zoom dalam kapsul putih taktil.
    - Tombol aksi 3D: `.neu-btn-blue` ("Buka Link Zoom") dan `.neu-btn-glass` ("Salin Tautan Zoom").
- **Past Events (`/dashboard/past`)**:
  - Riwayat webinar yang selesai dengan status "Hadir & Terverifikasi" atau "Tidak Hadir".
  - Aksi klaim sertifikat dan download materi PDF.
- **Scan Absensi (`/dashboard/scan`)**:
  - Scanner simulator interaktif (scan otomatis mock camera atau input kode absensi 6 digit).
  - Feedback visual sukses scan instan yang langsung mengubah status kehadiran di local state.
- **Sertifikat (`/dashboard/certificates`)**:
  - Koleksi sertifikat resmi dengan ID verifikasi unik, tanggal terbit, dan tombol download/preview.
- **Pengaturan Akun (`/dashboard/settings`)**:
  - Formulir profil peserta, preferensi email notifikasi, dan pergantian password.

### 4.3 Dashboard Admin (`/admin`) — [STATUS: SELESAI ✅]
- **Ringkasan Admin (`/admin`)**:
  - Metrik utama: Total Pendapatan, Total Peserta, Rata-rata Kehadiran, Event Aktif.
  - Visualisasi grafik pendaftaran mingguan.
- **Kelola Event (`/admin/events`, `/events/new`, `/events/$id`)**:
  - Tabel manajemen event dengan aksi ubah, hapus, dan generate QR code live.
  - Modal penayangan QR Presensi Live berukuran besar untuk diproyeksikan/dishare di layar Zoom, dilengkapi kode manual 6-karakter.
  - Formulir buat/edit event lengkap (jadwal, kuota, Zoom link, harga, thumbnail).
- **Data Peserta (`/admin/attendees`)**:
  - Tabel peserta terdaftar dengan filter event, badge status kehadiran, status pembayaran, dan tombol ekspor data.
- **Playlist Manager (`/admin/playlists`)**:
  - Manajemen kategori dan playlist topik webinar.
- **CMS Blog (`/admin/blog`)**:
  - Manajemen postingan artikel blog.

### 4.4 Sistem Navigasi & Header (`SiteHeader`) — [STATUS: SELESAI ✅]
- **Navbar Frosted Blur Glass**:
  - Menggunakan `bg-white/70 backdrop-blur-xl border border-white/80` dengan bayangan lembut dan pantulan cahaya atas (`inset_0_1px_2px_#ffffff`).
- **Centered 3-Column Layout**:
  - Kolom kiri: Logo Crave Event (`flex-1 justify-start`).
  - Kolom tengah: Desktop Nav Glider (`flex-shrink-0 justify-center`) berada tepat di tengah tanpa celah kosong timpang.
  - Kolom kanan: Aksi Dashboard & Masuk (`flex-1 justify-end`).
- **Segmented Glider Switch Presisi**:
  - Perhitungan posisi menggunakan `getBoundingClientRect()` (`elRect.left - containerRect.left`), kebal terhadap bug nesting `offsetLeft`.
  - Glider biru meluncur mulus mengikuti rute aktif (`Beranda`, `Event`, `Blog`).
  - Teks tab aktif kontras dan tidak pernah memudar.
- **Dropdown Event Solid (100% Opaque)**:
  - Background `bg-white` 100% solid dengan border tegas dan shadow elevasi, memastikan konten halaman di baliknya tidak tembus pandang atau mengaburkan teks menu.
  - Seamless hover bridge dan outside-click detection.
- **Mobile Header Terjaga**:
  - Desain mobile dipertahankan bersih dan orisinal (hanya logo di kiri dan tombol aksi di kanan) tanpa drawer sempit atau accordion berlebih.

### 4.5 Footer Modern Multi-Kolom (`SiteFooter`) — [STATUS: SELESAI ✅]
- **Pre-Footer CTA Card**: Kartu frosted glass mengambang dengan ikon 3D sphere `Sparkles` dan tombol aksi *"Jelajahi Jadwal"* & *"Buat Event Gratis"*.
- **Brand Info & Operational Live Status**: Deskripsi platform, logo resmi, dan badge status hijau aktif (*"Semua Sistem Beroperasi Normal 99.9%"*).
- **Komunitas Taktil**: Tombol interaktif clay glass untuk GitHub, Instagram, LinkedIn, dan Email.
- **Navigasi Multi-Kolom**: Terbagi atas Program Event, Layanan Peserta (`/dashboard/upcoming`), dan Host & Manajemen (`/dashboard/scan`, `/admin/playlists`).
- **Sub-Footer Bar**: Hak cipta 2026, link privasi & ketentuan layanan, serta lencana keamanan terverifikasi SSL.

---

## 5. Fondasi Desain & Tokens (Glassmorphism & Clay Neumorphism)

1. **Warna & Palet**:
   - Canvas: `#F5F7FB` (abu-abu kebiruan sejuk khas Apple).
   - Accent Primary: `#0A84FF` (Electric iOS Blue).
   - Accent Gradient: `linear-gradient(135deg, #1c8eff 0%, #0a84ff 60%, #0070e6 100%)`.
   - Text Ink: `#0F172A` (Slate 900) & Secondary `#475569` (Slate 600).
2. **Karakter Clay & Glass**:
   - `.frosted-glass-card`: `background: rgba(255,255,255,0.75)`, blur `24px`, saturation `180%`, inset highlight `rgba(255,255,255,0.95)`, drop shadow `0 20px 48px -10px rgba(15,23,42,0.1)`.
   - `.neu-btn-blue`: Tombol 3D dengan inset highlight ganda (specular white top + dark blue bottom bevel) dan glow shadow saat ditekan (`active:scale-98`).
   - `.neu-btn-glass`: Tombol clay putih frosted dengan tekstur taktil timbul.
   - `.neu-icon-sphere`: Ikon bulat 3D bulat bola biru dengan specular highlights.
   - `.neu-badge-*`: Kapsul status taktil timbul dengan warna semantik (accent, success, warning, neutral).

---

## 6. Arsitektur Store & State Frontend

Semua state interaktif dikelola terpusat di `src/lib/store.ts` menggunakan Zustand:
- **`events`**: Daftar event aktif & lampau beserta atribut (kuota, zoomLink, playlist, rundown, tipe).
- **`myEvents`**: Status pendaftaran peserta (`registered`, `paid`, `attended`, `certificateId`).
- **`currentUser`**: Info sesi mock aktif (`Peserta` vs `Host/Admin`).
- **Aksi State**:
  - `registerEvent(id, paid)`: Mendaftarkan event dan langsung membuka akses Zoom jika gratis/terbayar.
  - `payEvent(id)`: Mengubah status pembayaran menjadi lunas.
  - `recordAttendance(code)`: Mencatat kehadiran melalui kode/QR dan otomatis menghasilkan ID sertifikat.
  - `addEvent()`, `updateEvent()`, `deleteEvent()`: Manajemen CRUD oleh admin.

---

## 7. Roadmap Selanjutnya (Handover ke Backend)

| Tahap                       | Deskripsi Kebutuhan Backend                                                     | Rekomendasi Stack                         |
| -----------------------------| ---------------------------------------------------------------------------------| -------------------------------------------|
| **1. Database & REST/tRPC** | Menyambungkan tabel `events`, `users`, `registrations`, `certificates`, `blogs` | Supabase / PostgreSQL / Node.js           |
| **2. Auth Nyata**           | Login via Google OAuth / Magic Link Email                                       | Supabase Auth / Clerk / NextAuth          |
| **3. Payment Gateway**      | Webhook pembayaran otomatis QRIS, Virtual Account, & E-Wallet                   | Midtrans / Xendit / Tripay                |
| **4. Kamera QR Nyata**      | Integrasi modul kamera web pada rute `/dashboard/scan`                          | `html5-qrcode` / browser MediaDevices API |
| **5. PDF Generator**        | Render template sertifikat otomatis berlisensi QR code verifikasi               | `@react-pdf/renderer` / Puppeteer         |

