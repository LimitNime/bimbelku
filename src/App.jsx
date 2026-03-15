// ============================================================
// App.jsx — Root component & client-side router
// ============================================================
import { useState } from "react";
import "./styles/global.css";

// Public pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { PackagesPage, ArticlesPage, ArticleDetailPage, AboutPage } from "./pages/PublicPages.jsx";

// Dashboard shell
import DashboardLayout from "./dashboard/DashboardLayout.jsx";

// Admin pages
import {
  AdminDashboard, ManajemenSiswa, ManajemenGuru,
  ManajemenPaket, ManajemenArtikel, ManajemenUser,
} from "./dashboard/admin/AdminPages.jsx";

// Guru pages
import { GuruDashboard, DaftarSiswaGuru, JadwalGuru } from "./dashboard/guru/GuruPages.jsx";

// Siswa pages
import { SiswaDashboard, PaketSiswa, JadwalSiswa, ArtikelSiswa } from "./dashboard/siswa/SiswaPages.jsx";

// Shared dashboard pages
import { ProfilPage, DashArticleDetail } from "./dashboard/SharedDashPages.jsx";

// ─────────────────────────────────────────────────────────────

export default function App() {
  const [page,        setPage]        = useState("home");
  const [user,        setUser]        = useState(null);
  const [dashMenu,    setDashMenu]    = useState("dashboard");
  const [articleView, setArticleView] = useState(null);
  const [prevMenu,    setPrevMenu]    = useState("dashboard");

  /* ── Navigation ─────────────────────────────────────────── */
  const navigate = (p, data = null) => {
    const map = {
      "paket-belajar": "packages",
      "artikel":       "artikel",
      "tentang-kami":  "about",
      "home":          "home",
      "beranda":       "home",
    };
    if (p === "artikel-detail" && data) { setArticleView(data); setPage("artikel-detail"); }
    else setPage(map[p] || "home");
  };

  const openPublicArticle = (article) => { setArticleView(article); setPage("artikel-detail"); };
  const openDashArticle   = (article, from) => { setArticleView(article); setPrevMenu(from); setDashMenu("artikel-detail"); };

  const login  = (acc) => { setUser(acc); setDashMenu("dashboard"); setPage("dashboard"); };
  const logout = ()    => { setUser(null); setPage("home"); };

  /* ── Dashboard page renderer ─────────────────────────────── */
  const renderDashPage = () => {
    if (dashMenu === "artikel-detail" && articleView) {
      return <DashArticleDetail article={articleView} onBack={() => setDashMenu(prevMenu)} />;
    }

    // Admin
    if (user.role === "Admin") {
      if (dashMenu === "dashboard")     return <AdminDashboard />;
      if (dashMenu === "siswa")         return <ManajemenSiswa />;
      if (dashMenu === "guru")          return <ManajemenGuru />;
      if (dashMenu === "paket")         return <ManajemenPaket />;
      if (dashMenu === "artikel-admin") return <ManajemenArtikel onDetail={a => openDashArticle(a, "artikel-admin")} />;
      if (dashMenu === "user-mgmt")     return <ManajemenUser />;
    }

    // Guru
    if (user.role === "Guru") {
      if (dashMenu === "dashboard")    return <GuruDashboard />;
      if (dashMenu === "daftar-siswa") return <DaftarSiswaGuru />;
      if (dashMenu === "jadwal")       return <JadwalGuru />;
      if (dashMenu === "profil")       return <ProfilPage user={user} />;
    }

    // Siswa
    if (user.role === "Siswa") {
      if (dashMenu === "dashboard")    return <SiswaDashboard />;
      if (dashMenu === "paket-siswa")  return <PaketSiswa />;
      if (dashMenu === "jadwal-siswa") return <JadwalSiswa />;
      if (dashMenu === "artikel-siswa")return <ArtikelSiswa onArticle={a => openDashArticle(a, "artikel-siswa")} />;
      if (dashMenu === "profil-siswa") return <ProfilPage user={user} />;
    }

    return <p style={{ color: "var(--muted)" }}>Halaman tidak ditemukan.</p>;
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <>
      {page === "home"          && <HomePage onNav={navigate} onLogin={() => setPage("login")} onArticle={(a, mode) => { if (mode === "detail") openPublicArticle(a); else setPage("artikel"); }} />}
      {page === "login"         && <LoginPage onLogin={login} onBack={() => setPage("home")} />}
      {page === "packages"      && <PackagesPage onNav={navigate} onLogin={() => setPage("login")} />}
      {page === "artikel"       && <ArticlesPage onNav={navigate} onLogin={() => setPage("login")} onArticle={openPublicArticle} />}
      {page === "artikel-detail"&& articleView && <ArticleDetailPage article={articleView} onBack={() => setPage("artikel")} onNav={navigate} onLogin={() => setPage("login")} />}
      {page === "about"         && <AboutPage onNav={navigate} onLogin={() => setPage("login")} />}
      {page === "dashboard"     && user && (
        <DashboardLayout user={user} activeMenu={dashMenu} onMenu={setDashMenu} onLogout={logout}>
          {renderDashPage()}
        </DashboardLayout>
      )}
    </>
  );
}
