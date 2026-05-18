import { useTheme } from "../../../shared/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useMyBookings, Booking } from "../../bookings/hooks/useMyBookings";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { FiCalendar, FiHome, FiStar, FiMessageSquare, FiX } from "react-icons/fi";

interface BookingWithReview extends Booking {
  review?: { id: string; rating: number; comment: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING:   { color: "#92400e", bg: "#fffbeb", border: "#fde68a", label: "Awaiting Approval" },
  CONFIRMED: { color: "#166534", bg: "#f0fdf4", border: "#d1fae5", label: "Approved" },
  CANCELLED: { color: "#991b1b", bg: "#fef2f2", border: "#fecaca", label: "Cancelled" },
  COMPLETED: { color: "#374151", bg: "#f9fafb", border: "#e5e7eb", label: "Completed" },
};

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
          <FiStar size={24} color="#f59e0b" fill={(hovered || value) >= n ? "#f59e0b" : "none"} />
        </button>
      ))}
    </div>
  );
}

function ReviewModal({ booking, onClose, card, text, sub, border }: { booking: BookingWithReview; onClose: () => void; card: string; text: string; sub: string; border: string; }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const qc = useQueryClient();
  const submitReview = useMutation({
    mutationFn: () => api.post(`/reviews`, { bookingId: booking.id, listingId: booking.listingId, rating, comment }),
    onSuccess: () => { toast.success("Review submitted! Thank you."); qc.invalidateQueries({ queryKey: ["bookings"] }); onClose(); },
    onError: (e: any) => toast.error(e?.message || "Could not submit review"),
  });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: card, borderRadius: "24px", padding: "36px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", color: sub }}><FiX size={20} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <FiMessageSquare size={18} color="#FF385C" />
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: text }}>Leave a Review</h2>
        </div>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: sub }}>{booking.listing.title}</p>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: text }}>Your rating</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <div style={{ marginBottom: "24px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: text }}>Your experience</p>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell future guests about your stay..." rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${border}`, background: "transparent", color: text, fontSize: "14px", fontFamily: "Outfit, Segoe UI, sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => submitReview.mutate()} disabled={submitReview.isPending || !comment.trim()} style={{ width: "100%", background: submitReview.isPending || !comment.trim() ? "#ccc" : "#111111", color: "#ffffff", border: "none", borderRadius: "50px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: submitReview.isPending || !comment.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
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

  const bg = dark ? "#0f0f0f" : "#f5f5f5";
  const card = dark ? "#1a1a1a" : "#ffffff";
  const text = dark ? "#f0f0f0" : "#111111";
  const sub = dark ? "#888888" : "#666666";
  const border = dark ? "#2a2a2a" : "#ebebeb";

  const handleLogout = () => { logout(); navigate("/"); };
  const reviewable = bookings.filter(b => (b.status === "CONFIRMED" || b.status === "COMPLETED") && !b.review);
  const upcoming = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.checkIn) >= new Date());
  const totalSpent = bookings.filter(b => b.status !== "CANCELLED").reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = [
    { label: "Total Bookings",  value: bookings.length,   icon: <FiCalendar size={16} /> },
    { label: "Upcoming",        value: upcoming.length,   icon: <FiHome size={16} /> },
    { label: "Total Spent",     value: `$${totalSpent.toLocaleString()}`, icon: <FiStar size={16} /> },
    { label: "Pending Reviews", value: reviewable.length, icon: <FiMessageSquare size={16} />, highlight: reviewable.length > 0 },
  ];

  return (
    <div style={{ fontFamily: "Outfit, Segoe UI, sans-serif", background: bg, minHeight: "100vh" }}>
      {reviewTarget && <ReviewModal booking={reviewTarget} onClose={() => setReviewTarget(null)} card={card} text={text} sub={sub} border={border} />}

      <section style={{ background: dark ? "#0a0a0a" : "#111111", padding: "48px 32px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ margin: "0 0 6px", color: "#aaaaaa", fontSize: "14px", fontWeight: 600 }}>Guest dashboard</p>
            <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>Welcome, {user?.name ?? "Guest"}</h1>
            <p style={{ margin: 0, color: "#aaaaaa", fontSize: "15px" }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/listings")} style={{ background: "#FF385C", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Browse listings</button>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1.5px solid #444444", borderRadius: "50px", padding: "12px 24px", color: "#ffffff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>Log out</button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1100px", margin: "-28px auto 0", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" }}>
          {stats.map(({ label, value, icon, highlight }) => (
            <div key={label} style={{ background: highlight ? (dark ? "#1a1200" : "#fffbeb") : card, borderRadius: "16px", padding: "22px 20px", border: `1px solid ${highlight ? "#fde68a" : border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", color: highlight ? "#92400e" : sub }}>{icon}<p style={{ margin: 0, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p></div>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: highlight ? "#92400e" : text }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {reviewable.length > 0 && (
        <section style={{ maxWidth: "1100px", margin: "32px auto 0", padding: "0 32px" }}>
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FiStar size={20} color="#f59e0b" fill="#f59e0b" />
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: "15px", color: "#92400e" }}>You have {reviewable.length} stay{reviewable.length > 1 ? "s" : ""} to review</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#b45309" }}>Share your experience to help other guests</p>
              </div>
            </div>
            <button onClick={() => setReviewTarget(reviewable[0])} style={{ background: "#f59e0b", color: "#ffffff", border: "none", borderRadius: "50px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Write a review</button>
          </div>
        </section>
      )}

      <section style={{ maxWidth: "1100px", margin: "40px auto 0", padding: "0 32px 64px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: text, margin: "0 0 20px" }}>My Bookings</h2>
        {isLoading ? <div style={{ textAlign: "center", padding: "40px", color: sub }}>Loading bookings...</div>
          : bookings.length === 0
            ? <div style={{ textAlign: "center", padding: "60px", background: card, borderRadius: "20px", border: `1px solid ${border}` }}>
                <p style={{ color: sub, margin: "0 0 20px" }}>No bookings yet — find your next stay!</p>
                <button onClick={() => navigate("/listings")} style={{ background: "#111111", color: "#ffffff", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Browse listings</button>
              </div>
            : <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {bookings.map((b) => {
                  const s = STATUS_STYLE[b.status] ?? STATUS_STYLE.COMPLETED;
                  const canReview = (b.status === "CONFIRMED" || b.status === "COMPLETED") && !b.review;
                  return (
                    <div key={b.id} style={{ background: card, borderRadius: "18px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "16px", padding: "18px 22px", flexWrap: "wrap" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", flexShrink: 0 }}><FiHome size={18} /></div>
                      <div style={{ flex: 1, minWidth: "150px" }}>
                        <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "15px", color: text }}>{b.listing?.title}</p>
                        <p style={{ margin: "0 0 2px", fontSize: "12px", color: sub }}>{b.listing?.location}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#aaaaaa" }}>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: "16px", color: text, margin: 0 }}>${b.totalPrice}</p>
                      <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                      {b.review && <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: "#166534", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "999px", padding: "4px 12px" }}><FiStar size={11} fill="#16a34a" color="#16a34a" />Reviewed ({b.review.rating}/5)</span>}
                      {canReview && <button onClick={() => setReviewTarget(b)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "50px", padding: "7px 14px", fontSize: "12px", fontWeight: 700, color: "#92400e", cursor: "pointer", fontFamily: "inherit" }}><FiStar size={12} /> Leave review</button>}
                      <button onClick={() => navigate(`/listings/${b.listingId}`)} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: "50px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, color: "#555555", cursor: "pointer", fontFamily: "inherit" }}>View listing</button>
                    </div>
                  );
                })}
              </div>}
      </section>

      <footer style={{ background: "#0a0a0a", padding: "32px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>DIAVELA</p>
        <p style={{ margin: 0, color: "#555555", fontSize: "12px" }}>2025 DIAVELA · Every listing verified · Every stay guaranteed.</p>
      </footer>
    </div>
  );
}
