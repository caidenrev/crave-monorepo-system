import { describe, it, expect } from "vitest";
import {
  receiptNumber,
  buildReceiptHtml,
  type ReceiptData,
} from "../receipt";
import type { StoreProfile } from "../useStoreProfile";
import { products } from "../pos-data";

const store58: StoreProfile = {
  name: "Kopi Senja",
  address: "Jl. Merdeka No. 42",
  phone: "081234567890",
  receipt_footer: "Terima kasih!",
  logo_data: null,
  paper_width: 58,
};

const store80: StoreProfile = {
  ...store58,
  paper_width: 80,
};

function makeReceipt(overrides: Partial<ReceiptData> = {}): ReceiptData {
  return {
    transactionId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    createdAt: new Date("2024-01-15T10:30:00"),
    cashierName: "Dewi Lestari",
    method: "QRIS",
    lines: [
      { product: products[0], qty: 2 },
      { product: products[4], qty: 1 },
    ],
    subtotal: 61000,
    tax: 6100,
    taxRate: 0.1,
    total: 67100,
    ...overrides,
  };
}

describe("receiptNumber", () => {
  it("mengambil 8 karakter pertama UUID tanpa '-', di-uppercase", () => {
    expect(receiptNumber("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d")).toBe("A1B2C3D4");
  });

  it("menangani UUID pendek", () => {
    expect(receiptNumber("abc-1234")).toBe("ABC12340");
  });

  it("menangani string kosong", () => {
    expect(receiptNumber("")).toBe("");
  });
});

describe("buildReceiptHtml", () => {
  it("menghasilkan HTML yang valid dengan tag <!doctype html>", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("menampilkan nama toko", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("Kopi Senja");
  });

  it("menampilkan alamat dan telepon toko", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("Jl. Merdeka No. 42");
    expect(html).toContain("081234567890");
  });

  it("menampilkan nomor struk dari transactionId", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("A1B2C3D4");
  });

  it("menampilkan nama kasir", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("Dewi Lestari");
  });

  it("menampilkan setiap item di keranjang", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("Es Kopi Susu");
    expect(html).toContain("Croissant Butter");
  });

  it("menampilkan metode pembayaran", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("QRIS");
  });

  it("menampilkan footer struk", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("Terima kasih!");
  });

  it("pakai @page 58mm untuk paper_width 58", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("58mm");
  });

  it("pakai @page 80mm untuk paper_width 80", () => {
    const html = buildReceiptHtml(makeReceipt(), store80);
    expect(html).toContain("80mm");
  });

  it("escape karakter HTML berbahaya di nama produk", () => {
    const maliciousProduct = {
      ...products[0],
      name: '<script>alert("xss")</script>',
    };
    const html = buildReceiptHtml(
      makeReceipt({
        lines: [{ product: maliciousProduct, qty: 1 }],
      }),
      store58,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
  });

  it("menampilkan nama pelanggan bila ada", () => {
    const html = buildReceiptHtml(
      makeReceipt({ customerName: "Budi Santoso" }),
      store58,
    );
    expect(html).toContain("Budi Santoso");
  });

  it("tidak menampilkan baris pelanggan bila kosong", () => {
    const html = buildReceiptHtml(
      makeReceipt({ customerName: "  " }),
      store58,
    );
    expect(html).not.toContain("Pelanggan");
  });

  it("menampilkan total quantity item", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    // 2 Es Kopi + 1 Croissant = 3 item
    expect(html).toContain("3 item");
  });

  it("menampilkan persentase pajak", () => {
    const html = buildReceiptHtml(makeReceipt(), store58);
    expect(html).toContain("10%");
  });
});
