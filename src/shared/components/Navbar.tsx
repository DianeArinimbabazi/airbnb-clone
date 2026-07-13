import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const navBg = dark ? "#111111" : "#fff";
  const navBorder = dark ? "#2a2a2a" : "#e5e7eb";
  const textColor = dark ? "#f1f5f9" : "#111";
  const btnBorder = dark ? "#333333" : "#e5e7eb";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchQuery("");
    navigate(`/listings?q=${encodeURIComponent(query)}`);
    setMobileNavOpen(false);
  };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: navBg, borderBottom: `1px solid ${navBorder}`, padding: "12px 24px", fontFamily: "Outfit, sans-serif", transition: "background 0.2s" }}>
      {/* Desktop nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <Link to="/" style={{ fontSize: "20px", fontWeight: 800, color: "#dc2626", textDecoration: "none", letterSpacing: "-0.5px" }}>DIAVELA</Link>
          <Link to="/" style={{ fontSize: "14px", fontWeight: 700, color: textColor, textDecoration: "none", padding: "6px 10px", borderRadius: 8, border: `1px solid ${btnBorder}` }}>Home</Link>
          <Link to="/listings" style={{ fontSize: "14px", fontWeight: 700, color: textColor, textDecoration: "none", padding: "6px 10px", borderRadius: 8, border: `1px solid ${btnBorder}` }}>All Listings</Link>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="nav-search-bar" style={{ flex: "1 1 320px", minWidth: "260px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: dark ? "#131313" : "#f7f7f7", border: `1px solid ${navBorder}` }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleNavSearch()} placeholder="Search homes, cities, hosts..."
            style={{ flex: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", color: textColor, fontSize: "14px", fontFamily: "inherit" }} />
          <button onClick={handleNavSearch} style={{ padding: "10px 18px", background: "#FF385C", color: "#fff", border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Search</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Dark mode toggle */}
          <button onClick={toggleDark} title={dark ? "Light mode" : "Dark mode"} style={{ width: "40px", height: "24px", borderRadius: "50px", border: "none", cursor: "pointer", background: dark ? "#dc2626" : "#e5e7eb", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: "3px", left: dark ? "19px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </button>

          {/* Desktop auth buttons */}
          {isAuthenticated ? (
            <div className="nav-auth-section" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user?.role === "HOST" && <button onClick={() => navigate("/host")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Dashboard</button>}
              {user?.role === "GUEST" && <button onClick={() => navigate("/guest")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>My trips</button>}
              {user?.role === "ADMIN" && <button onClick={() => navigate("/admin")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Admin</button>}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#111", border: "2px solid #dc2626", cursor: "pointer", overflow: "hidden", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name ?? "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
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
                           <img src={user.avatar} alt={user.name ?? "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
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
            </div>
          ) : (
            <div className="nav-auth-section" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => navigate("/login")} style={{ background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: textColor }}>Sign In</button>
              <button onClick={() => navigate("/signup")} style={{ background: "#FF385C", border: "none", borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#fff" }}>Sign Up</button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="nav-hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} style={{ display: "none", background: "none", border: `1.5px solid ${btnBorder}`, borderRadius: "8px", padding: "8px", cursor: "pointer", color: textColor }}>
            {mobileNavOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="nav-mobile-drawer" style={{ display: "none", flexDirection: "column", gap: "8px", paddingTop: "16px", borderTop: `1px solid ${navBorder}`, marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: dark ? "#131313" : "#f7f7f7", border: `1px solid ${navBorder}` }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleNavSearch()} placeholder="Search..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: textColor, fontSize: "14px", fontFamily: "inherit" }} />
            <button onClick={handleNavSearch} style={{ padding: "8px 16px", background: "#FF385C", color: "#fff", border: "none", borderRadius: "999px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Search</button>
          </div>
          <button onClick={() => { navigate("/listings"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>All Listings</button>
          {isAuthenticated ? (
            <>
              {user?.role === "HOST" && <button onClick={() => { navigate("/host"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Dashboard</button>}
              {user?.role === "GUEST" && <button onClick={() => { navigate("/guest"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>My trips</button>}
              {user?.role === "ADMIN" && <button onClick={() => { navigate("/admin"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Admin</button>}
              <button onClick={() => { navigate("/messages"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Messages</button>
              <button onClick={() => { navigate("/profile"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Profile</button>
              <hr style={{ border: "none", borderTop: `1px solid ${navBorder}`, margin: "4px 0" }} />
              <button onClick={() => { logout(); setMobileNavOpen(false); navigate("/"); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
            </>
          ) : (
            <>
              <hr style={{ border: "none", borderTop: `1px solid ${navBorder}`, margin: "4px 0" }} />
              <button onClick={() => { navigate("/login"); setMobileNavOpen(false); }} style={{ background: "none", border: "none", padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: 600, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>Sign In</button>
              <button onClick={() => { navigate("/signup"); setMobileNavOpen(false); }} style={{ background: "#FF385C", border: "none", borderRadius: "8px", padding: "12px 16px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
