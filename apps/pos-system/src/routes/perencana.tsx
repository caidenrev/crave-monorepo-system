import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, Calculator, LineChart, PieChart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CapitalSimulator } from "@/components/planner/CapitalSimulator";
import { RecipeCosting } from "@/components/planner/RecipeCosting";
import { ProfitProjection } from "@/components/planner/ProfitProjection";
import { MarketingPlanner } from "@/components/planner/MarketingPlanner";

export const Route = createFileRoute("/perencana")({
  head: () => ({
    meta: [{ title: "Perencana Bisnis — Crave" }],
  }),
  component: PerencanaPage,
});

function PerencanaPage() {
  return (
    <AppShell
      title="Perencana Bisnis"
      subtitle="Simulasikan modal, hitung HPP, dan proyeksikan keuntungan bisnis Anda."
    >
      <Tabs 
        defaultValue="capital" 
        className="space-y-4 w-full"
        onValueChange={(v) => {
          const el = document.getElementById("perencana-slider");
          if (el) {
            if (v === "capital") el.style.transform = "translateX(0)";
            if (v === "costing") el.style.transform = "translateX(100%)";
            if (v === "profit") el.style.transform = "translateX(200%)";
            if (v === "marketing") el.style.transform = "translateX(300%)";
          }
        }}
      >
        <div className="w-full">
          <TabsList className="relative z-0 flex h-auto sm:h-14 w-full rounded-2xl sm:rounded-full bg-slate-200 dark:bg-slate-800 p-1">
            <div
              id="perencana-slider"
              className="absolute left-1 top-1 bottom-1 w-[calc(25%-2px)] rounded-xl sm:rounded-full bg-background shadow-md border border-black/5 dark:border-white/10 transition-transform duration-300 ease-in-out z-0 hidden sm:block"
              style={{ transform: "translateX(0)" }}
            />
            <TabsTrigger 
              value="capital" 
              className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
            >
              <PieChart className="size-4 sm:size-4.5 shrink-0" /> <span className="text-[10px] sm:text-sm leading-none">Simulasi Modal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="costing" 
              className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
            >
              <Calculator className="size-4 sm:size-4.5 shrink-0" /> <span className="text-[10px] sm:text-sm leading-none">Kalkulator HPP</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profit" 
              className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
            >
              <LineChart className="size-4 sm:size-4.5 shrink-0" /> <span className="text-[10px] sm:text-sm leading-none">Proyeksi Keuntungan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="marketing" 
              className="relative z-10 flex-1 flex-col sm:flex-row justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-full py-2 sm:py-0 data-[state=active]:bg-background sm:data-[state=active]:bg-transparent data-[state=active]:shadow-md sm:data-[state=active]:shadow-none data-[state=active]:text-foreground font-semibold transition-colors duration-300"
            >
              <Lightbulb className="size-4 sm:size-4.5 shrink-0" /> <span className="text-[10px] sm:text-sm leading-none">Ads & Marketing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="capital" className="space-y-4">
          <CapitalSimulator />
        </TabsContent>

        <TabsContent value="costing" className="space-y-4">
          <RecipeCosting />
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <ProfitProjection />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <MarketingPlanner />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
