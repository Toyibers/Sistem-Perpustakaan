import { createClient } from "@supabase/supabase-js";

// Supabase javascript client requires the base URL, without /rest/v1/
const rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://wjbydkdtvzyrhslophcm.supabase.co/rest/v1/";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqYnlka2R0dnp5cmhzbG9waGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTY0MDAsImV4cCI6MjA5MjI5MjQwMH0.BnMqodWWI8F4n-i9TDFwU6jKpbKIswOcwk43eLqwlh0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
