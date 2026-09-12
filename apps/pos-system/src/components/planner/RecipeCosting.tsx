import { useState } from "react";
import { Plus, Trash2, ArrowRight, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rupiah } from "@/lib/pos-data";
import { usePlanner, type Recipe } from "@/lib/usePlanner";
import { toast } from "sonner";

export interface CustomIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  price: number; // Harga aktual (total untuk kuantitas ini)
}

export function RecipeCosting() {
  const { recipes, isLoadingRecipes, saveRecipeMutation } = usePlanner();

  const [recipeName, setRecipeName] = useState("Kopi Susu Spesial");
  const [targetMargin, setTargetMargin] = useState<number>(50);
  const [ingredients, setIngredients] = useState<CustomIngredient[]>([
    { id: "1", name: "Biji Kopi Arabika", amount: 18, unit: "gram", price: 3500 },
    { id: "2", name: "Susu Segar", amount: 120, unit: "ml", price: 2400 },
    { id: "3", name: "Gula Aren", amount: 20, unit: "ml", price: 1000 },
    { id: "4", name: "Cup + Sedotan", amount: 1, unit: "pcs", price: 1500 },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: "", amount: 1, unit: "pcs", price: 0 }
    ]);
  };

  const updateIngredient = (id: string, field: keyof CustomIngredient, value: string | number) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const totalCOGS = ingredients.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Margin 50% artinya Harga Jual = HPP / 0.5
  const suggestedPrice = totalCOGS / (1 - (targetMargin / 100));
  const potentialProfit = suggestedPrice - totalCOGS;

  const handleSave = () => {
    if (!recipeName) {
      toast.error("Nama resep tidak boleh kosong");
      return;
    }
    
    saveRecipeMutation.mutate({
      name: recipeName,
      target_margin: targetMargin,
      ingredients: ingredients
    }, {
      onSuccess: () => {
        toast.success(`Resep "${recipeName}" berhasil disimpan!`);
      },
      onError: (err) => toast.error("Gagal menyimpan resep: " + err.message)
    });
  };

  const handleLoadRecipe = (id: string) => {
    const loaded = recipes.find(r => r.id === id);
    if (loaded) {
      setRecipeName(loaded.name);
      setTargetMargin(loaded.target_margin);
      setIngredients(loaded.ingredients);
      toast.info(`Resep "${loaded.name}" dimuat`);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div className="md:col-span-7 space-y-4">
        <Card className="rounded-xl shadow-soft h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Buat Resep & Kalkulasi HPP</CardTitle>
              <CardDescription className="mt-1">Rancang resep baru dan hitung modal per porsinya secara dinamis.</CardDescription>
            </div>
            
            <Select onValueChange={handleLoadRecipe}>
              <SelectTrigger className="w-[180px] rounded-xl bg-muted/50 border-transparent shadow-none">
                <SelectValue placeholder="Muat Resep Tersimpan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {recipes.length === 0 ? (
                  <SelectItem value="none" disabled>Belum ada resep</SelectItem>
                ) : (
                  recipes.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 border-t">
            <div className="space-y-2">
              <Label>Nama Resep / Produk Baru</Label>
              <Input 
                value={recipeName} 
                onChange={(e) => setRecipeName(e.target.value)} 
                className="font-bold text-lg rounded-xl"
                placeholder="Contoh: Nasi Goreng Spesial"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label>Daftar Bahan Baku</Label>
                <Button variant="outline" size="sm" onClick={addIngredient} className="rounded-xl h-8 gap-1">
                  <Plus className="size-3.5" /> Tambah Bahan
                </Button>
              </div>
              
              <div className="border rounded-xl bg-muted/20 overflow-hidden divide-y">
                {ingredients.map((item) => (
                  <div key={item.id} className="p-3 flex gap-2 items-center bg-card">
                    <div className="grid grid-cols-12 gap-2 flex-grow">
                      <div className="col-span-12 sm:col-span-5">
                        <Input 
                          placeholder="Nama Bahan" 
                          value={item.name} 
                          onChange={(e) => updateIngredient(item.id, "name", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Input 
                          type="number" 
                          min={0}
                          value={item.amount || ""} 
                          onChange={(e) => updateIngredient(item.id, "amount", Number(e.target.value))}
                          className="h-8 text-sm"
                          placeholder="Jml"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Input 
                          placeholder="Satuan" 
                          value={item.unit} 
                          onChange={(e) => updateIngredient(item.id, "unit", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">Rp</span>
                          <Input 
                            type="number" 
                            min={0}
                            value={item.price || ""} 
                            onChange={(e) => updateIngredient(item.id, "price", Number(e.target.value))}
                            className="h-8 pl-7 text-sm"
                            placeholder="Total Rp"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={() => removeIngredient(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Belum ada bahan baku. Tambahkan bahan baku pertama Anda.
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2 px-1">
                <span className="font-bold">Total HPP (Modal per Porsi)</span>
                <span className="text-xl font-black text-destructive">{rupiah(totalCOGS)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-4">
             <Button variant="default" className="w-full rounded-xl gap-2 font-bold shadow-soft">
               Simpan Resep <ArrowRight className="size-4" />
             </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-5 space-y-4">
        <Card className="rounded-xl shadow-soft h-full">
          
          <CardHeader>
            <CardTitle>Kalkulator Harga Jual</CardTitle>
            <CardDescription>
              Tentukan target margin keuntungan untuk <strong>"{recipeName || 'Resep Baru'}"</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Target Margin Keuntungan</Label>
                <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">{targetMargin}%</span>
              </div>
              <Slider
                value={[targetMargin]}
                onValueChange={(vals) => setTargetMargin(vals[0] || 0)}
                max={90}
                min={10}
                step={5}
                className="py-2"
              />
            </div>

            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Modal (HPP)</span>
                <span className="font-semibold text-lg">{rupiah(totalCOGS)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Potensi Untung per Porsi</span>
                <span className="font-semibold text-green-600 text-lg">+{rupiah(potentialProfit)}</span>
              </div>
              <Separator className="my-2" />
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Rekomendasi Harga Jual</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black">{rupiah(suggestedPrice)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              className="w-full rounded-xl text-lg font-bold h-12" 
              onClick={handleSave}
              disabled={saveRecipeMutation.isPending}
            >
              {saveRecipeMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Simpan Resep</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
