import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import { config } from "../../../config/env";

export function ResetPasswordPage() {
  const { dark } = useTheme();
  const bg      = dark ? "#1a1a1a" : "#f4f4f4";
  const card    = dark ? "#2a2a2a" : "#ffffff";
  const text    = dark ? "#f0f0f0" : "#222222";
  const sub     = dark ? "#aaaaaa" : "#888888";
  const border  = dark ? "#444444" : "#e0e0e0";
  const rightBg = dark ? "#111111" : "#f0f0f0";

  const { token } = useParams<{ token: string }>();
  const navigate  = useNavigate();

  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [error, setError]                     = useState("");

  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", borderRadius:"8px", border:`1.5px solid ${border}`, fontSize:"14px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:card, color:text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"13px", marginBottom:"6px", color:text };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
          <h1 style={{ fontSize:"28px", fontWeight:700, color:text, margin:"0 0 4px" }}>Choose a new</h1>
          <h2 style={{ fontSize:"28px", fontWeight:700, margin:"0 0 12px" }}>
            <em style={{ fontStyle:"italic", color:"#FF385C" }}>password</em>
          </h2>
          <p style={{ fontSize:"13px", color:sub, margin:0, lineHeight:1.6 }}>
            Must be at least 8 characters long.
          </p>
        </div>

        {error && (
          <div style={{ background:"#fee2e2", color:"#dc2626", padding:"12px 16px", borderRadius:"8px", marginBottom:"16px", fontSize:"14px" }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background:"#dcfce7", color:"#16a34a", padding:"20px", borderRadius:"12px", fontSize:"14px", lineHeight:1.7 }}>
            <p style={{ margin:"0 0 8px", fontWeight:700, fontSize:"16px" }}>Password reset!</p>
            <p style={{ margin:0 }}>Your password has been changed successfully. Redirecting you to sign in...</p>
            <Link to="/login" style={{ display:"inline-block", marginTop:"16px", color:"#FF385C", fontWeight:600, textDecoration:"none" }}>
              Go to Sign In now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div>
              <label style={lbl}>New Password <span style={{ color:"#FF385C" }}>*</span></label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" required minLength={8} style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Confirm Password <span style={{ color:"#FF385C" }}>*</span></label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password" required style={inp}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ padding:"14px", background:loading ? "#ccc" : "#FF385C", color:"#fff", border:"none", borderRadius:"8px", fontWeight:700, fontSize:"15px", cursor:loading ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              {loading ? "Resetting..." : "Reset Password"}
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
          <h2 style={{ fontSize:"26px", fontWeight:700, color:text, marginBottom:"12px" }}>Secure your account</h2>
          <p style={{ fontSize:"14px", color:sub, lineHeight:1.7 }}>
            Choose a strong password you have not used before to keep your account safe.
          </p>
        </div>
      </div>
    </div>
  );
}



