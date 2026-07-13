import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import toast from "react-hot-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  type: string;
  createdAt: string;
  photos?: { url: string }[];
  host: { name: string; email: string };
}

export function ModerationQueue() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { dark } = useTheme();

  const card = dark ? "#1a1a1a" : "#fff";
  const bg = dark ? "#111111" : "#f9f9f9";
  const text = dark ? "#f0f0f0" : "#222";
  const sub = dark ? "#888" : "#717171";
  const border = dark ? "rgba(255,255,255,0.08)" : "#f0f0f0";

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["admin", "listings", "all"],
    queryFn: async () => {
      const res = await api.get<{ data: Listing[] }>("/listings?limit=100");
      return res.data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["admin", "listings", "all"] });
      const prev = qc.getQueryData<Listing[]>(["admin", "listings", "all"]);
      qc.setQueryData<Listing[]>(["admin", "listings", "all"], old => old?.filter(l => l.id !== id) ?? []);
      return { prev };
    },
    onError: (_e: any, _id: any, ctx: any) => {
      qc.setQueryData(["admin", "listings", "all"], ctx?.prev);
      toast.error("Could not delete listing");
    },
    onSuccess: () => toast.success("Listing deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin", "listings", "all"] }),
  });

  const sorted = [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 80px", minHeight: "100vh", background: dark ? "#0f0f0f" : "#fff" }}>
      <button onClick={() => navigate("/admin")} style={{ background: card, border: `1.5px solid ${border}`, borderRadius: "10px", padding: "10px 20px", fontWeight: 600, fontSize: "14px", color: sub, cursor: "pointer", fontFamily: "inherit", marginBottom: "32px" }}>
        Back to Dashboard
      </button>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: text, margin: "0 0 8px" }}>Listing Management</h1>
      <p style={{ color: sub, fontSize: "14px", marginBottom: "32px" }}>All listings ({listings.length} total)</p>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <div style={{ width: "32px", height: "32px", border: `3px solid ${border}`, borderTopColor: "#e8442a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: bg, borderRadius: "16px" }}>
          <p style={{ fontSize: "40px" }}></p>
          <p style={{ fontWeight: 600, color: text }}>No listings yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sorted.map(l => (
            <div key={l.id} className="moderation-card" style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", overflow: "hidden", display: "grid", gridTemplateColumns: "180px 1fr" }}>
              <div style={{ background: bg, overflow: "hidden", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {l.photos?.[0]
                  ? <img src={l.photos[0].url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <span style={{ fontSize: "40px" }}></span>
                }
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: text, margin: "0 0 6px" }}>{l.title}</h3>
                  <p style={{ fontSize: "13px", color: sub, margin: "0 0 4px" }}> {l.location}  {l.type}  ${l.pricePerNight}/night</p>
                  <p style={{ fontSize: "13px", color: sub, margin: "0 0 8px" }}> {l.host?.name}  {l.host?.email}</p>
                  <p style={{ fontSize: "13px", color: dark ? "#ccc" : "#444", margin: 0, lineHeight: 1.5 }}>{l.description?.slice(0, 120)}...</p>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => navigate(`/listings/${l.id}`)} style={{ padding: "8px 18px", background: bg, color: text, border: `1px solid ${border}`, borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>View</button>
                  <button
                    onClick={() => { if (window.confirm(`Delete "${l.title}"? This cannot be undone.`)) deleteMutation.mutate(l.id); }}
                    disabled={deleteMutation.isPending}
                    style={{ padding: "8px 18px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModerationQueue;
