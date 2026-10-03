import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./useAuth";

export type SupabaseEmployee = {
  id: string;
  user_id?: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  last_active: string | null;
  created_at: string;
};

export function useEmployees() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["employees", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") throw new Error(error.message);
      return (data as SupabaseEmployee[]) || [];
    },
    enabled: !!user,
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (
      newEmp: Omit<SupabaseEmployee, "id" | "created_at" | "active" | "last_active">,
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("employees")
        .insert([
          {
            user_id: user.id,
            name: newEmp.name,
            email: newEmp.email,
            role: newEmp.role,
            active: true,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("employees")
        .update({ active })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return { ...query, addEmployeeMutation, toggleActiveMutation };
}
