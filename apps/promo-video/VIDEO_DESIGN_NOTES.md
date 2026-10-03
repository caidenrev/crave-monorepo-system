# VIDEO DESIGN NOTES — Crave POS SaaS Promo Video

Dokumen riset dan ringkasan desain hasil ekstraksi langsung dari kode sumber `d:/zone-event/crave-pos/apps/pos-system`.

---

## 1. Design Tokens (Light Mode — Bersih & Modern)

| Token | Nilai / Formula | Visual & Implementasi |
|---|---|---|
| **Font Family** | `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif` | Clean, geometric sans-serif dengan legibilitas tinggi untuk SaaS modern |
| **Background Utama** | `oklch(0.98 0.006 250)` (`#F8FAFC` s.d. `#F1F5F9`) | Off-white bersih dengan gradasi biru sangat halus (subtle soft light blue tint) |
| **Foreground / Text** | `oklch(0.22 0.03 258)` (`#0F172A` / `#1E293B`) | Slate gelap solid untuk kontras teks optimal, tidak ada abu-abu pucat |
| **Primary (Aksen Utama)** | `oklch(0.54 0.19 258)` (`#2563EB` / `#3158E3`) | Vibrant SaaS Blue khas Crave POS |
| **Primary Foreground** | `oklch(0.99 0.005 250)` (`#FFFFFF`) | Putih murni pada tombol & kartu aksen |
| **Card Background** | `oklch(1 0 0)` (`#FFFFFF`) | Putih bersih berbingkai border tipis |
| **Card Border** | `oklch(0.91 0.014 252)` (`#E2E8F0`) | Garis tepi 1px halus dan elegan |
| **Muted / Secondary** | `oklch(0.95 0.02 254)` / `oklch(0.53 0.035 256)` | Latar tombol pasif dan teks label sekunder |
| **Success (Positif)** | `oklch(0.62 0.15 155)` (`#10B981`) | Hijau emerald untuk pertumbuhan transaksi & status pembayaran |
| **Destructive** | `oklch(0.58 0.22 20)` (`#EF4444`) | Merah untuk peringatan stok menipis |
| **Radius** | `0.75rem` (12px), `1rem` (16px), `1.5rem` (24px) | Sudut melengkung halus khas antarmuka modern |
| **Shadow** | `--shadow-soft`: `0 1px 2px rgba(37,99,235,0.06), 0 8px 24px rgba(37,99,235,0.08)` | Bayangan berlapis lembut berwarna ambient biru halus, bukan hitam pekat |

---

## 2. Komponen Shadcn / UI Asli yang Direplikasi

1. **Card & Card Soft**: Digunakan untuk StatCard di dashboard, Card produk di POS kasir, dan Card ringkasan transaksi.
2. **Badge**: Badge status stok ("Tersedia 42", "Stok Menipis 4"), badge kategori produk ("Minuman", "Makanan"), dan badge persentase naik/turun ("+12.4%").
3. **Button**: Variasi tombol Primary (Blue solid), Outline (Border tipis), Ghost (Sidebar item), dan Icon Stepper (+ / -).
4. **SideNav / Sidebar**: Layout navigasi asli dengan logo di atas, menu Kasir, Dasbor, Stok, Laporan, Pengaturan, dan profil kasir/merchant di bawah.
5. **Chart**: AreaChart dengan kurva halus warna biru primer untuk tren omzet per jam/harian.
6. **Input & Search**: Search bar pencarian produk dan input email pendaftaran.

---

## 3. Layout Halaman Asli yang Ditampilkan

### A. Dasbor Analitik (`apps/pos-system/src/routes/dashboard.tsx`)
- **Top Metrics Grid**:
  - *Kartu 1 (Primary Hero Card)*: Pendapatan Hari Ini (`Rp 14.850.000` • +12,4%) warna biru primer elegan dengan teks putih.
  - *Kartu 2*: Total Transaksi (`184` • +8,1%) latar putih.
  - *Kartu 3*: Stok Menipis (`4 Produk` • Perlu restok).
  - *Kartu 4*: Rata-rata Belanja (`Rp 80.700` • -2,3%).
- **Area Chart Penjualan**: Grafik kurva tren omzet dengan titik data dinamis.
- **Daftar Transaksi Terakhir**: Struk transaksi cepat dengan status lunas QRIS.

### B. Kasir POS (`apps/pos-system/src/routes/index.tsx`)
- **Pills Kategori**: "Semua", "Minuman", "Makanan", "Snack".
- **Product Card Grid**: Kartu item menu asli (Es Kopi Susu `Rp 18.000`, Americano `Rp 16.000`, Croissant `Rp 25.000`, Kentang Goreng `Rp 15.000`).
- **Cart & Payment Panel**: Panel kanan struk pesanan dengan kalkulasi subtotal, pajak, tombol metode bayar (QRIS, Kartu, Tunai), dan tombol Checkout.

---

## 4. Lokasi Logo & Aset

- **Logo Light Mode**: `apps/promo-video/public/light-mode-logo.png`
- **Logo Dark Mode**: `apps/promo-video/public/dark-mode-logo.png`
- **Profile Avatar**: `apps/promo-video/public/profile-logo.jpeg`

---

## 5. Rencana Storyboard & Arsitektur Video (30 FPS, 30 Detik)

| Scene | Frame | Durasi | Fokus & Aksi |
|---|---|---|---|
| **Scene 1: Hook** | 0 – 90 | 3.0s | Logo Crave POS muncul (scale + fade + motion blur) + headline *"Kelola kasir & pesanan, lebih cepat."* staggered per kata blur-to-sharp. |
| **Scene 2: Dashboard Hero** | 90 – 240 | 5.0s | Dasbor asli Crave POS masuk dari bawah dengan spring, berhenti dengan 3D tilt halus. Stat card count-up, grafik kurva tumbuh, kamera smooth pan. |
| **Scene 3: Sidebar Menu Diagonal** | 240 – 390 | 5.0s | Item menu sidebar asli meluncur secara diagonal (10°), stagger motion blur. Menu aktif berpindah (Kasir → Dasbor → Stok) dan panel preview berganti sinkron. |
| **Scene 4: Flip Cards Fitur** | 390 – 570 | 6.0s | 4 Card fitur unggulan (Kasir Cepat, Otomasi QRIS, Laporan Real-time, Manajemen Stok). Berputar 180° 3D Flip (depan: icon + title, belakang: mini-UI asli). |
| **Scene 5: Item Cards & Cart** | 570 – 690 | 4.0s | Grid produk POS masuk dengan translateY + blur. Item "Es Kopi Susu" di-klik / di-pick, terbang masuk ke keranjang, counter bertambah, total terupdate otomatis. |
| **Scene 6: CTA Interaktif** | 690 – 900 | 7.0s | Tombol "Coba Gratis" didekati cursor digital, hover, click morphing menjadi input email & badge *"Terkirim ✓"*. Headline CTA berganti teks blur ("Coba Gratis" → "Tanpa Kartu Kredit" → "pos.crave.id"). Loop-friendly. |
