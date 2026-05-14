import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalSchema, type PersonalData } from "../schemas/booking";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props { defaultValues?: Partial<PersonalData>; onNext:(d:PersonalData)=>void; onBack:()=>void; }

export function StepPersonal({ defaultValues, onNext, onBack }: Props) {
  const { dark } = useTheme();
  const card   = dark ? "#2a2a2a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#222222";
  const sub    = dark ? "#aaaaaa" : "#555555";
  const border = dark ? "#444444" : "#dddddd";
  const err: React.CSSProperties = { color:"#e53e3e", fontSize:"13px", marginTop:"4px" };
  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background: card, color: text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, marginBottom:"6px", fontSize:"14px", color: text };

  const { register, handleSubmit, setError, formState:{errors} } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues,
  });
  const [preview, setPreview] = useState<string|null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { setError("root", { message:"Photo must be under 5MB" }); return; }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit(onNext)} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div>
        <label style={lbl}>Full name *</label>
        <input {...register("name")} placeholder="Jane Doe" style={inp} />
        {errors.name && <p style={err}>{errors.name.message}</p>}
      </div>
      <div>
        <label style={lbl}>Email *</label>
        <input type="email" {...register("email")} placeholder="you@example.com" style={inp} />
        {errors.email && <p style={err}>{errors.email.message}</p>}
      </div>
      <div>
        <label style={lbl}>Phone *</label>
        <input {...register("phone")} placeholder="+250 700 000 000" style={inp} />
        {errors.phone && <p style={err}>{errors.phone.message}</p>}
      </div>
      <div>
        <label style={lbl}>Profile photo (optional, max 5MB)</label>
        <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontFamily:"inherit", fontSize:"14px", color: text }} />
        {errors.root && <p style={err}>{errors.root.message}</p>}
        {preview && <img src={preview} alt="Preview" style={{ marginTop:"12px", width:"80px", height:"80px", borderRadius:"50%", objectFit:"cover", border:"3px solid #10B981" }} />}
      </div>
      <div style={{ display:"flex", gap:"12px" }}>
        <button type="button" onClick={onBack}
          style={{ flex:1, background: card, color: sub, border:`1.5px solid ${border}`, borderRadius:"10px", padding:"14px", fontSize:"15px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          &larr; Back
        </button>
        <button type="submit"
          style={{ flex:2, background:"#10B981", color:"#fff", border:"none", borderRadius:"10px", padding:"14px", fontSize:"16px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          Continue &rarr;
        </button>
      </div>
    </form>
  );
}
