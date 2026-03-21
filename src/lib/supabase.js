// ============================================================
// supabase.js — Supabase client instances
// ============================================================
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL || "https://cwjueiafxaqnhcikttbg.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3anVlaWFmeGFxbmhjaWt0dGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDU5ODcsImV4cCI6MjA4OTIyMTk4N30.c2l74AMY9HPOmI4hqmUpxr-GDKMLrdpl4Jhk-eFfqyw";

// Client biasa — untuk semua operasi user
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Client admin telah DIHAPUS dari frontend secara permanen untuk alasan keamanan.
// Operasi admin (seperti bypass RLS / auto-confirm regis) wajib menggunakan Supabase Edge Functions.
