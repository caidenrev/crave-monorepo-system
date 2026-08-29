import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type SupabaseEmployee = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  last_active: string | null;
  created_at: string;
};

export function useEmployees() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error && error.code !== "42P01") throw new Error(error.message);
      return (data as SupabaseEmployee[]) || [];
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (
      newEmp: Omit<SupabaseEmployee, "id" | "created_at" | "active" | "last_active">,
    ) => {
      const { data, error } = await supabase
        .from("employees")
        .insert([
          {
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
      const { data, error } = await supabase
        .from("employees")
        .update({ active })
        .eq("id", id)
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
