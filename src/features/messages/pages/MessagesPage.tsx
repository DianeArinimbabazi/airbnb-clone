import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import { FiMessageSquare, FiArrowLeft } from "react-icons/fi";

export default function MessagesPage() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const bg     = dark ? "#111111" : "#f7f7f5";
  const card   = dark ? "#1a1a1a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const accent = "#e8442a";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, Segoe UI, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: card, border: `1px solid ${border}`, borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: text }}
          >
            <FiArrowLeft size={16} />
          </button>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: text }}>Messages</h1>
        </div>

        {/* Empty state */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "80px 40px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: dark ? "#2a1008" : "#fff1ef", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <FiMessageSquare size={28} color={accent} />
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: text }}>No messages yet</p>
          <p style={{ margin: "0 0 28px", fontSize: "14px", color: sub, maxWidth: "340px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            When hosts message you about your bookings, conversations will appear here.
          </p>
          <button
            onClick={() => navigate("/listings")}
            style={{ background: accent, color: "#fff", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Browse listings
          </button>
        </div>

      </div>
    </div>
  );
}
