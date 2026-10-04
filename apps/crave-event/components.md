# Aether UI — Component Reference
### Katalog Komponen React · Pasangan dari `design.md`

Dokumen ini mendaftar semua komponen yang sudah kamu buat, dengan status kesesuaiannya terhadap tema biru-putih di `design.md`, cara pakai, dependensi, dan catatan penyesuaian token. Semua komponen ditulis dengan **React + styled-components**.

**Dependensi global:**
```bash
npm install styled-components
```

**Legenda status:**
- ✅ Sudah sesuai tema — pakai langsung
- ⚠️ Perlu ganti warna/token — lihat catatan
- ❌ Di luar tema biru-putih — pakai terbatas / opsional

---

## 1. Button — `neu-button` ⚠️

Tombol pill neumorphic dasar, tanpa ikon.

```jsx
import Button from './Button';

<Button />
```

| Aspek | Detail |
|---|---|
| Style asal | Abu-abu (`#e0e0e0`), inset shadow ganda |
| Radius | `50px` (pill) |
| State | `:hover`, `:focus` → shadow berbalik jadi raised |
| **Catatan** | Ganti `background-color` → `var(--neu-base)`, shadow → `var(--neu-shadow-dark)` / `var(--neu-shadow-light)` (lihat §5.2 design.md). Teks tetap `--color-ink-secondary`. |
| Props saat ini | Tidak ada — teks & onClick masih hardcode, sebaiknya ditambah `children` dan `onClick` |

---

## 2. Arrow Button — `aether-primary-btn` ✅

Tombol primary dengan label + chip bundar berisi ikon panah, gaya liquid-glass.

```jsx
import Button from './ArrowButton';

<Button /> // "Get started" + chip panah
```

| Aspek | Detail |
|---|---|
| Style | Glass strong + bevel + chip solid `--color-ink` |
| Radius | Pill (`9999px`) |
| Motion | Hover: naik 1px + chip scale 1.06; Active: scale 0.97 |
| **Catatan** | Ganti `--color-ink` pada `.aether-primary-btn__chip` → `var(--color-accent-strong)` agar chip jadi biru, sesuai §7 design.md |
| Props saat ini | Label & ikon hardcode — sebaiknya diterima sebagai `children`/`icon` prop |

---

## 3. Checkbox — `aether-check` ✅

Grup checkbox dalam `fieldset`, kotak kaca dengan checkmark animasi spring.

```jsx
import Checkbox from './Checkbox';

<Checkbox /> // 3 opsi notifikasi contoh
```

| Aspek | Detail |
|---|---|
| Style | Box glass, fill `--color-ink` saat checked |
| Animasi | Checkmark scale 0→1 dengan `--ease-spring` |
| Focus | Sudah pakai `--focus-ring` |
| **Catatan** | Ganti fill `.aether-check input:checked + .aether-check__box` dari `--color-ink` → `var(--color-accent)` |
| Props saat ini | Label & jumlah opsi hardcode — jadikan array `options` sebagai prop |

---

## 4. Filter Menu / Segmented Tabs — `Radio` (tabs + glider) ✅

Tab pill dengan glider (indikator geser) dan badge notifikasi.

```jsx
import Radio from './FilterMenu';

<Radio /> // Hello (badge 2) · UI · World
```

| Aspek | Detail |
|---|---|
| Style | Putih + aksen `#185ee0` → petakan ke `--color-accent` |
| Mekanisme | `input[type=radio]` tersembunyi + `label` + `.glider` posisi absolut |
| Responsif | `@media max-width:700px` → scale 0.6 |
| **Catatan** | Ganti `#185ee0` dan `#e6eef9` → `var(--color-accent)` / `var(--color-accent-tint)` |
| Keterbatasan | Jumlah tab & posisi glider hardcode 3 tab (`translateX(0/100%/200%)`) — untuk tab dinamis perlu refactor ke JS width calculation |

---

## 5. Card — `aether-card` ✅

Kartu konten glass dengan ikon, badge, judul, body, footer + action.

```jsx
import Card from './Card';

<Card /> // "Layered glass" contoh konten
```

| Aspek | Detail |
|---|---|
| Style | Glass murni, gradient sheen di `::after` |
| Icon container | Fill `--color-ink` (bisa jadi `--color-accent-strong` untuk varian aksen) |
| **Catatan** | Sudah paling representatif untuk gaya "Aether" — jadikan basis card lain |
| Props saat ini | Semua teks hardcode — sebaiknya terima `icon`, `badge`, `title`, `body`, `meta`, `onAction` |

---

## 6. Weather Widget ✅

