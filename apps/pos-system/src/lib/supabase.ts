import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string) || "https://your-project-id.supabase.co";
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
