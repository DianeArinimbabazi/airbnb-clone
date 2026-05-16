import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navBg = dark ? "#111111" : "#fff";
  const navBorder = dark ? "#2a2a2a" : "#e5e7eb";
  const textColor = dark ? "#f1f5f9" : "#111";
  const btnBorder = dark ? "#333333" : "#e5e7eb";
  const handleNavSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchQuery("");
    navigate(`/listings?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: navBg, borderBottom: `1px solid ${navBorder}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", fontFamily: "Outfit, sans-serif", transition: "background 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <Link to="/" style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626", textDecoration: "none", letterSpacing: "-0.5px" }}>DIAVELA</Link>
        <Link to="/" style={{ fontSize: "14px", fontWeight: 700, color: textColor, textDecoration: "none", padding: "6px 10px", borderRadius: 8, border: `1px solid ${btnBorder}` }}>Home</Link>
        <Link to="/listings" style={{ fontSize: "14px", fontWeight: 700, color: textColor, textDecoration: "none", padding: "6px 10px", borderRadius: 8, border: `1px solid ${btnBorder}` }}>All Listings</Link>
      </div>
      <div style={{ flex: "1 1 320px", minWidth: "260px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: dark ? "#131313" : "#f7f7f7", border: `1px solid ${navBorder}` }}>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleNavSearch()} placeholder="Search homes, cities, hosts..."
          style={{ flex: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", color: textColor, fontSize: "14px", fontFamily: "inherit" }} />
        <button onClick={handleNavSearch} style={{ padding: "10px 18px", background: "#FF385C", color: "#fff", border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Search</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={toggleDark} title={dark ? "Light mode" : "Dark mode"} style={{ width: "40px", height: "24px", borderRadius: "50px", border: "none", cursor: "pointer", background: dark ? "#dc2626" : "#e5e7eb", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: "3px", left: dark ? "19px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
        </button>
        {isAuthenticated ? (
          <>
            {user?.role === "HOST" && <button onClick={() => navigate("/host")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Dashboard</button>}
            {user?.role === "GUEST" && <button onClick={() => navigate("/guest")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>My trips</button>}
            {user?.role === "ADMIN" && <button onClick={() => navigate("/admin")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Admin</button>}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "2px solid #dc2626", cursor: "pointer", overflow: "hidden", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name ?? "avatar"}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span style={{ color: "#f87171", fontWeight: 800, fontSize: "14px", fontFamily: "inherit" }}>
                    {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", right: 0, top: "46px", background: navBg, border: `1px solid ${navBorder}`, borderRadius: "14px", padding: "8px", minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px 4px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#111", border: "1.5px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name ?? "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#f87171", fontWeight: 800, fontSize: "12px" }}>
                          {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", color: textColor, fontWeight: 700 }}>{user?.name ?? "User"}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#888", textTransform: "capitalize" }}>{user?.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  <p style={{ margin: "0 12px 8px", fontSize: "11px", color: "#bbb" }}>{user?.email}</p>
                  <hr style={{ margin: "0 0 6px", border: "none", borderTop: `1px solid ${navBorder}` }} />
                  <button onClick={() => { setMenuOpen(false); navigate("/profile"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Profile</button>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }} style={{ width: "100%", background: "none", border: "none", padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit", borderRadius: "8px" }}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
}