Kartu cuaca dengan ilustrasi awan+matahari animasi CSS.

```jsx
import WeatherCard from './WeatherWidget';

<WeatherCard /> // Messadine, Tunisia · 23°C
```

| Aspek | Detail |
|---|---|
| Style | Putih + gradient kuning lembut, awan biru `#4c9beb` |
| Animasi | Awan bergoyang (`@keyframes clouds`), sun pulse |
| **Catatan** | Warna awan → `var(--color-accent-soft)`; radius sudah 23px, dekat `--radius-lg` |
| Props saat ini | Lokasi, tanggal, suhu hardcode — jadikan props `location`, `date`, `tempC` |

---

## 7. Stats Widget ⚠️

Kartu statistik neumorphic dengan ikon bulat, judul, persentase naik, angka besar, progress bar.

```jsx
import StatCard from './StatsWidget';

<StatCard /> // Sales · +20% · 39,500
```

| Aspek | Detail |
|---|---|
| Style asal | Abu-abu neumorphic + hijau `#10b981` |
| **Catatan** | Base → `var(--neu-base)` + shadow §5.2; hijau tetap dipakai khusus sebagai indikator "naik" (status color), bukan warna dasar |
| Props saat ini | Judul, angka, persen, fill % hardcode — jadikan props `label`, `value`, `percent`, `trend` |

---

## 8. Folder / Files Card ✅

Kartu folder 3D interaktif (klik untuk buka), menampilkan daftar file dengan tag & search bar mini.

```jsx
import FolderCard from './FolderFilesCard';

<FolderCard /> // 5 file contoh
```

| Aspek | Detail |
|---|---|
| Style | Folder solid `#0056b3` / `rgba(0,123,255,.65)` → sudah dekat `--color-accent-strong` |
| Interaksi | `checkbox` tersembunyi mengontrol `rotateX/Y`, file "terbang" keluar dengan delay bertingkat |
| Warna file | Multi-warna (merah/kuning/biru/cyan/ungu) — boleh tetap variatif untuk membedakan tipe file (data-viz), bukan pelanggaran tema |
| **Catatan** | Ganti hex folder → token `--color-accent-strong` |
| Kompleksitas | Komponen paling berat (banyak keyframe + delay manual) — pertimbangkan generate posisi file dari array, bukan class `.file-1..5` manual, agar jumlah file dinamis |

---

## 9. Container (placeholder) ⚠️

Blok kosong neumorphic — dasar untuk skeleton/placeholder.

```jsx
import Container from './Container';

<Container />
```

| Aspek | Detail |
|---|---|
| Style | `190×254px`, radius 50px, neumorphic abu `#e0e0e0` |
| **Catatan** | Ganti ke `var(--neu-base)` + shadow §5.2. Tidak punya konten — cocok jadi skeleton loading |

---

## 10. Search Input — `cir-search` ✅

Input pencarian pill dengan ikon kaca pembesar dan shortcut `⌘K`.

```jsx
import SearchInput from './SearchFill';

<SearchInput />
```

| Aspek | Detail |
|---|---|
| Style | Putih, border `#e3e8ee`, focus ring biru `#2e7def` |
| **Catatan** | Contoh terbaik pemakaian `--focus-ring`; tinggal ganti `#2e7def` → `var(--color-accent)` |
| Props saat ini | Placeholder & shortcut key hardcode — jadikan props `placeholder`, `shortcut` |

---

## 11. Glass Card (Animated Word) ⚠️

Kartu dengan 3 kata bergantian secara horizontal (carousel teks otomatis).

```jsx
import WordCard from './GlassCardWords';

<WordCard /> // "UI" → "Experiment" → "UI"
```

| Aspek | Detail |
|---|---|
| Style | Abu netral `rgb(223,225,235)`, tanpa aksen warna |
| **Catatan** | Tambahkan tint biru tipis: `background: linear-gradient(..., var(--color-accent-tint) 0%, ...)` agar konsisten tema |
| Props saat ini | Kata-kata hardcode array 3 — jadikan prop `words: string[]` |

---

## 12. Bottom Nav Mobile ✅

Navigasi bawah mobile, glass biru transparan dengan 4 item + status aktif.

```jsx
import BottomNav from './NavMenuMobile';

<BottomNav /> // Home (aktif) · Files · Plans · Settings
```

| Aspek | Detail |
|---|---|
| Style | `rgba(0,122,255,.404)` = referensi utama `--color-accent-glass` |
| Active state | Background putih transparan + teks biru |
| **Catatan** | Sudah 100% sesuai tema — jadikan referensi saat membuat komponen glass-biru lain. Perlu tambah `position: fixed` (saat ini dikomentari) saat dipakai sungguhan |
| Props saat ini | 4 item hardcode — jadikan props `items: {icon, label, active}[]` |

