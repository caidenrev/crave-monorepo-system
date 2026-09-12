import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rupiah } from "@/lib/pos-data";

export function ProfitProjection() {
  const [initialCapital, setInitialCapital] = useState<number>(10000000);
  const [dailySalesQty, setDailySalesQty] = useState<number>(50);
  const [avgProfitPerCup, setAvgProfitPerCup] = useState<number>(7000);
  const [monthlyOpex, setMonthlyOpex] = useState<number>(2000000); // Gaji, listrik, dll di luar HPP

  const dailyProfit = (dailySalesQty * avgProfitPerCup);
  const monthlyGrossProfit = dailyProfit * 30;
  const monthlyNetProfit = monthlyGrossProfit - monthlyOpex;

  const monthsToBEP = monthlyNetProfit > 0 ? initialCapital / monthlyNetProfit : 0;

  // Generate projection data for 12 months
  const projectionData = Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    const accumulatedProfit = monthlyNetProfit * month;
    return {
      name: `Bulan ${month}`,
      Keuntungan: accumulatedProfit,
      BEP: initialCapital,
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-xl shadow-soft md:col-span-1">
        <CardHeader>
          <CardTitle>Parameter Proyeksi</CardTitle>
          <CardDescription>Ubah parameter untuk melihat simulasi profit bulanan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Total Modal Disetor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <Input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Penjualan (Porsi / Hari)</Label>
            <Input
              type="number"
              value={dailySalesQty}
              onChange={(e) => setDailySalesQty(Number(e.target.value))}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Rata-rata Untung Kotor (Per Porsi)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <Input
                type="number"
                value={avgProfitPerCup}
                onChange={(e) => setAvgProfitPerCup(Number(e.target.value))}
                className="pl-10 rounded-xl"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Harga Jual dikurangi HPP</p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label>Biaya Operasional Tetap / Bulan</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">Rp</span>
              <Input
                type="number"
                value={monthlyOpex}
                onChange={(e) => setMonthlyOpex(Number(e.target.value))}
                className="pl-10 rounded-xl"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Gaji karyawan, listrik, sewa tempat, internet</p>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="rounded-xl shadow-soft">
            <CardContent className="p-6 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-1">Proyeksi Laba Bersih per Bulan</p>
              <p className={`text-3xl font-black ${monthlyNetProfit > 0 ? "text-green-500" : "text-destructive"}`}>
                {rupiah(monthlyNetProfit)}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-soft">
            <CardContent className="p-6 flex flex-col justify-center">
              <p className="text-sm text-muted-foreground mb-1">Estimasi Balik Modal (BEP)</p>
              <p className="text-3xl font-black text-primary">
                {monthsToBEP > 0 ? `${monthsToBEP.toFixed(1)} Bulan` : "Tidak Pernah"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle>Grafik Break-Even Point (BEP)</CardTitle>
            <CardDescription>Titik perpotongan adalah bulan dimana modal awal Anda kembali (ROI 100%).</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`}
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <RechartsTooltip 
                  formatter={(value: number) => rupiah(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                {/* Garis batas modal awal */}
                <Area 
                  type="monotone" 
                  dataKey="BEP" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  fillOpacity={0} 
                  activeDot={false}
                  name="Garis Modal Awal"
                />
                {/* Grafik akumulasi keuntungan */}
                <Area 
                  type="monotone" 
                  dataKey="Keuntungan" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  name="Akumulasi Laba Bersih"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
