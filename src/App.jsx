// ============================================================
// App.jsx — Root component & client-side router
// Versi terbaru sesuai spesifikasi sistem bimbel
// ============================================================
import { useState } from "react";
import "./styles/global.css";

// ── Public pages ─────────────────────────────────────────────
import HomePage    from "./pages/HomePage.jsx";
import LoginPage   from "./pages/LoginPage.jsx";
import { ArticlesPage, ArticleDetailPage, AboutPage } from "./pages/PublicPages.jsx";

// ── Dashboard shell ──────────────────────────────────────────
import DashboardLayout from "./dashboard/DashboardLayout.jsx";

// ── Admin pages ──────────────────────────────────────────────
import {
  AdminDashboard,
  ManajemenSiswa,
  ManajemenGuru,
  ManajemenArtikel,
  ManajemenUser,
  SettingHonor,
  ManajemenProgram,
} from "./dashboard/admin/AdminPages.jsx";

import {
  SPPSiswa,
  Pemasukan,
  Pengeluaran,
  SaldoLaporan,
  HonorGuru,
  Tutorial,
} from "./dashboard/admin/AdminNewPages.jsx";

// ── Guru pages ───────────────────────────────────────────────
import {
  GuruDashboard,
  DaftarSiswaGuru,
  InputAbsensi,
  RekapAbsensi,
  HonorGuruPage,
  ProfilGuru,
} from "./dashboard/guru/GuruPages.jsx";

// ── Siswa pages ──────────────────────────────────────────────
import {
  SiswaDashboard,
  AbsensiSiswa,
  PembayaranSiswa,
  ArtikelSiswa,
  ProfilSiswa,
} from "./dashboard/siswa/SiswaPages.jsx";

// ── Shared pages ─────────────────────────────────────────────
import { DashArticleDetail } from "./dashboard/SharedDashPages.jsx";

// ─────────────────────────────────────────────────────────────

export default function App() {
  const [page,        setPage]        = useState("home");
  const [user,        setUser]        = useState(null);
  const [dashMenu,    setDashMenu]    = useState("dashboard");
  const [articleView, setArticleView] = useState(null);
  const [prevMenu,    setPrevMenu]    = useState("dashboard");

  // ── Navigation ───────────────────────────────────────────
  const navigate = (p, data = null) => {
    const map = {
      "artikel":      "artikel",
      "tentang-kami": "about",
      "home":         "home",
      "beranda":      "home",
    };
    if (p === "artikel-detail" && data) {
      setArticleView(data);
      setPage("artikel-detail");
    } else {
      setPage(map[p] || "home");
    }
  };

  const openPublicArticle = (article) => {
    setArticleView(article);
    setPage("artikel-detail");
  };

  const openDashArticle = (article, from) => {
    setArticleView(article);
    setPrevMenu(from);
    setDashMenu("artikel-detail");
  };

  const login  = (acc) => { setUser(acc); setDashMenu("dashboard"); setPage("dashboard"); };
  const logout = ()    => { setUser(null); setPage("home"); };

  // ── Dashboard page renderer ──────────────────────────────
  const renderDashPage = () => {

    // Detail artikel (shared semua role)
    if (dashMenu === "artikel-detail" && articleView) {
      return <DashArticleDetail article={articleView} onBack={() => setDashMenu(prevMenu)} />;
    }

    // ── ADMIN ──────────────────────────────────────────────
    if (user.role === "Admin") {
      switch (dashMenu) {
        case "dashboard":     return <AdminDashboard />;
        case "siswa":         return <ManajemenSiswa />;
        case "guru":          return <ManajemenGuru />;
        case "spp":           return <SPPSiswa />;
        case "pemasukan":     return <Pemasukan />;
        case "pengeluaran":   return <Pengeluaran />;
        case "saldo":         return <SaldoLaporan />;
        case "honor":         return <HonorGuru />;
        case "artikel-admin": return <ManajemenArtikel onDetail={a => openDashArticle(a, "artikel-admin")} />;
        case "tutorial":      return <Tutorial />;
        case "user-mgmt":     return <ManajemenUser />;
        case "setting-honor": return <SettingHonor />;
        case "program":       return <ManajemenProgram />;
        default: break;
      }
    }

    // ── GURU ───────────────────────────────────────────────
    if (user.role === "Guru") {
      switch (dashMenu) {
        case "dashboard":     return <GuruDashboard onMenu={setDashMenu} />;
        case "daftar-siswa":  return <DaftarSiswaGuru />;
        case "input-absensi": return <InputAbsensi />;
        case "rekap-absensi": return <RekapAbsensi />;
        case "honor-guru":    return <HonorGuruPage />;
        case "profil-guru":   return <ProfilGuru user={user} />;
        default: break;
      }
    }

    // ── SISWA ──────────────────────────────────────────────
    if (user.role === "Siswa") {
      switch (dashMenu) {
        case "dashboard":      return <SiswaDashboard onMenu={setDashMenu} />;
        case "absensi-siswa":  return <AbsensiSiswa />;
        case "pembayaran":     return <PembayaranSiswa />;
        case "artikel-siswa":  return <ArtikelSiswa onArticle={a => openDashArticle(a, "artikel-siswa")} />;
        case "profil-siswa":   return <ProfilSiswa user={user} />;
        default: break;
      }
    }

    return (
      <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🚧</div>
        <p>Halaman sedang dalam pengembangan.</p>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {/* Public pages */}
      {page === "home" && (
        <HomePage
          onNav={navigate}
          onLogin={() => setPage("login")}
          onArticle={(a, mode) => {
            if (mode === "detail") openPublicArticle(a);
            else setPage("artikel");
          }}
        />
      )}

      {page === "login" && (
        <LoginPage onLogin={login} onBack={() => setPage("home")} />
      )}

      {page === "artikel" && (
        <ArticlesPage
          onNav={navigate}
          onLogin={() => setPage("login")}
          onArticle={openPublicArticle}
        />
      )}

      {page === "artikel-detail" && articleView && (
        <ArticleDetailPage
          article={articleView}
          onBack={() => setPage("artikel")}
          onNav={navigate}
          onLogin={() => setPage("login")}
        />
      )}

      {page === "about" && (
        <AboutPage onNav={navigate} onLogin={() => setPage("login")} />
      )}

      {/* Dashboard */}
      {page === "dashboard" && user && (
        <DashboardLayout
          user={user}
          activeMenu={dashMenu}
          onMenu={setDashMenu}
          onLogout={logout}
        >
          {renderDashPage()}
        </DashboardLayout>
      )}
    </>
  );
}