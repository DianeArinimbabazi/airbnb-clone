import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useMyBookings } from "../../bookings/hooks/useMyBookings";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { FiHome, FiSearch, FiPlus, FiCalendar, FiStar, FiUser, FiSettings, FiLogOut, FiEdit, FiTrash, FiEye, FiDollarSign } from "react-icons/fi";

interface Listing {
  id: string; title: string; location: string; pricePerNight: number;
  type: string; guests: number; rating?: number; photos?: { url: string }[];
}
interface ListingsResponse { data: Listing[]; meta: { total: number }; }

const PHOTOS: Record<string, string[]> = {
  VILLA:     ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
  CABIN:     ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"],
  APARTMENT: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0266?w=800"],
  HOUSE:     ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
};
const FALLBACK = ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"];
function hashId(id: string) { return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0); }
function assignPhoto(l: Listing): Listing {
  if (l.photos?.[0]?.url) return l;
  const pool = PHOTOS[l.type] ?? FALLBACK;
  return { ...l, photos: [{ url: pool[hashId(l.id) % pool.length] }] };
}
function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#854f0b", bg: "#faeeda" },
  CONFIRMED: { label: "Confirmed", color: "#3b6d11", bg: "#eaf3de" },
  CANCELLED: { label: "Cancelled", color: "#a32d2d", bg: "#fcebeb" },
  COMPLETED: { label: "Completed", color: "#185fa5", bg: "#e6f1fb" },
};

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("listings");
  const [activeTab, setActiveTab] = useState<"listings"|"bookings">("listings");

  const card   = dark ? "#1a1a1a" : "#ffffff";
  const bg     = dark ? "#111111" : "#f7f7f5";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const accent = "#e8442a";

  const { data: listings = [], isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ["listings", "host", user?.id],
    enabled: !!user?.id,
    queryFn: async () => { const res = await api.get<ListingsResponse>(`/listings?hostId=${user?.id}&limit=50`); return (res.data ?? []).map(assignPhoto); },
  });
  const { data: bookings = [], isLoading: loadingBookings } = useMyBookings();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => { toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["listings", "host", user?.id] }); },
    onError: (e: any) => toast.error(e?.message || "Could not delete listing"),
  });

  const totalRevenue = bookings.filter(b => b.status !== "CANCELLED").reduce((s, b) => s + b.totalPrice, 0);
  const upcoming     = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date());
  const ratings      = listings.map(l => l.rating).filter((r): r is number => typeof r === "number");
  const avgRating    = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : "—";

  const filteredListings = listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase()));
  const filteredBookings = bookings.filter(b => b.listing?.title?.toLowerCase().includes(search.toLowerCase()) || b.guest?.name?.toLowerCase().includes(search.toLowerCase()));

  const navItems = [
    { id: "listings",  icon: <FiHome size={15} />,     label: "My listings",   action: () => { setActiveNav("listings"); setActiveTab("listings"); } },
    { id: "bookings",  icon: <FiCalendar size={15} />, label: "Bookings",      action: () => { setActiveNav("bookings"); setActiveTab("bookings"); } },
    { id: "add",       icon: <FiPlus size={15} />,     label: "Add listing",   action: () => navigate("/listings/new") },
    { id: "reviews",   icon: <FiStar size={15} />,     label: "Reviews",       action: () => navigate("/listings") },
    { id: "earnings",  icon: <FiDollarSign size={15} />,label: "Earnings",     action: () => { setActiveNav("earnings"); } },
  ];
  const accountItems = [
    { id: "profile",  icon: <FiUser size={15} />,     label: "Edit profile", action: () => navigate("/profile") },
    { id: "settings", icon: <FiSettings size={15} />, label: "Settings",     action: () => navigate("/profile") },
    { id: "logout",   icon: <FiLogOut size={15} />,   label: "Log out",      action: () => { logout(); navigate("/"); } },
  ];

  const NavItem = ({ item, active }: { item: any; active: boolean }) => (
    <div onClick={() => { setActiveNav(item.id); item.action?.(); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 20px", fontSize: "13px", cursor: "pointer", borderRight: active ? `3px solid ${accent}` : "3px solid transparent", background: active ? (dark ? "#2a1008" : "#fff1ef") : "transparent", color: active ? accent : sub, fontWeight: active ? 600 : 400 }}>
      {item.icon}<span>{item.label}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", display: "flex", minHeight: "100vh", background: bg }}>

      {/* Sidebar */}
      <div style={{ width: "220px", flexShrink: 0, background: card, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div onClick={() => navigate("/")} style={{ padding: "18px 20px 14px", fontSize: "20px", fontWeight: 800, borderBottom: `1px solid ${border}`, cursor: "pointer", color: text }}>
          DIA<span style={{ color: accent }}>VELA</span>
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Hosting</p>
          {navItems.map(item => <NavItem key={item.id} item={item} active={activeNav === item.id} />)}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "7px 12px", width: "240px" }}>
            <FiSearch size={13} color={sub} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings or bookings..." style={{ border: "none", background: "transparent", fontSize: "13px", color: text, outline: "none", width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: sub }}>
            {[{label:"Home",to:"/"},{label:"Listings",to:"/listings"},{label:"Profile",to:"/profile"}].map(({label,to}) => (
              <span key={label} onClick={() => navigate(to)} style={{ cursor: "pointer" }}>{label}</span>
            ))}
            <button onClick={() => navigate("/listings/new")} style={{ background: accent, color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add listing</button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase() ?? "H"}</div>
              <div><p style={{ fontSize: "12px", fontWeight: 600, color: text, margin: 0 }}>{user?.name ?? "Host"}</p><p style={{ fontSize: "11px", color: sub, margin: 0 }}>{user?.email}</p></div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px", flex: 1 }}>
          {/* Banner */}
          <div style={{ background: `linear-gradient(135deg, #f97316, ${accent})`, borderRadius: "16px", padding: "24px 28px", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back, {user?.name ?? "Host"}!</h2>
              <p style={{ fontSize: "13px", opacity: .85, maxWidth: "320px", lineHeight: 1.5, margin: "0 0 14px" }}>Manage your listings, track bookings and grow your hosting business.</p>
              <button onClick={() => navigate("/listings/new")} style={{ background: "#fff", color: accent, border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add new listing</button>
            </div>
            <FiHome size={64} style={{ opacity: .25 }} />
          </div>

          {/* Stats */}
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

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: bg, borderRadius: "10px", padding: "4px", width: "fit-content", border: `1px solid ${border}` }}>
            {(["listings","bookings"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? accent : "transparent", color: activeTab === tab ? "#fff" : sub, border: "none", borderRadius: "8px", padding: "7px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{tab}</button>
            ))}
          </div>

          {/* Listings table */}
          {activeTab === "listings" && (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: bg }}>
                    {["#","Photo","Title","Location","Type","Price/night","Rating","Status","Action"].map(h => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 12px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingListings ? (
                    <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>Loading listings...</td></tr>
                  ) : filteredListings.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>
                      No listings yet. <span onClick={() => navigate("/listings/new")} style={{ color: accent, cursor: "pointer", fontWeight: 600 }}>Create your first →</span>
                    </td></tr>
                  ) : filteredListings.map((l, i) => (
                    <tr key={l.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ width: "48px", height: "36px", borderRadius: "6px", overflow: "hidden", background: bg }}>
                          {l.photos?.[0]?.url ? <img src={l.photos[0].url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <FiHome size={16} color={sub} />}
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: text, maxWidth: "150px" }}>{l.title}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{l.location}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: sub }}>{l.type}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: text }}>${l.pricePerNight}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {typeof l.rating === "number" ? (
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", background: "#faeeda", padding: "2px 8px", borderRadius: "999px" }}>★ {l.rating.toFixed(1)}</span>
                        ) : <span style={{ fontSize: "12px", color: sub }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#eaf3de", color: "#3b6d11" }}>Active</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => navigate(`/listings/${l.id}`)} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "3px" }}><FiEye size={11} /></button>
                          <button onClick={() => navigate(`/listings/${l.id}/edit`)} style={{ background: "#e6f1fb", color: "#185fa5", border: "none", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "3px" }}><FiEdit size={11} /></button>
                          <button onClick={() => { if (confirm(`Delete "${l.title}"?`)) deleteMutation.mutate(l.id); }} disabled={deleteMutation.isPending} style={{ background: "#fcebeb", color: "#a32d2d", border: "none", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "3px" }}><FiTrash size={11} /></button>
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

          {/* Bookings table */}
          {activeTab === "bookings" && (
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
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>Loading bookings...</td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>No bookings yet</td></tr>
                  ) : filteredBookings.slice(0, 20).map((b, i) => {
                    const s = STATUS[b.status] ?? STATUS.COMPLETED;
                    return (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{String(i+1).padStart(2,"0")}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>{initials(b.guest?.name ?? "G")}</div>
                            <span style={{ fontSize: "13px", color: text }}>{b.guest?.name ?? "Guest"}</span>
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
              <div style={{ padding: "10px 16px", fontSize: "12px", color: sub, borderTop: `1px solid ${border}` }}>
                Showing {Math.min(20, filteredBookings.length)} of {bookings.length} bookings
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


