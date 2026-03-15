// ============================================================
// LoginPage.jsx — Authentication page
// ============================================================
import { useState } from "react";
import { DEMO_ACCOUNTS } from "../data";

export default function LoginPage({ onLogin, onBack }) {
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [error, setError]   = useState("");

  const handleLogin = () => {
    const acc = DEMO_ACCOUNTS.find(a => a.email === email && a.pass === pass);
    if (acc) { setError(""); onLogin(acc); }
    else setError("Email atau password salah. Gunakan akun demo di bawah.");
  };

  const fillDemo = (acc) => { setEmail(acc.email); setPass(acc.pass); setError(""); };

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
          }}>🎓 BimbelKu</span>
        </div>

        <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 800, marginBottom: 6 }}>
          Selamat Datang Kembali 👋
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: ".88rem", marginBottom: 28 }}>
          Masuk ke akun BimbelKu kamu
        </p>

        {/* Demo accounts */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <h4 style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
            Akun Demo
          </h4>
          {DEMO_ACCOUNTS.map((a) => (
            <div key={a.role} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: ".78rem", fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: a.color + "22", color: a.color }}>{a.role}</span>
              <span style={{ fontSize: ".75rem", color: "var(--muted)", fontFamily: "monospace" }}>{a.email}</span>
              <span onClick={() => fillDemo(a)} style={{ fontSize: ".72rem", color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}>Gunakan</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="email@contoh.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: ".82rem", marginBottom: 12 }}>{error}</p>}

        <button className="btn-block" onClick={handleLogin}>Masuk</button>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: ".82rem", color: "var(--muted)" }}>
          Belum punya akun?{" "}
          <span style={{ color: "var(--blue)", cursor: "pointer", fontWeight: 600 }}>Daftar Sekarang</span>
        </p>
        <p style={{ textAlign: "center", marginTop: 8, fontSize: ".82rem", color: "var(--muted)", cursor: "pointer" }} onClick={onBack}>
          ← Kembali ke Beranda
        </p>
      </div>
    </div>
  );
}
