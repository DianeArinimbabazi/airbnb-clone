import { useTheme } from "../../../shared/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useMyBookings } from "../../bookings/hooks/useMyBookings";
import { api } from "../../../lib/api";

interface Listing {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  type: string;
  guests: number;
  photos?: { url: string }[];
}
interface ListingsResponse {
  data: Listing[];
  meta: { total: number };
}

function useHostListings(hostId: string | undefined) {
  return useQuery<Listing[]>({
    queryKey: ["listings", "host", hostId],
    enabled: !!hostId,
    queryFn: async () => {
      const res = await api.get<ListingsResponse>(`/listings?hostId=${hostId}&limit=50`);
      return res.data ?? [];
    },
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const bg = dark ? "#1a1a1a" : "#f5f5f5";
  const card = dark ? "#2a2a2a" : "#ffffff";
  const text = dark ? "#f0f0f0" : "#111111";
  const sub = dark ? "#aaaaaa" : "#888888";
  const border = dark ? "#333333" : "#f0f0f0";
  const { data: listings = [], isLoading: loadingListings } = useHostListings(user?.id);
  const { data: bookings = [], isLoading: loadingBookings } = useMyBookings();

  const handleLogout = () => { logout(); navigate("/"); };

  const totalRevenue = bookings
    .filter(b => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const upcoming = bookings.filter(
    b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date()
  );

  const stats = [
    { label: "My Listings", value: listings.length, icon: "🏠" },
    { label: "Total Bookings", value: bookings.length, icon: "📋" },
    { label: "Upcoming", value: upcoming.length, icon: "📅" },
    { label: "Total Earned", value: `$${totalRevenue.toLocaleString()}`, icon: "💰" },
  ];

  const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
    CONFIRMED: { color: "#166534", bg: "#f0fdf4", border: "#d1fae5" },
    CANCELLED: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    COMPLETED: { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
  };

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", background: bg, minHeight: "100vh" }}>

      <section style={{ background: dark ? "#111111" : "#222222", padding: "48px 32px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ margin: "0 0 6px", color: "#aaaaaa", fontSize: "14px", fontWeight: 600 }}>Host dashboard</p>
            <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>
              Welcome, {user?.name ?? "Host"} 👋
            </h1>
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "15px" }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/listings/new")} style={{ background: "#FF385C", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              + Add listing
            </button>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1.5px solid #444444", borderRadius: "50px", padding: "12px 24px", color: "#ffffff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              Log out
            </button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "-28px auto 0", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" }}>
          {stats.map(({ label, value, icon }) => (
            <div key={label} style={{ background: card, borderRadius: "16px", padding: "22px 20px", border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{icon} {label}</p>
              <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: text }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "48px auto 0", padding: "0 32px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: "0 0 20px" }}>Your Listings</h2>
        {loadingListings ? (
          <div style={{ textAlign: "center", padding: "40px", color: sub }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: card, borderRadius: "20px", border: `1px solid ${border}` }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🏠</p>
            <h3 style={{ color: text, margin: "0 0 8px" }}>No listings yet</h3>
            <p style={{ color: sub, margin: "0 0 24px" }}>Create your first listing to start hosting</p>
            <button onClick={() => navigate("/listings/new")} style={{ background: "#111111", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              + Create listing
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {listings.map(l => {
              const photo = l.photos?.[0]?.url;
              return (
                <div key={l.id} style={{ background: card, borderRadius: "18px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "20px", padding: "16px 20px", flexWrap: "wrap" }}>
                  <div style={{ width: "80px", height: "64px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photo ? <img src={photo} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "24px" }}>🏠</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: "160px" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "15px", color: text }}>{l.title}</p>
                    <p style={{ margin: "0 0 2px", fontSize: "13px", color: sub }}>📍 {l.location}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#aaaaaa" }}>{l.type} · up to {l.guests} guests · ${l.pricePerNight}/night</p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "5px 14px", borderRadius: "20px", background: "#f0fdf4", color: "#166534", border: "1px solid #d1fae5" }}>
                    Active
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigate(`/listings/${l.id}`)} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: "50px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "#555555", cursor: "pointer", fontFamily: "inherit" }}>View</button>
                    <button onClick={() => navigate(`/listings/${l.id}/edit`)} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: "50px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, color: "#555555", cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ maxWidth: "1100px", margin: "40px auto 0", padding: "0 32px 64px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: "0 0 20px" }}>Recent Bookings</h2>
        {loadingBookings ? (
          <div style={{ textAlign: "center", padding: "40px", color: sub }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: card, borderRadius: "20px", border: `1px solid ${border}`, color: sub }}>No bookings yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.slice(0, 8).map(b => {
              const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.COMPLETED;
              return (
                <div key={b.id} style={{ background: card, borderRadius: "16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", flexWrap: "wrap" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>
                    {b.guest?.name?.[0]?.toUpperCase() ?? "G"}
                  </div>
                  <div style={{ flex: 1, minWidth: "140px" }}>
                    <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "14px", color: text }}>{b.guest?.name ?? "Guest"}</p>
                    <p style={{ margin: "0 0 2px", fontSize: "12px", color: sub }}>{b.listing.title}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#aaaaaa" }}>{formatDate(b.checkIn)} to {formatDate(b.checkOut)}</p>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: "16px", color: text, margin: 0 }}>${b.totalPrice}</p>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{b.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto 48px", padding: "0 32px" }}>
        <div style={{ background: "#111111", borderRadius: "20px", padding: "32px 36px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "36px" }}>💡</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "16px", color: "#ffffff" }}>Pro tip: Verified hosts earn 30% more</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#aaaaaa", lineHeight: 1.6 }}>Complete your host profile and verification to unlock higher visibility and guest trust.</p>
          </div>
          <button style={{ background: card, color: text, border: "none", borderRadius: "50px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            Complete profile
          </button>
        </div>
      </section>

      <footer style={{ background: "#0a0a0a", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>DIAVELA</p>
        <p style={{ margin: 0, color: "#555555", fontSize: "12px" }}>2025 DIAVELA · Every listing verified · Every stay guaranteed.</p>
      </footer>
    </div>
  );
}


