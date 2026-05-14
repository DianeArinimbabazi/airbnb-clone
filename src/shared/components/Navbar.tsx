import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navBg = dark ? "#111111" : "#fff";
  const navBorder = dark ? "#2a2a2a" : "#e5e7eb";
  const textColor = dark ? "#f1f5f9" : "#111";
  const btnBorder = dark ? "#333333" : "#e5e7eb";
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: navBg, borderBottom: `1px solid ${navBorder}`, padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Outfit, sans-serif", transition: "background 0.2s" }}>
      <Link to="/" style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626", textDecoration: "none", letterSpacing: "-0.5px" }}>DIAVELA</Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={toggleDark} title={dark ? "Light mode" : "Dark mode"} style={{ width: "40px", height: "24px", borderRadius: "50px", border: "none", cursor: "pointer", background: dark ? "#dc2626" : "#e5e7eb", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: "3px", left: dark ? "19px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>{dark ? "🌙" : "☀️"}</span>
        </button>
        {isAuthenticated ? (
          <>
            {user?.role === "HOST" && <button onClick={() => navigate("/listings/new")} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "50px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ List your space</button>}
            {user?.role === "HOST" && <button onClick={() => navigate("/host")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Dashboard</button>}
            {user?.role === "GUEST" && <button onClick={() => navigate("/guest")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>My trips</button>}
            {user?.role === "ADMIN" && <button onClick={() => navigate("/admin")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Admin</button>}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "2px solid #dc2626", color: "#f87171", fontWeight: 800, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>{user?.email?.[0]?.toUpperCase() ?? "U"}</button>
              {menuOpen && (
                <div style={{ position: "absolute", right: 0, top: "46px", background: navBg, border: `1px solid ${navBorder}`, borderRadius: "14px", padding: "8px", minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200 }}>
                  <p style={{ margin: "8px 12px 4px", fontSize: "12px", color: "#888", fontWeight: 600 }}>{user?.email}</p>
                  <p style={{ margin: "0 12px 8px", fontSize: "11px", color: "#bbb", textTransform: "capitalize" }}>{user?.role?.toLowerCase()}</p>
                  <hr style={{ margin: "0 0 6px", border: "none", borderTop: `1px solid ${navBorder}` }} />
                  <button onClick={() => { setMenuOpen(false); navigate("/profile"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Profile</button>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
            <button onClick={() => navigate("/signup")} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: "50px", padding: "10px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Sign up</button>
          </>
        )}
      </div>
    </nav>
  );
}