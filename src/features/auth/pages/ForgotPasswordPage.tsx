import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import { config } from "../../../config/env";

export function ForgotPasswordPage() {
  const { dark } = useTheme();
  const bg      = dark ? "#1a1a1a" : "#f4f4f4";
  const card    = dark ? "#2a2a2a" : "#ffffff";
  const text    = dark ? "#f0f0f0" : "#222222";
  const sub     = dark ? "#aaaaaa" : "#888888";
  const border  = dark ? "#444444" : "#e0e0e0";
  const rightBg = dark ? "#111111" : "#f0f0f0";

  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", borderRadius:"8px", border:`1.5px solid ${border}`, fontSize:"14px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:card, color:text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"13px", marginBottom:"6px", color:text };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:bg }}>
      {/* Left - Form */}
      <div style={{ flex:"0 0 480px", background:card, padding:"48px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ marginBottom:"32px" }}>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:text, margin:"0 0 4px" }}>Forgot your</h1>
          <h2 style={{ fontSize:"28px", fontWeight:700, margin:"0 0 12px" }}>
            <em style={{ fontStyle:"italic", color:"#FF385C" }}>password?</em>
          </h2>
          <p style={{ fontSize:"13px", color:sub, margin:0, lineHeight:1.6 }}>
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {error && (
          <div style={{ background: dark ? "#3b1111" : "#fee2e2", color: dark ? "#fca5a5" : "#dc2626", padding:"12px 16px", borderRadius:"8px", marginBottom:"16px", fontSize:"14px" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background: dark ? "#064e3b" : "#dcfce7", color: dark ? "#6ee7b7" : "#16a34a", padding:"20px", borderRadius:"12px", fontSize:"14px", lineHeight:1.7 }}>
            <p style={{ margin:"0 0 8px", fontWeight:700, fontSize:"16px" }}>Check your inbox!</p>
            <p style={{ margin:0 }}>
              If <strong>{email}</strong> is registered, a password reset link has been sent. Check your email and follow the instructions.
            </p>
            <Link to="/login" style={{ display:"inline-block", marginTop:"16px", color:"#FF385C", fontWeight:600, textDecoration:"none" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div>
              <label style={lbl}>Email address <span style={{ color:"#FF385C" }}>*</span></label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inp}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ padding:"14px", background:loading ? (dark ? "#555" : "#ccc") : "#FF385C", color:"#fff", border:"none", borderRadius:"8px", fontWeight:700, fontSize:"15px", cursor:loading ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p style={{ textAlign:"center", fontSize:"14px", color:sub, margin:0 }}>
              Remember it? <Link to="/login" style={{ color:"#FF385C", fontWeight:600 }}>Sign in</Link>
            </p>
          </form>
        )}
      </div>

      {/* Right - Illustration */}
      <div style={{ flex:1, background:rightBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-80px", right:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"rgba(255,56,92,0.06)" }} />
        <div style={{ position:"absolute", bottom:"-60px", left:"-60px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(16,185,129,0.08)" }} />
        <div style={{ textAlign:"center", maxWidth:"360px", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"80px", marginBottom:"24px" }}></div>
          <h2 style={{ fontSize:"26px", fontWeight:700, color:text, marginBottom:"12px" }}>No worries, it happens!</h2>
          <p style={{ fontSize:"14px", color:sub, lineHeight:1.7 }}>
            We will send a secure link to your email so you can choose a new password and get back to your account quickly.
          </p>
        </div>
      </div>
    </div>
  );
}



