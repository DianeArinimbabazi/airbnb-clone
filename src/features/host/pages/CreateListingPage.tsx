import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

const schema = z.object({
  title:         z.string().min(10, "Title must be at least 10 characters"),
  description:   z.string().min(50, "Description must be at least 50 characters"),
  location:      z.string().min(3, "Location is required"),
  pricePerNight: z.number().min(10, "Price must be at least $10"),
  guests:        z.number().min(1).max(50),
  type:          z.string().min(1, "Type is required"),
  amenities:     z.string().min(1, "List at least one amenity"),
  category:      z.string().min(1, "Category is required"),
  bedrooms:      z.number().min(1).max(20),
  bathrooms:     z.number().min(1).max(20),
  availableFrom: z.string().optional(),
  superhost:     z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const inp: React.CSSProperties = { width:"100%", padding:"12px 16px", border:"1.5px solid #ddd", borderRadius:"10px", fontSize:"15px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };
const lbl: React.CSSProperties = { display:"block", fontWeight:600, fontSize:"13px", marginBottom:"6px", color:"#333" };
const err: React.CSSProperties = { color:"#e53e3e", fontSize:"13px", marginTop:"4px" };

const CATEGORIES = ["Beach","Mountain","City","Countryside","Desert","Lake","Cabin","Luxury"];
const TYPES = ["APARTMENT","HOUSE","VILLA","CABIN","STUDIO","LOFT","COTTAGE","BUNGALOW"];

import { config } from '../../../config/env';
const BASE = config.apiUrl;

export function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { guests:2, pricePerNight:50, bedrooms:1, bathrooms:1, superhost:false },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Step 1: Create the listing
      setUploadProgress("Creating listing...");
      const res = await api.post<{ data: { id: string } }>("/listings", {
        ...( ({ category, ...rest }) => rest )(data),
        available: true,
      });

      const listingId = res.data?.id ?? (res as unknown as { id: string }).id;
      if (!listingId) throw new Error("No listing ID returned");

      // Step 2: Upload photos if any
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} photo(s)...`);
        const token = localStorage.getItem("token");
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
          const formData = new FormData();
          formData.append("photo", files[i]);
          await fetch(`${BASE}/listings/${listingId}/photos`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
        }
      }

      setUploadProgress("");
      return listingId;
    },
    onSuccess: () => {
      toast.success("Listing created successfully!");
      qc.invalidateQueries({ queryKey: ["listings", "mine"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      navigate("/host");
    },
    onError: (e: Error) => {
      setUploadProgress("");
      toast.error(e.message || "Failed to create listing");
    },
  });

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 10) { setImageError("Maximum 10 photos"); return; }
    const oversized = selected.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) { setImageError(`${oversized.name} exceeds 5MB`); return; }
    setImageError("");
    setFiles(selected);
    const readers = selected.map(file => new Promise<string>(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPreviews);
  };

  const removePhoto = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"40px 24px 80px" }}>
      <button onClick={() => navigate("/host")} style={{ background:"none", border:"1.5px solid #ddd", borderRadius:"10px", padding:"10px 20px", fontWeight:600, fontSize:"14px", color:"#555", cursor:"pointer", fontFamily:"inherit", marginBottom:"32px" }}>
         Back to Dashboard
      </button>
      <h1 style={{ fontSize:"26px", fontWeight:800, color:"#222", margin:"0 0 8px" }}>Create a new listing</h1>
      <p style={{ color:"#717171", fontSize:"14px", marginBottom:"32px" }}>Fill in the details about your property</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:"24px" }}>

        {/* Photos */}
        <div>
          <label style={lbl}>Property Photos <span style={{ fontWeight:400, color:"#888" }}>(up to 10, max 5MB each)</span></label>
          <div
            style={{ border:"2px dashed #ddd", borderRadius:"12px", padding:"24px", textAlign:"center", background:"#fafafa", cursor:"pointer" }}
            onClick={() => document.getElementById("img-upload")?.click()}
          >
            {previews.length === 0 ? (
              <div>
                <p style={{ fontSize:"32px", margin:"0 0 8px" }}></p>
                <p style={{ color:"#717171", fontSize:"14px", margin:"0 0 4px" }}>Click to upload photos</p>
                <p style={{ color:"#aaa", fontSize:"12px", margin:0 }}>JPEG, PNG, WebP up to 5MB each</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))", gap:"8px" }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position:"relative" }}>
                    <img src={src} alt={`photo ${i+1}`} style={{ width:"100%", height:"100px", objectFit:"cover", borderRadius:"8px" }} />
                    <button type="button" onClick={e => { e.stopPropagation(); removePhoto(i); }}
                      style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"50%", width:"22px", height:"22px", fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      
                    </button>
                    {i === 0 && <span style={{ position:"absolute", bottom:"4px", left:"4px", background:"#FF385C", color:"#fff", fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:"4px" }}>Cover</span>}
                  </div>
                ))}
                {previews.length < 10 && (
                  <div style={{ height:"100px", border:"2px dashed #ddd", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", color:"#aaa" }}>+</div>
                )}
              </div>
            )}
          </div>
          <input id="img-upload" type="file" accept="image/*" multiple onChange={handleImages} style={{ display:"none" }} />
          {imageError && <p style={err}>{imageError}</p>}
        </div>

        {/* Title */}
        <div>
          <label style={lbl}>Title *</label>
          <input {...register("title")} placeholder="Cozy beachfront villa with ocean views" style={inp} />
          {errors.title && <p style={err}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Description *</label>
          <textarea {...register("description")} rows={5} placeholder="Describe your property in detail..." style={{ ...inp, resize:"vertical" }} />
          {errors.description && <p style={err}>{errors.description.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label style={lbl}>Location *</label>
          <input {...register("location")} placeholder="Kigali, Rwanda" style={inp} />
          {errors.location && <p style={err}>{errors.location.message}</p>}
        </div>

        {/* Price + Guests */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div>
            <label style={lbl}>Price per night ($) *</label>
            <input type="number" min={10} {...register("pricePerNight", { valueAsNumber:true })} style={inp} />
            {errors.pricePerNight && <p style={err}>{errors.pricePerNight.message}</p>}
          </div>
          <div>
            <label style={lbl}>Max guests *</label>
            <input type="number" min={1} max={50} {...register("guests", { valueAsNumber:true })} style={inp} />
            {errors.guests && <p style={err}>{errors.guests.message}</p>}
          </div>
        </div>

        {/* Bedrooms + Bathrooms */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div>
            <label style={lbl}>Bedrooms *</label>
            <input type="number" min={1} max={20} {...register("bedrooms", { valueAsNumber:true })} style={inp} />
            {errors.bedrooms && <p style={err}>{errors.bedrooms.message}</p>}
          </div>
          <div>
            <label style={lbl}>Bathrooms *</label>
            <input type="number" min={1} max={20} {...register("bathrooms", { valueAsNumber:true })} style={inp} />
            {errors.bathrooms && <p style={err}>{errors.bathrooms.message}</p>}
          </div>
        </div>

        {/* Type + Category */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div>
            <label style={lbl}>Property Type *</label>
            <select {...register("type")} style={inp}>
              <option value="">Select type</option>
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
            </select>
            {errors.type && <p style={err}>{errors.type.message}</p>}
          </div>
          <div>
            <label style={lbl}>Category *</label>
            <select {...register("category")} style={inp}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p style={err}>{errors.category.message}</p>}
          </div>
        </div>

        {/* Available From */}
        <div>
          <label style={lbl}>Available From</label>
          <input type="date" {...register("availableFrom")} style={inp} />
        </div>

        {/* Amenities */}
        <div>
          <label style={lbl}>Amenities * <span style={{ fontWeight:400, color:"#888" }}>(comma-separated)</span></label>
          <input {...register("amenities")} placeholder="WiFi, Pool, Kitchen, Parking, AC, TV, Gym" style={inp} />
          {errors.amenities && <p style={err}>{errors.amenities.message}</p>}
        </div>

        {/* Superhost */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <input type="checkbox" id="superhost" {...register("superhost")} style={{ width:"18px", height:"18px", accentColor:"#FF385C" }} />
          <label htmlFor="superhost" style={{ fontWeight:600, fontSize:"14px", color:"#333", cursor:"pointer" }}>
            Mark as Superhost listing
          </label>
        </div>

        {/* Progress */}
        {uploadProgress && (
          <div style={{ background:"#f0fdf4", border:"1px solid #d1fae5", borderRadius:"10px", padding:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"16px", height:"16px", border:"2px solid #10B981", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <p style={{ margin:0, fontSize:"14px", color:"#059669", fontWeight:500 }}>{uploadProgress}</p>
          </div>
        )}

        <button type="submit" disabled={mutation.isPending}
          style={{ padding:"16px", background: mutation.isPending ? "#ccc" : "#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor: mutation.isPending ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
          {mutation.isPending ? "Creating..." : "Create Listing"}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
export default CreateListingPage;
