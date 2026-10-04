# Aether UI — Design System
### iOS-Inspired Web UI · Tema Biru & Putih

Dokumen ini merangkum bahasa desain dari komponen-komponen yang sudah kamu buat (button, card, checkbox, tabs, nav, dll) menjadi satu sistem yang konsisten: **kaca (glass), lembut (soft), dan biru sebagai satu-satunya warna aksen**. Sebagian besar komponenmu (yang berprefix `aether-*`) sudah memakai token ini secara alami — dokumen ini menstandarkan sisanya (neumorphic abu-abu, kartu gelap, dll) supaya semua mengikuti tema yang sama.

---

## 1. Filosofi

- **Kaca di atas kertas** — permukaan translucent (`backdrop-filter: blur + saturate`) mengambang di atas latar putih/off-white, bukan di atas gelap.
- **Satu warna aksen** — biru sistem. Tidak ada warna aksen kedua (hijau/oranye hanya dipakai untuk status, bukan branding).
- **Bevel, bukan border tebal** — highlight tipis di sisi atas-kiri (inset light) + shadow lembut di bawah, meniru refleksi kaca nyata.
- **Rounded, selalu** — radius besar (16–24px untuk card/input, full-pill untuk button/nav/tabs).
- **Motion halus & pegas (spring)** — bukan linear. Skala kecil saat `:active`, translateY kecil saat `:hover`.

---

## 2. Warna

### 2.1 Warna inti
| Token                          | Hex / Value              | Pemakaian                       |
| --------------------------------| --------------------------| ---------------------------------|
| `--color-canvas`               | `#F5F7FB`                | Latar halaman                   |
| `--color-surface`              | `#FFFFFF`                | Kartu solid, modal              |
| `--color-surface-glass`        | `rgba(255,255,255,0.55)` | Panel kaca ringan               |
| `--color-surface-glass-strong` | `rgba(255,255,255,0.75)` | Panel kaca utama (button, card) |
| `--color-ink`                  | `#1D1D1F`                | Teks utama                      |
| `--color-ink-secondary`        | `#54545A`                | Teks sekunder                   |
| `--color-ink-tertiary`         | `#86868B`                | Label, meta, placeholder        |
| `--color-ink-inverse`          | `#F5F5F7`                | Teks di atas isi biru/gelap     |
| `--color-hairline`             | `rgba(15,23,42,0.08)`    | Border tipis                    |

### 2.2 Biru sistem (satu-satunya aksen)
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-accent` | `#0A84FF` | Aksen utama — link, ikon aktif, progress |
| `--color-accent-strong` | `#0056B3` | Fill solid (folder, badge penuh) |
| `--color-accent-soft` | `#4C9BEB` | Elemen dekoratif (awan, ilustrasi) |
| `--color-accent-tint` | `#E6EEF9` | Background chip/pill terpilih |
| `--color-accent-ring` | `rgba(10,132,255,0.32)` | Focus ring |
| `--color-accent-glass` | `rgba(0,122,255,0.40)` | Nav bar / panel biru transparan |

> Semua nuansa biru di komponen lama kamu (`#185ee0`, `#2e7def`, `#60a5fa`, `#007AFF`, `#0056b3`, `#4c9beb`) dipetakan ke skala tunggal di atas — pakai token, jangan hex lepas, biar konsisten lintas komponen.

### 2.3 Warna status (dipakai sangat terbatas — bukan untuk elemen dekoratif)
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-success` | `#22C55E` (fill `#04E40048`) | Toast sukses, status dot |
| `--color-warning` | `#FCBB04` → `#FFFC00` | Ilustrasi cuaca/rating saja |
| `--color-danger` | `#FF3B30` | Delete, error, search bar "hot" state |

---

## 3. Tipografi

```css
--font-sans: -apple-system, "SF Pro Text", "Inter", system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; /* meta/label uppercase */
```

| Level | Size | Weight | Letter-spacing | Pemakaian |
|---|---|---|---|---|
| Display | 30px | 700 | -0.01em | Angka besar (suhu, statistik) |
| Title | 17px | 600 | -0.012em | Judul card |
| Body | 15px | 400–500 | -0.002em | Paragraf, button label |
| Caption | 13px | 500 | 0 | Sub-teks, tombol kecil |
| Meta / Overline | 11px | 600 | 0.06em, UPPERCASE | Label kategori, badge |

