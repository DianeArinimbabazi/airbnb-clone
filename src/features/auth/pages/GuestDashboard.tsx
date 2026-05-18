import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useMyBookings, type Booking } from "../../bookings/hooks/useMyBookings";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { FiHome, FiSearch, FiCalendar, FiStar, FiMessageSquare, FiUser, FiSettings, FiLogOut, FiHeart, FiMapPin, FiEye, FiX } from "react-icons/fi";

interface BookingWithReview extends Booking {
  review?: { id: string; rating: number; comment: string };
}

function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }


const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Awaiting Approval", color: "#854f0b", bg: "#faeeda" },
  CONFIRMED: { label: "Approved",          color: "#3b6d11", bg: "#eaf3de" },
  CANCELLED: { label: "Cancelled",         color: "#a32d2d", bg: "#fcebeb" },
  COMPLETED: { label: "Completed",         color: "#185fa5", bg: "#e6f1fb" },
};

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
          <FiStar size={22} color="#f59e0b" fill={(hovered || value) >= n ? "#f59e0b" : "none"} />
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ booking, onClose, card, text, sub, border, accent }: { booking: BookingWithReview; onClose: () => void; card: string; text: string; sub: string; border: string; accent: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const qc = useQueryClient();
  const submitReview = useMutation({
    mutationFn: () => api.post(`/listings/${booking.listingId}/reviews`, { bookingId: booking.id, listingId: booking.listingId, rating, comment }),
    onSuccess: () => { toast.success("Review submitted!"); qc.invalidateQueries({ queryKey: ["bookings"] }); onClose(); },
    onError: (e: any) => toast.error(e?.message || "Could not submit review"),
  });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: card, borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "460px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: sub }}><FiX size={18} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <FiStar size={18} color={accent} />
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: text }}>Leave a Review</h2>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: sub }}>{booking.listing.title}</p>
        <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: text }}>Your rating</p>
        <div style={{ marginBottom: "16px" }}><StarPicker value={rating} onChange={setRating} /></div>
        <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 600, color: text }}>Your experience</p>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell future guests about your stay..." rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${border}`, background: "transparent", color: text, fontSize: "13px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "16px" }} />
        <button onClick={() => submitReview.mutate()} disabled={submitReview.isPending || !comment.trim()} style={{ width: "100%", background: !comment.trim() ? "#ccc" : accent, color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 700, cursor: !comment.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {submitReview.isPending ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const { data: rawBookings = [], isLoading } = useMyBookings();
  const bookings = rawBookings as BookingWithReview[];
  const [reviewTarget, setReviewTarget] = useState<BookingWithReview | null>(null);
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("bookings");

  const card   = dark ? "#1a1a1a" : "#ffffff";
  const bg     = dark ? "#111111" : "#f7f7f5";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const accent = "#e8442a";

  const reviewable = bookings.filter(b => (b.status === "CONFIRMED" || b.status === "COMPLETED") && !b.review);
  const upcoming   = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date());
  const totalSpent = bookings.filter(b => b.status !== "CANCELLED").reduce((s, b) => s + b.totalPrice, 0);
  const filtered   = bookings.filter(b => b.listing?.title?.toLowerCase().includes(search.toLowerCase()));

  const navItems = [
    { id: "home",     icon: <FiHome size={15} />,        label: "Home",           action: () => navigate("/") },
    { id: "listings", icon: <FiMapPin size={15} />,      label: "Browse listings",action: () => navigate("/listings") },
    { id: "saved",    icon: <FiHeart size={15} />,       label: "Saved",          action: () => navigate("/listings") },
    { id: "messages", icon: <FiMessageSquare size={15} />,label: "Messages",      action: () => navigate("/profile") },
  ];
  const accountItems = [
    { id: "bookings", icon: <FiCalendar size={15} />, label: "My bookings",  action: () => setActiveNav("bookings") },
    { id: "reviews",  icon: <FiStar size={15} />,     label: "My reviews",   action: () => setActiveNav("bookings") },
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
      {reviewTarget && <ReviewModal booking={reviewTarget} onClose={() => setReviewTarget(null)} card={card} text={text} sub={sub} border={border} accent={accent} />}

      {/* Sidebar */}
      <div style={{ width: "220px", flexShrink: 0, background: card, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div onClick={() => navigate("/")} style={{ padding: "18px 20px 14px", fontSize: "20px", fontWeight: 800, borderBottom: `1px solid ${border}`, cursor: "pointer", color: text }}>
          DIA<span style={{ color: accent }}>VELA</span>
        </div>
        <div style={{ padding: "14px 0 4px" }}>
          <p style={{ fontSize: "10px", color: sub, padding: "0 20px 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>Main menu</p>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..." style={{ border: "none", background: "transparent", fontSize: "13px", color: text, outline: "none", width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: sub }}>
            {[{label:"Home",to:"/"},{label:"Listings",to:"/listings"},{label:"Profile",to:"/profile"}].map(({label,to}) => (
              <span key={label} onClick={() => navigate(to)} style={{ cursor: "pointer" }}>{label}</span>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase() ?? "G"}</div>
              <div><p style={{ fontSize: "12px", fontWeight: 600, color: text, margin: 0 }}>{user?.name ?? "Guest"}</p><p style={{ fontSize: "11px", color: sub, margin: 0 }}>{user?.email}</p></div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px", flex: 1 }}>
          {/* Banner */}
          <div style={{ background: `linear-gradient(135deg, #f97316, ${accent})`, borderRadius: "16px", padding: "24px 28px", color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back, {user?.name ?? "Guest"}!</h2>
              <p style={{ fontSize: "13px", opacity: .85, maxWidth: "320px", lineHeight: 1.5, margin: "0 0 14px" }}>Manage your bookings, leave reviews and discover new places to stay.</p>
              <button onClick={() => navigate("/listings")} style={{ background: "#fff", color: accent, border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Browse listings</button>
            </div>
            <FiMapPin size={64} style={{ opacity: .25 }} />
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Total Bookings",  value: bookings.length,              color: text },
              { label: "Upcoming",        value: upcoming.length,              color: text },
              { label: "Total Spent",     value: `$${totalSpent.toLocaleString()}`, color: text },
              { label: "Pending Reviews", value: reviewable.length,            color: reviewable.length > 0 ? accent : text },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", padding: "16px" }}>
                <p style={{ fontSize: "11px", color: sub, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Review banner */}
          {reviewable.length > 0 && (
            <div style={{ background: "#fffbeb", border: `1px solid #fde68a`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiStar size={18} color="#f59e0b" fill="#f59e0b" />
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "14px", color: "#92400e" }}>You have {reviewable.length} stay{reviewable.length > 1 ? "s" : ""} to review</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#b45309" }}>Share your experience to help other guests</p>
                </div>
              </div>
              <button onClick={() => setReviewTarget(reviewable[0])} style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Write a review</button>
            </div>
          )}

          {/* Bookings table */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: text, margin: 0 }}>My Bookings</p>
            <span onClick={() => navigate("/listings")} style={{ fontSize: "12px", color: accent, cursor: "pointer" }}>Browse more</span>
          </div>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: bg }}>
                  {["#","Listing","Dates","Amount","Status","Action"].map(h => (
                    <th key={h} style={{ fontSize: "11px", fontWeight: 600, color: sub, padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${border}`, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>Loading bookings...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>
                    {bookings.length === 0 ? "No bookings yet — find your next stay!" : "No results found"}
                  </td></tr>
                ) : filtered.map((b, i) => {
                  const s = STATUS[b.status] ?? STATUS.COMPLETED;
                  const canReview = (b.status === "CONFIRMED" || b.status === "COMPLETED") && !b.review;
                  return (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: text }}>{b.listing?.title}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: sub }}>{b.listing?.location}</p>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: sub }}>{fmt(b.checkIn)} → {fmt(b.checkOut)}</td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 600, color: text }}>${b.totalPrice}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {canReview && (
                            <button onClick={() => setReviewTarget(b)} style={{ background: "#fffbeb", color: "#92400e", border: `1px solid #fde68a`, borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}><FiStar size={11} /> Review</button>
                          )}
                          {b.review && (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#3b6d11", background: "#eaf3de", borderRadius: "6px", padding: "5px 10px" }}>★ {b.review.rating}/5</span>
                          )}
                          <button onClick={() => navigate(`/listings/${b.listingId}`)} style={{ background: bg, color: sub, border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 10px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}><FiEye size={11} /> View</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "10px 16px", fontSize: "12px", color: sub, borderTop: `1px solid ${border}` }}>
              Showing {filtered.length} of {bookings.length} bookings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


