import type { CartLine } from "./pos-data";
import type { PaperWidth, StoreProfile } from "./useStoreProfile";

/** Data satu transaksi untuk dicetak di struk. */
export type ReceiptData = {
  transactionId: string;
  createdAt: Date;
  cashierName: string;
  customerName?: string;
  method: "QRIS" | "Kartu" | "Tunai";
  lines: CartLine[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
};

/** Nomor struk = 8 karakter pertama ID transaksi, sama seperti di laporan. */
export const receiptNumber = (transactionId: string) =>
  transactionId.replace(/-/g, "").slice(0, 8).toUpperCase();

const num = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatDate = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** HTML struk siap cetak untuk printer thermal 58 mm / 80 mm. */
export function buildReceiptHtml(r: ReceiptData, store: StoreProfile): string {
  const paper: PaperWidth = store.paper_width;
  // area cetak efektif: 58 mm → ±48 mm, 80 mm → ±72 mm
  const printable = paper === 80 ? 72 : 48;
  const fontPx = paper === 80 ? 12 : 11;
  const row = (left: string, right: string, cls = "") =>
    `<div class="row ${cls}"><span>${left}</span><span>${right}</span></div>`;

  const items = r.lines
    .map(
      (l) => `<div class="item">
        <div class="name">${esc(l.product.name)}</div>
        ${row(`${l.qty} x ${num(l.product.price)}`, num(l.product.price * l.qty))}
      </div>`,
    )
    .join("");

  const totalQty = r.lines.reduce((a, l) => a + l.qty, 0);
  const storeName = store.name.trim() || "Toko";

  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Struk ${receiptNumber(r.transactionId)}</title>
<style>
  @page { size: ${paper}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { width: ${paper}mm; padding: 3mm ${(paper - printable) / 2}mm 6mm;
    font: ${fontPx}px/1.35 "Courier New", ui-monospace, Menlo, monospace; }
  .center { text-align: center; }
  .logo { display: block; margin: 0 auto 2mm; max-width: ${Math.round(printable * 0.6)}mm; max-height: 22mm; object-fit: contain; }
  .store { font-size: ${fontPx + 3}px; font-weight: 700; text-transform: uppercase; }
  .muted { font-size: ${fontPx - 1}px; }
  hr { border: 0; border-top: 1px dashed #000; margin: 2mm 0; }
  .row { display: flex; justify-content: space-between; gap: 2mm; }
  .row span:last-child { text-align: right; white-space: nowrap; }
  .meta .row span:first-child { white-space: nowrap; }
  .meta .row span:last-child { white-space: normal; word-break: break-word; }
  .item { margin-bottom: 1mm; }
  .item .name { word-break: break-word; }
  .item .row { padding-left: 2mm; }
  .total { font-weight: 700; font-size: ${fontPx + 2}px; }
  .footer { margin-top: 3mm; white-space: pre-line; }
</style></head>
<body>
  <div class="center">
    ${store.logo_data ? `<img class="logo" src="${store.logo_data}" alt="">` : ""}
    <div class="store">${esc(storeName)}</div>
    ${store.address ? `<div class="muted">${esc(store.address)}</div>` : ""}
    ${store.phone ? `<div class="muted">Telp. ${esc(store.phone)}</div>` : ""}
  </div>
  <hr>
  <div class="meta">
    ${row("No. Struk", receiptNumber(r.transactionId))}
    ${row("Tanggal", formatDate(r.createdAt))}
    ${row("Kasir", esc(r.cashierName))}
    ${r.customerName?.trim() ? row("Pelanggan", esc(r.customerName.trim())) : ""}
  </div>
  <hr>
  ${items}
  <hr>
  ${row(`Subtotal (${totalQty} item)`, num(r.subtotal))}
  ${row(`Pajak ${Math.round(r.taxRate * 100)}%`, num(r.tax))}
  ${row("TOTAL", `Rp${num(r.total)}`, "total")}
  ${row(`Bayar (${esc(r.method)})`, num(r.total))}
  <hr>
  <div class="center footer">${esc(store.receipt_footer.trim() || "Terima kasih atas kunjungan Anda!")}</div>
</body></html>`;
}

/**
 * Cetak struk lewat iframe tersembunyi agar yang tercetak hanya struk, bukan seluruh
 * halaman. Memakai dialog cetak browser (printer thermal Bluetooth bisa lewat aplikasi
 * seperti RawBT di Android). Catatan: WebView aplikasi Android (APK) tidak punya
 * dialog cetak — butuh plugin printer native.
 */
export function printReceipt(r: ReceiptData, store: StoreProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) {
      frame.remove();
      reject(new Error("Browser tidak mendukung pencetakan"));
      return;
    }
    doc.open();
    doc.write(buildReceiptHtml(r, store));
    doc.close();

    const cleanup = () => setTimeout(() => frame.remove(), 1000);
    const go = () => {
      try {
        win.focus();
        win.print();
        resolve();
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Gagal membuka dialog cetak"));
      } finally {
        cleanup();
      }
    };
    // tunggu logo termuat sebelum mencetak
    const img = doc.querySelector("img");
    if (img && !img.complete) {
      img.onload = go;
      img.onerror = go;
    } else {
      setTimeout(go, 50);
    }
  });
}

/**
 * Kecilkan gambar logo untuk struk: lebar maks. 384 px (lebar cetak printer 58 mm),
 * latar putih, JPEG. Hasilnya biasanya < 50 KB.
 */
export function resizeLogo(file: File, maxWidth = 384): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File harus berupa gambar (PNG atau JPG)"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width, (maxWidth * 0.6) / img.height);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Browser tidak mendukung pengolahan gambar"));
        return;
      }
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };
    img.src = url;
  });
}