---

## 4. Radius & Spacing

| Token | Value | Pemakaian |
|---|---|---|
| `--radius-sm` | 8px | Checkbox box, tag |
| `--radius-md` | 16px | Nav bar item, search bar dalam |
| `--radius-lg` | 20–24px | Card, container, modal |
| `--radius-pill` | 9999px | Button, tabs, chip, bottom nav, search bar |

Skala spacing: `4 · 8 · 12 · 16 · 20 · 24 · 32` px — kelipatan 4, konsisten dengan padding komponenmu (mis. button `15px 40px` dibulatkan ke `16px 40px`).

---

## 5. Elevation — Dua Sistem Bevel

Kamu punya dua gaya shadow di komponen — keduanya sah, dipakai untuk konteks berbeda:

### 5.1 Liquid Glass (utama — dipakai untuk button, card, nav, checkbox)
```css
--glass-blur: blur(20px) saturate(180%);
--glass-bevel-inset:
  inset 1.5px 1.5px 0 0 rgba(255,255,255,0.9),   /* highlight atas-kiri */
  inset -1px -1px 0 0 rgba(255,255,255,0.55),    /* soft bawah-kanan */
  inset 0 0 0 1px rgba(15,23,42,0.04);           /* hairline */
--glass-shadow-resting: 0 1px 2px rgba(15,23,42,.04), 0 12px 28px -10px rgba(15,23,42,.16);
--glass-shadow-raised:  0 2px 4px rgba(15,23,42,.06), 0 22px 44px -14px rgba(15,23,42,.22);
--glass-bevel-pressed:  inset 1px 1px 1px rgba(15,23,42,.08), inset -1px -1px 0 rgba(255,255,255,.55);
```
Gunakan di atas latar terang/foto agar efek blur terlihat.

### 5.2 Neumorphic Biru-Putih (varian — untuk widget angka/statistik/container)
Versi lamamu abu-abu (`#e0e0e0` / `#bcbcbc`); untuk tema biru-putih, ganti base ke putih kebiruan:
```css
--neu-base: #F0F4FA;
--neu-shadow-dark: #D3DDEA;
--neu-shadow-light: #FFFFFF;

box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
/* pressed / inset */
box-shadow: inset 4px 4px 10px var(--neu-shadow-dark), inset -4px -4px 10px var(--neu-shadow-light);
```
Pakai hanya untuk permukaan datar besar (container, kartu statistik) — jangan dicampur dengan glass di komponen yang sama.

---

## 6. Motion

```css
--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);   /* masuk/hover */
--ease-spring: cubic-bezier(0.5, 1.6, 0.4, 1);   /* pop/checkbox/chip */
--dur-fast: 140ms;
--dur-med: 220ms;
```
- **Hover**: `translateY(-1px)` + shadow naik ke level "raised".
- **Active/press**: `scale(0.97)` + bevel berubah ke "pressed" (inset makin dalam).
- **Toggle (checkbox/tab glider)**: pakai `--ease-spring`, durasi 220–250ms.
- **Focus**: selalu tambahkan `--focus-ring` biru, jangan hilangkan outline tanpa pengganti.

```css
--focus-ring: 0 0 0 3px var(--color-accent-ring);
```

---

## 7. Inventaris Komponen

