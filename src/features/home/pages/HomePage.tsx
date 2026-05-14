import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight:"100vh", fontFamily:"inherit" }}>
      <div style={{
        position:"relative", minHeight:"100vh",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(rgba(0,0,0,0.52),rgba(0,0,0,0.52)), url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600') center/cover no-repeat",
        padding:"80px 24px 40px"
      }}>

        {/* Auth buttons top-right */}
        <div style={{ position:"absolute", top:"24px", right:"36px", display:"flex", gap:"12px", zIndex:10 }}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/login")}
                style={{ padding:"10px 26px", borderRadius:"8px", border:"2px solid #fff", background:"transparent", color:"#fff", fontWeight:700, fontSize:"15px", cursor:"pointer", fontFamily:"inherit" }}>
                Sign In
              </button>
              <button onClick={() => navigate("/signup")}
                style={{ padding:"10px 26px", borderRadius:"8px", border:"none", background:"#FF385C", color:"#fff", fontWeight:700, fontSize:"15px", cursor:"pointer", fontFamily:"inherit" }}>
                Sign Up
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/listings")}
              style={{ padding:"10px 26px", borderRadius:"8px", border:"none", background:"#FF385C", color:"#fff", fontWeight:700, fontSize:"15px", cursor:"pointer", fontFamily:"inherit" }}>
              Browse Listings
            </button>
          )}
        </div>

        {/* Hero text */}
        <p style={{ fontSize:"13px", fontWeight:700, letterSpacing:"0.15em", color:"rgba(255,255,255,0.75)", textTransform:"uppercase", marginBottom:"20px", textAlign:"center" }}>
          WE ARE #1 ON THE MARKET
        </p>
        <h1 style={{ fontSize:"clamp(36px,6vw,68px)", fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:"20px", maxWidth:"800px", textAlign:"center" }}>
          We're Here To Help You <br />
          <em style={{ fontStyle:"italic", color:"#FF385C", borderBottom:"3px solid #FF385C" }}>Navigate</em> While Traveling
        </h1>
        <p style={{ fontSize:"18px", color:"rgba(255,255,255,0.8)", marginBottom:"44px", maxWidth:"480px", textAlign:"center" }}>
          You'll get comprehensive results based on the provided location.
        </p>

        {/* Search bar */}
        <div style={{ display:"flex", alignItems:"center", background:"#fff", borderRadius:"50px", padding:"8px 8px 8px 28px", width:"100%", maxWidth:"720px", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
          <input placeholder="What are you looking for?"
            onKeyDown={e => { if (e.key === "Enter") navigate(isAuthenticated ? "/listings" : "/login"); }}
            style={{ flex:1, border:"none", outline:"none", fontSize:"16px", background:"transparent", fontFamily:"inherit", color:"#222" }} />
          <div style={{ width:"1px", height:"28px", background:"#ddd", margin:"0 16px" }} />
          <span style={{ fontSize:"15px", color:"#888", marginRight:"16px" }}>Location</span>
          <button onClick={() => navigate(isAuthenticated ? "/listings" : "/login")}
            style={{ padding:"14px 28px", background:"#FF385C", color:"#fff", border:"none", borderRadius:"40px", fontWeight:700, fontSize:"15px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            Search places
          </button>
        </div>

        {/* Place quick links */}
        <div style={{ display:"flex", gap:"12px", marginTop:"28px", flexWrap:"wrap", justifyContent:"center" }}>
          {["Kigali","Gisenyi","Musanze","Nyungwe","Kibuye"].map(place => (
            <button key={place}
              onClick={() => navigate(isAuthenticated ? `/listings?q=${place}` : "/login")}
              style={{ padding:"8px 20px", borderRadius:"40px", border:"1.5px solid rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:"14px", fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              {place}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:"48px", marginTop:"60px", paddingTop:"36px", borderTop:"1px solid rgba(255,255,255,0.2)" }}>
          {[["500+","Listings"],["200+","Hosts"],["10k+","Happy Guests"]].map(([num,label]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <p style={{ fontSize:"32px", fontWeight:800, color:"#fff", margin:0 }}>{num}</p>
              <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)", margin:"4px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



