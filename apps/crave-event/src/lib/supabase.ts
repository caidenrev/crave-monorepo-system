import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION
 * ============================================================================
 * Seluruh URL dan API Keys diambil 100% dari environment variables (.env).
 * Tidak ada kredensial atau project ID yang di-hardcode di dalam source code.
 */

// Baca URL dari environment variables (.env)
const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ||
  (import.meta.env["SUPABASE_URL"] as string | undefined) ||
  "";

// Baca Key dari environment variables (.env) - Mendukung format Publishable Key maupun Anon Key
const supabaseAnonKey =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ||
  (import.meta.env["VITE_SUPABASE_KEY"] as string | undefined) ||
  (import.meta.env["SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  "";

// Status koneksi cloud berdasarkan keberadaan kredensial valid di .env
export const isSupabaseConfigured = Boolean(
  supabaseUrl.trim() !== "" && supabaseAnonKey.trim() !== "",
);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.info(
    "%c[Crave Event] Kredensial Supabase di .env belum terisi. Aplikasi berjalan dalam mode Reactive Store lokal.",
    "color: #0A84FF; font-weight: bold;",
  );
}

// Client singleton Supabase
export const supabase = createClient(
  supabaseUrl || "https://empty.supabase.co",
  supabaseAnonKey || "empty-anon-key",
  {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
    },
  },
);

export type DatabaseProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: "user" | "admin";
  phone?: string | null;
  bio?: string | null;
  created_at: string;
};

export type DatabaseEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "free" | "paid";
  price: number;
  date: string;
  time: string;
  duration_minutes: number;
  location: string;
  speaker_name: string;
  speaker_role: string;
  speaker_avatar?: string | null;
  quota: number;
  registered_count: number;
  zoom_link?: string | null;
  playlist: string;
  rundown?: Array<{ time: string; activity: string }> | null;
  status: "upcoming" | "ongoing" | "past";
  attendance_code: string;
  banner_url?: string | null;
  created_at: string;
};

export type DatabaseRegistration = {
  id: string;
  user_id: string;
  event_id: string;
  status: "registered" | "attended" | "cancelled";
  payment_status: "free" | "pending" | "paid";
  payment_reference?: string | null;
  attended_at?: string | null;
  certificate_id?: string | null;
  created_at: string;
};

export type DatabaseCertificate = {
  id: string;
  certificate_number: string;
  user_id: string;
  event_id: string;
  user_name: string;
  event_title: string;
  event_date: string;
  issued_at: string;
  verification_url: string;
  pdf_url?: string | null;
};
