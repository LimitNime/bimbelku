// ============================================================
// LoginPage.jsx — Authentication page (Supabase)
// ============================================================
import { useState } from "react";

export default function LoginPage({ onLogin, onNav, loginError }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) { setError("Email dan password wajib diisi."); return; }
    setLoading(true);
    setError("");
    try {
      await onLogin(email, pass);
    } catch (err) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || loginError;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", padding: 20,
    }}>
      <div className="fade-in" style={{
        background: "#fff", borderRadius: 24, padding: "44px 40px",
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,.1)", border: "1px solid var(--border)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <span style={{
            fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 800,
            background: "linear-gradient(135deg,var(--blue),var(--green-light))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}><i className="fa-solid fa-graduation-cap" style={{marginRight: 8}}></i> Al-Adzkiya</span>
        </div>

        <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>
          Selamat Datang Kembali <i className="fa-solid fa-hand-sparkles" style={{ color: "#f59e0b" }}></i>
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".88rem", marginBottom: 28 }}>
          Masuk ke akun Al-Adzkiya kamu
        </p>

        {/* Form */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="email@contoh.com"
            value={email} onChange={e => setEmail(e.target.value)}
            disabled={loading} />
        </div>
        <div className="form-group" style={{ position: "relative" }}>
          <label className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <input className="form-input" type={showPass ? "text" : "password"} placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              disabled={loading} style={{ paddingRight: 44 }} />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color .2s"
              }}
            >
              <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: "1rem" }}></i>
            </button>
          </div>
        </div>

        {displayError && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          }}>
            <p style={{ color: "#dc2626", fontSize: ".82rem", margin: 0 }}><i className="fa-solid fa-triangle-exclamation" style={{marginRight: 6}}></i> {displayError}</p>
          </div>
        )}

        <button className="btn-block" onClick={handleLogin} disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Memuat..." : "Masuk"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: ".82rem", color: "var(--muted)", cursor: "pointer" }}
          onClick={() => onNav("home")}>
          ← Kembali ke Beranda
        </p>
      </div>
    </div>
  );
}