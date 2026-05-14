const fs = require("fs");
const file = "src/features/auth/pages/ProfilePage.tsx";
let c = fs.readFileSync(file, "utf8");

// Add avatar upload section after the avatar display div
c = c.replace(
  `  const [name, setName]               = useState(user?.name ?? "");`,
  `  const [name, setName]               = useState(user?.name ?? "");
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
      const res = await fetch(\`http://localhost:3000/api/v1/users/\${user?.id}/avatar\`, {
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
  }`
);

// Replace avatar display with clickable upload
c = c.replace(
  `          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#064e3b", display: "flex", alignItems: "center", justifyContent: "center", color: "#6ee7b7", fontWeight: 800, fontSize: "28px", flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>`,
  `          <div style={{ position: "relative", flexShrink: 0 }}>
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
          </div>`
);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed:", c.includes("handleAvatarChange"));
