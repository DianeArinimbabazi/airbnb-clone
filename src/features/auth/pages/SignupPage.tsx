import { useTheme } from "../../../shared/context/ThemeContext";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const { dark } = useTheme();
  const bg = dark ? "#1a1a1a" : "#f4f4f4";
  const card = dark ? "#2a2a2a" : "#ffffff";
  const text = dark ? "#f0f0f0" : "#222222";
  const sub = dark ? "#aaaaaa" : "#888888";
  const border = dark ? "#444444" : "#e0e0e0";
  const rightBg = dark ? "#111111" : "#f0f0f0";
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", username:"", phone:"", password:"", confirmPassword:"", role:"GUEST" as "GUEST"|"HOST" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/listings" replace />;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      await signup(form.name, form.email, form.username, form.phone, form.password, form.role);
      navigate("/listings");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", borderRadius:"8px", border:`1.5px solid ${border}`, fontSize:"14px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:card };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"13px", marginBottom:"6px", color:text };

  return (
    <div className="auth-split" style={{ background:bg }}>
      {/* Left - Form */}
      <div className="auth-form-panel" style={{ background:card, padding:"48px", display:"flex", flexDirection:"column", justifyContent:"center", overflowY:"auto" }}>
        <div style={{ marginBottom:"24px" }}>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:text, margin:"0 0 4px" }}>Welcome! Please</h1>
          <h2 style={{ fontSize:"28px", fontWeight:700, margin:"0 0 12px" }}>
            <em style={{ fontStyle:"italic", color:"#FF385C" }}>Sign up</em> to continue.
          </h2>
          <p style={{ fontSize:"13px", color:sub, margin:0, lineHeight:1.6 }}>Join our community of travelers and hosts across Rwanda.</p>
        </div>

        {error && <div style={{ background:"#fee2e2", color:"#dc2626", padding:"12px 16px", borderRadius:"8px", marginBottom:"16px", fontSize:"14px" }}>{error}</div>}

        {/* Role toggle */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"20px" }}>
          {(["GUEST","HOST"] as const).map(r => (
            <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role:r }))}
              style={{ padding:"12px", borderRadius:"8px", border:`2px solid ${form.role===r ? "#FF385C" : "#e0e0e0"}`, background:form.role===r ? "#fff0f3" : "#fff", color:form.role===r ? "#FF385C" : "#555", fontWeight:700, fontSize:"14px", cursor:"pointer", fontFamily:"inherit" }}>
              {r === "GUEST" ? "Join as Guest" : "Join as Host"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div><label style={lbl}>Full Name <span style={{ color:"#FF385C" }}>*</span></label><input value={form.name} onChange={set("name")} placeholder="Jane Doe" required style={inp} /></div>
            <div><label style={lbl}>Username <span style={{ color:"#FF385C" }}>*</span></label><input value={form.username} onChange={set("username")} placeholder="janedoe" required style={inp} /></div>
          </div>
          <div><label style={lbl}>Enter Email <span style={{ color:"#FF385C" }}>*</span></label><input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required style={inp} /></div>
          <div><label style={lbl}>Phone <span style={{ color:"#FF385C" }}>*</span></label><input value={form.phone} onChange={set("phone")} placeholder="+250 700 000 000" required style={inp} /></div>
          <div><label style={lbl}>Password <span style={{ color:"#FF385C" }}>*</span></label><input type="password" value={form.password} onChange={set("password")} placeholder="Min 8 characters" required minLength={8} style={inp} /></div>
          <div><label style={lbl}>Confirm Password <span style={{ color:"#FF385C" }}>*</span></label><input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required style={inp} /></div>
          <label style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", color:"#666", cursor:"pointer" }}>
            <input type="checkbox" required /> By signing up, you agree to the <span style={{ color:"#FF385C", textDecoration:"underline" }}>terms of service</span>
          </label>
          <button type="submit" disabled={loading}
            style={{ padding:"14px", background:loading ? "#ccc" : "#FF385C", color:"#fff", border:"none", borderRadius:"8px", fontWeight:700, fontSize:"15px", cursor:loading ? "not-allowed" : "pointer", fontFamily:"inherit", marginTop:"4px" }}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:"20px", fontSize:"14px", color:sub }}>
          Have an account? <Link to="/login" style={{ color:"#FF385C", fontWeight:600 }}>Sign in</Link>
        </p>
      </div>

      {/* Right - Illustration */}
      <div className="auth-right-panel" style={{ background:rightBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-80px", right:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"rgba(255,56,92,0.06)" }} />
        <div style={{ position:"absolute", bottom:"-60px", left:"-60px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(16,185,129,0.08)" }} />
        <div style={{ textAlign:"center", maxWidth:"360px", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"56px", fontWeight:800, color:"#FF385C", marginBottom:"16px", letterSpacing:"-1px" }}>DIAVELA</div>
          <h2 style={{ fontSize:"20px", fontWeight:700, color:text, marginBottom:"12px" }}>Trusted Travel Experiences</h2>
          <p style={{ fontSize:"14px", color:sub, marginBottom:"40px", lineHeight:1.7 }}>Your gateway to authentic stays, verified hosts, and unforgettable Rwanda experiences.</p>
          <div style={{ background:card, borderRadius:"20px", padding:"32px", boxShadow:"0 8px 40px rgba(0,0,0,0.08)", marginTop:"40px" }}>
            <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
              <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:"#FF385C" }} />
              <div style={{ flex:1, height:"12px", borderRadius:"6px", background:rightBg }} />
              <div style={{ width:"40px", height:"12px", borderRadius:"6px", background:rightBg }} />
            </div>
            <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", height:"80px" }}>
              {[40,65,45,80,55,70,50].map((h,i) => (
                <div key={i} style={{ flex:1, height:`${h}%`, borderRadius:"4px 4px 0 0", background:i===3 ? "#FF385C" : "#e8e8e8" }} />
              ))}
            </div>
            <div style={{ height:"2px", background:"#f0f0f0", marginTop:"8px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}




