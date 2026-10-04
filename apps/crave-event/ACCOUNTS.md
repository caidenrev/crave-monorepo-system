# 🔐 Daftar Akun & Hak Akses (RBAC) — Crave Event

Dokumen ini mencatat daftar akun resmi, kredensial pengujian, pembagian peran (*role-based access control*), serta batas hak akses dashboard di dalam platform **Crave Event**.

---

## 👥 1. Tabel Kredensial Akun

| Peran (Role) | Email | Password | Target Dashboard | Hak Istimewa Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@crave.id`<br>`root@crave.id` | `Password123!` | `/admin` (dan `/dashboard`) | • Akses root tak terbatas<br>• Hapus & edit event/blog siapa saja<br>• Reset seluruh database/event/blog<br>• Fitur beralih role |
| **Speaker / Host** | `speaker@crave.id`<br>`host@crave.id`<br>`admin@crave.id` | `Password123!` | `/admin` | • Publikasi event & rundown webinar<br>• Tayangkan live QR Presensi Zoom<br>• Manajemen daftar peserta & status bayar<br>• Tulis & terbitkan blog edukasi |
| **Peserta (User)** | `peserta@crave.id`<br>*(atau daftar baru)* | `Password123!` | `/dashboard` | • Pendaftaran webinar (gratis & berbayar)<br>• Akses link Zoom meeting<br>• Presensi via scan kamera / webcam<br>• Klaim & unduh sertifikat PDF |

> [!NOTE]
> Sistem autentikasi mendukung login cepat lokal serta sinkronisasi Supabase Auth. Format password pengujian default adalah `Password123!` (atau password yang Anda masukkan saat registrasi mandiri).

---

## 🛡️ 2. Matriks Hak Akses (Access Control Matrix)

| Fitur / Halaman | Pengunjung (Tamu) | Peserta (`user`) | Speaker (`speaker`) | Super Admin (`superadmin`) |
| :--- | :---: | :---: | :---: | :---: |
| **Katalog Event & Blog Publik** | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| **Detail Event & Rundown** | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| **Daftar / Beli Tiket Webinar** | ❌ Wajib Login | ✅ Ya | ✅ Ya | ✅ Ya |
| **Dashboard Peserta (`/dashboard`)** | ❌ Dialihkan | ✅ Akses Penuh | 🔄 Dialihkan ke `/admin` | ✅ Ya |
| **Scan Presensi QR Peserta** | ❌ Dialihkan | ✅ Ya | ❌ (Khusus Peserta) | ✅ Ya |
| **Klaim & Unduh Sertifikat** | ❌ Dialihkan | ✅ Ya | ❌ (Khusus Peserta) | ✅ Ya |
| **Panel Speaker (`/admin`)** | ❌ Dialihkan | ⛔ Akses Ditolak | ✅ Akses Penuh | ✅ Akses Penuh |
| **Buat / Edit Event & Rundown** | ❌ Dialihkan | ⛔ Akses Ditolak | ✅ Ya | ✅ Ya |
| **Tayangkan Live QR Code Zoom** | ❌ Dialihkan | ⛔ Akses Ditolak | ✅ Ya | ✅ Ya |
| **Tulis & Publikasi Blog Materi** | ❌ Dialihkan | ⛔ Akses Ditolak | ✅ Ya | ✅ Ya |
| **Kelola Status Pembayaran Peserta** | ❌ Dialihkan | ⛔ Akses Ditolak | ✅ Ya | ✅ Ya |
| **Hapus Event / Blog Milik Orang Lain** | ❌ | ❌ | ❌ | ✅ Ya (Root) |
| **Tombol Reset Seluruh Data (Wipe)** | ❌ | ❌ | ❌ | ✅ Ya (Root) |
| **Shortcut Beralih Role Dashboard** | ❌ | ❌ | ❌ | ✅ Ya (Root) |

---

## 🔄 3. Alur Pengamanan (*Route Guards & Flow*)

1. **Pengunjung Belum Login**:
   - Tidak ada tombol **Dashboard** di header navigasi (hanya tersedia tombol **Masuk** dan **Daftar**).
   - Membuka URL `/dashboard` atau `/admin` secara manual akan memicu proteksi guard dan mengalihkan pengguna ke `/auth?mode=login&redirect=...`.
   - Pada halaman event (`/events/$slug`), tombol pendaftaran terkunci dan menampilkan kartu ajakan masuk: *"Masuk untuk Mendaftar Event"*.
2. **Pengguna Masuk Sebagai Peserta**:
   - Diarahkan ke Dashboard Peserta (`/dashboard`).
   - Jika peserta mencoba mengetikkan URL `/admin`, sistem menampilkan alert toast: *"Akses Ditolak: Hanya untuk Speaker & Admin"* dan mengembalikan ke `/dashboard`.
3. **Pengguna Masuk Sebagai Speaker**:
   - Diarahkan ke Panel Speaker (`/admin`).
   - Jika speaker mencoba membuka `/dashboard`, sistem menampilkan notifikasi ramah: *"Mengalihkan ke Panel Speaker..."* dan mengarahkannya kembali ke `/admin`.
4. **Pendaftaran Akun Baru**:
   - Formulir registrasi dilengkapi **tactile sliding capsule switch** untuk menentukan peran akun secara sadar sebelum mendaftar:
     - Switch **Peserta** → Menuju `/dashboard`.
     - Switch **Speaker** → Menuju `/admin`.
