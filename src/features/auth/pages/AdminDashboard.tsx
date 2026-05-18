import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { FiHome, FiPlus, FiMessageSquare, FiStar, FiCalendar, FiHeart, FiUser, FiSettings, FiLogOut, FiCheck, FiX, FiEye, FiSearch, FiShield, FiClock, FiDollarSign, FiMapPin } from "react-icons/fi";

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guest: { id: string; name: string; email: string };
  listing: { id: string; title: string; location: string };
}
interface Stats { totalUsers: number; totalListings: number; totalBookings: number; pendingBookings: number; totalRevenue: number; }

function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#854f0b", bg: "#faeeda" },
  CONFIRMED: { label: "Approved",  color: "#3b6d11", bg: "#eaf3de" },
  CANCELLED: { label: "Rejected",  color: "#a32d2d", bg: "#fcebeb" },
  COMPLETED: { label: "Completed", color: "#185fa5", bg: "#e6f1fb" },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");

  const card   = dark ? "#1a1a1a" : "#ffffff";
  const bg     = dark ? "#111111" : "#f7f7f5";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const accent = "#e8442a";

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["admin", "bookings"],
    queryFn: () => api.get<Booking[]>("/bookings/all"),
  });
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/status`, { status: "CONFIRMED" }),
    onSuccess: () => { toast.success("Booking approved"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/status`, { status: "CANCELLED" }),
    onSuccess: () => { toast.success("Booking rejected"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  const filtered = bookings.filter(b =>
    b.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.listing?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const pending   = bookings.filter(b => b.status === "PENDING").length;
  const approved  = bookings.filter(b => b.status === "CONFIRMED").length;
  const revenue   = bookings.filter(b => b.status !== "CANCELLED").reduce((s, b) => s + b.totalPrice, 0);

  const navItems = [
    { id: "dashboard", icon: <FiHome size={15} />, label: "Dashboard" },
    { id: "listings",  icon: <FiPlus size={15} />, label: "Add listing", action: () => navigate("/listings/new") },
    { id: "messages",  icon: <FiMessageSquare size={15} />, label: "Messages" },
  ];
  const listingItems = [
    { id: "mylistings", icon: <FiHome size={15} />, label: "My listings", action: () => navigate("/listings") },
    { id: "reviews",    icon: <FiStar size={15} />, label: "Reviews" },
    { id: "bookings",   icon: <FiCalendar size={15} />, label: "Bookings" },
    { id: "saved",      icon: <FiHeart size={15} />, label: "Saved" },
  ];
  const accountItems = [
    { id: "profile",  icon: <FiUser size={15} />, label: "Edit profile", action: () => navigate("/profile") },
    { id: "settings", icon: <FiSettings size={15} />, label: "Settings" },
    { id: "moderation", icon: <FiShield size={15} />, label: "Moderation", action: () => navigate("/admin/moderation") },
    { id: "logout",   icon: <FiLogOut size={15} />, label: "Log out", action: () => { logout(); navigate("/"); } },
  ];

  const NavItem = ({ item, active }: { item: any; active: boolean }) => (
    <div
      onClick={() => { setActiveNav(item.id); item.action?.(); }}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 20px", fontSize: "13px", cursor: "pointer", borderRight: active ? `3px solid ${accent}` : "3px solid transparent", background: active ? (dark ? "#2a1008" : "#fff1ef") : "transparent", color: active ? accent : sub, fontWeight: active ? 600 : 400, transition: "background .15s" }}
    >
      {item.icon}<span>{item.label}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", display: "flex", minHeight: "100vh", background: bg }}>

      {/* Sidebar */}
      <div style={{ width: "220px", flexShrink: 0, background: card, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "18px 20px 14px", fontSize: "20px", fontWeight: 800, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "8px", color: text }}>
          <FiMapPin size={18} color={accent} />List<span style={{ color: accent }}>On</span>
        </div>

        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Main menu</p>
          {navItems.map(item => <NavItem key={item.id} item={item} active={activeNav === item.id} />)}
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Listing</p>
          {listingItems.map(item => <NavItem key={item.id} item={item} active={activeNav === item.id} />)}
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Account</p>
          {accountItems.map(item => <NavItem key={item.id} item={item} active={activeNav === item.id} />)}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "7px 12px", fontSize: "13px", color: sub, width: "220px" }}>
            <FiSearch size={13} /><span>Search...</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: sub }}>
            {["Home","Dashboard","Listings","Explore"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase() ?? "A"}</div>
              <div><p style={{ fontSize: "12px", fontWeight: 600, color: text, margin: 0 }}>{user?.name ?? "Admin"}</p><p style={{ fontSize: "11px", color: sub, margin: 0 }}>{user?.email}</p></div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px", flex: 1 }}>

          {/* Banner */}
          <div style={{ background: `linear-gradient(135deg, #f97316, ${accent})`, borderRadius: "16px", padding: "24px 28px", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>Booking approvals & management</h2>
              <p style={{ fontSize: "13px", opacity: .85, maxWidth: "320px", lineHeight: 1.5, margin: "0 0 14px" }}>Review pending bookings below. Approve or reject guest requests before they're confirmed.</p>
              <button onClick={() => navigate("/admin/moderation")} style={{ background: "#fff", color: accent, border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>View moderation</button>
            </div>
            <FiShield size={64} style={{ opacity: .25 }} />
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Total bookings", value: stats?.totalBookings ?? bookings.length, icon: <FiCalendar size={18} />, ic: { bg: "#fff1ef", color: accent } },
              { label: "Pending",        value: stats?.pendingBookings ?? pending,        icon: <FiClock size={18} />,    ic: { bg: "#fff1ef", color: accent }, red: true },
              { label: "Approved",       value: approved,                                 icon: <FiCheck size={18} />,    ic: { bg: "#eaf3de", color: "#3b6d11" } },
              { label: "Revenue",        value: `$${(stats?.totalRevenue ?? revenue).toLocaleString()}`, icon: <FiDollarSign size={18} />, ic: { bg: "#e6f1fb", color: "#185fa5" } },
            ].map(({ label, value, icon, ic, red }) => (
              <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div><p style={{ fontSize: "11px", color: sub, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p><p style={{ fontSize: "22px", fontWeight: 700, color: red ? accent : text, margin: 0 }}>{value}</p></div>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: ic.bg, display: "flex", alignItems: "center", justifyContent: "center", color: ic.color }}>{icon}</div>
              </div>
            ))}
          </div>

          {/* Bookings table */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: text, margin: 0 }}>Bookings</p>
            <span style={{ fontSize: "12px", color: accent, cursor: "pointer" }}>View all</span>
          </div>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: sub }}>Show <select style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${border}`, background: bg, color: text }}><option>10</option><option>25</option></select> entries</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: "6px 10px" }}>
                <FiSearch size={12} color={sub} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ border: "none", background: "transparent", fontSize: "12px", color: text, outline: "none", width: "130px" }} />
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: bg }}>
                  {["#","Guest","Listing","Check-in","Amount","Status","Action"].map(h => (
                    <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>Loading bookings...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>No bookings found</td></tr>
                ) : filtered.slice(0, 10).map((b, i) => {
                  const s = STATUS[b.status] ?? STATUS.COMPLETED;
                  const isPending = b.status === "PENDING";
                  return (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{String(i + 1).padStart(2, "0")}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 600, color: sub, flexShrink: 0 }}>{initials(b.guest?.name ?? "G")}</div>
                          <span style={{ fontSize: "13px", color: text }}>{b.guest?.name ?? "Guest"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{b.listing?.title}</td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{fmt(b.checkIn)}</td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: text }}>${b.totalPrice}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {isPending && <>
                            <button onClick={() => approveMutation.mutate(b.id)} disabled={approveMutation.isPending} style={{ background: accent, color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Approve</button>
                            <button onClick={() => rejectMutation.mutate(b.id)} disabled={rejectMutation.isPending} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 12px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>Reject</button>
                          </>}
                          <button onClick={() => navigate(`/listings/${b.listing?.id}`)} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}><FiEye size={11} /> View</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: sub, borderTop: `1px solid ${border}` }}>
              <span>Showing 1 to {Math.min(10, filtered.length)} of {filtered.length} entries</span>
              <div style={{ display: "flex", gap: "4px" }}>
                {["‹","1","›"].map((p, i) => <div key={i} style={{ width: "26px", height: "26px", borderRadius: "6px", border: `1px solid ${i===1?accent:border}`, background: i===1?accent:bg, color: i===1?"#fff":sub, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{p}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
