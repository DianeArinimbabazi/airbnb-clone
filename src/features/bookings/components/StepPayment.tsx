import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentData } from "../schemas/booking";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props { defaultValues?: Partial<PaymentData>; isPending?: boolean; onSubmit:(d:PaymentData)=>void; onBack:()=>void; }

export function StepPayment({ defaultValues, isPending, onSubmit, onBack }: Props) {
  const { dark } = useTheme();
  const card   = dark ? "#2a2a2a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#222222";
  const sub    = dark ? "#aaaaaa" : "#555555";
  const border = dark ? "#444444" : "#dddddd";
  const err: React.CSSProperties = { color:"#e53e3e", fontSize:"13px", marginTop:"4px" };
  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background: card, color: text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"14px", color: text, marginBottom:"6px" };

  const { register, handleSubmit, formState:{errors} } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div>
        <label style={lbl}>Card Number *</label>
        <input {...register("card")} placeholder="1234 5678 9012 3456" maxLength={16} style={inp} />
        {errors.card && <p style={err}>{errors.card.message}</p>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
        <div>
          <label style={lbl}>Expiry Date *</label>
          <input {...register("expiry")} placeholder="MM/YY" maxLength={5} style={inp} />
          {errors.expiry && <p style={err}>{errors.expiry.message}</p>}
        </div>
        <div>
          <label style={lbl}>CVV *</label>
          <input {...register("cvv")} placeholder="123" maxLength={3} type="password" style={inp} />
          {errors.cvv && <p style={err}>{errors.cvv.message}</p>}
        </div>
      </div>
      <div style={{ background: dark ? "#064e3b" : "#f0fdf4", border:`1px solid ${dark ? "#065f46" : "#d1fae5"}`, borderRadius:"10px", padding:"14px" }}>
        <p style={{ margin:0, fontSize:"13px", color: dark ? "#6ee7b7" : "#059669" }}>
          This is a mock payment form. No real charges will be made.
        </p>
      </div>
      <div style={{ display:"flex", gap:"12px" }}>
        <button type="button" onClick={onBack}
          style={{ flex:1, padding:"14px", borderRadius:"10px", border:`1.5px solid ${border}`, background: card, fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", color: sub }}>
          &larr; Back
        </button>
        <button type="submit" disabled={isPending}
          style={{ flex:2, padding:"14px", borderRadius:"10px", border:"none", background: isPending ? "#ccc" : "#10B981", color:"#fff", fontSize:"15px", fontWeight:700, cursor: isPending ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          {isPending ? "Processing..." : "Review Booking &rarr;"}
        </button>
      </div>
    </form>
  );
}
export default StepPayment;
