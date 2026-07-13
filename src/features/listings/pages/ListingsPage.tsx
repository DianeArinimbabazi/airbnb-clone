import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useStore } from "../../../store/StoreContext";
import { useListings } from "../hooks/useListings";
import { useFavorites } from "../hooks/useFavorites";
import { useTheme } from "../../../shared/context/ThemeContext";
import ListingCard from "../components/ListingCard";
import { Spinner } from "../../../shared/components/Spinner";
import { useSearchParams } from "react-router-dom";
import { FaHome, FaUmbrellaBeach, FaMountain, FaCouch } from "react-icons/fa";
import { FiGrid, FiMap } from "react-icons/fi";

const ListingsMapView = lazy(() => import("../components/ListingsMapView"));

const CATEGORIES = [
  { value: "All",       label: "All",       icon: FaHome },
  { value: "HOUSE",     label: "House",     icon: FaHome },
  { value: "VILLA",     label: "Villa",     icon: FaUmbrellaBeach },
  { value: "CABIN",     label: "Cabin",     icon: FaMountain },
  { value: "APARTMENT", label: "Apartment", icon: FaCouch },
];

export default function ListingsPage() {
  const { data: listings = [], isLoading, isFetching } = useListings();
  const { state, dispatch } = useStore();
  const { isSaved, count: savedCount } = useFavorites();
  const { dark } = useTheme();
  const [savedOnly, setSavedOnly] = useState(false);
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid"|"map">("grid");
  const [searchParams] = useSearchParams();

  const text = dark ? "#f0f0f0" : "#222";
  const sub = dark ? "#888" : "#717171";
  const border = dark ? "rgba(255,255,255,0.08)" : "#ebebeb";
  const btnBg = dark ? "#2a2a2a" : "#fff";

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    dispatch({ type: "SET_FILTER", payload: q });
  }, [searchParams, dispatch]);

  const filtered = useMemo(() => {
    let result = listings;
    if (state.filter?.trim()) {
      const q = state.filter.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
      );
    }
    if (category !== "All") result = result.filter(l => l.type === category);
    if (savedOnly) result = result.filter(l => isSaved(l.id));
    result = result.filter(l => (l as any).photos && (l as any).photos.length > 0);
    return result;
  }, [listings, state.filter, category, savedOnly, isSaved]);

  if (isLoading) return <Spinner />;

  return (
    <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px 60px" }}>
      {state.filter && (
        <div style={{ padding:"16px 0 0", display:"flex", alignItems:"center", gap:"12px" }}>
          <p style={{ fontSize:"15px", color: text, margin:0 }}>
            Showing results for <strong>"{state.filter}"</strong>
          </p>
          <button onClick={() => dispatch({ type:"SET_FILTER", payload:"" })}
            style={{ background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"20px", padding:"4px 12px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Clear
          </button>
        </div>
      )}
      <div style={{ display:"flex", gap:"8px", overflowX:"auto", padding:"16px 0", borderBottom:`1px solid ${border}`, marginBottom:"24px", scrollbarWidth:"none", alignItems:"center" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 18px", borderRadius:"24px", border:"1.5px solid", borderColor: category === cat.value ? "#FF385C" : border, background: category === cat.value ? "#FF385C" : btnBg, color: category === cat.value ? "#fff" : sub, fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
            <cat.icon style={{ width:"16px", height:"16px" }} />
            {cat.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color: sub, cursor:"pointer", whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} />
            Saved {savedCount > 0 && `(${savedCount})`}
          </label>
          <div style={{ display:"flex", border:`1.5px solid ${border}`, borderRadius:"24px", overflow:"hidden" }}>
            <button onClick={() => setViewMode("grid")} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", border:"none", background: viewMode==="grid" ? "#FF385C" : btnBg, color: viewMode==="grid" ? "#fff" : sub, fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
              <FiGrid size={13}/> Grid
            </button>
            <button onClick={() => setViewMode("map")} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", border:"none", background: viewMode==="map" ? "#FF385C" : btnBg, color: viewMode==="map" ? "#fff" : sub, fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
              <FiMap size={13}/> Map
            </button>
          </div>
          <button onClick={() => { dispatch({ type:"RESET" }); setCategory("All"); setSavedOnly(false); }}
            style={{ padding:"8px 16px", borderRadius:"24px", border:`1.5px solid ${border}`, background: btnBg, fontWeight:600, fontSize:"13px", color: sub, cursor:"pointer", fontFamily:"inherit" }}>
            Clear all
          </button>
        </div>
      </div>
      {isFetching && !isLoading && (
        <p style={{ fontSize:"13px", color:"#FF385C", marginBottom:"12px", fontWeight:500 }}>Refreshing...</p>
      )}
      <p style={{ fontSize:"14px", color: sub, marginBottom:"20px" }}>
        {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
        {viewMode === "map" && "  click a pin to explore"}
      </p>
      {viewMode === "map" ? (
        <Suspense fallback={<Spinner />}>
          <ListingsMapView listings={filtered} />
        </Suspense>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <h2 style={{ fontSize:"22px", fontWeight:700, color: text, margin:"0 0 8px" }}>No listings found</h2>
          <p style={{ color: sub, marginBottom:"20px" }}>Try adjusting your filters.</p>
          <button onClick={() => { dispatch({ type:"RESET" }); setCategory("All"); setSavedOnly(false); }}
            style={{ padding:"12px 24px", background:"#FF385C", color:"#fff", border:"none", borderRadius:"10px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            Show all listings
          </button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:"24px" }}>
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}


