import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

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

  return (
    <AppShell
      title="Spreadsheet Data"
      subtitle="Bebas mengedit dan menggunakan rumus seperti di Excel"
      actions={
        <Button className="rounded-xl" onClick={handleSave}>
          <Save className="size-4 mr-2" /> Simpan Data
        </Button>
      }
    >
      <div
        className="card-soft border border-border"
        style={{ height: "calc(100vh - 120px)", position: "relative", zIndex: 10 }}
      >
        {isLoaded && data.length > 0 ? (
          <Workbook
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
