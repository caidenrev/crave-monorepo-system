import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { rupiah } from "@/lib/pos-data";

export function CapitalSimulator() {
  const [totalCapital, setTotalCapital] = useState<number>(10000000);
  const [capexPercent, setCapexPercent] = useState<number>(60);
  
  const opexPercent = 100 - capexPercent;
  const capexAmount = (totalCapital * capexPercent) / 100;
  const opexAmount = (totalCapital * opexPercent) / 100;

  const chartData = [
    { name: "Aset Tetap (Capex)", value: capexAmount, color: "#3b82f6" }, // blue-500
    { name: "Operasional (Opex)", value: opexAmount, color: "#10b981" }, // emerald-500
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-xl shadow-soft">
        <CardHeader>
          <CardTitle>Input Modal</CardTitle>
          <CardDescription>Tentukan modal awal dan alokasi dana.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="total-capital">Total Modal Awal</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <Input
                id="total-capital"
                type="number"
                min={0}
                value={totalCapital}
                onChange={(e) => setTotalCapital(Number(e.target.value))}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Alokasi Aset Tetap (Capex)</Label>
              <span className="text-sm font-semibold text-primary">{capexPercent}%</span>
            </div>
            <Slider
              value={[capexPercent]}
              onValueChange={(vals) => setCapexPercent(vals[0] || 0)}
              max={100}
              step={5}
              className="py-4"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              * Capex (Capital Expenditure) meliputi pembelian mesin, renovasi, gerobak, dll.<br/>
              * Opex (Operational Expenditure) meliputi gaji, sewa, bahan baku awal ({opexPercent}%).
            </p>
          </div>

          <div className="pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anggaran Capex</p>
              <p className="font-bold text-lg">{rupiah(capexAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anggaran Opex</p>
              <p className="font-bold text-lg">{rupiah(opexAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-soft">
        <CardHeader>
          <CardTitle>Visualisasi Alokasi</CardTitle>
          <CardDescription>Grafik pembagian modal Anda.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => rupiah(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
