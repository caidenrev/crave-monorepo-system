import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";
import type { CustomIngredient } from "@/components/planner/RecipeCosting";

export interface Recipe {
  id: string;
  user_id?: string;
  name: string;
  target_margin: number;
  ingredients: CustomIngredient[];
  created_at: string;
}

export interface MarketingPlan {
  id: string;
  user_id?: string;
  platform: string;
  daily_budget: number;
  duration_days: number;
  created_at: string;
}

export function usePlanner() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // RECIPES
  const recipesQuery = useQuery({
    queryKey: ["recipes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Recipe[]) || [];
    },
    enabled: !!user,
  });

  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: Omit<Recipe, "id" | "created_at" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("recipes")
        .insert([{ ...recipe, user_id: user.id }])
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
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  // MARKETING PLANS
  const marketingPlansQuery = useQuery({
    queryKey: ["marketing_plans", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("marketing_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as MarketingPlan[]) || [];
    },
    enabled: !!user,
  });

  const saveMarketingPlanMutation = useMutation({
    mutationFn: async (plan: Omit<MarketingPlan, "id" | "created_at" | "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("marketing_plans")
        .insert([{ ...plan, user_id: user.id }])
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
