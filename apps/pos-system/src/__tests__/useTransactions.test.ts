import { describe, it, expect } from "vitest";
import { newTransactionId } from "../useTransactions";

describe("newTransactionId", () => {
  it("menghasilkan string UUID v4 format (36 karakter, 5 segmen dipisah '-')", () => {
    const id = newTransactionId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(id).toHaveLength(36);
  });

  it("menghasilkan ID yang unik setiap panggilan", () => {
    const id1 = newTransactionId();
    const id2 = newTransactionId();
    const id3 = newTransactionId();
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it("versi UUID selalu 4 (karakter ke-14 = '4')", () => {
    for (let i = 0; i < 100; i++) {
      const id = newTransactionId();
      expect(id[14]).toBe("4");
    }
  });

  it("variant selalu 8/9/a/b (karakter ke-19)", () => {
    for (let i = 0; i < 100; i++) {
      const id = newTransactionId();
      expect(["8", "9", "a", "b"]).toContain(id[19].toLowerCase());
    }
  });
});
