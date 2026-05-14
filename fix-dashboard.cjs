const fs = require("fs");
const file = "src/features/auth/pages/GuestDashboard.tsx";
const content = `import { AIRecommendations } from '../../ai/AIRecommendations';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMyBookings, useCancelBooking } from "../../bookings/hooks/useMyBookings";
import { useTheme } from "../../../shared/context/ThemeContext";
import toast from "react-hot-toast";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nights(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  CONFIRMED: { color: "#7c6fa8", bg: "#f0ebff" },
  COMPLETED: { color: "#1a7f45", bg: "#d4f5e2" },
  CANCELLED: { color: "#888", bg: "#f0f0f0" },
};

type Tab = "upcoming" | "past";

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const { data: bookings = [], isLoading } = useMyBookings();
  const cancelMutation = useCancelBooking();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const bg     = dark ? "#1a1a1a" : "#fafafa";
  const card   = dark ? "#2a2a2a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#aaaaaa" : "#888888";
  const border = dark ? "#333333" : "#f0f0f0";
  const heroBg = dark ? "#111111" : "#222222";

  const upcoming  = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date());
  const past      = bookings.filter(b => b.status === "COMPLETED" || b.status === "CANCELLED" || (b.status === "CONFIRMED" && new Date(b.checkIn) < new Date()));
  const displayed = tab === "upcoming" ? upcoming : past;

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Booking cancelled");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", background: bg, minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ background: heroBg, padding: "48px 32px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ margin: "0 0 6px", color: "#aaaaaa", fontSize: "14px", fontWeight: 600 }}>{getGreeting()}</p>
            <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>
              Welcome back, {user?.name ?? "Guest"} \u{1F44B}
            </h1>
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "15px" }}>{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            style={{ background: "transparent", border: "1.5px solid #444444", borderRadius: "10px", padding: "10px 20px", color: "#ffffff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
            \u{1F6AA} Log out
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: "1100px", margin: "-28px auto 0", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" }}>
          {[
            { icon: "\u{1F4CB}", label: "Total Bookings",  value: bookings.length },
            { icon: "\u{1F4C5}", label: "Upcoming",        value: upcoming.length },
            { icon: "\u2705",    label: "Completed",       value: bookings.filter(b => b.status === "COMPLETED").length },
            { icon: "\u274C",    label: "Cancelled",       value: bookings.filter(b => b.status === "CANCELLED").length },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: card, border: \`1px solid \${border}\`, borderRadius: "16px", padding: "20px 16px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
              <p style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: text }}>{value}</p>
              <p style={{ margin: 0, fontSize: "12px", color: sub, fontWeight: 600 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bookings */}
      <section style={{ maxWidth: "1100px", margin: "40px auto 0", padding: "0 32px 64px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: 0 }}>My Bookings</h2>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {(["upcoming", "past"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 20px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", background: tab === t ? "#FF385C" : dark ? "#333333" : "#f0f0f0", color: tab === t ? "#ffffff" : sub }}>
                {t === "upcoming" ? \`Upcoming (\${upcoming.length})\` : \`Past (\${past.length})\`}
              </button>
            ))}
            <button onClick={() => navigate("/listings")}
              style={{ padding: "8px 20px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", background: heroBg, color: "#ffffff" }}>
              + New booking
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px", color: sub }}>
            <p style={{ fontSize: "32px" }}>\u231B</p><p>Loading your bookings...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: card, borderRadius: "20px", border: \`1px solid \${border}\` }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>\u{1F3D6}\uFE0F</p>
            <h3 style={{ color: text, margin: "0 0 8px" }}>{tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}</h3>
            <p style={{ color: sub, margin: "0 0 24px" }}>{tab === "upcoming" ? "Ready for your next adventure?" : "Your completed stays will appear here"}</p>
            {tab === "upcoming" && (
              <button onClick={() => navigate("/listings")}
                style={{ background: "#FF385C", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Browse listings
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {displayed.map((booking) => {
              const statusStyle = STATUS_STYLE[booking.status] ?? STATUS_STYLE.CONFIRMED;
              const photo = booking.listing?.photos?.[0]?.url;
              const n = nights(booking.checkIn, booking.checkOut);
              const canCancel = booking.status === "CONFIRMED" && new Date(booking.checkIn) > new Date();
              return (
                <div key={booking.id} style={{ background: card, borderRadius: "18px", border: \`1px solid \${border}\`, overflow: "hidden", display: "flex", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ width: "160px", minHeight: "140px", flexShrink: 0, overflow: "hidden", background: dark ? "#333333" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photo
                      ? <img src={photo} alt={booking.listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "40px" }}>\u{1F3E0}</span>
                    }
                  </div>
                  <div style={{ flex: 1, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: text }}>{booking.listing.title}</h3>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: statusStyle.color, background: statusStyle.bg }}>{booking.status}</span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "13px", color: sub }}>\u{1F4CD} {booking.listing.location}</p>
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: sub }}>\u{1F4C5} {formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: sub }}>{n} night{n !== 1 ? "s" : ""} &middot; \${booking.listing.pricePerNight}/night</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 800, color: text }}>\${booking.totalPrice}</p>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => navigate(\`/listings/\${booking.listingId}\`)}
                          style={{ padding: "8px 16px", borderRadius: "8px", border: \`1.5px solid \${border}\`, background: card, color: sub, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                          View listing
                        </button>
                        {canCancel && (
                          <button onClick={() => handleCancel(booking.id)} disabled={cancelling === booking.id}
                            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: cancelling === booking.id ? "#f5f5f5" : "#fde8e8", color: cancelling === booking.id ? "#aaa" : "#d93025", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                            {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AIRecommendations />

      <footer style={{ background: "#0a0a0a", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>DIAVELA</p>
        <p style={{ margin: 0, color: "#555555", fontSize: "12px" }}>&copy; 2025 DIAVELA &middot; Every listing verified &middot; Every stay guaranteed.</p>
      </footer>
    </div>
  );
}
`;
fs.writeFileSync(file, content, "utf8");
console.log("Done!");
