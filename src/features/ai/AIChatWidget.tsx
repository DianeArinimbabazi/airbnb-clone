import { useState, useRef, useEffect } from "react";
import { api } from "../../lib/api";
import { useTheme } from "../../shared/context/ThemeContext";

interface Message { role: "user" | "assistant"; content: string; }

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I am your DIAVELA assistant. Ask me anything!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { dark } = useTheme();
  const sessionId = "session-" + (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).id : "guest");
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const chatBg = dark ? "#1a1a1a" : "#fff";
  const chatBorder = dark ? "#333" : "#f0f0f0";
  const chatText = dark ? "#f0f0f0" : "#222";
  const msgBg = dark ? "#2a2a2a" : "#f5f5f5";
  const inputBg = dark ? "#2a2a2a" : "#fff";
  const inputBorder = dark ? "#444" : "#eee";

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
    } catch { setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]); }
    finally { setLoading(false); }
  }
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position:"fixed", bottom:"28px", right:"28px", zIndex:9999, width:"56px", height:"56px", borderRadius:"50%", background:"linear-gradient(135deg,#FF385C,#ff6b35)", border:"none", cursor:"pointer", fontSize:"24px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 20px rgba(255,56,92,0.4)" }}>
        {open ? "\u2715" : "Chat"}
      </button>
      {open && (
        <div style={{ position:"fixed", bottom:"96px", right:"28px", zIndex:9998, width:"360px", height:"480px", background:chatBg, borderRadius:"20px", boxShadow:"0 8px 40px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", overflow:"hidden", border:`1px solid ${chatBorder}` }}>
          <div style={{ background:"linear-gradient(135deg,#FF385C,#ff6b35)", padding:"16px 20px", color:"#fff" }}>
            <p style={{ margin:"0 0 2px", fontWeight:800, fontSize:"15px" }}>DIAVELA Assistant</p>
            <p style={{ margin:0, fontSize:"12px", opacity:0.85 }}>AI-powered support</p>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"12px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?"#FF385C":msgBg, color:m.role==="user"?"#fff":chatText, fontSize:"13px", lineHeight:1.5 }}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{ background:msgBg, borderRadius:"18px", padding:"10px 16px", alignSelf:"flex-start", color:chatText }}>...</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:"12px 16px", borderTop:`1px solid ${chatBorder}`, display:"flex", gap:"8px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything..." style={{ flex:1, padding:"10px 14px", border:`1.5px solid ${inputBorder}`, borderRadius:"50px", fontSize:"13px", outline:"none", background:inputBg, color:chatText, fontFamily:"inherit" }} />
            <button onClick={send} disabled={loading||!input.trim()} style={{ width:"40px", height:"40px", borderRadius:"50%", background:input.trim()?"#FF385C":(dark?"#333":"#f0f0f0"), border:"none", cursor:"pointer", color:input.trim()?"#fff":(dark?"#666":"#aaa") }}>{">"}</button>
          </div>
        </div>
      )}
    </>
  );
}
