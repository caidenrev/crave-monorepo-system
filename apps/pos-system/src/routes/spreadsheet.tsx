import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/spreadsheet")({
  head: () => ({
    meta: [
      { title: "Spreadsheet Data — Crave" },
      { name: "description", content: "Spreadsheet Excel untuk laporan bebas" },
    ],
  }),
  component: SpreadsheetPage,
});

function SpreadsheetPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [workbookKey, setWorkbookKey] = useState(Date.now().toString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crave_spreadsheet");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        const expandedData = parsed.map((sheet: any) => ({
          ...sheet,
          row: Math.max(sheet.row || 0, 100),
          column: Math.max(sheet.column || 0, 26),
        }));
        setData(expandedData);
      } catch (e) {
        console.error(e);
        initEmpty();
      }
    } else {
      initEmpty();
    }
    setIsLoaded(true);
  }, []);

  const initEmpty = () => {
    setData([
      {
        id: "sheet_" + Date.now(),
        name: "Laporan Bebas",
        status: 1,
        row: 100,
        column: 26,
        celldata: [
          { r: 0, c: 0, v: { v: "Nama Klien", m: "Nama Klien", bl: 1 } },
          { r: 0, c: 1, v: { v: "Tagihan", m: "Tagihan", bl: 1 } },
          { r: 0, c: 2, v: { v: "Tanggal", m: "Tanggal", bl: 1 } },
        ],
      },
    ]);
  };

  const handleSave = () => {
    toast.success("Spreadsheet disimpan secara otomatis ke memori lokal!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Mengimpor file Excel...");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const newSheets = wb.SheetNames.map((sheetName, index) => {
          const ws = wb.Sheets[sheetName];
          if (!ws) return null;
          const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          const celldata: any[] = [];
          for (let r = 0; r < sheetData.length; r++) {
            const row = sheetData[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
              const val = row[c];
              if (val !== undefined && val !== null && val !== "") {
                celldata.push({
                  r,
                  c,
                  v: { v: val, m: String(val) }
                });
              }
            }
          }

          return {
            id: `sheet_${Math.random().toString(36).substring(2, 9)}`,
            name: sheetName,
            status: index === 0 ? 1 : 0,
            row: Math.max(sheetData.length + 50, 100),
            column: Math.max((sheetData[0]?.length || 0) + 20, 26),
            celldata
          };
        }).filter(Boolean);

        setData(newSheets);
        setWorkbookKey(Date.now().toString());
        localStorage.setItem("crave_spreadsheet", JSON.stringify(newSheets));
        toast.dismiss(loadingToast);
        toast.success("Berhasil mengimpor file Excel!");
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Gagal membaca file Excel.");
        console.error(err);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      data.forEach((sheet) => {
        const aoa: any[][] = [];
        if (sheet.celldata) {
          sheet.celldata.forEach((cell: any) => {
            let rowArr = aoa[cell.r];
            if (!rowArr) {
              rowArr = [];
              aoa[cell.r] = rowArr;
            }
            rowArr[cell.c] = cell.v?.m || cell.v?.v || "";
          });
        }
        
        for (let i = 0; i < aoa.length; i++) {
          if (!aoa[i]) aoa[i] = [];
        }
        
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Sheet");
      });
      
      XLSX.writeFile(wb, "Crave_Spreadsheet.xlsx");
      toast.success("Berhasil mengekspor ke Excel!");
    } catch (err) {
      toast.error("Gagal mengekspor file.");
      console.error(err);
    }
  };

  return (
    <AppShell
      title="Spreadsheet Data"
      subtitle="Bebas mengedit dan menggunakan rumus seperti di Excel"
      actions={
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={handleExport}>
            <Download className="size-4 mr-2" /> Export
          </Button>
          <Button className="rounded-xl" onClick={handleSave}>
            <Save className="size-4 mr-2" /> Simpan Data
          </Button>
        </div>
      }
    >
      <div
        className="card-soft border border-border"
        style={{ height: "calc(100vh - 120px)", position: "relative", zIndex: 10 }}
      >
        {isLoaded && data.length > 0 ? (
          <Workbook
            key={workbookKey}
            data={data}
            onChange={(newData: any) => {
              localStorage.setItem("crave_spreadsheet", JSON.stringify(newData));
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Memuat Excel...
          </div>
        )}
      </div>
    </AppShell>
  );
}
