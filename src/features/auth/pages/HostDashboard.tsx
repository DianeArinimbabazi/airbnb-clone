import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useMyBookings } from "../../bookings/hooks/useMyBookings";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import {
  FiHome, FiSearch, FiPlus, FiCalendar, FiStar, FiUser, FiSettings,
  FiLogOut, FiEdit, FiTrash, FiEye, FiDollarSign, FiMessageSquare, FiMap
} from "react-icons/fi";

interface Listing {
  id: string; title: string; location: string; pricePerNight: number;
  type: string; guests: number; rating?: number; photos?: { url: string }[];
}
interface ListingsResponse { data: Listing[]; meta: { total: number }; }

const PHOTOS: Record<string, string> = {
  VILLA: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
  CABIN: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
  APARTMENT: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0266?w=800",
  HOUSE: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
};
function assignPhoto(l: Listing): Listing {
  if (l.photos?.[0]?.url) return l;
  return { ...l, photos: [{ url: PHOTOS[l.type] ?? "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" }] };
}
function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#854f0b", bg: "#faeeda" },
  CONFIRMED: { label: "Confirmed", color: "#3b6d11", bg: "#eaf3de" },
  CANCELLED: { label: "Cancelled", color: "#a32d2d", bg: "#fcebeb" },
  COMPLETED: { label: "Completed", color: "#185fa5", bg: "#e6f1fb" },
};

