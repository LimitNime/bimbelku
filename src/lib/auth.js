// ============================================================
// auth.js — Fungsi Auth menggunakan Supabase
// ============================================================
import { supabase } from "./supabase.js";

// ── Login ────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Ambil role dari tabel profiles (maybeSingle agar tidak error jika belum ada)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nama")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    id:    data.user.id,
    email: data.user.email,
    role:  profile?.role  || "siswa",
    nama:  profile?.nama  || email.split("@")[0],
  };
};

// ── Logout ───────────────────────────────────────────────────
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── Get current session ──────────────────────────────────────
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nama")
    .eq("id", session.user.id)
    .maybeSingle();

  return {
    id:    session.user.id,
    email: session.user.email,
    role:  profile?.role  || "siswa",
    nama:  profile?.nama  || session.user.email?.split("@")[0],
  };
};

// ── Daftar user baru (admin pakai ini untuk tambah guru/siswa) ─
export const registerUser = async (email, password, role, nama) => {
  // Panggil Edge Function 'admin-create-user'
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: { action: "create", email, password, role, nama }
  });

  if (error) {
    throw error;
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }

  return data.user;
};
