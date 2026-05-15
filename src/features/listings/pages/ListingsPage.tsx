import { useState, useMemo, useEffect } from "react";
import { useStore } from "../../../store/StoreContext";
import { useListings } from "../hooks/useListings";
import { useFavorites } from "../hooks/useFavorites";
import ListingCard from "../components/ListingCard";
import { Spinner } from "../../../shared/components/Spinner";
import { useSearchParams } from "react-router-dom";
import { FaHome, FaUmbrellaBeach, FaMountain, FaCouch, FaSearch } from 'react-icons/fa';


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
  const [savedOnly, setSavedOnly] = useState(false);
  const [category, setCategory] = useState("All");
  const [searchParams] = useSearchParams();

  // Read search query from URL on mount
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
    result = result.filter(l => l.photos && l.photos.length > 0);
    return result;
  }, [listings, state.filter, category, savedOnly, isSaved]);

  if (isLoading) return <Spinner />;

  return (
    <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px 60px" }}>

      {/* Search indicator */}
      {state.filter && (
        <div style={{ padding:"16px 0 0", display:"flex", alignItems:"center", gap:"12px" }}>
          <p style={{ fontSize:"15px", color:"#222", margin:0 }}>
            Showing results for <strong>"{state.filter}"</strong>
          </p>
          <button onClick={() => dispatch({ type:"SET_FILTER", payload:"" })}
            style={{ background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"20px", padding:"4px 12px", fontSize:"12px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Clear
          </button>
        </div>
      )}

      {/* Category filter bar */}
      <div style={{ display:"flex", gap:"8px", overflowX:"auto", padding:"16px 0", borderBottom:"1px solid #ebebeb", marginBottom:"24px", scrollbarWidth:"none" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 18px", borderRadius:"24px", border:"1.5px solid", borderColor: category === cat.value ? "#FF385C" : "#ddd", background: category === cat.value ? "#FF385C" : "#fff", color: category === cat.value ? "#fff" : "#555", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>
            <cat.icon style={{ width: '16px', height: '16px' }} />
            {cat.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:600, color:"#555", cursor:"pointer", whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} />
            Saved {savedCount > 0 && `(${savedCount})`}
          </label>
          <button onClick={() => { dispatch({ type:"RESET" }); setCategory("All"); setSavedOnly(false); }}
            style={{ padding:"8px 16px", borderRadius:"24px", border:"1.5px solid #ddd", background:"#fff", fontWeight:600, fontSize:"13px", color:"#555", cursor:"pointer", fontFamily:"inherit" }}>
            Clear all
          </button>
        </div>
      </div>

      {isFetching && !isLoading && (
        <p style={{ fontSize:"13px", color:"#FF385C", marginBottom:"12px", fontWeight:500 }}>Refreshing...</p>
      )}

      <p style={{ fontSize:"14px", color:"#717171", marginBottom:"20px" }}>
        {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <p style={{ fontSize:"48px", marginBottom:"16px" }}><FaSearch /></p>
          <h2 style={{ fontSize:"22px", fontWeight:700, color:"#222", margin:"0 0 8px" }}>No listings found</h2>
          <p style={{ color:"#717171", marginBottom:"20px" }}>
            {state.filter ? `No results for "${state.filter}". Try a different search.` : "Try adjusting your filters."}
          </p>
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








