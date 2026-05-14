import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { datesSchema, type DatesData } from "../schemas/booking";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props { defaultValues?: Partial<DatesData>; onNext:(d:DatesData)=>void; }

export function StepDates({ defaultValues, onNext }: Props) {
  const { dark } = useTheme();
  const card   = dark ? "#2a2a2a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#222222";
  const border = dark ? "#444444" : "#dddddd";
  const err: React.CSSProperties = { color:"#e53e3e", fontSize:"13px", marginTop:"4px" };
  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background: card, color: text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, marginBottom:"6px", fontSize:"14px", color: text };

  const { register, handleSubmit, formState:{errors} } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
    defaultValues: defaultValues ?? { guests:1 },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div>
        <label style={lbl}>Check-in *</label>
        <input type="date" {...register("checkIn")} style={inp} />
        {errors.checkIn && <p style={err}>{errors.checkIn.message}</p>}
      </div>
      <div>
        <label style={lbl}>Check-out *</label>
        <input type="date" {...register("checkOut")} style={inp} />
        {errors.checkOut && <p style={err}>{errors.checkOut.message}</p>}
      </div>
      <div>
        <label style={lbl}>Guests *</label>
        <input type="number" min={1} max={16} {...register("guests",{valueAsNumber:true})} style={inp} />
        {errors.guests && <p style={err}>{errors.guests.message}</p>}
      </div>
      <button type="submit"
        style={{ background:"#9b8ec4", color:"#fff", border:"none", borderRadius:"10px", padding:"14px", fontSize:"16px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        Continue &rarr;
      </button>
    </form>
  );
}
