# Panduan Aktivasi Backend Supabase — Crave Event

Backend Crave Event kini telah siap 100% menggunakan arsitektur BaaS (**Supabase** PostgreSQL + Row Level Security + Storage + Auth).

---

## 3 Langkah Mudah Menghubungkan ke Supabase

### 1. Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Klik **New Project**, beri nama `crave-event`, dan buat password database yang kuat.
3. Tunggu 1–2 menit hingga instance PostgreSQL siap.

---

### 2. Jalankan Skema Database & Data Awal
1. Buka menu **SQL Editor** di sidebar kiri Supabase Dashboard.
2. Klik **New Query**.
3. Buka file [supabase/schema.sql](file:///d:/zone-event/supabase/schema.sql), salin seluruh isinya, dan klik **Run**.
   - Ini akan membuat seluruh tabel (`profiles`, `events`, `registrations`, `certificates`, `playlists`, `blogs`), Row Level Security (RLS) policies, trigger auth otomatis, dan fungsi presensi QR (`record_attendance_and_claim_cert`).
4. *(Opsional)* Buka file [supabase/seed.sql](file:///d:/zone-event/supabase/seed.sql), salin isinya ke SQL Editor baru, dan klik **Run** untuk mengisi event dan playlist awal.

---

### 3. Masukkan Kunci API ke File `.env`
1. Di Supabase Dashboard, buka **Project Settings** (ikon gear di pojok kiri bawah) -> **API**.
2. Salin **Project URL** dan **anon / public key**.
3. Buat file `.env` di root project `d:/zone-event/.env` (berdasarkan [.env.example](file:///d:/zone-event/.env.example)):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Simpan file `.env`. Vite akan langsung menyambungkan aplikasi ke database Supabase secara real-time!

---

## Fitur Backend yang Telah Terpasang:
- **Otentikasi & Profil**: Sinkronisasi otomatis dari `auth.users` ke tabel publik `profiles` dengan role `user` dan `admin`.
- **Manajemen Event (CRUD)**: Create, Read, Update, Delete event via `eventsApi` di [supabase-services.ts](file:///d:/zone-event/src/lib/supabase-services.ts).
- **Pendaftaran & Pembayaran**: Manajemen status registrasi (`free`, `pending`, `paid`) via `registrationsApi`.
- **Presensi QR & Sertifikat Otomatis**: Prosedur tersimpan di database (`record_attendance_and_claim_cert`) memverifikasi kode presensi unik per event dan otomatis menerbitkan nomor sertifikat resmi anti-duplikasi.
- **Graceful Local Fallback**: Jika file `.env` belum diisi, aplikasi tetap berjalan 100% menggunakan local reactive store tanpa ada error atau blank screen.
