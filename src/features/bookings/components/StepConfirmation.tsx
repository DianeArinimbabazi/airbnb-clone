import type { BookingFormData } from "../schemas/booking";
import { useTheme } from "../../../shared/context/ThemeContext";
import dayjs from "dayjs";

interface Props {
  data: BookingFormData;
  listingTitle: string;
  pricePerNight: number;
  isPending: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function StepConfirmation({ data, listingTitle, pricePerNight, isPending, onConfirm, onBack }: Props) {
  const { dark } = useTheme();
  const card   = dark ? "#2a2a2a" : "#f9f9f9";
  const card2  = dark ? "#1e293b" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#222222";
  const sub    = dark ? "#aaaaaa" : "#717171";
  const border = dark ? "#444444" : "#f0f0f0";

  const nights   = Math.max(1, dayjs(data.checkOut).diff(dayjs(data.checkIn), "day"));
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const total    = subtotal + serviceFee;

  const row = (label: string, value: string) => (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}` }}>
      <span style={{ fontSize:"14px", color: sub }}>{label}</span>
      <span style={{ fontSize:"14px", fontWeight:600, color: text }}>{value}</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div style={{ background: card, borderRadius:"16px", padding:"24px", border:`1px solid ${border}` }}>
        <h3 style={{ fontSize:"16px", fontWeight:700, color: text, margin:"0 0 16px" }}>Booking Summary</h3>
        {row("Listing", listingTitle)}
        {row("Check-in", dayjs(data.checkIn).format("MMM D, YYYY"))}
        {row("Check-out", dayjs(data.checkOut).format("MMM D, YYYY"))}
        {row("Nights", String(nights))}
        {row("Guests", String(data.guests))}
        {row("Guest name", data.name)}
        {row("Email", data.email)}
        {row("Phone", data.phone)}
      </div>

      <div style={{ background: card2, borderRadius:"16px", padding:"24px", border:`1px solid ${border}` }}>
        <h3 style={{ fontSize:"16px", fontWeight:700, color: text, margin:"0 0 16px" }}>Price Breakdown</h3>
        {row(`$${pricePerNight} x ${nights} night${nights>1?"s":""}`, `$${subtotal.toLocaleString()}`)}
        {row("Service fee (12%)", `$${serviceFee.toLocaleString()}`)}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", marginTop:"4px" }}>
          <span style={{ fontSize:"16px", fontWeight:700, color: text }}>Total</span>
          <span style={{ fontSize:"16px", fontWeight:800, color: text }}>${total.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ background: dark ? "#422006" : "#fff3cd", borderRadius:"12px", padding:"16px", border:`1px solid ${dark ? "#92400e" : "#ffc107"}` }}>
        <p style={{ margin:0, fontSize:"13px", color: dark ? "#fcd34d" : "#856404" }}>
          Payment: card ending in {data.card.slice(-4)} &nbsp;&bull;&nbsp; Expires {data.expiry}
        </p>
      </div>

      <div style={{ display:"flex", gap:"12px" }}>
        <button onClick={onBack}
          style={{ flex:1, padding:"14px", background: card2, border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", color: sub }}>
          &larr; Back
        </button>
        <button onClick={onConfirm} disabled={isPending}
          style={{ flex:2, padding:"14px", background: isPending ? "#ccc" : "#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor: isPending ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          {isPending ? "Confirming..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
