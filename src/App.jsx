import { useState, useEffect } from "react";
import "./styles/global.css";

// ── Supabase Auth ─────────────────────────────────────────────
import { supabase } from "./lib/supabase.js";
import { loginUser, logoutUser, getSession } from "./lib/auth.js";
import { ToastProvider } from "./components/Toast.jsx";
import { getSiteSettings } from "./lib/db.js";

// ── Public pages ─────────────────────────────────────────────
import HomePage    from "./pages/HomePage.jsx";
import LoginPage   from "./pages/LoginPage.jsx";
import { ArticlesPage, ArticleDetailPage, AboutPage } from "./pages/PublicPages.jsx";

// ── Dashboard shell ──────────────────────────────────────────
import DashboardLayout from "./dashboard/DashboardLayout.jsx";

// ── Admin pages ──────────────────────────────────────────────
import {
  AdminDashboard, ManajemenSiswa, ManajemenGuru,
  ManajemenArtikel, ManajemenUser, SettingHonor, ManajemenProgram,
  LandingPageEditor,
} from "./dashboard/admin/AdminPages.jsx";

import {
  SPPSiswa, Pemasukan, Pengeluaran, SaldoLaporan,
  HonorGuru, Tutorial, RekapAbsensiAdmin,
  SettingWeb, TemplateWA,
} from "./dashboard/admin/AdminNewPages.jsx";

// ── Guru pages ───────────────────────────────────────────────
import {
  GuruDashboard, InputAbsensi, RekapAbsensi, HonorGuruPage, ProfilGuru,
} from "./dashboard/guru/GuruPages.jsx";

// ── Siswa pages ──────────────────────────────────────────────
import {
  SiswaDashboard, AbsensiSiswa, PembayaranSiswa, ArtikelSiswa, ProfilSiswa,
} from "./dashboard/siswa/SiswaPages.jsx";

// ── Raport pages ─────────────────────────────────────────────
import { AdminRaport, GuruRaport, SiswaRaport, GuruRekapRaport } from "./dashboard/raport/RaportPages.jsx";

// ── Shared pages ─────────────────────────────────────────────
import { DashArticleDetail } from "./dashboard/SharedDashPages.jsx";

// ─────────────────────────────────────────────────────────────

