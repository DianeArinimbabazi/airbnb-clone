import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../../../shared/context/ThemeContext";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import {
  FiHome, FiMessageSquare, FiStar, FiCalendar, FiUser, FiSettings,
  FiLogOut, FiCheck, FiEye, FiSearch, FiShield, FiClock, FiDollarSign,
  FiTrash, FiList, FiSend
} from "react-icons/fi";

interface Booking {
  id: string; status: "PENDING"|"CONFIRMED"|"CANCELLED"|"COMPLETED";
  checkIn: string; checkOut: string; totalPrice: number;
  guest: { id: string; name: string; email: string };
  listing: { id: string; title: string; location: string };
}
interface Listing {
  id: string; title: string; location: string; type: string;
  pricePerNight: number; rating?: number;
  host?: { name: string };
  photos?: { url: string }[];
}
interface User { id: string; name: string; email: string; role: string; createdAt: string; }

type Section = "dashboard"|"messages"|"alllistings"|"reviews"|"bookings"|"moderation"|"settings"|"users";

function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"}); }
function initials(name: string) { return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }

const STATUS: Record<string, {label:string;color:string;bg:string}> = {
  PENDING:   {label:"Pending",   color:"#854f0b", bg:"#faeeda"},
  CONFIRMED: {label:"Approved",  color:"#3b6d11", bg:"#eaf3de"},
  CANCELLED: {label:"Rejected",  color:"#a32d2d", bg:"#fcebeb"},
  COMPLETED: {label:"Completed", color:"#185fa5", bg:"#e6f1fb"},
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState<Section>("dashboard");
  const [msgDraft, setMsgDraft] = useState("");
  const [settingsForm, setSettingsForm] = useState({ name: user?.name??"", email: user?.email??"" });

  const card=dark?"#1a1a1a":"#ffffff", bg=dark?"#111111":"#f7f7f5";
  const text=dark?"#f0f0f0":"#111111", sub=dark?"#888888":"#666666";
  const border=dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)";
  const inputBg=dark?"#2a2a2a":"#f7f7f5", accent="#e8442a";

  const { data: bookings=[], isLoading } = useQuery<Booking[]>({
    queryKey: ["admin","bookings"],
    queryFn: async () => { const r = await api.get<any>("/bookings?limit=100"); return r.data??r??[]; },
  });
  const { data: listings=[] } = useQuery<Listing[]>({
    queryKey: ["admin","listings"],
    queryFn: async () => { const r = await api.get<any>("/listings?limit=200"); return r.data??r??[]; },
  });
  const { data: users=[] } = useQuery<User[]>({
    queryKey: ["admin","users"],
    queryFn: async () => { const r = await api.get<any>("/users"); return Array.isArray(r)?r:(r.data??[]); },
  });

  const approveMutation = useMutation({
    mutationFn: (id:string) => api.patch(`/bookings/${id}/status`,{status:"CONFIRMED"}),
    onSuccess: () => { toast.success("Booking approved"); qc.invalidateQueries({queryKey:["admin"]}); },
    onError: (e:any) => toast.error(e?.message||"Failed"),
  });
  const rejectMutation = useMutation({
    mutationFn: (id:string) => api.patch(`/bookings/${id}/status`,{status:"CANCELLED"}),
    onSuccess: () => { toast.success("Booking rejected"); qc.invalidateQueries({queryKey:["admin"]}); },
    onError: (e:any) => toast.error(e?.message||"Failed"),
  });
  const deleteListingMutation = useMutation({
    mutationFn: (id:string) => api.delete(`/listings/${id}`),
    onSuccess: () => { toast.success("Listing deleted"); qc.invalidateQueries({queryKey:["admin","listings"]}); },
    onError: (e:any) => toast.error(e?.message||"Failed"),
  });

  const pending   = bookings.filter(b=>b.status==="PENDING").length;
  const approved  = bookings.filter(b=>b.status==="CONFIRMED").length;
  const revenue   = bookings.filter(b=>b.status!=="CANCELLED").reduce((s,b)=>s+b.totalPrice,0);
  const filteredBookings = bookings.filter(b=>
    b.guest?.name?.toLowerCase().includes(search.toLowerCase())||
    b.listing?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredListings = listings.filter(l=>
    l.title?.toLowerCase().includes(search.toLowerCase())||
    l.location?.toLowerCase().includes(search.toLowerCase())
  );
  const ratedListings = listings.filter(l=>typeof l.rating==="number");
  const avgRating = ratedListings.length
    ? (ratedListings.reduce((s,l)=>s+l.rating!,0)/ratedListings.length).toFixed(1) : "—";

  const navSections = [
    { label:"Main menu", items:[
      { id:"dashboard",   icon:<FiHome size={15}/>,        label:"Dashboard" },
      { id:"messages",    icon:<FiMessageSquare size={15}/>,label:"Messages" },
    ]},
    { label:"Listing", items:[
      { id:"alllistings", icon:<FiList size={15}/>,        label:"All listings" },
      { id:"reviews",     icon:<FiStar size={15}/>,        label:"Reviews" },
      { id:"bookings",    icon:<FiCalendar size={15}/>,    label:"Bookings" },
      { id:"moderation",  icon:<FiShield size={15}/>,      label:"Moderation" },
      { id:"users",       icon:<FiUser size={15}/>,        label:"Users" },
    ]},
    { label:"Account", items:[
      { id:"settings",    icon:<FiSettings size={15}/>,    label:"Settings" },
      { id:"logout",      icon:<FiLogOut size={15}/>,      label:"Log out", action:()=>{ logout(); navigate("/"); } },
    ]},
  ];

  const NavItem = ({ id, icon, label, action }: { id:string; icon:React.ReactNode; label:string; action?:()=>void }) => {
    const active = activeNav === id;
    return (
      <div onClick={()=>{ if(action) action(); else setActiveNav(id as Section); }}
        style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 20px", fontSize:"13px", cursor:"pointer", borderRight:active?`3px solid ${accent}`:"3px solid transparent", background:active?(dark?"#2a1008":"#fff1ef"):"transparent", color:active?accent:sub, fontWeight:active?600:400 }}>
        {icon}<span>{label}</span>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"Outfit, Segoe UI, sans-serif", display:"flex", minHeight:"100vh", background:bg }}>
      {/* Sidebar */}
      <div style={{ width:"220px", flexShrink:0, background:card, borderRight:`1px solid ${border}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        <div onClick={()=>navigate("/")} style={{ padding:"18px 20px 14px", fontSize:"20px", fontWeight:800, borderBottom:`1px solid ${border}`, cursor:"pointer", color:text }}>
          DIA<span style={{color:accent}}>VELA</span>
        </div>
        {navSections.map(section=>(
          <div key={section.label} style={{ padding:"14px 0 4px" }}>
            <p style={{ fontSize:"10px", color:sub, padding:"0 20px 6px", textTransform:"uppercase", letterSpacing:".06em" }}>{section.label}</p>
            {section.items.map(item=><NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} action={(item as any).action} />)}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"16px 20px", borderTop:`1px solid ${border}`, display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"12px", fontWeight:700, flexShrink:0 }}>{user?.name?.[0]?.toUpperCase()??"A"}</div>
          <div style={{minWidth:0}}>
            <p style={{ fontSize:"12px", fontWeight:600, color:text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name??"Admin"}</p>
            <p style={{ fontSize:"11px", color:sub, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Topbar */}
        <div style={{ background:card, borderBottom:`1px solid ${border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:bg, border:`1px solid ${border}`, borderRadius:"10px", padding:"7px 12px", width:"240px" }}>
            <FiSearch size={13} color={sub}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ border:"none", background:"transparent", fontSize:"13px", color:text, outline:"none", width:"100%" }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {[{label:"Home",to:"/"},{label:"Listings",to:"/listings"},{label:"Profile",to:"/profile"}].map(({label,to})=>(
              <span key={label} onClick={()=>navigate(to)} style={{ fontSize:"13px", color:sub, cursor:"pointer" }}>{label}</span>
            ))}
          </div>
        </div>

        <div style={{ padding:"24px", flex:1, overflowY:"auto" }}>

          {/* Stats row — always visible */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
            {[
              { label:"Total Bookings", value:bookings.length,   icon:<FiCalendar size={18}/>, ic:{bg:"#fff1ef",color:accent} },
              { label:"Pending",        value:pending,           icon:<FiClock size={18}/>,    ic:{bg:"#faeeda",color:"#854f0b"}, red:true },
              { label:"Approved",       value:approved,          icon:<FiCheck size={18}/>,    ic:{bg:"#eaf3de",color:"#3b6d11"} },
              { label:"Revenue",        value:`$${revenue.toLocaleString()}`, icon:<FiDollarSign size={18}/>, ic:{bg:"#e6f1fb",color:"#185fa5"} },
            ].map(({label,value,icon,ic,red})=>(
              <div key={label} style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontSize:"11px", color:sub, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:".04em" }}>{label}</p>
                  <p style={{ fontSize:"22px", fontWeight:700, color:red?accent:text, margin:0 }}>{value}</p>
                </div>
                <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:ic.bg, display:"flex", alignItems:"center", justifyContent:"center", color:ic.color }}>{icon}</div>
              </div>
            ))}
          </div>

          {/* ── DASHBOARD ── */}
          {activeNav==="dashboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              <div style={{ background:`linear-gradient(135deg,#f97316,${accent})`, borderRadius:"16px", padding:"24px 28px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <h2 style={{ fontSize:"18px", fontWeight:700, margin:"0 0 6px" }}>Welcome back, {user?.name??"Admin"}!</h2>
                  <p style={{ fontSize:"13px", opacity:.85, margin:"0 0 14px" }}>Manage bookings, listings, users and platform health.</p>
                  <button onClick={()=>setActiveNav("bookings")} style={{ background:"#fff", color:accent, border:"none", borderRadius:"8px", padding:"8px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>View bookings</button>
                </div>
                <FiShield size={64} style={{opacity:.25}}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
                {[
                  { label:"Total Listings", value:listings.length, icon:"🏠", action:()=>setActiveNav("alllistings") },
                  { label:"Total Users",    value:users.length,    icon:"👥", action:()=>setActiveNav("users") },
                  { label:"Avg Rating",     value:avgRating,       icon:"⭐", action:()=>setActiveNav("reviews") },
                ].map(({label,value,icon,action})=>(
                  <div key={label} onClick={action} style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", padding:"20px", cursor:"pointer" }}>
                    <div style={{ fontSize:"28px", marginBottom:"8px" }}>{icon}</div>
                    <p style={{ fontSize:"11px", color:sub, margin:"0 0 4px", textTransform:"uppercase" }}>{label}</p>
                    <p style={{ fontSize:"24px", fontWeight:800, color:text, margin:0 }}>{value}</p>
                  </div>
                ))}
              </div>
              {/* Recent bookings preview */}
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ margin:0, fontSize:"14px", fontWeight:700, color:text }}>Recent bookings</p>
                  <span onClick={()=>setActiveNav("bookings")} style={{ fontSize:"12px", color:accent, cursor:"pointer" }}>View all</span>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{background:bg}}>
                    {["Guest","Listing","Amount","Status"].map(h=>(
                      <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 16px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {bookings.slice(0,5).map(b=>{
                      const s=STATUS[b.status]??STATUS.COMPLETED;
                      return (
                        <tr key={b.id} style={{borderBottom:`1px solid ${border}`}}>
                          <td style={{padding:"11px 16px",fontSize:"13px",color:text}}>{b.guest?.name}</td>
                          <td style={{padding:"11px 16px",fontSize:"12px",color:sub}}>{b.listing?.title}</td>
                          <td style={{padding:"11px 16px",fontSize:"13px",fontWeight:600,color:text}}>${b.totalPrice}</td>
                          <td style={{padding:"11px 16px"}}><span style={{fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",background:s.bg,color:s.color}}>{s.label}</span></td>
                        </tr>
                      );
                    })}
                    {bookings.length===0&&<tr><td colSpan={4} style={{padding:"24px",textAlign:"center",color:sub,fontSize:"13px"}}>No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MESSAGES ── */}
          {activeNav==="messages" && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"16px", overflow:"hidden", display:"flex", height:"500px" }}>
              <div style={{ width:"260px", borderRight:`1px solid ${border}`, display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"14px 16px", borderBottom:`1px solid ${border}`, fontSize:"13px", fontWeight:700, color:text }}>Conversations</div>
                {bookings.slice(0,8).map((b,i)=>{
                  const colors=[accent,"#3b82f6","#10b981","#f59e0b","#8b5cf6"];
                  const color=colors[i%colors.length];
                  return (
                    <div key={b.id} style={{ padding:"12px 16px", display:"flex", gap:"10px", alignItems:"flex-start", borderBottom:`1px solid ${border}`, cursor:"pointer" }}>
                      <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"12px", fontWeight:700, flexShrink:0 }}>{initials(b.guest?.name??"G")}</div>
                      <div style={{minWidth:0}}>
                        <p style={{ margin:"0 0 2px", fontSize:"13px", fontWeight:600, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.guest?.name??"Guest"}</p>
                        <p style={{ margin:0, fontSize:"11px", color:sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.listing?.title}</p>
                      </div>
                    </div>
                  );
                })}
                {bookings.length===0&&<div style={{padding:"40px 16px",textAlign:"center",color:sub,fontSize:"13px"}}>No conversations yet</div>}
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, fontSize:"13px", fontWeight:600, color:text }}>
                  {bookings.length>0?`Chat with ${bookings[0].guest?.name} — ${bookings[0].listing?.title}`:"Select a conversation"}
                </div>
                <div style={{ flex:1, padding:"20px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"12px" }}>
                  {bookings.length>0?(
                    <>
                      <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
                        <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"10px", fontWeight:700 }}>{initials(bookings[0].guest?.name??"G")}</div>
                        <div style={{ background:inputBg, padding:"10px 14px", borderRadius:"18px 18px 18px 4px", fontSize:"13px", color:text, maxWidth:"65%" }}>Hi, I have a question about my booking for {bookings[0].listing?.title}.</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"row-reverse", gap:"8px", alignItems:"flex-end" }}>
                        <div style={{ background:accent, padding:"10px 14px", borderRadius:"18px 18px 4px 18px", fontSize:"13px", color:"#fff", maxWidth:"65%" }}>Hello! I am happy to help. What would you like to know?</div>
                      </div>
                    </>
                  ):(
                    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:sub, fontSize:"13px" }}>Messages will appear here</div>
                  )}
                </div>
                <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}`, display:"flex", gap:"8px" }}>
                  <input value={msgDraft} onChange={e=>setMsgDraft(e.target.value)} placeholder="Type a message..." style={{ flex:1, background:inputBg, border:`1px solid ${border}`, borderRadius:"10px", padding:"9px 14px", fontSize:"13px", color:text, outline:"none", fontFamily:"inherit" }}/>
                  <button onClick={()=>{ if(msgDraft.trim()){ toast.success("Message sent!"); setMsgDraft(""); } }} style={{ background:accent, color:"#fff", border:"none", borderRadius:"10px", padding:"9px 16px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"6px" }}><FiSend size={13}/>Send</button>
                </div>
              </div>
            </div>
          )}

          {/* ── ALL LISTINGS ── */}
          {activeNav==="alllistings" && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, fontSize:"14px", fontWeight:700, color:text }}>
                All listings ({listings.length} total)
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{background:bg}}>
                  {["#","Title","Location","Type","Price","Rating","Host","Action"].map(h=>(
                    <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredListings.length===0?(
                    <tr><td colSpan={8} style={{padding:"32px",textAlign:"center",color:sub,fontSize:"13px"}}>No listings found</td></tr>
                  ):filteredListings.map((l,i)=>(
                    <tr key={l.id} style={{borderBottom:`1px solid ${border}`}}>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{padding:"11px 14px",fontSize:"13px",fontWeight:600,color:text,maxWidth:"180px"}}>{l.title}</td>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{l.location}</td>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{l.type}</td>
                      <td style={{padding:"11px 14px",fontSize:"13px",fontWeight:600,color:text}}>${l.pricePerNight}</td>
                      <td style={{padding:"11px 14px"}}>
                        {typeof l.rating==="number"
                          ?<span style={{fontSize:"12px",fontWeight:600,color:"#92400e",background:"#faeeda",padding:"2px 8px",borderRadius:"999px"}}>★ {l.rating.toFixed(1)}</span>
                          :<span style={{fontSize:"12px",color:sub}}>—</span>}
                      </td>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{l.host?.name??"—"}</td>
                      <td style={{padding:"11px 14px"}}>
                        <div style={{display:"flex",gap:"6px"}}>
                          <button onClick={()=>navigate(`/listings/${l.id}`)} style={{background:bg,color:sub,border:`1px solid ${border}`,borderRadius:"6px",padding:"5px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"3px"}}><FiEye size={11}/></button>
                          <button onClick={()=>{ if(confirm(`Delete "${l.title}"?`)) deleteListingMutation.mutate(l.id); }} style={{background:"#fcebeb",color:"#a32d2d",border:"none",borderRadius:"6px",padding:"5px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"3px"}}><FiTrash size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeNav==="reviews" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
                {[
                  { label:"Avg Rating",     value:avgRating,        icon:"★" },
                  { label:"Rated Listings", value:ratedListings.length, icon:"🏠" },
                  { label:"Total Listings", value:listings.length,  icon:"📋" },
                ].map(({label,value,icon})=>(
                  <div key={label} style={{ background:card, border:`1px solid ${border}`, borderRadius:"16px", padding:"20px", display:"flex", alignItems:"center", gap:"16px" }}>
                    <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#fff1ef", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{icon}</div>
                    <div>
                      <p style={{ fontSize:"11px", color:sub, margin:"0 0 4px", textTransform:"uppercase" }}>{label}</p>
                      <p style={{ fontSize:"22px", fontWeight:800, color:accent, margin:0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{background:bg}}>
                    {["Listing","Location","Type","Rating"].map(h=>(
                      <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 16px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {ratedListings.length===0?(
                      <tr><td colSpan={4} style={{padding:"32px",textAlign:"center",color:sub,fontSize:"13px"}}>No reviews yet</td></tr>
                    ):ratedListings.map(l=>(
                      <tr key={l.id} style={{borderBottom:`1px solid ${border}`}}>
                        <td style={{padding:"12px 16px",fontSize:"13px",fontWeight:600,color:text}}>{l.title}</td>
                        <td style={{padding:"12px 16px",fontSize:"12px",color:sub}}>{l.location}</td>
                        <td style={{padding:"12px 16px",fontSize:"12px",color:sub}}>{l.type}</td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",gap:"2px",alignItems:"center"}}>
                            {[1,2,3,4,5].map(s=>(
                              <span key={s} style={{color:s<=Math.round(l.rating!)?"#f59e0b":"#e5e7eb",fontSize:"14px"}}>★</span>
                            ))}
                            <span style={{fontSize:"12px",color:sub,marginLeft:"6px"}}>{l.rating!.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeNav==="bookings" && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, fontSize:"14px", fontWeight:700, color:text }}>All bookings</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{background:bg}}>
                  {["#","Guest","Listing","Check-in","Amount","Status","Action"].map(h=>(
                    <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {isLoading?(
                    <tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:sub}}>Loading...</td></tr>
                  ):filteredBookings.length===0?(
                    <tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:sub}}>No bookings found</td></tr>
                  ):filteredBookings.map((b,i)=>{
                    const s=STATUS[b.status]??STATUS.COMPLETED;
                    const isPending=b.status==="PENDING";
                    return (
                      <tr key={b.id} style={{borderBottom:`1px solid ${border}`}}>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{String(i+1).padStart(2,"0")}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"10px",fontWeight:700}}>{initials(b.guest?.name??"G")}</div>
                            <span style={{fontSize:"13px",color:text}}>{b.guest?.name??"Guest"}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{b.listing?.title}</td>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{fmt(b.checkIn)}</td>
                        <td style={{padding:"11px 14px",fontSize:"13px",fontWeight:600,color:text}}>${b.totalPrice}</td>
                        <td style={{padding:"11px 14px"}}><span style={{fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",background:s.bg,color:s.color}}>{s.label}</span></td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",gap:"6px"}}>
                            {isPending&&<>
                              <button onClick={()=>approveMutation.mutate(b.id)} style={{background:accent,color:"#fff",border:"none",borderRadius:"6px",padding:"5px 12px",fontSize:"11px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Approve</button>
                              <button onClick={()=>rejectMutation.mutate(b.id)} style={{background:bg,color:sub,border:`1px solid ${border}`,borderRadius:"6px",padding:"5px 12px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit"}}>Reject</button>
                            </>}
                            <button onClick={()=>navigate(`/listings/${b.listing?.id}`)} style={{background:bg,color:sub,border:`1px solid ${border}`,borderRadius:"6px",padding:"5px 10px",fontSize:"11px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"3px"}}><FiEye size={11}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── MODERATION ── */}
          {activeNav==="moderation" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, fontSize:"14px", fontWeight:700, color:text }}>Pending approvals</div>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{background:bg}}>
                    {["Guest","Listing","Check-in","Check-out","Amount","Action"].map(h=>(
                      <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {bookings.filter(b=>b.status==="PENDING").length===0?(
                      <tr><td colSpan={6} style={{padding:"32px",textAlign:"center",color:sub,fontSize:"13px"}}>
                        <div style={{fontSize:"32px",marginBottom:"8px"}}>✅</div>
                        All caught up — no pending approvals
                      </td></tr>
                    ):bookings.filter(b=>b.status==="PENDING").map((b)=>(
                      <tr key={b.id} style={{borderBottom:`1px solid ${border}`}}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"10px",fontWeight:700}}>{initials(b.guest?.name??"G")}</div>
                            <div>
                              <p style={{margin:0,fontSize:"13px",color:text,fontWeight:500}}>{b.guest?.name}</p>
                              <p style={{margin:0,fontSize:"11px",color:sub}}>{b.guest?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{b.listing?.title}</td>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{fmt(b.checkIn)}</td>
                        <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{fmt(b.checkOut)}</td>
                        <td style={{padding:"11px 14px",fontSize:"13px",fontWeight:600,color:text}}>${b.totalPrice}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",gap:"6px"}}>
                            <button onClick={()=>approveMutation.mutate(b.id)} style={{background:accent,color:"#fff",border:"none",borderRadius:"6px",padding:"6px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Approve</button>
                            <button onClick={()=>rejectMutation.mutate(b.id)} style={{background:"#fcebeb",color:"#a32d2d",border:"none",borderRadius:"6px",padding:"6px 14px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeNav==="users" && (
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"14px", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${border}`, fontSize:"14px", fontWeight:700, color:text }}>All users ({users.length})</div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{background:bg}}>
                  {["#","Name","Email","Role","Joined"].map(h=>(
                    <th key={h} style={{ fontSize:"11px", fontWeight:600, color:sub, padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${border}`, textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {users.length===0?(
                    <tr><td colSpan={5} style={{padding:"32px",textAlign:"center",color:sub}}>Loading users...</td></tr>
                  ):users.map((u,i)=>(
                    <tr key={u.id} style={{borderBottom:`1px solid ${border}`}}>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{String(i+1).padStart(2,"0")}</td>
                      <td style={{padding:"11px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"10px",fontWeight:700}}>{initials(u.name??"U")}</div>
                          <span style={{fontSize:"13px",color:text,fontWeight:500}}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{u.email}</td>
                      <td style={{padding:"11px 14px"}}>
                        <span style={{fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",
                          background:u.role==="ADMIN"?"#faeeda":u.role==="HOST"?"#eaf3de":"#e6f1fb",
                          color:u.role==="ADMIN"?"#854f0b":u.role==="HOST"?"#3b6d11":"#185fa5"
                        }}>{u.role}</span>
                      </td>
                      <td style={{padding:"11px 14px",fontSize:"12px",color:sub}}>{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeNav==="settings" && (
            <div style={{ maxWidth:"560px", display:"flex", flexDirection:"column", gap:"20px" }}>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px" }}>
                <p style={{ fontSize:"15px", fontWeight:700, color:text, margin:"0 0 20px" }}>Admin profile</p>
                {[
                  { label:"Full name",     key:"name",  value:settingsForm.name,  placeholder:"Admin name" },
                  { label:"Email address", key:"email", value:settingsForm.email, placeholder:"admin@email.com" },
                ].map(({label,key,value,placeholder})=>(
                  <div key={key} style={{marginBottom:"16px"}}>
                    <label style={{fontSize:"12px",fontWeight:600,color:sub,display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:".04em"}}>{label}</label>
                    <input value={value} onChange={e=>setSettingsForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
                      style={{width:"100%",background:inputBg,border:`1px solid ${border}`,borderRadius:"10px",padding:"10px 14px",fontSize:"13px",color:text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  </div>
                ))}
                <button onClick={()=>{ navigate("/profile"); toast.success("Opening profile editor..."); }}
                  style={{background:accent,color:"#fff",border:"none",borderRadius:"10px",padding:"11px 24px",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  Save changes
                </button>
              </div>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px" }}>
                <p style={{ fontSize:"15px", fontWeight:700, color:text, margin:"0 0 16px" }}>Platform settings</p>
                {["Email notifications","Booking auto-approval","Maintenance mode","New user alerts"].map(label=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                    <span style={{fontSize:"13px",color:text}}>{label}</span>
                    <div style={{width:"36px",height:"20px",borderRadius:"10px",background:label==="Maintenance mode"?(dark?"#333":"#ddd"):accent,cursor:"pointer",position:"relative"}}>
                      <div style={{position:"absolute",right:label==="Maintenance mode"?"auto":"2px",left:label==="Maintenance mode"?"2px":"auto",top:"2px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff"}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:"16px", padding:"24px" }}>
                <p style={{ fontSize:"15px", fontWeight:700, color:text, margin:"0 0 16px" }}>Account</p>
                <div style={{display:"flex",gap:"10px"}}>
                  <button onClick={()=>{ logout(); navigate("/"); }} style={{background:"#fcebeb",color:"#a32d2d",border:"none",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Log out</button>
                  <button onClick={()=>navigate("/profile")} style={{background:bg,color:sub,border:`1px solid ${border}`,borderRadius:"10px",padding:"10px 20px",fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>Edit full profile</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


