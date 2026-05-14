import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <button onClick={() => navigate("/admin")} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: "10px", padding: "10px 20px", fontWeight: 600, fontSize: "14px", color: "#555", cursor: "pointer", fontFamily: "inherit", marginBottom: "32px" }}>
        Back to Dashboard
      </button>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#222", margin: "0 0 8px" }}>Listing Management</h1>
      <p style={{ color: "#717171", fontSize: "14px", marginBottom: "32px" }}>All listings ({listings.length} total)</p>

      {isLoading ? (
        <p style={{ color: "#717171" }}>Loading...</p>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "#f9f9f9", borderRadius: "16px" }}>
          <p style={{ fontSize: "40px" }}>ð </p>
          <p style={{ fontWeight: 600, color: "#222" }}>No listings yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sorted.map(l => (
            <div key={l.id} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: "16px", overflow: "hidden", display: "grid", gridTemplateColumns: "180px 1fr" }}>
              <div style={{ background: "#f5f5f5", overflow: "hidden", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {l.photos?.[0]
                  ? <img src={l.photos[0].url} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "40px" }}>ð </span>
                }
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#222", margin: "0 0 6px" }}>{l.title}</h3>
                  <p style={{ fontSize: "13px", color: "#717171", margin: "0 0 4px" }}>ð {l.location} Â· {l.type} Â· ${l.pricePerNight}/night</p>
                  <p style={{ fontSize: "13px", color: "#717171", margin: "0 0 8px" }}>ð¤ {l.host?.name} Â· {l.host?.email}</p>
                  <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: 1.5 }}>{l.description?.slice(0, 120)}...</p>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => navigate(`/listings/${l.id}`)} style={{ padding: "8px 18px", background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>View</button>
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