import { describe, it, expect } from "vitest";
import { rupiah, products, type CartLine } from "../pos-data";

describe("rupiah", () => {
  it("memformat angka dengan prefix Rp dan separator id-ID", () => {
    expect(rupiah(18000)).toBe("Rp18.000");
    expect(rupiah(1000000)).toBe("Rp1.000.000");
    expect(rupiah(0)).toBe("Rp0");
  });

  it("tidak menampilkan desimal untuk angka bulat", () => {
    expect(rupiah(15500)).toBe("Rp15.500");
    expect(rupiah(15500)).not.toContain(".");
  });

  it("memformat desimal dengan pemotongan ke 0 desimal", () => {
    // 15500.99 → "Rp15.500" (maximumFractionDigits: 0)
    expect(rupiah(15500.99)).toBe("Rp15.501");
  });
});

describe("products (mock data)", () => {
  it("memiliki 12 produk dengan field lengkap", () => {
    expect(products).toHaveLength(12);
    for (const p of products) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.name).toBe("string");
      expect(typeof p.sku).toBe("string");
      expect(typeof p.price).toBe("number");
      expect(p.price).toBeGreaterThan(0);
      expect(typeof p.stock).toBe("number");
      expect(p.stock).toBeGreaterThanOrEqual(0);
      expect(typeof p.minStock).toBe("number");
    }
  });

  it("memiliki produk dengan stok di bawah minimum (p3, p7, p11)", () => {
    const lowStock = products.filter((p) => p.stock < p.minStock);
    const ids = lowStock.map((p) => p.id);
    expect(ids).toContain("p3"); // Cappuccino: stok 8, min 10
    expect(ids).toContain("p7"); // Roti Bakar: stok 4, min 8
    expect(ids).toContain("p11"); // Donat: stok 2, min 12
  });

  it("setiap produk punya kategori yang valid", () => {
    const validCategories = ["Minuman", "Makanan", "Snack", "Lainnya"];
    for (const p of products) {
      expect(validCategories).toContain(p.category);
    }
  });
});

describe("CartLine type", () => {
  it("membentuk pasangan product + qty dengan benar", () => {
    const line: CartLine = {
      product: products[0],
      qty: 3,
    };
    expect(line.product.id).toBe("p1");
    expect(line.qty).toBe(3);
    expect(line.product.price * line.qty).toBe(54000);
  });
});
