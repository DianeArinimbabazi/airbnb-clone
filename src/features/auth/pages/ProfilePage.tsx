import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const bg     = dark ? "#111111" : "#f9fafb";
  const card   = dark ? "#1e1e1e" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#aaaaaa" : "#717171";
  const border = dark ? "#2a2a2a" : "#e5e7eb";
  const inp    = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid " + border, fontSize: "14px", fontFamily: "inherit", background: card, color: text, outline: "none", boxSizing: "border-box" as const };

  const [name, setName]               = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl]     = useState(user?.avatar ?? "");
  const [uploading, setUploading]     = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`http://localhost:3000/api/v1/users/${user?.id}/avatar`, {
        method: "POST",
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.avatar);
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew]         = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const updateProfile = useMutation({
    mutationFn: () => api.put("/users/" + user?.id, { name }),
    onSuccess: () => toast.success("Profile updated!"),
    onError: () => toast.error("Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: () => api.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => { toast.success("Password changed!"); setCurrent(""); setNew(""); setConfirm(""); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "Failed to change password"),
  });

  function handlePasswordSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error("Fill all password fields");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    changePassword.mutate();
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, Segoe UI, sans-serif", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: sub, fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: "24px", padding: 0 }}>
          &larr; Back
        </button>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: text, margin: "0 0 8px" }}>My Profile</h1>
        <p style={{ color: sub, margin: "0 0 32px", fontSize: "14px" }}>{user?.email} &middot; {user?.role}</p>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", background: card, borderRadius: "16px", padding: "24px", border: "1px solid " + border }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#064e3b", display: "flex", alignItems: "center", justifyContent: "center", color: "#6ee7b7", fontWeight: 800, fontSize: "28px", overflow: "hidden" }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U")
              }
            </div>
            <label style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid white" }}>
              <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>+</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
            {uploading && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: "10px" }}>...</span></div>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "18px", color: text }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: "13px", color: sub }}>{user?.email}</p>
          </div>
        </div>

        {/* Update name */}
        <div style={{ background: card, borderRadius: "16px", padding: "24px", border: "1px solid " + border, marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: text, margin: "0 0 20px" }}>Personal information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Email</label>
              <input value={user?.email ?? ""} disabled style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Role</label>
              <input value={user?.role ?? ""} disabled style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} />
            </div>
            <button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending || !name.trim()}
              style={{ padding: "12px", background: "#10B981", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div style={{ background: card, borderRadius: "16px", padding: "24px", border: "1px solid " + border, marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: text, margin: "0 0 20px" }}>Change password</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Current password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrent(e.target.value)} style={inp} placeholder="Enter current password" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>New password</label>
              <input type="password" value={newPassword} onChange={e => setNew(e.target.value)} style={inp} placeholder="Enter new password" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: sub, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirm(e.target.value)} style={inp} placeholder="Confirm new password" />
            </div>
            <button onClick={handlePasswordSubmit} disabled={changePassword.isPending}
              style={{ padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
              {changePassword.isPending ? "Changing..." : "Change password"}
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={() => { logout(); navigate("/"); }}
          style={{ width: "100%", padding: "14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
