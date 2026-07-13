import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const query = searchQuery.trim();
    navigate(`/listings${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"inherit" }}>
      <div style={{
        position:"relative", minHeight:"100vh",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(rgba(0,0,0,0.52),rgba(0,0,0,0.52)), url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600') center/cover no-repeat",
        padding:"clamp(40px, 10vw, 80px) 16px"
      }}>

        {/* Hero text */}
        <p style={{ fontSize:"clamp(11px, 2.5vw, 13px)", fontWeight:700, letterSpacing:"0.15em", color:"rgba(255,255,255,0.75)", textTransform:"uppercase", marginBottom:"clamp(12px, 3vw, 20px)", textAlign:"center" }}>
          DIAVELA  Trusted travel experiences in Rwanda
        </p>
        <h1 style={{ fontSize:"clamp(28px, 5vw, 68px)", fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:"clamp(12px, 3vw, 20px)", maxWidth:"800px", textAlign:"center", padding:"0 8px" }}>
          Discover Rwanda retreats <br />
          with <em style={{ fontStyle:"italic", color:"#FF385C", borderBottom:"3px solid #FF385C" }}>DIAVELA</em>
        </h1>
        <p style={{ fontSize:"clamp(15px, 3vw, 18px)", color:"rgba(255,255,255,0.8)", marginBottom:"clamp(28px, 5vw, 44px)", maxWidth:"480px", textAlign:"center", padding:"0 8px" }}>
          Book verified Rwanda listings, stay with trusted hosts, and travel with confidence.
        </p>

        {/* Search bar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", alignItems:"stretch", width:"100%", maxWidth:"720px", padding:"0 8px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", background:"#fff", borderRadius:"50px", padding:"12px 16px", boxShadow:"0 8px 40px rgba(0,0,0,0.3)", gap:"12px" }}>
            <input placeholder="Search DIAVELA stays..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              style={{ flex:1, minWidth:"100px", border:"none", outline:"none", fontSize:"clamp(14px, 2vw, 16px)", background:"transparent", fontFamily:"inherit", color:"#222", padding:"0" }} />
            <button onClick={handleSearch}
              style={{ padding:"12px 24px", background:"#FF385C", color:"#fff", border:"none", borderRadius:"40px", fontWeight:700, fontSize:"clamp(13px, 2vw, 15px)", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              Search
            </button>
          </div>
        </div>

        {/* Place quick links */}
        <div style={{ display:"flex", gap:"clamp(6px, 2vw, 12px)", marginTop:"clamp(20px, 5vw, 28px)", flexWrap:"wrap", justifyContent:"center" }}>
          {["Kigali","Gisenyi","Musanze","Nyungwe","Kibuye"].map(place => (
            <button key={place}
              onClick={() => navigate(`/listings?q=${place}`)}
              style={{ padding:"8px clamp(12px, 3vw, 20px)", borderRadius:"40px", border:"1.5px solid rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:"clamp(12px, 2vw, 14px)", fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              {place}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"clamp(24px, 5vw, 48px)", marginTop:"clamp(40px, 8vw, 60px)", paddingTop:"clamp(20px, 5vw, 36px)", borderTop:"1px solid rgba(255,255,255,0.2)", width:"100%" }}>
          {[["500+","Listings"],["200+","Hosts"],["10k+","Happy Guests"]].map(([num,label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <p style={{ fontSize:"clamp(24px, 4vw, 32px)", fontWeight:800, color:"#fff", margin:0 }}>{num}</p>
              <p style={{ fontSize:"clamp(11px, 2vw, 13px)", color:"rgba(255,255,255,0.6)", margin:"4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




