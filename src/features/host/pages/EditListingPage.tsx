import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { config } from "../../../config/env";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useListing } from "../../listings/hooks/useListing";
import { Spinner } from "../../../shared/components/Spinner";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

const schema = z.object({
  title:         z.string().min(10, "Title must be at least 10 characters"),
  description:   z.string().min(20, "Description must be at least 20 characters"),
  location:      z.string().min(3, "Location is required"),
  pricePerNight: z.number().min(10, "Price must be at least $10"),
  guests:        z.number().min(1).max(50),
  type:          z.string().min(1, "Type is required"),
  amenities:     z.string().min(1, "List at least one amenity"),
  
});

type FormData = z.infer<typeof schema>;

const TYPES = ["APARTMENT","HOUSE","VILLA","CABIN","STUDIO","LOFT","COTTAGE","BUNGALOW"];

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { dark } = useTheme();
  const { data: listing, isLoading } = useListing(id!);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const BASE = config.apiUrl;

  const text   = dark ? "#f0f0f0" : "#222";
  const sub    = dark ? "#aaaaaa" : "#717171";
  const border = dark ? "#444444" : "#ddd";
  const card   = dark ? "#1a1a1a" : "#fafafa";
  const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", outline:"none", fontFamily:"inherit", boxSizing:"border-box", background: dark ? "#2a2a2a" : "#fff", color: text };
  const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"13px", marginBottom:"6px", color: text };
  const errStyle: React.CSSProperties = { color:"#e53e3e", fontSize:"13px", marginTop:"4px" };

  type PhotoData = { url: string; publicId?: string; public_id?: string; id?: string };
  const getPhotoId = (photo: PhotoData) => photo.publicId ?? photo.public_id ?? photo.id ?? photo.url;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (listing) {
      reset({
        title:         listing.title,
        description:   listing.description ?? "",
        location:      listing.location,
        pricePerNight: listing.pricePerNight,
        guests:        listing.guests,
        type:          listing.type,
        amenities:     listing.amenities ?? "",
        
      });
    }
  }, [listing, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => api.put(`/listings/${id}`, data),
    onSuccess: () => {
      toast.success("Listing updated!");
      qc.invalidateQueries({ queryKey: ["listing", id] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      navigate("/host");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to update listing");
    },
  });

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(
        `${BASE}/listings/${id}/photos`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      toast.success("Photo added!");
      qc.invalidateQueries({ queryKey: ["listing", id] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Remove this photo?")) return;
    if (!photoId) {
      toast.error("Unable to identify this photo for deletion.");
      return;
    }
    setDeletingPhoto(photoId);
    try {
      const encodedId = encodeURIComponent(photoId);
      const path = photoId.startsWith("http")
        ? `/listings/${id}/photos?url=${encodedId}`
        : `/listings/${id}/photos/${encodedId}`;
      await api.delete(path);
      toast.success("Photo removed");
      qc.invalidateQueries({ queryKey: ["listing", id] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove photo");
    } finally {
      setDeletingPhoto(null);
    }
  }

  if (isLoading) return <Spinner />;
  if (!listing) return (
    <div style={{ padding:"80px 24px", textAlign:"center" }}>
      <p style={{ fontSize:"48px" }}>??</p>
      <p style={{ color:text }}>Listing not found</p>
      <button onClick={() => navigate("/host")} style={{ marginTop:"16px", background:"#10B981", color:"#fff", border:"none", borderRadius:"10px", padding:"12px 24px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Back to Dashboard</button>
    </div>
  );

  const realPhotos = (listing.photos ?? []) as PhotoData[];

  return (
    <div style={{ maxWidth:"640px", margin:"0 auto", padding:"40px 24px 80px" }}>
      <button onClick={() => navigate("/host")} style={{ background:"none", border:`1.5px solid ${border}`, borderRadius:"10px", padding:"10px 20px", fontWeight:600, fontSize:"14px", color:sub, cursor:"pointer", fontFamily:"inherit", marginBottom:"32px" }}>
        Back to Dashboard
      </button>
      <h1 style={{ fontSize:"26px", fontWeight:800, color:text, margin:"0 0 8px" }}>Edit listing</h1>
      <p style={{ color:sub, fontSize:"14px", marginBottom:"32px" }}>Update your property details</p>

      {/* Photos section */}
      <div style={{ marginBottom:"32px" }}>
        <label style={{ ...lbl, fontSize:"15px", marginBottom:"12px" }}>Photos ({realPhotos.length}/5)</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px,1fr))", gap:"12px", marginBottom:"14px" }}>
          {realPhotos.map(photo => {
            const photoId = getPhotoId(photo);
            return (
              <div key={photoId} style={{ position:"relative", borderRadius:"10px", overflow:"hidden", aspectRatio:"4/3", background:card }}>
                <img src={photo.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photoId)}
                  disabled={deletingPhoto === photoId}
                  style={{ position:"absolute", top:"6px", right:"6px", width:"26px", height:"26px", borderRadius:"50%", background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}
                >
                  {deletingPhoto === photoId ? "..." : "x"}
                </button>
              </div>
            );
          })}
          {realPhotos.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ aspectRatio:"4/3", borderRadius:"10px", border:`2px dashed ${border}`, background:card, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"6px", color:sub, fontSize:"13px", fontWeight:600, fontFamily:"inherit" }}
            >
              <span style={{ fontSize:"24px" }}>+</span>
              {uploadingPhoto ? "Uploading..." : "Add photo"}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display:"none" }} />
        <p style={{ fontSize:"12px", color:sub, margin:0 }}>Max 5 photos. Click x to remove, + to add.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
        <div>
          <label style={lbl}>Title *</label>
          <input {...register("title")} style={inp} />
          {errors.title && <p style={errStyle}>{errors.title.message}</p>}
        </div>
        <div>
          <label style={lbl}>Description *</label>
          <textarea {...register("description")} rows={4} style={{ ...inp, resize:"vertical" }} />
          {errors.description && <p style={errStyle}>{errors.description.message}</p>}
        </div>
        <div>
          <label style={lbl}>Location *</label>
          <input {...register("location")} style={inp} />
          {errors.location && <p style={errStyle}>{errors.location.message}</p>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"16px" }}>
          <div>
            <label style={lbl}>Price per night ($) *</label>
            <input type="number" min={10} {...register("pricePerNight", { valueAsNumber:true })} style={inp} />
            {errors.pricePerNight && <p style={errStyle}>{errors.pricePerNight.message}</p>}
          </div>
          <div>
            <label style={lbl}>Max guests *</label>
            <input type="number" min={1} max={50} {...register("guests", { valueAsNumber:true })} style={inp} />
            {errors.guests && <p style={errStyle}>{errors.guests.message}</p>}
          </div>
        </div>
        <div>
          <label style={lbl}>Property Type *</label>
          <select {...register("type")} style={inp}>
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
          </select>
          {errors.type && <p style={errStyle}>{errors.type.message}</p>}
        </div>
        <div>
          <label style={lbl}>Amenities * <span style={{ fontWeight:400, color:sub }}>(comma-separated)</span></label>
          <input {...register("amenities")} placeholder="WiFi, Pool, Kitchen, Parking, AC" style={inp} />
          {errors.amenities && <p style={errStyle}>{errors.amenities.message}</p>}
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          style={{ padding:"14px", background: saveMutation.isPending ? "#ccc" : "#10B981", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor: saveMutation.isPending ? "not-allowed" : "pointer", fontFamily:"inherit" }}
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
export default EditListingPage;



