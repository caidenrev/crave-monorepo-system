import React from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Save,
  Plus,
  Table,
  Calculator,
  CheckCircle2,
} from "lucide-react";

interface SpreadsheetExactProps {
  className?: string;
  activeCellProgress?: number;
}

export const SpreadsheetExact: React.FC<SpreadsheetExactProps> = ({
  className = "",
  activeCellProgress = 1,
}) => {
  const columns = ["A", "B", "C", "D", "E", "F"];
  const rows = [
    { id: 1, a: "Tanggal", b: "Kategori", c: "Pendapatan (IDR)", d: "Pengeluaran", e: "Laba Bersih", f: "Status" },
    { id: 2, a: "01/10/2026", b: "Minuman", c: "8.450.000", d: "2.100.000", e: "6.350.000", f: "Tervalidasi" },
    { id: 3, a: "01/10/2026", b: "Makanan", c: "4.200.000", d: "1.250.000", e: "2.950.000", f: "Tervalidasi" },
    { id: 4, a: "01/10/2026", b: "Snack", c: "2.200.000", d: "600.000", e: "1.600.000", f: "Tervalidasi" },
    { id: 5, a: "TOTAL", b: "Semua Kategori", c: "14.850.000", d: "3.950.000", e: "10.900.000", f: "LUNAS ✓" },
  ];

  return (
    <div className={`w-full h-full bg-[#F8FAFC] flex flex-col select-none ${className}`}>
      {/* Top Spreadsheet Header Toolbar */}
      <header className="px-6 py-3 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-200">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <span>Spreadsheet Laporan Keuangan</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Live Formula Sync
              </span>
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Laporan fleksibel bebas edit terintegrasi langsung dengan database POS
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#64748B] shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-soft">
            <Download className="w-3.5 h-3.5" />
            <span>Export .XLSX</span>
          </button>
        </div>
      </header>

      {/* Formula Bar */}
      <div className="px-6 py-2 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center gap-3 text-xs">
        <span className="font-bold text-[#2563EB] px-2 py-0.5 rounded bg-white border border-[#E2E8F0]">
          E5
        </span>
        <span className="font-mono font-bold text-[#64748B]">fx</span>
        <div className="flex-1 px-3 py-1 rounded bg-white border border-[#E2E8F0] font-mono text-xs text-[#0F172A]">
          =SUM(C5-D5) <span className="text-[#10B981] font-bold">➔ Rp 10.900.000</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="w-full bg-white rounded-2xl border border-[#CBD5E1] shadow-soft overflow-hidden">
          {/* Column Header Row */}
          <div className="grid grid-cols-6 bg-[#F8FAFC] border-b border-[#CBD5E1] text-[11px] font-extrabold text-[#64748B] text-center">
            {columns.map((col) => (
              <div key={col} className="py-2 border-r border-[#CBD5E1] last:border-r-0">
                {col}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {rows.map((r, idx) => {
            const isTotalRow = idx === 4;
            const isHeaderRow = idx === 0;

            return (
              <div
                key={r.id}
                className={`grid grid-cols-6 border-b border-[#E2E8F0] text-xs ${
                  isHeaderRow
                    ? "bg-[#F8FAFC] font-extrabold text-[#0F172A]"
                    : isTotalRow
                    ? "bg-blue-50/70 font-black text-[#2563EB]"
                    : "text-[#334155] hover:bg-slate-50"
                }`}
              >
                <div className="px-4 py-2.5 border-r border-[#E2E8F0] truncate">{r.a}</div>
                <div className="px-4 py-2.5 border-r border-[#E2E8F0] truncate">{r.b}</div>
                <div className="px-4 py-2.5 border-r border-[#E2E8F0] truncate font-mono">{r.c}</div>
                <div className="px-4 py-2.5 border-r border-[#E2E8F0] truncate font-mono text-red-500">{r.d}</div>
                <div className={`px-4 py-2.5 border-r border-[#E2E8F0] truncate font-mono ${isTotalRow ? "text-[#10B981]" : ""}`}>
                  {r.e}
                </div>
                <div className="px-4 py-2.5 truncate font-bold text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                    isTotalRow
                      ? "bg-emerald-100 text-emerald-700"
                      : isHeaderRow
                      ? ""
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {r.f}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
