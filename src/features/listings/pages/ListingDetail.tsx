import { AIReviewSummary } from '../../ai/AIReviewSummary';
import { lazy, Suspense } from 'react';
const ListingMap = lazy(() => import('../components/ListingMap'));
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useFavorites } from "../hooks/useFavorites";
import { useListing } from "../hooks/useListing";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { Spinner } from "../../../shared/components/Spinner";

import type { ReactNode } from "react";
import {
  FaHeart, FaRegHeart, FaStar, FaUsers, FaBed, FaBath,
  FaWifi, FaParking, FaSwimmingPool, FaUtensils, FaSnowflake,
  FaTv, FaDumbbell, FaFireAlt, FaShare, FaChevronLeft,
  FaShieldAlt, FaMedal, FaMapMarkerAlt, FaChevronRight,
} from "react-icons/fa";

const AMENITY_ICONS: Record<string, ReactNode> = {
  wifi:      <FaWifi />,
  parking:   <FaParking />,
  pool:      <FaSwimmingPool />,
  kitchen:   <FaUtensils />,
  ac:        <FaSnowflake />,
  tv:        <FaTv />,
  gym:       <FaDumbbell />,
  fireplace: <FaFireAlt />,
};

function getAmenityIcon(amenity: string): ReactNode {
  const key = amenity.toLowerCase().trim();
  for (const [k, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return <FaWifi />;
}

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: listing, isLoading, isError } = useListing(id!);
  const { isSaved, toggle } = useFavorites();
  const { dark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests]     = useState(1);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);

  const qc = useQueryClient();
  const bookMutation = useMutation({
    mutationFn: () => api.post("/bookings", {
      listingId: id!,
      checkIn: new Date(checkIn + "T14:00:00.000Z").toISOString(),
      checkOut: new Date(checkOut + "T14:00:00.000Z").toISOString(),
    }),
    onSuccess: () => {
      toast.success("Booking confirmed!");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/guest");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? "Booking failed"),
  });

  function handleBook() {
    if (!isAuthenticated) return navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    if (!checkIn || !checkOut) return toast.error("Select check-in and check-out dates");
    if (new Date(checkOut) <= new Date(checkIn)) return toast.error("Check-out must be after check-in");
    bookMutation.mutate();
  }

  const bg       = dark ? "#0f172a" : "#fff";
  const cardBg   = dark ? "#1e293b" : "#fff";
  const detailBg = dark ? "#1e293b" : "#f9f9f9";
  const text      = dark ? "#f1f5f9" : "#222";
  const subText   = dark ? "#94a3b8" : "#717171";
  const bodyText  = dark ? "#cbd5e1" : "#444";
  const border    = dark ? "#334155" : "#ebebeb";
  const inputBdr  = dark ? "#475569" : "#ddd";

  if (isLoading) return <Spinner />;
  if (isError || !listing) {
    return (
      <div style={{ padding:"100px 24px", textAlign:"center", background: bg, minHeight:"100vh" }}>
        <p style={{ fontSize:"48px" }}></p>
        <h2 style={{ fontSize:"22px", fontWeight:700, color: text, margin:"16px 0 8px" }}>Listing not found</h2>
        <p style={{ color: subText, marginBottom:"24px" }}>This listing may have been removed.</p>
        <button onClick={() => navigate("/")} style={{ padding:"12px 28px", background:"#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:"15px" }}>
          Explore listings
        </button>
      </div>
    );
  }

  const bedrooms  = String((listing as any).bedrooms  ?? "-");
  const bathrooms = String((listing as any).bathrooms ?? "-");

  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos.map((p: { url: string }) => p.url)
    : [];

  const amenityList        = listing.amenities ? listing.amenities.split(",").map((a: string) => a.trim()).filter(Boolean) : [];
  const displayedAmenities = showAllAmenities ? amenityList : amenityList.slice(0, 8);

  const nights     = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const subtotal   = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const total      = subtotal + serviceFee;

  const inp: React.CSSProperties = { width:"100%", padding:0, border:"none", fontSize:"13px", fontFamily:"inherit", outline:"none", background:"transparent", color: text };

  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);

  return (
    <div style={{ maxWidth:"1120px", margin:"0 auto", padding:"24px 24px 80px", background: bg, minHeight:"100vh", color: text }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
        <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 0", background:"none", border:"none", fontWeight:600, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color: text, textDecoration:"underline" }}>
          <FaChevronLeft size={12} /> Back
        </button>
        <div style={{ display:"flex", gap:"16px" }}>
          <button onClick={() => toggle(listing.id, listing.title)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 12px", background:"none", border:"none", fontWeight:600, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color: text, textDecoration:"underline" }}>
            {isSaved(listing.id) ? <><FaHeart color="#FF385C" /> Saved</> : <><FaRegHeart /> Save</>}
          </button>
          <button onClick={async () => {
              if (navigator.share) {
                await navigator.share({ title: listing.title, url: window.location.href }).catch(() => {});
              } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied!");
              }
            }}
            style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 12px", background:"none", border:"none", fontWeight:600, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color: text, textDecoration:"underline" }}>
            <FaShare /> Share
          </button>
        </div>
      </div>

      <h1 style={{ fontSize:"26px", fontWeight:700, color: text, margin:"0 0 8px" }}>{listing.title}</h1>
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px", flexWrap:"wrap" }}>
        {listing.rating && (
          <span style={{ display:"flex", alignItems:"center", gap:"4px", fontWeight:600, fontSize:"14px", color: text }}>
            <FaStar size={14} color="#FF385C" /> {Number(listing.rating).toFixed(1)}
          </span>
        )}
        {listing.superhost && <span style={{ fontSize:"13px", fontWeight:600, color: text }}> Superhost</span>}
        <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"14px", color: subText }}>
          <FaMapMarkerAlt size={12} /> {listing.location}
        </span>
      </div>

      {/* Photo Gallery */}
      <div style={{ position:"relative", marginBottom:"32px" }}>
        {photos.length === 1 ? (
          <div style={{ height:"480px", borderRadius:"16px", overflow:"hidden", cursor:"pointer" }} onClick={() => setShowCarousel(true)}>
            <img src={photos[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        ) : (
          <div className="listing-photo-grid">
            <div style={{ gridRow:"1 / 3", position:"relative", overflow:"hidden", cursor:"pointer" }} onClick={() => { setPhotoIndex(0); setShowCarousel(true); }}>
              <img src={photos[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {[1,2,3,4].filter(i => photos[i]).map(i => (
              <div key={i} style={{ overflow:"hidden", cursor:"pointer" }} onClick={() => { setPhotoIndex(i); setShowCarousel(true); }}>
                <img src={photos[i]} alt={"Photo " + (i+1)} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
              </div>
            ))}
          </div>
        )}
        {photos.length > 1 && (
          <button onClick={() => setShowCarousel(true)} style={{ position:"absolute", bottom:"16px", right:"16px", background: cardBg, border:"1.5px solid " + text, borderRadius:"8px", padding:"8px 16px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", color: text }}>
            Show all {photos.length} photos
          </button>
        )}
      </div>

      {/* Carousel Modal */}
      {showCarousel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <button onClick={() => setShowCarousel(false)} aria-label="Close carousel" style={{ position:"absolute", top:"20px", right:"20px", background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:"48px", height:"48px", color:"#fff", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{'\u2715'}</button>
          <button onClick={prevPhoto} style={{ position:"absolute", left:"20px", background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:"48px", height:"48px", color:"#fff", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FaChevronLeft />
          </button>
          <div style={{ textAlign:"center" }}>
            <img src={photos[photoIndex]} alt={"Photo " + (photoIndex+1)} style={{ maxHeight:"80vh", maxWidth:"90vw", objectFit:"contain", borderRadius:"8px" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <p style={{ color:"#fff", marginTop:"12px", fontSize:"14px" }}>{photoIndex+1} / {photos.length}</p>
          </div>
          <button onClick={nextPhoto} style={{ position:"absolute", right:"20px", background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%", width:"48px", height:"48px", color:"#fff", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FaChevronRight />
          </button>
        </div>
      )}

      <div className="listing-detail-grid">
        {/* Left */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:"24px", borderBottom:"1px solid " + border }}>
            <div>
              <h2 style={{ fontSize:"22px", fontWeight:700, color: text, margin:"0 0 8px" }}>
                {listing.type.charAt(0) + listing.type.slice(1).toLowerCase()} in {listing.location}
              </h2>
              <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"15px", color: subText }}>
                  <FaUsers size={14} /> {listing.guests} guests
                </span>
                <span style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"15px", color: subText }}>
                  <FaBed size={14} /> {bedrooms} bedrooms
                </span>
                <span style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"15px", color: subText }}>
                  <FaBath size={14} /> {bathrooms} bathrooms
                </span>
              </div>
            </div>
            <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"#FF385C", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:"20px", flexShrink:0 }}>
              {listing.host?.name?.charAt(0) ?? "H"}
            </div>
          </div>

          {/* Highlights */}
          <div style={{ padding:"24px 0", borderBottom:"1px solid " + border, display:"flex", flexDirection:"column", gap:"20px" }}>
            {[
              { icon: <FaMedal size={28} color="#FF385C" />, title: "Hosted by " + (listing.host?.name ?? "Host"), sub: listing.superhost ? "Superhost  Experienced host" : "Experienced host" },
              { icon: <FaUsers size={24} color="#FF385C" />, title: "Up to " + listing.guests + " guests", sub: "This place accommodates all guests comfortably" },
              { icon: <FaShieldAlt size={24} color="#FF385C" />, title: "Enhanced clean", sub: "This host committed to enhanced cleaning standards" },
            ].map(h => (
              <div key={h.title} style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                {h.icon}
                <div>
                  <p style={{ fontWeight:600, color: text, margin:"0 0 2px", fontSize:"15px" }}>{h.title}</p>
                  <p style={{ color: subText, margin:0, fontSize:"13px" }}>{h.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={{ padding:"24px 0", borderBottom:"1px solid " + border }}>
            <h3 style={{ fontSize:"18px", fontWeight:700, color: text, margin:"0 0 12px" }}>About this place</h3>
            <p style={{ fontSize:"15px", color: bodyText, lineHeight:1.8, margin:0 }}>{listing.description}</p>
          </div>

          {/* Property details */}
          <div style={{ padding:"24px 0", borderBottom:"1px solid " + border }}>
            <h3 style={{ fontSize:"18px", fontWeight:700, color: text, margin:"0 0 16px" }}>Property details</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              {[
                { label:"Type",     value: listing.type.charAt(0)+listing.type.slice(1).toLowerCase() },
                { label:"Location", value: listing.location },
                { label:"Guests",   value: listing.guests + " max" },
                { label:"Price",    value: "$" + listing.pricePerNight + "/night" },
                { label:"Rating",   value: listing.rating ? listing.rating + " stars" : "No reviews yet" },
                { label:"Host",     value: listing.host?.name ?? "" },
              ].map(d => (
                <div key={d.label} style={{ background: detailBg, borderRadius:"10px", padding:"12px 16px" }}>
                  <p style={{ fontSize:"11px", fontWeight:700, color: subText, margin:"0 0 4px", textTransform:"uppercase" }}>{d.label}</p>
                  <p style={{ fontSize:"14px", fontWeight:600, color: text, margin:0 }}>{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div style={{ padding:"24px 0", borderBottom:"1px solid " + border }}>
            <h3 style={{ fontSize:"18px", fontWeight:700, color: text, margin:"0 0 20px" }}>What this place offers</h3>
            {amenityList.length === 0 ? <p style={{ color: subText }}>No amenities listed.</p> : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                  {displayedAmenities.map((a: string) => (
                    <div key={a} style={{ display:"flex", alignItems:"center", gap:"12px", fontSize:"15px", color: text }}>
                      <span style={{ color: subText, fontSize:"16px" }}>{getAmenityIcon(a)}</span>
                      {a}
                    </div>
                  ))}
                </div>
                {amenityList.length > 8 && (
                  <button onClick={() => setShowAllAmenities(!showAllAmenities)} style={{ marginTop:"16px", padding:"12px 24px", background: cardBg, border:"1.5px solid " + text, borderRadius:"10px", fontWeight:600, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", color: text }}>
                    {showAllAmenities ? "Show less" : "Show all " + amenityList.length + " amenities"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Location Map */}
          <div style={{ padding:"24px 0", borderBottom:"1px solid " + border }}>
            <h3 style={{ fontSize:"18px", fontWeight:700, color: text, margin:"0 0 8px" }}>Where you will be</h3>
            <p style={{ fontSize:"14px", color: subText, margin:"0 0 20px" }}>{listing.location}</p>
            <Suspense fallback={<div style={{height:"400px",display:"flex",alignItems:"center",justifyContent:"center",color:subText}}>Loading map...</div>}>
              <ListingMap location={listing.location} dark={dark} />
            </Suspense>
          </div>

          <AIReviewSummary listingId={id} rating={listing.rating} />
        </div>

        {/* Right - Booking Widget */}
        <div>
          <div style={{ background: cardBg, padding:"24px", borderRadius:"16px", boxShadow:"0 4px 24px rgba(0,0,0,0.12)", position:"sticky", top:"24px", border:"1px solid " + border }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div>
                <span style={{ fontSize:"22px", fontWeight:800, color: text }}>{"$" + listing.pricePerNight.toLocaleString()}</span>
                <span style={{ fontSize:"15px", color: subText }}> / night</span>
              </div>
              {listing.rating && Number(listing.rating) > 0 && (
                <span style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"14px", fontWeight:600, color: text }}>
                  <FaStar size={12} color="#FF385C" /> {Number(listing.rating).toFixed(1)}
                </span>
              )}
            </div>

            <div style={{ border:"1.5px solid " + inputBdr, borderRadius:"10px", overflow:"hidden", marginBottom:"12px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid " + inputBdr }}>
                <div style={{ padding:"10px 12px", borderRight:"1px solid " + inputBdr }}>
                  <p style={{ fontSize:"10px", fontWeight:700, color: text, margin:"0 0 4px", textTransform:"uppercase" }}>Check-in</p>
                  <input type="date" value={checkIn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckIn(e.target.value)} style={inp} />
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <p style={{ fontSize:"10px", fontWeight:700, color: text, margin:"0 0 4px", textTransform:"uppercase" }}>Checkout</p>
                  <input type="date" value={checkOut} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckOut(e.target.value)} style={inp} />
                </div>
              </div>
              <div style={{ padding:"10px 12px" }}>
                <p style={{ fontSize:"10px", fontWeight:700, color: text, margin:"0 0 4px", textTransform:"uppercase" }}>Guests</p>
                <select value={guests} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGuests(Number(e.target.value))} style={inp}>
                  {Array.from({ length: listing.guests }, (_, i) => i+1).map(n => (
                    <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={handleBook} disabled={bookMutation.isPending}
              style={{ width:"100%", padding:"14px", background: "#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:700, cursor: "pointer", fontFamily:"inherit", marginBottom:"12px" }}>
              {bookMutation.isPending ? "Booking..." : isAuthenticated ? "Book" : "Sign in to book"}
            </button>
            <p style={{ textAlign:"center", fontSize:"13px", color: subText, margin:"0 0 16px" }}>You won't be charged yet</p>

            {nights > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px", borderTop:"1px solid " + border, paddingTop:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"14px", color: text }}>
                  <span>{"$" + listing.pricePerNight.toLocaleString()} x {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>{"$" + subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"14px", color: text }}>
                  <span>Service fee</span>
                  <span>{"$" + serviceFee.toLocaleString()}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"15px", fontWeight:700, color: text, borderTop:"1px solid " + border, paddingTop:"12px" }}>
                  <span>Total</span>
                  <span>{"$" + total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;


