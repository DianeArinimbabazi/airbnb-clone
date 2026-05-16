import { useState, useRef, useEffect } from "react";
import { api } from "../../lib/api";

interface Message { role: "user" | "assistant"; content: string; }

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I am your DIAVELA assistant. Ask me anything!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = "session-" + (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).id : "guest");
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next); setLoading(true);
    try {
      const res = await api.post<any>("/ai/chat", { sessionId, message: text });
      const reply = (res as any)?.response ?? (res as any)?.reply ?? "No response.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch { setMessages([...next, { role: "assistant", content: "Something went wrong." }]); }
    finally { setLoading(false); }
  }
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:9999, width:"56px", height:"56px", borderRadius:"50%", background:"linear-gradient(135deg,#FF385C,#ff6b35)", border:"none", cursor:"pointer", fontSize:"24px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(255,56,92,0.4)" }}>
        {open ? "X" : "Chat"}
      </button>
      {open && (
        <div style={{ position:"fixed", bottom:"96px", right:"28px", zIndex:9998, width:"360px", height:"480px", background:"#fff", borderRadius:"20px", boxShadow:"0 8px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#FF385C,#ff6b35)", padding:"16px 20px", color:"#fff" }}>
            <p style={{ margin:"0 0 2px", fontWeight:800, fontSize:"15px" }}>DIAVELA Assistant</p>
            <p style={{ margin:0, fontSize:"12px", opacity:0.85 }}>AI-powered support</p>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"12px" }}>
            {messages.map((m, i) => (<div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}><div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?"#FF385C":"#f5f5f5", color:m.role==="user"?"#fff":"#222", fontSize:"13px", lineHeight:1.5 }}>{m.content}</div></div>))}
            {loading && <div style={{ background:"#f5f5f5", borderRadius:"18px", padding:"10px 16px", alignSelf:"flex-start" }}>...</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:"12px 16px", borderTop:"1px solid #f0f0f0", display:"flex", gap:"8px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything..." style={{ flex:1, padding:"10px 14px", border:"1.5px solid #eee", borderRadius:"50px", fontSize:"13px", outline:"none" }} />
            <button onClick={send} disabled={loading||!input.trim()} style={{ width:"40px", height:"40px", borderRadius:"50%", background:input.trim()?"#FF385C":"#f0f0f0", border:"none", cursor:"pointer", color:input.trim()?"#fff":"#aaa" }}>{">"}</button>
          </div>
        </div>
      )}
    </>
  );
}

