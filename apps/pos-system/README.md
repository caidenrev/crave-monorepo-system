<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/dark-mode-logo.png">
    <source media="(prefers-color-scheme: light)" srcset="public/light-mode-logo.png">
    <img alt="Simple-Point Logo" src="public/light-mode-logo.png" width="280">
  </picture>
</p>

<h1 align="center">Simple-Point (Crave POS System)</h1>

<p align="center">
  <strong>Solusi Point of Sale (POS) & Manajemen Keuangan Digital yang Ringan, Cepat, dan Akurat untuk UMKM Indonesia.</strong>
</p>

---

## 📌 Latar Belakang & Permasalahan

Pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) memegang peranan krusial bagi perekonomian. Namun, mayoritas masih mengandalkan **pencatatan manual** menggunakan kertas. Metode ini rentan terhadap human error, hilangnya catatan utang-piutang, serta kebocoran persediaan barang (stok) karena riwayat mutasi yang tidak tercatat secara kronologis.

**Simple-Point** hadir sebagai solusi POS & Pembukuan digital tanpa biaya langganan yang rumit. Memungkinkan pemilik bisnis memantau penjualan, riwayat stok, serta utang-piutang secara instan untuk memperkuat kelangsungan finansial usaha.

---

## 🚀 Fitur Utama

- **⚡ Transaksi Kasir Cepat (POS)**: Layanan kasir digital responsif yang mempercepat transaksi penjualan produk harian.
- **📦 Inventaris & Kartu Stok**: Pelacakan riwayat masuk-keluar stok secara detail (Kartu Stok) guna meminimalkan kebocoran inventaris.
- **💸 Pelacakan Utang & Piutang**: Pengelolaan daftar utang (kepada supplier) dan piutang (oleh pelanggan) dengan batas jatuh tempo untuk kelancaran arus kas.
- **🔒 Keamanan PIN Karyawan**: Pembatasan akses operasional kasir dan menu krusial menggunakan sistem PIN individual karyawan.
- **📊 Laporan Keuangan & Spreadsheet**: Tampilan interaktif pembukuan kas, laba rugi, dan integrasi spreadsheet interaktif untuk kebutuhan analisis lanjutan.

---

## 🛠️ Spesifikasi Teknologi

Sistem dibangun menggunakan arsitektur modern berkecepatan tinggi:
- **Frontend Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Router**: [Vite](https://vite.dev/) + [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (untuk SSR dan optimasi bundling)
- **Database & Auth**: [Supabase](https://supabase.com/) (Real-time DB dan enkripsi data)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Framer Motion](https://www.framer.com/motion/)

---

## 💻 Panduan Instalasi Lokal

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi LTS) di komputer Anda.

### Langkah-langkah
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/caidenrev/crave-pos-hackton.git
   cd simple-point
   ```

2. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin file `.env.example` (atau buat file `.env`) dan lengkapi kredensial database Supabase Anda:
   ```env
   VITE_SUPABASE_DATABASE_PASSWORD="your-supabase-db-password"
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

4. **Jalankan Aplikasi (Mode Development)**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di browser melalui tautan `http://localhost:8080` (atau port default yang tertera di terminal).

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 📁 Struktur Direktori Proyek

```text
simple-point/
├── android/               # Konfigurasi native Android (Capacitor)
├── public/                # Aset gambar, logo, dan file statis
├── src/
│   ├── components/        # Komponen UI utama & tata letak (AppShell, SideNav)
│   │   └── ui/            # Komponen visual dasar (button, card, dialog, dll.)
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Logika utilitas, integrasi Supabase, dan data model
│   ├── routes/            # Pengaturan rute halaman TanStack Router
│   ├── router.tsx         # Konfigurasi entry-point router
│   ├── server.ts          # Integrasi server-side rendering
│   └── styles.css         # Styling global Tailwind
├── vite.config.ts         # Konfigurasi bundler Vite
├── package.json           # Dependensi modul & skrip build
└── DESKRIPSI_APLIKASI.txt # Deskripsi naratif untuk kebutuhan lomba
```
