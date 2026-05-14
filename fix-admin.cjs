const fs = require("fs");
const file = "src/features/auth/pages/AdminDashboard.tsx";
const content = `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useTheme } from "../../../shared/context/ThemeContext";
import toast from "react-hot-toast";

const TABS = ["Overview", "Users", "Listings", "Bookings"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  HOST:      { bg: "#f0fdf4", color: "#16a34a" },
  GUEST:     { bg: "#eff6ff", color: "#2563eb" },
  ADMIN:     { bg: "#fef3c7", color: "#d97706" },
  CONFIRMED: { bg: "#f0fdf4", color: "#16a34a" },
  CANCELLED: { bg: "#fef2f2", color: "#dc2626" },
  COMPLETED: { bg: "#f9fafb", color: "#6b7280" },
};

function Badge({ label }: { label: string }) {
  const s = STATUS_COLORS[label] ?? { bg: "#f9fafb", color: "#888" };
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { dark } = useTheme();
  const [tab, setTab] = useState("Overview");
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});

  const bg     = dark ? "#111111" : "#f9fafb";
  const card   = dark ? "#1e1e1e" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#aaaaaa" : "#717171";
  const border = dark ? "#2a2a2a" : "#e5e7eb";
  const rowHover = dark ? "#2a2a2a" : "#f9fafb";

  const { data: usersData }    = useQuery({ queryKey: ["admin", "users"],    queryFn: () => api.get<{ data: any[] }>("/users?limit=200") });
  const { data: listingsData } = useQuery({ queryKey: ["admin", "listings"], queryFn: () => api.get<{ data: any[] }>("/listings?limit=200") });
  const { data: bookingsData } = useQuery({ queryKey: ["admin", "bookings"], queryFn: () => api.get<{ data: any[] }>("/bookings?limit=200") });

  const users    = (usersData as any)?.data    ?? [];
  const listings = (listingsData as any)?.data ?? [];
  const bookings = (bookingsData as any)?.data ?? [];

  const totalRevenue = bookings
    .filter((b: any) => b.status !== "CANCELLED")
    .reduce((sum: number, b: any) => sum + (b.totalPrice ?? 0), 0);

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(\`/users/\${id}\`, { role }),
    onSuccess: (_data: any, { id, role }: any) => {
      toast.success(\`Role updated to \${role}\`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setRoleMap(prev => ({ ...prev, [id]: "" }));
    },
    onError: () => toast.error("Failed to update role"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(\`/users/\${id}\`),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: () => toast.error("Failed to delete user"),
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id: string) => api.delete(\`/listings/\${id}\`),
    onSuccess: () => { toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["admin", "listings"] }); },
    onError: () => toast.error("Failed to delete listing"),
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(\`/bookings/\${id}/status\`, { status }),
    onSuccess: () => { toast.success("Booking updated"); qc.invalidateQueries({ queryKey: ["admin", "bookings"] }); },
    onError: () => toast.error("Failed to update booking"),
  });

  const STATS = [
    { label: "Total Users",    value: users.length },
    { label: "Total Listings", value: listings.length },
    { label: "Total Bookings", value: bookings.length },
    { label: "Total Revenue",  value: "\$" + totalRevenue.toLocaleString() },
  ];

  const th: React.CSSProperties = { padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: sub, textTransform: "uppercase", background: dark ? "#1a1a1a" : "#f9fafb" };
  const td: React.CSSProperties = { padding: "12px 20px", fontSize: "13px", color: text, borderTop: \`1px solid \${border}\` };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, Segoe UI, sans-serif" }}>

      {/* Header */}
      <div style={{ background: dark ? "#0a1a10" : "#0a2e1e", color: "#fff", padding: "32px 40px 24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#10B981", margin: "0 0 8px" }}>ADMIN PANEL</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 4px" }}>Admin Dashboard</h1>
            <p style={{ margin: 0, color: "#a7f3d0", fontSize: "13px" }}>Signed in as {user?.email} &middot; {user?.role}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => navigate("/listings")} style={{ background: "transparent", border: "1.5px solid #a7f3d0", color: "#a7f3d0", borderRadius: "50px", padding: "9px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              View Site
            </button>
            <button onClick={() => { logout(); navigate("/"); }} style={{ background: "#dc2626", border: "none", color: "#fff", borderRadius: "50px", padding: "9px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: card, borderRadius: "16px", padding: "24px", border: \`1px solid \${border}\` }}>
              <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: sub, textTransform: "uppercase" }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: text }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: card, borderRadius: "50px", padding: "5px", border: \`1px solid \${border}\`, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 22px", borderRadius: "50px", border: "none", background: tab === t ? "#0a2e1e" : "transparent", color: tab === t ? "#fff" : sub, fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: card, borderRadius: "16px", padding: "24px", border: \`1px solid \${border}\` }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 800, color: text }}>Recent Bookings</h3>
              {bookings.slice(0, 8).map((b: any) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: \`1px solid \${border}\` }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px", color: text }}>{b.listing?.title ?? "Listing"}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: sub }}>{b.guest?.email ?? b.guestId}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "13px", color: text }}>\${b.totalPrice}</p>
                    <Badge label={b.status} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: card, borderRadius: "16px", padding: "24px", border: \`1px solid \${border}\` }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 800, color: text }}>Recent Users</h3>
              {users.slice(0, 8).map((u: any) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: \`1px solid \${border}\` }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px", color: text }}>{u.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: sub }}>{u.email}</p>
                  </div>
                  <Badge label={u.role} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "Users" && (
          <div style={{ background: card, borderRadius: "16px", border: \`1px solid \${border}\`, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: \`1px solid \${border}\` }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: text }}>All Users ({users.length})</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Email", "Role", "Joined", "Change Role", "Actions"].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ background: card }} onMouseEnter={e => (e.currentTarget.style.background = rowHover)} onMouseLeave={e => (e.currentTarget.style.background = card)}>
                      <td style={td}><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                      <td style={td}>{u.email}</td>
                      <td style={{ ...td }}><Badge label={u.role} /></td>
                      <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={td}>
                        {u.role !== "ADMIN" && (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <select value={roleMap[u.id] ?? ""} onChange={e => setRoleMap(prev => ({ ...prev, [u.id]: e.target.value }))}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: \`1px solid \${border}\`, fontSize: "12px", fontFamily: "inherit", background: card, color: text }}>
                              <option value="">Select</option>
                              <option value="GUEST">GUEST</option>
                              <option value="HOST">HOST</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button onClick={() => { if (roleMap[u.id]) updateRoleMutation.mutate({ id: u.id, role: roleMap[u.id] }); }}
                              disabled={!roleMap[u.id] || updateRoleMutation.isPending}
                              style={{ padding: "5px 12px", background: "#0a2e1e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                              Save
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={td}>
                        {u.id !== user?.id && (
                          <button onClick={() => { if (confirm(\`Delete \${u.name}?\`)) deleteUserMutation.mutate(u.id); }}
                            style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === "Listings" && (
          <div style={{ background: card, borderRadius: "16px", border: \`1px solid \${border}\`, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: \`1px solid \${border}\`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: text }}>All Listings ({listings.length})</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Photo", "Title", "Host", "Location", "Type", "Price", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {listings.map((l: any) => (
                    <tr key={l.id} style={{ background: card }} onMouseEnter={e => (e.currentTarget.style.background = rowHover)} onMouseLeave={e => (e.currentTarget.style.background = card)}>
                      <td style={{ ...td, width: "60px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", background: border }}>
                          {l.photos?.[0]?.url
                            ? <img src={l.photos[0].url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", background: dark ? "#333" : "#e5e7eb" }} />
                          }
                        </div>
                      </td>
                      <td style={{ ...td, fontWeight: 600, maxWidth: "200px" }}>{l.title}</td>
                      <td style={td}>{l.host?.name ?? "-"}</td>
                      <td style={td}>{l.location}</td>
                      <td style={td}><Badge label={l.type} /></td>
                      <td style={{ ...td, fontWeight: 700 }}>\${l.pricePerNight}/night</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => navigate(\`/listings/\${l.id}\`)} style={{ padding: "5px 12px", background: dark ? "#2a2a2a" : "#f9fafb", color: text, border: \`1px solid \${border}\`, borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View</button>
                          <button onClick={() => { if (confirm(\`Delete "\${l.title}"?\`)) deleteListingMutation.mutate(l.id); }}
                            style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === "Bookings" && (
          <div style={{ background: card, borderRadius: "16px", border: \`1px solid \${border}\`, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: \`1px solid \${border}\` }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: text }}>All Bookings ({bookings.length})</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Listing", "Guest", "Check-in", "Check-out", "Amount", "Status", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} style={{ background: card }} onMouseEnter={e => (e.currentTarget.style.background = rowHover)} onMouseLeave={e => (e.currentTarget.style.background = card)}>
                      <td style={{ ...td, fontWeight: 600 }}>{b.listing?.title ?? "-"}</td>
                      <td style={td}>{b.guest?.name ?? b.guest?.email ?? b.guestId}</td>
                      <td style={td}>{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td style={td}>{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td style={{ ...td, fontWeight: 700 }}>\${b.totalPrice}</td>
                      <td style={td}><Badge label={b.status} /></td>
                      <td style={td}>
                        {b.status === "CONFIRMED" && (
                          <button onClick={() => updateBookingMutation.mutate({ id: b.id, status: "COMPLETED" })}
                            style={{ padding: "5px 12px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            Complete
                          </button>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button onClick={() => updateBookingMutation.mutate({ id: b.id, status: "CANCELLED" })}
                            style={{ padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginLeft: "6px" }}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
`;
fs.writeFileSync(file, content, "utf8");
console.log("Done!");
