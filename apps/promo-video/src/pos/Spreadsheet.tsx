/**
 * Salinan halaman Spreadsheet (apps/pos-system/src/routes/spreadsheet.tsx),
 * memakai komponen Workbook (@fortune-sheet/react) yang sama dengan pos-system.
 */
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { Save, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, salesByHour } from "@/lib/pos-data";

export const spreadsheetActions = (
  <div className="flex gap-2">
    <Button variant="outline" className="rounded-xl">
      <Upload className="size-4 mr-2" /> Import
    </Button>
    <Button variant="outline" className="rounded-xl">
      <Download className="size-4 mr-2" /> Export
    </Button>
    <Button className="rounded-xl">
      <Save className="size-4 mr-2" /> Simpan Data
    </Button>
  </div>
);

const header = ["Tanggal", "Produk", "Kategori", "Qty", "Harga", "Total"];
const days = [
  "01/10",
  "02/10",
  "03/10",
  "04/10",
  "05/10",
  "06/10",
  "07/10",
  "08/10",
  "09/10",
  "10/10",
  "11/10",
  "12/10",
];
const rows = products.map((p, i) => {
  const qty =
    6 + ((i * 7 + salesByHour[i % salesByHour.length]!.transaksi) % 23);
  return [days[i]!, p.name, p.category, qty, p.price, qty * p.price];
});

const cell = (
  r: number,
  c: number,
  v: string | number,
  extra: Record<string, unknown> = {},
) => ({
  r,
  c,
  v: {
    v,
    m:
      typeof v === "number" && c >= 4
        ? `Rp${v.toLocaleString("id-ID")}`
        : String(v),
    ...(typeof v === "number" && c >= 4
      ? { ct: { fa: '"Rp"#,##0', t: "n" } }
      : {}),
    ...extra,
  },
});

const totalRow = rows.length + 1;
const grandTotal = rows.reduce((a, r) => a + (r[5] as number), 0);

export const SHEET_DATA = [
  {
    id: "sheet_laporan",
    name: "Laporan Oktober",
    status: 1,
    row: 60,
    column: 18,
    config: { columnlen: { 0: 80, 1: 170, 2: 100, 3: 60, 4: 110, 5: 130 } },
    celldata: [
      ...header.map((h, c) =>
        cell(0, c, h, { bl: 1, bg: "#eff4ff", fc: "#1d4ed8" }),
      ),
      ...rows.flatMap((row, i) =>
        row.map((v, c) =>
          c === 5
            ? cell(i + 1, c, v, { f: `=D${i + 2}*E${i + 2}` })
            : cell(i + 1, c, v),
        ),
      ),
      cell(totalRow, 4, "Total", { bl: 1 }),
      cell(totalRow, 5, grandTotal, {
        bl: 1,
        f: `=SUM(F2:F${totalRow})`,
        fc: "#1d4ed8",
      }),
    ],
  },
  {
    id: "sheet_stok",
    name: "Stok Gudang",
    status: 0,
    row: 60,
    column: 18,
    celldata: [],
  },
];

export const SHEET_TOTAL = grandTotal;
export const SHEET_TOTAL_ROW = totalRow;

export function Spreadsheet({ height }: { height: number }) {
  // fortune-sheet menggambar ke canvas setelah mount — tunggu sampai siap sebelum frame diambil
  const [handle] = useState(() => delayRender("fortune-sheet"));
  useEffect(() => {
    const t = setTimeout(() => continueRender(handle), 1500);
    return () => clearTimeout(t);
  }, [handle]);

  return (
    <div
      className="card-soft border border-border"
      style={{ height, position: "relative", zIndex: 10 }}
    >
      <Workbook data={SHEET_DATA as never} />
    </div>
  );
}
