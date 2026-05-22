import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { FiArrowLeft, FiSend, FiMessageSquare, FiSearch } from "react-icons/fi";

interface Message {
  id: string; senderId: string; senderName: string;
  text: string; timestamp: Date; read: boolean;
}
interface Conversation {
  id: string; participantId: string; participantName: string;
  participantInitial: string; participantColor: string;
  listingTitle: string; messages: Message[]; lastActivity: Date;
}

const COLORS = ["#e8442a","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899"];
function colorFor(id: string) {
  return COLORS[id.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % COLORS.length];
}

function makeDemoConvs(userId: string, userName: string): Conversation[] {
  const now = new Date();
  const min = (n: number) => new Date(now.getTime() - n * 60000);
  return [
    { id:"conv-1", participantId:"host-1", participantName:"Maria Santos", participantInitial:"M", participantColor:colorFor("host-1"), listingTitle:"Oceanfront Villa with Infinity Pool", lastActivity:min(5),
      messages:[
        {id:"m1",senderId:"host-1",senderName:"Maria Santos",text:"Hi! Thanks for booking the villa. Do you have any questions before your arrival?",timestamp:min(60),read:true},
        {id:"m2",senderId:userId,senderName:userName,text:"Hello! Yes, what time is check-in available?",timestamp:min(45),read:true},
        {id:"m3",senderId:"host-1",senderName:"Maria Santos",text:"Check-in is from 3 PM onwards. I'll send you the gate code the morning of your arrival.",timestamp:min(30),read:true},
        {id:"m4",senderId:userId,senderName:userName,text:"Perfect, thank you!",timestamp:min(20),read:true},
        {id:"m5",senderId:"host-1",senderName:"Maria Santos",text:"Looking forward to hosting you! Let me know if you need anything else.",timestamp:min(5),read:false},
      ]},
    { id:"conv-2", participantId:"host-2", participantName:"James Okafor", participantInitial:"J", participantColor:colorFor("host-2"), listingTitle:"Cozy Mountain Cabin with Hot Tub", lastActivity:min(120),
      messages:[
        {id:"m6",senderId:"host-2",senderName:"James Okafor",text:"Welcome! The cabin is fully stocked with firewood and essentials.",timestamp:min(180),read:true},
        {id:"m7",senderId:userId,senderName:userName,text:"Wonderful! Is the hot tub ready to use on arrival?",timestamp:min(150),read:true},
        {id:"m8",senderId:"host-2",senderName:"James Okafor",text:"Yes, it will be heated and waiting for you!",timestamp:min(120),read:true},
      ]},
    { id:"conv-3", participantId:"host-3", participantName:"Yuki Tanaka", participantInitial:"Y", participantColor:colorFor("host-3"), listingTitle:"Minimalist Tokyo Apartment", lastActivity:min(1440),
      messages:[
        {id:"m9",senderId:"host-3",senderName:"Yuki Tanaka",text:"Konnichiwa! I left a guide to the neighborhood on the kitchen table.",timestamp:min(1440),read:true},
        {id:"m10",senderId:userId,senderName:userName,text:"Arigatou! The apartment is beautiful.",timestamp:min(1380),read:true},
      ]},
  ];
}

