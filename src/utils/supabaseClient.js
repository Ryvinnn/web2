import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process?.env?.VITE_SUPABASE_URL) ||
  "";
const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process?.env?.VITE_SUPABASE_ANON_KEY) ||
  "";

/**
 * Validates whether Supabase environment variables are properly configured.
 */
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    typeof supabaseUrl === "string" &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseUrl.includes("placeholder")
  );
};

/**
 * Initialized Supabase client instance, or null if unconfigured.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