export default function App() {
  const [page,        setPage]        = useState("home");
  const [user,        setUser]        = useState(null);
  const [dashMenu,    setDashMenu]    = useState("dashboard");
  const [articleView, setArticleView] = useState(null);
  const [prevMenu,    setPrevMenu]    = useState("dashboard");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginError,  setLoginError]  = useState("");
  const [savedAbsensi,setSavedAbsensi]= useState([]);
  const [siteInfo,    setSiteInfo]    = useState({ nama: "Al-Adzkiya", tagline: "Lembaga Bimbingan Belajar", logo: "🎓" });

  // ── Load site settings untuk tab title & favicon ─────────
  useEffect(() => {
    getSiteSettings().then(s => {
      if (!s) return;
      setSiteInfo(s);
      // Update tab title
      document.title = s.tagline ? `${s.nama} — ${s.tagline}` : s.nama;
      // Update favicon jika logo adalah emoji
      const logo = s.logo || "🎓";
      if (!logo.startsWith("http") && !logo.startsWith("/")) {
        // Emoji → canvas favicon
        const canvas = document.createElement("canvas");
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.font = "28px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(logo, 16, 16);
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = canvas.toDataURL();
      } else if (logo.startsWith("http") || logo.startsWith("/")) {
        // URL gambar
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = logo;
      }
    }).catch(() => {});
  }, []);

  // ── Restore session saat app dibuka ──────────────────────
  useEffect(() => {
    getSession().then(session => {
      if (session) { setUser(session); setPage("dashboard"); }
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) { setUser(null); setPage("home"); }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSavedAbsensi = (newRows) => {
    setSavedAbsensi(prev => [...prev, ...newRows]);
    setDashMenu("rekap-absensi");
  };

  const navigate = (p) => {
    const map = { artikel: "artikel", "tentang-kami": "about", home: "home", beranda: "home" };
    setPage(map[p] || "home");
  };

  const openPublicArticle  = (article) => { setArticleView(article); setPage("artikel-detail"); };
  const openDashArticle    = (article, from) => { setArticleView(article); setPrevMenu(from); setDashMenu("artikel-detail"); };

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoginError("");
    try {
      const acc = await loginUser(email, password);
      setUser(acc); setDashMenu("dashboard"); setPage("dashboard");
    } catch (err) {
      const msg = err.message || "Email atau password salah.";
      setLoginError(msg); throw new Error(msg);
    }
  };

  const logout = async () => { await logoutUser(); setUser(null); setPage("home"); };

  // ── Dashboard page renderer ──────────────────────────────
  const renderDashPage = () => {
    const role = user?.role?.toLowerCase();

    if (role === "admin") {
      switch (dashMenu) {
        case "dashboard":           return <AdminDashboard />;
        case "siswa":               return <ManajemenSiswa />;
        case "guru":                return <ManajemenGuru />;
        case "rekap-absensi-admin": return <RekapAbsensiAdmin />;
        case "spp":                 return <SPPSiswa />;
        case "pemasukan":           return <Pemasukan />;
        case "pengeluaran":         return <Pengeluaran />;
        case "saldo":               return <SaldoLaporan />;
        case "honor":               return <HonorGuru />;
        case "artikel-admin":       return <ManajemenArtikel onDetail={a => openDashArticle(a, "artikel-admin")} />;
        case "tutorial":            return <Tutorial />;
        case "user-mgmt":           return <ManajemenUser />;
        case "setting-honor":       return <SettingHonor />;
        case "program":             return <ManajemenProgram />;
        case "setting-web":         return <SettingWeb />;
        case "template-wa":         return <TemplateWA />;
        case "landing-editor":      return <LandingPageEditor />;
        // case "setting-mapel":       return <SettingProgramMapel />; // Ditangguhkan
        case "raport-admin":        return <AdminRaport user={user} siteInfo={siteInfo} />;
        case "artikel-detail":      return <DashArticleDetail article={articleView} onBack={() => setDashMenu(prevMenu)} onArticle={a => openDashArticle(a, prevMenu)} />;
        default:                    return <AdminDashboard />;
      }
    }

    if (role === "guru") {
      switch (dashMenu) {
        case "dashboard":      return <GuruDashboard onMenu={setDashMenu} />;
        case "input-absensi":  return <InputAbsensi onSaved={handleSavedAbsensi} />;
        case "rekap-absensi":  return <RekapAbsensi savedAbsensi={savedAbsensi} />;
        case "honor-guru":     return <HonorGuruPage />;
        case "profil-guru":    return <ProfilGuru user={user} />;
        case "raport-guru":    return <GuruRaport user={user} siteInfo={siteInfo} />;
        case "rekap-raport-guru": return <GuruRekapRaport user={user} siteInfo={siteInfo} />;
        case "artikel-detail": return <DashArticleDetail article={articleView} onBack={() => setDashMenu(prevMenu)} onArticle={a => openDashArticle(a, prevMenu)} />;
        default:               return <GuruDashboard onMenu={setDashMenu} />;
      }
    }

    if (role === "siswa") {
      switch (dashMenu) {
        case "dashboard":      return <SiswaDashboard onMenu={setDashMenu} />;
        case "absensi-siswa":  return <AbsensiSiswa />;
        case "pembayaran":     return <PembayaranSiswa />;
        case "artikel-siswa":  return <ArtikelSiswa onArticle={a => openDashArticle(a, "artikel-siswa")} />;
        case "profil-siswa":   return <ProfilSiswa user={user} />;
        case "raport-siswa":   return <SiswaRaport user={user} siteInfo={siteInfo} />;
        case "artikel-detail": return <DashArticleDetail article={articleView} onBack={() => setDashMenu(prevMenu)} onArticle={a => openDashArticle(a, prevMenu)} />;
        default:               return <SiswaDashboard onMenu={setDashMenu} />;
      }
    }

    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Akses ditolak.</div>;
  };

  // ── Final Render ─────────────────────────────────────────
  const renderMainContent = () => {
    if (loadingAuth) return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", animation: "spin .8s linear infinite" }} />
        <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>Memuat {siteInfo.nama}...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (page === "home")           return <HomePage onNav={navigate} onLogin={() => setPage("login")} onArticle={openPublicArticle} />;
    if (page === "login")          return <LoginPage onLogin={login} onNav={navigate} loginError={loginError} />;
    if (page === "artikel")        return <ArticlesPage onNav={navigate} onArticle={openPublicArticle} />;
    if (page === "about")          return <AboutPage onNav={navigate} />;
    if (page === "artikel-detail") return <ArticleDetailPage article={articleView} onNav={navigate} onArticle={openPublicArticle} />;

    if (page === "dashboard" && user) return (
      <DashboardLayout user={user} menu={dashMenu} onMenu={setDashMenu} onLogout={logout}>
        {renderDashPage()}
      </DashboardLayout>
    );

    return <HomePage onNav={navigate} onLogin={() => setPage("login")} onArticle={openPublicArticle} />;
  };

  return <ToastProvider>{renderMainContent()}</ToastProvider>;
}
