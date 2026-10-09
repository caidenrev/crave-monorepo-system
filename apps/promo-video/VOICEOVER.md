# Crave POS — Voiceover Script

Durasi video ±59 detik (30fps). Timing diambil dari timeline `src/scenes/Scenes.tsx`
(sudah memperhitungkan transisi 20 frame antar scene). Target tempo ±140–150 kata/menit:
tenang, percaya diri, tidak terburu-buru.

| # | Waktu | Scene di layar | Voiceover |
|---|-------|----------------|-----------|
| 1 | 0:00.3 – 0:03.6 | Intro: logo & "Crave" | This is Crave. *(jeda)* Point of sale, reimagined. |
| 2 | 0:04.2 – 0:09.0 | Overview: dasbor muncul | Checkout, payments, inventory and analytics — all in one beautifully simple workspace. |
| 3 | 0:09.6 – 0:15.0 | 01 · Navigation: sidebar bergulir | Every tool is one tap away, organised in a calm, focused sidebar. |
| 4 | 0:15.6 – 0:21.6 | 02 · Checkout: tap produk, keranjang | Ring up orders in seconds. Tap a product — and it's already in the cart. |
| 5 | 0:22.2 – 0:27.3 | 03 · Payments: QRIS → berhasil | Customers pay with QRIS, and Crave confirms every payment the moment it lands. |
| 6 | 0:28.0 – 0:33.4 | 04 · Analytics: grafik & angka | Revenue, trends and best-sellers update live, with every single sale. |
| 7 | 0:34.2 – 0:37.2 | 05 · Inventory: stok menipis | Running low? Crave tells you first. |
| 8 | 0:37.8 – 0:43.0 | 06 · Products: dialog tambah produk | Adding a new product takes seconds — and it's ready to sell instantly. |
| 9 | 0:43.6 – 0:48.0 | 07 · Suppliers: tombol WhatsApp | Reorder from any supplier with a single WhatsApp message. |
| 10 | 0:48.6 – 0:53.4 | 08 · Spreadsheet: rumus SUM | And when you need the numbers, your reports are ready for Excel. |
| 11 | 0:54.4 – 0:59.0 | Outro: logo & CTA | Crave. *(jeda)* Sell smarter. *(jeda)* Grow faster. |

## Naskah utuh (untuk ditempel ke TTS)

```
This is Crave. <break time="0.5s" /> Point of sale, reimagined.
<break time="0.6s" />
Checkout, payments, inventory and analytics — all in one beautifully simple workspace.
<break time="0.6s" />
Every tool is one tap away, organised in a calm, focused sidebar.
<break time="0.6s" />
Ring up orders in seconds. Tap a product — and it's already in the cart.
<break time="0.6s" />
Customers pay with QRIS, and Crave confirms every payment the moment it lands.
<break time="0.7s" />
Revenue, trends and best-sellers update live, with every single sale.
<break time="0.8s" />
Running low? Crave tells you first.
<break time="0.6s" />
Adding a new product takes seconds — and it's ready to sell instantly.
<break time="0.6s" />
Reorder from any supplier with a single WhatsApp message.
<break time="0.6s" />
And when you need the numbers, your reports are ready for Excel.
<break time="0.9s" />
Crave. <break time="0.6s" /> Sell smarter. <break time="0.4s" /> Grow faster.
```

> Tag `<break time="…" />` didukung ElevenLabs. Untuk TTS lain, hapus tag-nya dan
> generate per baris (lihat saran di bawah).

## Arahan suara (voice direction)

- **Karakter:** hangat, percaya diri, modern — seperti narator demo produk startup
  (Apple / Linear / Stripe). Bukan suara iklan TV yang berteriak.
- **Tempo:** sedang–lambat, ±140–150 kata/menit, beri ruang napas antar kalimat.
- **Nada:** sedikit tersenyum; kata kunci diberi tekanan ringan: *seconds*, *real time*,
  *live*, *instantly*, *Excel*, *Grow faster*.
- **Penutup:** "Crave." diucapkan tenang & mantap, "Grow faster." turun di akhir (bukan naik).

## Cara generate yang disarankan

**Paling rapi: generate per baris, bukan sekaligus.** Tiap baris tabel jadi satu file
(`vo-01.mp3` … `vo-11.mp3`), lalu diletakkan di frame awal scene-nya. Dengan begitu
sinkronisasi tidak bergeser walau satu kalimat lebih panjang/pendek dari perkiraan.

Pilihan tool:

1. **ElevenLabs** — kualitas paling natural untuk promo.
   - Pilih suara narasi pria/wanita yang *warm & conversational* dari Voice Library
     (filter: *Narrative / Advertisement*, aksen *American* atau *British*).
   - Setting awal: Stability ±45–55%, Similarity ±75%, Style ±15–25%, Speaker boost ON.
   - Kalau terdengar datar, turunkan Stability; kalau tidak konsisten antar baris, naikkan.
2. **OpenAI TTS** (model TTS terbaru yang mendukung *instructions*) — cocok kalau ingin
   mengatur gaya lewat teks, contoh instruksi:
   *"Warm, confident product-demo narrator. Calm pace, subtle smile, light emphasis on
   key words. No hype."*
3. **Google Cloud / Azure TTS** — pakai suara kategori *Neural/Studio*, dukung SSML
   `<break>` dan `<emphasis>`.

Ekspor: **WAV 48 kHz** (atau MP3 320 kbps), mono.

## Musik & mixing

- Musik latar: ambient electronic / soft corporate dengan beat ringan, ±100–110 BPM,
  tanpa vokal. Pastikan lisensinya boleh untuk komersial.
- Level: voiceover sekitar **-16 LUFS** (media sosial), musik **8–12 dB di bawah** VO,
  dan diturunkan (*ducking*) saat ada suara.
- Aksen suara kecil yang cocok: "whoosh" halus di transisi zoom-blur, dan bunyi
  "cha-ching" di momen *Pembayaran Berhasil* (±0:24.8).

## Memasang audio ke video

Taruh file di `apps/promo-video/public/` (mis. `public/vo/vo-01.mp3`, `public/music.mp3`),
lalu audio dipasang dengan komponen `<Audio>` Remotion di awal tiap scene. Render ulang
dengan `npm run video:render:landscape` dan `npm run video:render`.
