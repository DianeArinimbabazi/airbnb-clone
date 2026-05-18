import { useTheme } from "../../../shared/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { FiUsers, FiHome, FiCalendar, FiCheck, FiX, FiClock, FiStar, FiShield } from "react-icons/fi";

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  createdAt: string;
  guest: { id: string; name: string; email: string };
  listing: { id: string; title: string; location: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  guest: { name: string };
  listing: { title: string };
}

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:   { color: "#92400e", bg: "#fffbeb", border: "#fde68a", label: "Pending" },
  CONFIRMED: { color: "#166534", bg: "#f0fdf4", border: "#d1fae5", label: "Approved" },
  CANCELLED: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", label: "Rejected" },
  COMPLETED: { color: "#374151", bg: "#f9fafb", border: "#e5e7eb", label: "Completed" },
};

function BookingRow({ b, card, border, text, sub, onApprove, onReject, approving, rejecting, showActions }: {
  b: Booking; card: string; border: string; text: string; sub: string;
  onApprove: () => void; onReject: () => void;
  approving: boolean; rejecting: boolean; showActions: boolean;
}) {
  const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.COMPLETED;
  return (
    <div style={{ background: card, borderRadius: "16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", flexWrap: "wrap" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, fontSize: "14px", flexShrink: 0 }}>
        {b.guest?.name?.[0]?.toUpperCase() ?? "G"}
      </div>
      <div style={{ flex: 1, minWidth: "150px" }}>
        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "14px", color: text }}>{b.guest?.name ?? "Guest"}</p>
        <p style={{ margin: "0 0 2px", fontSize: "12px", color: sub }}>{b.listing?.title}</p>
        <p style={{ margin: 0, fontSize: "11px", color: "#aaaaaa" }}>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
      </div>
      <p style={{ fontWeight: 800, fontSize: "15px", color: text, margin: 0 }}>${b.totalPrice}</p>
      <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
      {showActions && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onApprove} disabled={approving} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#f0fdf4", border: "1.5px solid #d1fae5", borderRadius: "50px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, color: "#166534", cursor: approving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <FiCheck size={13} /> Approve
          </button>
          <button onClick={onReject} disabled={rejecting} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "50px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, color: "#991b1b", cursor: rejecting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <FiX size={13} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const qc = useQueryClient();
  const bg = dark ? "#0f0f0f" : "#f5f5f5";
  const card = dark ? "#1a1a1a" : "#ffffff";
  const text = dark ? "#f0f0f0" : "#111111";
  const sub = dark ? "#888888" : "#666666";
  const border = dark ? "#2a2a2a" : "#ebebeb";

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["admin", "bookings"],
    queryFn: () => api.get<Booking[]>("/bookings/all"),
  });
  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<Stats>("/admin/stats"),
  });
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["admin", "reviews"],
    queryFn: () => api.get<Review[]>("/reviews/all?limit=6"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/status`, { status: "CONFIRMED" }),
    onSuccess: () => { toast.success("Booking approved ✓"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); qc.invalidateQueries({ queryKey: ["admin", "stats"] }); },
    onError: (e: any) => toast.error(e?.message || "Could not approve"),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/status`, { status: "CANCELLED" }),
    onSuccess: () => { toast.success("Booking rejected"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); qc.invalidateQueries({ queryKey: ["admin", "stats"] }); },
    onError: (e: any) => toast.error(e?.message || "Could not reject"),
  });

  const handleLogout = () => { logout(); navigate("/"); };
  const pending = bookings.filter(b => b.status === "PENDING");

  const statCards = [
    { label: "Total Users",    value: stats?.totalUsers    ?? "—", icon: <FiUsers size={18} /> },
    { label: "Listings",       value: stats?.totalListings ?? "—", icon: <FiHome  size={18} /> },
    { label: "Total Bookings", value: stats?.totalBookings ?? "—", icon: <FiCalendar size={18} /> },
    { label: "Pending",        value: stats?.pendingBookings ?? pending.length, icon: <FiClock size={18} />, highlight: true },
    { label: "Revenue",        value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <FiStar size={18} /> },
  ];

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", background: bg, minHeight: "100vh" }}>
      <section style={{ background: dark ? "#0a0a0a" : "#111111", padding: "48px 32px 64px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <FiShield size={18} color="#FF385C" />
              <p style={{ margin: 0, color: "#aaaaaa", fontSize: "14px", fontWeight: 600 }}>Admin dashboard</p>
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>Welcome, {user?.name ?? "Admin"}</h1>
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "15px" }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/admin/moderation")} style={{ background: "#FF385C", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Moderation Queue</button>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1.5px solid #444444", borderRadius: "50px", padding: "12px 24px", color: "#ffffff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>Log out</button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "-28px auto 0", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" }}>
          {statCards.map(({ label, value, icon, highlight }) => (
            <div key={label} style={{ background: highlight ? (dark ? "#2a1a00" : "#fffbeb") : card, borderRadius: "16px", padding: "22px 20px", border: `1px solid ${highlight ? "#fde68a" : border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: highlight ? "#92400e" : sub }}>{icon}<p style={{ margin: 0, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p></div>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: highlight ? "#92400e" : text }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1200px", margin: "48px auto 0", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: 0 }}>Pending Approvals</h2>
          {pending.length > 0 && <span style={{ background: "#FF385C", color: "#fff", borderRadius: "999px", padding: "2px 10px", fontSize: "12px", fontWeight: 800 }}>{pending.length}</span>}
        </div>
        {loadingBookings ? <div style={{ textAlign: "center", padding: "40px", color: sub }}>Loading...</div>
          : pending.length === 0 ? <div style={{ textAlign: "center", padding: "40px", background: card, borderRadius: "20px", border: `1px solid ${border}`, color: sub }}>No pending bookings — all caught up!</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pending.map(b => <BookingRow key={b.id} b={b} card={card} border={border} text={text} sub={sub} onApprove={() => approveMutation.mutate(b.id)} onReject={() => rejectMutation.mutate(b.id)} approving={approveMutation.isPending} rejecting={rejectMutation.isPending} showActions />)}
            </div>}
      </section>

      <section style={{ maxWidth: "1200px", margin: "48px auto 0", padding: "0 32px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: "0 0 20px" }}>All Bookings</h2>
        {loadingBookings ? <div style={{ textAlign: "center", padding: "40px", color: sub }}>Loading...</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bookings.slice(0, 20).map(b => <BookingRow key={b.id} b={b} card={card} border={border} text={text} sub={sub} onApprove={() => approveMutation.mutate(b.id)} onReject={() => rejectMutation.mutate(b.id)} approving={approveMutation.isPending} rejecting={rejectMutation.isPending} showActions={b.status === "PENDING"} />)}
            </div>}
      </section>

      <section style={{ maxWidth: "1200px", margin: "48px auto 0", padding: "0 32px 64px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: "0 0 20px" }}>Recent Guest Reviews</h2>
        {reviews.length === 0
          ? <div style={{ textAlign: "center", padding: "40px", background: card, borderRadius: "20px", border: `1px solid ${border}`, color: sub }}>No reviews yet</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "14px" }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: card, borderRadius: "16px", border: `1px solid ${border}`, padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div><p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "14px", color: text }}>{r.guest?.name ?? "Guest"}</p><p style={{ margin: 0, fontSize: "12px", color: sub }}>{r.listing?.title}</p></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "999px", padding: "3px 10px" }}>
                      <FiStar size={11} color="#92400e" fill="#f59e0b" /><span style={{ fontSize: "12px", fontWeight: 800, color: "#92400e" }}>{r.rating}</span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: sub, lineHeight: 1.6, fontStyle: "italic" }}>"{r.comment}"</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#aaaaaa" }}>{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>}
      </section>

      <footer style={{ background: "#0a0a0a", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>DIAVELA</p>
        <p style={{ margin: 0, color: "#555555", fontSize: "12px" }}>2025 DIAVELA · Admin Panel</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;