type Section = "listings" | "bookings" | "earnings" | "reviews" | "messages" | "settings";

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState<Section>("listings");
  const [settingsForm, setSettingsForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", bio: "" });
  const [msgDraft, setMsgDraft] = useState("");

  const card   = dark ? "#1a1a1a" : "#ffffff";
  const bg     = dark ? "#111111" : "#f7f7f5";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = dark ? "#2a2a2a" : "#f7f7f5";
  const accent = "#e8442a";

  const { data: listings = [], isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ["listings", "host", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await api.get<ListingsResponse>(`/listings?hostId=${user?.id}&limit=50`);
      return (res.data ?? []).map(assignPhoto);
    },
  });
  const { data: bookings = [], isLoading: loadingBookings } = useMyBookings();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => { toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["listings", "host", user?.id] }); },
    onError: (e: any) => toast.error(e?.message || "Could not delete"),
  });

  const totalRevenue = bookings.filter(b => b.status !== "CANCELLED").reduce((s, b) => s + b.totalPrice, 0);
  const upcoming     = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date());
  const ratings      = listings.map(l => l.rating).filter((r): r is number => typeof r === "number");
  const avgRating    = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : "—";

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
    b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
    (b as any).guest?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Monthly earnings from bookings
  const monthlyEarnings = (() => {
    const map: Record<string, number> = {};
    bookings.filter(b => b.status !== "CANCELLED").forEach(b => {
      const key = new Date(b.checkIn).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      map[key] = (map[key] ?? 0) + b.totalPrice;
    });
    return Object.entries(map).slice(-6);
  })();

  const navItems: { id: Section; icon: JSX.Element; label: string }[] = [
    { id: "listings",  icon: <FiHome size={15} />,        label: "My listings" },
    { id: "bookings",  icon: <FiCalendar size={15} />,    label: "Bookings" },
    { id: "earnings",  icon: <FiDollarSign size={15} />,  label: "Earnings" },
    { id: "reviews",   icon: <FiStar size={15} />,        label: "Reviews" },
    { id: "messages",  icon: <FiMessageSquare size={15} />, label: "Messages" },
  ];
  const accountItems: { id: Section | "add" | "profile" | "logout" | "explore"; icon: JSX.Element; label: string; action: () => void }[] = [
    { id: "add",      icon: <FiPlus size={15} />,      label: "Add listing",  action: () => navigate("/listings/new") },
    { id: "explore",  icon: <FiMap size={15} />,        label: "Explore map",  action: () => navigate("/listings") },
    { id: "profile",  icon: <FiUser size={15} />,       label: "Edit profile", action: () => navigate("/profile") },
    { id: "settings", icon: <FiSettings size={15} />,   label: "Settings",     action: () => setActiveNav("settings") },
    { id: "logout",   icon: <FiLogOut size={15} />,     label: "Log out",      action: () => { logout(); navigate("/"); } },
  ];

  const NavItem = ({ id, icon, label, action }: { id: string; icon: JSX.Element; label: string; action?: () => void }) => {
    const active = activeNav === id;
    return (
      <div onClick={() => { if (action) action(); else setActiveNav(id as Section); }}
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 20px", fontSize: "13px", cursor: "pointer", borderRight: active ? `3px solid ${accent}` : "3px solid transparent", background: active ? (dark ? "#2a1008" : "#fff1ef") : "transparent", color: active ? accent : sub, fontWeight: active ? 600 : 400 }}>
        {icon}<span>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", display: "flex", minHeight: "100vh", background: bg }}>
      {/* Sidebar */}
      <div style={{ width: "220px", flexShrink: 0, background: card, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div onClick={() => navigate("/")} style={{ padding: "18px 20px 14px", fontSize: "20px", fontWeight: 800, borderBottom: `1px solid ${border}`, cursor: "pointer", color: text }}>
          DIA<span style={{ color: accent }}>VELA</span>
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Hosting</p>
          {navItems.map(item => <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} />)}
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Account</p>
          {accountItems.map(item => <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} action={item.action} />)}
        </div>
        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{user?.name?.[0]?.toUpperCase() ?? "H"}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "Host"}</p>
            <p style={{ fontSize: "11px", color: sub, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "7px 12px", width: "240px" }}>
            <FiSearch size={13} color={sub} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings or bookings..." style={{ border: "none", background: "transparent", fontSize: "13px", color: text, outline: "none", width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/listings/new")} style={{ background: accent, color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add listing</button>
            <button onClick={() => navigate("/listings")} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>View map</button>
          </div>
        </div>

        <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>

          {/* Stats always visible */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "My Listings",    value: listings.length },
              { label: "Total Bookings", value: bookings.length },
              { label: "Upcoming",       value: upcoming.length },
              { label: "Total Earned",   value: `$${totalRevenue.toLocaleString()}` },
              { label: "Avg Rating",     value: avgRating },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", padding: "16px" }}>
                <p style={{ fontSize: "11px", color: sub, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                <p style={{ fontSize: "20px", fontWeight: 700, color: text, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── LISTINGS ── */}
          {activeNav === "listings" && (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: bg }}>
                    {["#","Photo","Title","Location","Type","Price/night","Rating","Action"].map(h => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 12px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingListings ? (
                    <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: sub }}>Loading...</td></tr>
                  ) : filteredListings.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: sub }}>
                      No listings yet. <span onClick={() => navigate("/listings/new")} style={{ color: accent, cursor: "pointer", fontWeight: 600 }}>Create your first →</span>
                    </td></tr>
                  ) : filteredListings.map((l, i) => (
                    <tr key={l.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", background: bg }}>
                          {l.photos?.[0]?.url && <img src={l.photos[0].url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: text, maxWidth: "160px" }}>{l.title}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{l.location}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{l.type}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: text }}>${l.pricePerNight}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {typeof l.rating === "number"
                          ? <span style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", background: "#faeeda", padding: "2px 8px", borderRadius: "999px" }}>★ {l.rating.toFixed(1)}</span>
                          : <span style={{ fontSize: "12px", color: sub }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => navigate(`/listings/${l.id}`)} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}><FiEye size={11} /></button>
                          <button onClick={() => navigate(`/listings/${l.id}/edit`)} style={{ background: "#e6f1fb", color: "#185fa5", border: "none", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}><FiEdit size={11} /></button>
                          <button onClick={() => { if (confirm(`Delete "${l.title}"?`)) deleteMutation.mutate(l.id); }} style={{ background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}><FiTrash size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "10px 16px", fontSize: "12px", color: sub, borderTop: `1px solid ${border}` }}>
                Showing {filteredListings.length} of {listings.length} listings
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeNav === "bookings" && (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: bg }}>
                    {["#","Guest","Listing","Check-in","Check-out","Amount","Status"].map(h => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub }}>Loading...</td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub }}>No bookings yet</td></tr>
                  ) : filteredBookings.map((b, i) => {
                    const s = STATUS[b.status] ?? STATUS.COMPLETED;
                    return (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{String(i+1).padStart(2,"0")}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>{initials((b as any).guest?.name ?? "G")}</div>
                            <span style={{ fontSize: "13px", color: text }}>{(b as any).guest?.name ?? "Guest"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{b.listing?.title}</td>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{fmt(b.checkIn)}</td>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{fmt(b.checkOut)}</td>
                        <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: text }}>${b.totalPrice}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── EARNINGS ── */}
          {activeNav === "earnings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
                {[
                  { label: "Total Earned", value: `$${totalRevenue.toLocaleString()}`, sub: "All time", color: accent },
                  { label: "This Month", value: `$${(monthlyEarnings[monthlyEarnings.length-1]?.[1] ?? 0).toLocaleString()}`, sub: "Current month", color: "#10b981" },
                  { label: "Avg per Booking", value: bookings.length ? `$${Math.round(totalRevenue / bookings.filter(b=>b.status!=="CANCELLED").length) || 0}` : "$0", sub: "Per confirmed booking", color: "#3b82f6" },
                ].map(({ label, value, sub: s, color }) => (
                  <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
                    <p style={{ fontSize: "12px", color: sub, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color, margin: "0 0 4px" }}>{value}</p>
                    <p style={{ fontSize: "12px", color: sub, margin: 0 }}>{s}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: text, margin: "0 0 16px" }}>Monthly earnings</p>
                {monthlyEarnings.length === 0 ? (
                  <p style={{ color: sub, fontSize: "13px", textAlign: "center", padding: "32px 0" }}>No earnings data yet — complete some bookings to see your chart.</p>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
                    {monthlyEarnings.map(([month, amount]) => {
                      const max = Math.max(...monthlyEarnings.map(e => e[1]));
                      const pct = max > 0 ? (amount / max) * 100 : 0;
                      return (
                        <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: sub }}>${amount.toLocaleString()}</span>
                          <div style={{ width: "100%", height: `${Math.max(pct, 4)}%`, background: accent, borderRadius: "6px 6px 0 0", minHeight: "8px" }} />
                          <span style={{ fontSize: "11px", color: sub, whiteSpace: "nowrap" }}>{month}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: text, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${border}` }}>Booking revenue breakdown</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: bg }}>
                      {["Listing","Bookings","Revenue","Avg/booking"].map(h => (
                        <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 16px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(l => {
                      const lb = bookings.filter(b => b.listing?.id === l.id && b.status !== "CANCELLED");
                      const rev = lb.reduce((s, b) => s + b.totalPrice, 0);
                      return (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "11px 16px", fontSize: "13px", color: text, fontWeight: 500 }}>{l.title}</td>
                          <td style={{ padding: "11px 16px", fontSize: "13px", color: sub }}>{lb.length}</td>
                          <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: 600, color: text }}>${rev.toLocaleString()}</td>
                          <td style={{ padding: "11px 16px", fontSize: "13px", color: sub }}>${lb.length ? Math.round(rev / lb.length) : 0}</td>
                        </tr>
                      );
                    })}
                    {listings.length === 0 && <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center", color: sub, fontSize: "13px" }}>No listings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeNav === "reviews" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "4px" }}>
                {[
                  { label: "Avg Rating", value: avgRating, icon: "★" },
                  { label: "Total Reviews", value: ratings.length, icon: "✍" },
                  { label: "Listings Rated", value: listings.filter(l => typeof l.rating === "number").length, icon: "🏠" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fff1ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{icon}</div>
                    <div>
                      <p style={{ fontSize: "11px", color: sub, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                      <p style={{ fontSize: "22px", fontWeight: 800, color: accent, margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {listings.filter(l => typeof l.rating === "number").length === 0 ? (
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "60px 40px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>⭐</div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: text, margin: "0 0 8px" }}>No reviews yet</p>
                  <p style={{ fontSize: "13px", color: sub, margin: 0 }}>Reviews from guests will appear here once your listings receive ratings.</p>
                </div>
              ) : (
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: bg }}>
                        {["Listing","Location","Rating","Type"].map(h => (
                          <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 16px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.filter(l => typeof l.rating === "number").map(l => (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: text }}>{l.title}</td>
                          <td style={{ padding: "12px 16px", fontSize: "12px", color: sub }}>{l.location}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ color: s <= Math.round(l.rating!) ? "#f59e0b" : "#e5e7eb", fontSize: "14px" }}>★</span>
                              ))}
                              <span style={{ fontSize: "12px", color: sub, marginLeft: "6px" }}>{l.rating!.toFixed(1)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "12px", color: sub }}>{l.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activeNav === "messages" && (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden", display: "flex", height: "500px" }}>
              {/* Sidebar */}
              <div style={{ width: "260px", borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${border}`, fontSize: "13px", fontWeight: 700, color: text }}>Conversations</div>
                {bookings.slice(0, 8).map((b, i) => {
                  const colors = [accent,"#3b82f6","#10b981","#f59e0b","#8b5cf6"];
                  const color = colors[i % colors.length];
                  const guestName = (b as any).guest?.name ?? `Guest ${i+1}`;
                  return (
                    <div key={b.id} style={{ padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-start", borderBottom: `1px solid ${border}`, cursor: "pointer" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{initials(guestName)}</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{guestName}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.listing?.title}</p>
                      </div>
                    </div>
                  );
                })}
                {bookings.length === 0 && (
                  <div style={{ padding: "40px 16px", textAlign: "center", color: sub, fontSize: "13px" }}>No conversations yet</div>
                )}
              </div>
              {/* Chat area */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`, fontSize: "13px", fontWeight: 600, color: text }}>
                  {bookings.length > 0 ? `Chat with ${(bookings[0] as any).guest?.name ?? "guest"} — ${bookings[0].listing?.title}` : "Select a conversation"}
                </div>
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bookings.length > 0 ? (
                    <>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>{initials((bookings[0] as any).guest?.name ?? "G")}</div>
                        <div style={{ background: inputBg, padding: "10px 14px", borderRadius: "18px 18px 18px 4px", fontSize: "13px", color: text, maxWidth: "65%" }}>
                          Hi! I just booked {bookings[0].listing?.title}. Looking forward to the stay!
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row-reverse", gap: "8px", alignItems: "flex-end" }}>
                        <div style={{ background: accent, padding: "10px 14px", borderRadius: "18px 18px 4px 18px", fontSize: "13px", color: "#fff", maxWidth: "65%" }}>
                          Welcome! The property will be ready for you. Let me know if you have any questions.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: sub, fontSize: "13px" }}>
                      Messages from guests will appear here
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${border}`, display: "flex", gap: "8px" }}>
                  <input value={msgDraft} onChange={e => setMsgDraft(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "9px 14px", fontSize: "13px", color: text, outline: "none", fontFamily: "inherit" }} />
                  <button onClick={() => { if (msgDraft.trim()) { toast.success("Message sent!"); setMsgDraft(""); } }} style={{ background: accent, color: "#fff", border: "none", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Send</button>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeNav === "settings" && (
            <div style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: text, margin: "0 0 20px" }}>Profile settings</p>
                {[
                  { label: "Full name", key: "name", value: settingsForm.name, placeholder: "Your name" },
                  { label: "Email address", key: "email", value: settingsForm.email, placeholder: "your@email.com" },
                  { label: "Bio", key: "bio", value: settingsForm.bio, placeholder: "Tell guests about yourself..." },
                ].map(({ label, key, value, placeholder }) => (
                  <div key={key} style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: sub, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</label>
                    <input value={value} onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>
                ))}
                <button onClick={() => { navigate("/profile"); toast.success("Opening profile editor..."); }}
                  style={{ background: accent, color: "#fff", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Save changes
                </button>
              </div>

              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: text, margin: "0 0 16px" }}>Notifications</p>
                {["New booking requests", "Booking confirmations", "Guest messages", "Review reminders"].map(label => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: "13px", color: text }}>{label}</span>
                    <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: accent, cursor: "pointer", position: "relative" }}>
                      <div style={{ position: "absolute", right: "2px", top: "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: text, margin: "0 0 16px" }}>Account actions</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => { logout(); navigate("/"); }} style={{ background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Log out</button>
                  <button onClick={() => navigate("/profile")} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 20px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Edit full profile</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
