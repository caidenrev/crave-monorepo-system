# Logo Crave Event: panduan pemakaian

## Idenya
Huruf **C** berbentuk cincin, dengan **titik merah "LIVE"** di celahnya: event sedang berlangsung.
Hurufnya senada dengan Crave POS, tapi titik merah itu yang jadi ciri khas Crave Event.

## File

| Kebutuhan | File |
|---|---|
| Header web/app (latar terang) | `crave-event-horizontal.svg` |
| Header di latar gelap | `crave-event-horizontal-dark.svg` |
| Poster, sertifikat, slide pembuka | `crave-event-stacked.svg` / `-dark.svg` |
| Tulisan saja | `crave-event-wordmark.svg` / `-dark.svg` |
| Simbol saja (avatar, stiker, watermark) | `crave-event-symbol.svg` |
| Ukuran kecil (≤ 32 px) | `crave-event-symbol-small.svg` (cincin lebih tebal, celah lebih lebar) |
| Satu warna (hitam / putih / biru) | folder `symbol/`, `horizontal/`, `stacked/`, `wordmark/` |
| Favicon & ikon PWA | `symbol/favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192/512.png`, `maskable-512.png`, `site.webmanifest`, `head-snippet.html` |
| Ikon app (putih di atas biru) | `symbol/crave-event-symbol-app-icon.svg` |
| PNG siap pakai | folder `png/` |

Semua SVG berupa path murni (tanpa font), jadi tampilannya sama di mana pun.
Untuk mengubah bentuk, edit `../build_logo.py` lalu jalankan `python build_logo.py`.

## Warna

| Nama | HEX | RGB | Dipakai untuk |
|---|---|---|---|
| Crave Blue | `#0A84FF` | 10, 132, 255 | cincin C, tulisan "event" |
| Live Red | `#FF3B30` | 255, 59, 48 | titik live (hanya di situ) |
| Ink | `#1D1D1F` | 29, 29, 31 | tulisan "crave" di latar terang |
| White | `#FFFFFF` | 255, 255, 255 | tulisan "crave" di latar gelap |

Warnanya sama dengan token `--accent`, `--danger` dan `--ink` di `src/styles.css`.
Merah hanya untuk titik live, jangan dipakai di bagian logo lain.

## Ruang kosong & ukuran minimum
- **Ruang kosong:** di sekeliling logo, sisakan jarak minimal **selebar titik live (diameternya)**. Jangan ada teks atau gambar lain di area itu.
- **Minimum:** lockup horizontal minimal **96 px** lebar (25 mm cetak). Simbol minimal **16 px**; di bawah 32 px pakai `symbol-small`.

## Latar yang boleh
- Putih / abu terang (`#F5F7FB`) → versi berwarna.
- Gelap / navy (`#0B1530`, hitam) → versi `-dark`, atau versi putih.
- Biru brand → versi putih saja.
- Foto → hanya kalau area di belakang logo cukup tenang; pakai versi putih atau hitam.

## Jangan
- Mengubah proporsi (stretch / squash) atau memutar logo.
- Mengganti warna titik live, atau menghilangkannya dari simbol.
- Mengganti tulisan "crave event" dengan font lain, atau menulisnya dengan huruf kapital.
- Menambah bayangan, gradien, outline, atau efek 3D.
- Menaruh logo berwarna di atas latar biru atau merah.

## Catatan
- Huruf "crave event" digambar khusus (garis geometris dengan ujung bulat). SF Pro tidak dipakai karena lisensi Apple tidak mengizinkannya untuk logo.
- Belum ada pengecekan merek dagang. Cek dulu ke PDKI / DJKI sebelum logo dipakai resmi.