| Komponen (punyamu) | Gaya saat ini | Status vs. tema biru-putih |
|---|---|---|
| Button (`neu-button`) | Neumorphic abu-abu | ⚠️ Ganti ke token §5.2 biru-putih |
| Arrow Button (`aether-primary-btn`) | Glass + chip hitam | ✅ Sudah sesuai — ganti chip `--color-ink` → `--color-accent-strong` agar biru |
| Checkbox (`aether-check`) | Glass, fill hitam saat checked | ✅ Sesuai — ganti fill checked ke `--color-accent` |
| Filter Menu / Tabs (`Radio`) | Putih + aksen `#185ee0` | ✅ Sudah biru-putih, tinggal map ke `--color-accent` |
| Card (`aether-card`) | Glass murni | ✅ Sudah sesuai penuh |
| Weather Widget | Putih + kuning + biru awan | ✅ Cocok, biru awan → `--color-accent-soft` |
| Stats Widget | Neumorphic abu + hijau | ⚠️ Ganti base ke §5.2, sisakan hijau hanya untuk status naik/turun |
| Folder/Files Card | Biru solid + file warna-warni | ✅ Base biru sesuai; warna file tetap boleh variatif sebagai data-viz |
| Container (kosong) | Neumorphic abu | ⚠️ Ganti ke §5.2 |
| Search Input (`cir-search`) | Putih + ring biru | ✅ Sudah sesuai, contoh terbaik focus ring |
| Glass Card (animated word) | Abu netral | ⚠️ Opsional: tambahkan tint biru tipis di background |
| Bottom Nav Mobile | Glass biru transparan | ✅ Referensi utama untuk `--color-accent-glass` |
| Pricing/Glass Card gelap | Dark + ungu | ❌ Di luar tema — pakai hanya untuk section promo khusus, bukan UI inti |
| Toast Sukses | Putih + hijau | ✅ Base sesuai, hijau tetap untuk status |
| Meeting/Event Widget | Putih + kuning aktif | ⚠️ Ganti highlight hari aktif dari kuning (`#f0ff7a`) → `--color-accent-tint` |
| Star Rating | Putih + oranye | ✅ Oranye untuk rating boleh dipertahankan (konvensi universal) |

---

## 8. Aturan Pemakaian Cepat

1. **Latar halaman** selalu `--color-canvas`, bukan putih polos — supaya efek glass komponen terlihat.
2. **Satu radius per grup**: semua tombol/tab/nav = pill; semua card/input = `--radius-lg`.
3. **Jangan campur** neumorphic + glass dalam satu card yang sama.
4. **Biru hanya untuk**: state aktif/terpilih, primary action, focus ring, link. Elemen netral (card, input kosong) tetap putih/abu muda.
5. **Ikon**: outline 1.75–2px stroke, ukuran 16–20px, warna ikuti `--color-ink-secondary` kecuali sedang aktif → `--color-accent`.

---

## 9. Token CSS Siap Pakai

```css
:root {
  /* Surface */
  --color-canvas: #F5F7FB;
  --color-surface: #FFFFFF;
  --color-surface-glass: rgba(255,255,255,0.55);
  --color-surface-glass-strong: rgba(255,255,255,0.75);

  /* Ink */
  --color-ink: #1D1D1F;
  --color-ink-secondary: #54545A;
  --color-ink-tertiary: #86868B;
  --color-ink-inverse: #F5F5F7;
  --color-hairline: rgba(15,23,42,0.08);

  /* Accent (biru) */
  --color-accent: #0A84FF;
  --color-accent-strong: #0056B3;
  --color-accent-soft: #4C9BEB;
  --color-accent-tint: #E6EEF9;
  --color-accent-ring: rgba(10,132,255,0.32);
  --color-accent-glass: rgba(0,122,255,0.40);

  /* Status */
  --color-success: #22C55E;
  --color-warning: #FCBB04;
  --color-danger: #FF3B30;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-pill: 9999px;

  /* Glass */
  --glass-blur: blur(20px) saturate(180%);
  --glass-bevel-inset: inset 1.5px 1.5px 0 0 rgba(255,255,255,.9), inset -1px -1px 0 0 rgba(255,255,255,.55), inset 0 0 0 1px rgba(15,23,42,.04);
  --glass-shadow-resting: 0 1px 2px rgba(15,23,42,.04), 0 12px 28px -10px rgba(15,23,42,.16);
  --glass-shadow-raised: 0 2px 4px rgba(15,23,42,.06), 0 22px 44px -14px rgba(15,23,42,.22);
  --glass-bevel-pressed: inset 1px 1px 1px rgba(15,23,42,.08), inset -1px -1px 0 rgba(255,255,255,.55);

  /* Neumorphic biru-putih */
  --neu-base: #F0F4FA;
  --neu-shadow-dark: #D3DDEA;
  --neu-shadow-light: #FFFFFF;

  /* Motion */
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-spring: cubic-bezier(0.5, 1.6, 0.4, 1);
  --dur-fast: 140ms;
  --dur-med: 220ms;

  /* Focus */
  --focus-ring: 0 0 0 3px var(--color-accent-ring);

  /* Font */
  --font-sans: -apple-system, "SF Pro Text", "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

---

*Simpan file ini sebagai referensi utama saat membuat komponen baru — setiap komponen baru sebaiknya memakai token di §9, bukan angka/hex baru.*