function fmt(date: Date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  return date.toLocaleDateString([],{month:"short",day:"numeric"});
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dark } = useTheme();
  const bg=dark?"#111111":"#f7f7f5", card=dark?"#1a1a1a":"#ffffff", text=dark?"#f0f0f0":"#111111";
  const sub=dark?"#888888":"#666666", border=dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)";
  const inputBg=dark?"#2a2a2a":"#f7f7f5", accent="#e8442a";
  const userId=user?.id??"me", userName=user?.name??"You";

  const [conversations,setConversations]=useState<Conversation[]>(()=>makeDemoConvs(userId,userName));
  const [activeId,setActiveId]=useState<string>(conversations[0]?.id??"");
  const [draft,setDraft]=useState("");
  const [search,setSearch]=useState("");
  const bottomRef=useRef<HTMLDivElement>(null);
  const active=conversations.find(c=>c.id===activeId);

  useEffect(()=>{
    if(!activeId)return;
    setConversations(prev=>prev.map(c=>c.id===activeId?{...c,messages:c.messages.map(m=>({...m,read:true}))}:c));
  },[activeId]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[active?.messages.length]);

  function sendMessage(){
    if(!draft.trim()||!activeId)return;
    const msg:Message={id:`msg-${Date.now()}`,senderId:userId,senderName:userName,text:draft.trim(),timestamp:new Date(),read:true};
    setConversations(prev=>prev.map(c=>c.id===activeId?{...c,messages:[...c.messages,msg],lastActivity:new Date()}:c));
    setDraft("");
    const conv=conversations.find(c=>c.id===activeId);
    if(!conv)return;
    setTimeout(()=>{
      const replies=["Thanks for letting me know!","Of course, happy to help!","Great, see you soon!","No problem at all.","I will get back to you shortly."];
      const reply:Message={id:`msg-${Date.now()}-r`,senderId:conv.participantId,senderName:conv.participantName,text:replies[Math.floor(Math.random()*replies.length)],timestamp:new Date(),read:false};
      setConversations(prev=>prev.map(c=>c.id===activeId?{...c,messages:[...c.messages,reply],lastActivity:new Date()}:c));
    },1500);
  }

  const filteredConvs=conversations.filter(c=>c.participantName.toLowerCase().includes(search.toLowerCase())||c.listingTitle.toLowerCase().includes(search.toLowerCase()));
  const unread=(c:Conversation)=>c.messages.filter(m=>m.senderId!==userId&&!m.read).length;

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"Outfit, Segoe UI, sans-serif"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px 24px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <button onClick={()=>navigate(-1)} style={{background:card,border:`1px solid ${border}`,borderRadius:"50%",width:"36px",height:"36px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:text}}><FiArrowLeft size={16}/></button>
          <h1 style={{margin:0,fontSize:"22px",fontWeight:800,color:text}}>Messages</h1>
        </div>
        <div style={{display:"flex",height:"calc(100vh - 120px)",background:card,borderRadius:"20px",border:`1px solid ${border}`,overflow:"hidden"}}>
          <div style={{width:"300px",flexShrink:0,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"14px",borderBottom:`1px solid ${border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",background:inputBg,borderRadius:"10px",padding:"8px 12px"}}>
                <FiSearch size={13} color={sub}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{border:"none",background:"transparent",fontSize:"13px",color:text,outline:"none",width:"100%"}}/>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {filteredConvs.map(conv=>{
                const last=conv.messages[conv.messages.length-1];
                const u=unread(conv);
                const isActive=conv.id===activeId;
                return(
                  <div key={conv.id} onClick={()=>setActiveId(conv.id)} style={{padding:"14px",cursor:"pointer",background:isActive?(dark?"#2a1008":"#fff1ef"):"transparent",borderLeft:isActive?`3px solid ${accent}`:"3px solid transparent",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                    <div style={{width:"40px",height:"40px",borderRadius:"50%",background:conv.participantColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"14px",fontWeight:700,flexShrink:0}}>{conv.participantInitial}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"2px"}}>
                        <p style={{margin:0,fontSize:"13px",fontWeight:700,color:isActive?accent:text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"130px"}}>{conv.participantName}</p>
                        <span style={{fontSize:"10px",color:sub,flexShrink:0}}>{fmt(conv.lastActivity)}</span>
                      </div>
                      <p style={{margin:"0 0 2px",fontSize:"11px",color:accent,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.listingTitle}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <p style={{margin:0,fontSize:"12px",color:sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"160px"}}>{last?.text}</p>
                        {u>0&&<span style={{background:accent,color:"#fff",borderRadius:"999px",padding:"1px 6px",fontSize:"10px",fontWeight:700,flexShrink:0}}>{u}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {active?(
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"38px",height:"38px",borderRadius:"50%",background:active.participantColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"14px",fontWeight:700}}>{active.participantInitial}</div>
                <div><p style={{margin:0,fontSize:"14px",fontWeight:700,color:text}}>{active.participantName}</p><p style={{margin:0,fontSize:"11px",color:sub}}>{active.listingTitle}</p></div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"12px"}}>
                {active.messages.map(msg=>{
                  const isMe=msg.senderId===userId;
                  return(
                    <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:"8px",alignItems:"flex-end"}}>
                      {!isMe&&<div style={{width:"28px",height:"28px",borderRadius:"50%",background:active.participantColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"11px",fontWeight:700,flexShrink:0}}>{active.participantInitial}</div>}
                      <div style={{maxWidth:"65%"}}>
                        <div style={{background:isMe?accent:inputBg,color:isMe?"#fff":text,padding:"10px 14px",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",fontSize:"13px",lineHeight:1.5}}>{msg.text}</div>
                        <p style={{margin:"3px 0 0",fontSize:"10px",color:sub,textAlign:isMe?"right":"left"}}>{fmt(msg.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>
              <div style={{padding:"14px 20px",borderTop:`1px solid ${border}`,display:"flex",gap:"10px",alignItems:"flex-end"}}>
                <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Type a message... (Enter to send)" rows={1} style={{flex:1,background:inputBg,border:`1px solid ${border}`,borderRadius:"12px",padding:"10px 14px",fontSize:"13px",color:text,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.5}}/>
                <button onClick={sendMessage} disabled={!draft.trim()} style={{width:"40px",height:"40px",borderRadius:"50%",background:draft.trim()?accent:(dark?"#333":"#ddd"),color:"#fff",border:"none",cursor:draft.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FiSend size={15}/></button>
              </div>
            </div>
          ):(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px"}}>
              <FiMessageSquare size={48} color={sub}/>
              <p style={{color:sub,fontSize:"14px",margin:0}}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