---

## 13. Pricing / Glass Card (Dark) ❌

Kartu harga gelap dengan border animasi berputar (conic gradient spin) dan CTA ungu-pink.

```jsx
import PricingCard from './GlassCardPricing';

<PricingCard /> // "Explosive Growth" + 5 fitur + tombol "Book a Call"
```

| Aspek | Detail |
|---|---|
| Style | Dark (`hsl(240,15%,9%)`) + gradient ungu/pink — **di luar tema biru-putih** |
| Pemakaian | Simpan sebagai varian "promo/dark section" terpisah, jangan dipakai di UI inti (dashboard, form, nav) |
| Jika ingin dipakai dalam tema | Ganti `--primary` dari ungu → `var(--color-accent)`, background dark → `var(--color-surface)` gelap khusus (butuh dark-mode token terpisah, belum ada di design.md) |

---

## 14. Toast (Success) ✅

Notifikasi sukses mengambang dengan ikon centang bulat hijau dan tombol close.

```jsx
import Toast from './Toast';

<Toast /> // "Success message · Everything seems great"
```

| Aspek | Detail |
|---|---|
| Style | Putih solid, ikon hijau `#269b24` (status color, bukan aksen) |
| **Catatan** | Sudah sesuai — hijau di sini benar karena representasi status sukses, bukan warna brand |
| Props saat ini | Teks & warna status hardcode — buat varian `type: success \| error \| warning` yang switch warna ikon otomatis |

---

## 15. Meeting / Event Widget ⚠️

Kartu jadwal dengan selector bulan, info panggilan, dan date-strip mingguan + indikator dot.

```jsx
import MeetingCard from './EventWidget';

<MeetingCard /> // September · 3 calls · Thu, 11 · strip Mon–Sat
```

| Aspek | Detail |
|---|---|
| Style | Putih/abu `#e9eeea`, hari aktif disorot kuning `#f0ff7a` |
| **Catatan** | Ganti highlight `.day-active` dari kuning → `var(--color-accent-tint)` (background) + `var(--color-accent)` (teks/dot) |
| Props saat ini | Bulan, tanggal, daftar hari hardcode — jadikan props `month`, `days: {num, name, active}[]`, `callCount` |

---

## 16. Star Rating ✅

Rating bintang 1–5, urutan visual dibalik via CSS (`float: right` + sibling selector).

```jsx
import StarRating from './StarRating';

<StarRating /> // default terpilih: 3 bintang
```

| Aspek | Detail |
|---|---|
| Style | Bintang abu default `#666`, terisi oranye `#ffa723` |
| **Catatan** | Oranye untuk rating adalah konvensi universal — boleh dipertahankan di luar palet biru (lihat §7 design.md) |
| Props saat ini | Rating awal hardcode `defaultChecked` di star3 — jadikan props `defaultValue`, `onChange` |

---

## Ringkasan Prioritas Perbaikan

| Prioritas | Komponen | Aksi |
|---|---|---|
| Tinggi | Button, Stats Widget, Container | Ganti base neumorphic abu → biru-putih (§5.2) |
| Tinggi | Filter Menu, Search Input | Ganti hex biru lama → token `--color-accent` |
| Sedang | Checkbox, Arrow Button, Folder Card | Ganti fill hitam (`--color-ink`) → `--color-accent-strong` |
| Sedang | Meeting Widget | Ganti highlight kuning → `--color-accent-tint` |
| Rendah | Glass Card (Words) | Tambah tint biru tipis di background |
| Opsional | Pricing Card (dark) | Pertahankan sebagai varian promo, bukan UI inti |

---

## Pola Umum yang Bisa Dijadikan Shared Utility

Beberapa pola berulang di banyak komponenmu — layak dijadikan `mixin`/helper styled-components bersama:

```js
// glassSurface.js
export const glassSurface = css`
  background: var(--color-surface-glass-strong);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-hairline);
  box-shadow: var(--glass-bevel-inset), var(--glass-shadow-resting);
`;

// neuSurface.js
export const neuSurface = css`
  background: var(--neu-base);
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
`;
```

Dipakai di: Card, Arrow Button, Checkbox, Search Input, Bottom Nav (glass) · Button, Stats Widget, Container (neu).

---

*Referensi ini dipasangkan dengan `design.md` — setiap kali membuat komponen baru, cek dulu apakah polanya sudah ada di sini sebelum menulis CSS dari nol.*
