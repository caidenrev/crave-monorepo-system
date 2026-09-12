import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { CustomIngredient } from "@/components/planner/RecipeCosting";

export interface Recipe {
  id: string;
  name: string;
  target_margin: number;
  ingredients: CustomIngredient[];
  created_at: string;
}

export interface MarketingPlan {
  id: string;
  platform: string;
  daily_budget: number;
  duration_days: number;
  created_at: string;
}

export function usePlanner() {
  const queryClient = useQueryClient();

  // RECIPES
  const recipesQuery = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Recipe[]) || [];
    },
  });

  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("recipes")
        .insert([recipe])
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  // MARKETING PLANS
  const marketingPlansQuery = useQuery({
    queryKey: ["marketing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as MarketingPlan[]) || [];
    },
  });

  const saveMarketingPlanMutation = useMutation({
    mutationFn: async (plan: Omit<MarketingPlan, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("marketing_plans")
        .insert([plan])
        .select()
        .single();

      if (error) throw error;
      return data as MarketingPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing_plans"] });
    },
  });

  return {
    recipes: recipesQuery.data || [],
    isLoadingRecipes: recipesQuery.isLoading,
    saveRecipeMutation,
    deleteRecipeMutation,
    
    marketingPlans: marketingPlansQuery.data || [],
    isLoadingMarketingPlans: marketingPlansQuery.isLoading,
    saveMarketingPlanMutation,
  };
}
