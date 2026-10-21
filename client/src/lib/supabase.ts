import { createClient } from "@supabase/supabase-js";

// Production Supabase project credentials (with fallback so Vercel builds always connect directly)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://dooyuufselfooknywhrx.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb3l1dWZzZWxmb29rbnl3aHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzg1NzYsImV4cCI6MjEwNzgxNDU3Nn0.kFhAsuAgL_bmkFbFtrna-ltLDeK1pYj5AAENXruafxM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
}
