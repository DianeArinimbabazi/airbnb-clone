import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useAuth } from "../../auth/hooks/useAuth";
import { api } from "../../../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft, FiSend, FiMessageSquare, FiSearch } from "react-icons/fi";

interface ApiMessage {
  id: string; content: string; senderId: string; receiverId: string;
  bookingId: string; read: boolean; createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}
interface Conversation {
  id: string; bookingId: string; content: string; createdAt: string;
  senderId: string; receiverId: string; unread: number;
  sender: { id: string; name: string; avatar?: string };
  receiver: { id: string; name: string; avatar?: string };
  booking: { id: string; listing: { id: string; title: string; photos: { url: string }[] } };
}

const COLORS = ["#e8442a","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899"];
function colorFor(name: string) {
  return COLORS[name.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % COLORS.length];
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
}
function fmt(iso: string) {
  const date = new Date(iso);
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
  const qc = useQueryClient();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const bg    = dark ? "#111111" : "#f7f7f5";
  const card  = dark ? "#1a1a1a" : "#ffffff";
  const text  = dark ? "#f0f0f0" : "#111111";
  const sub   = dark ? "#888888" : "#666666";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = dark ? "#2a2a2a" : "#f7f7f5";
  const accent = "#e8442a";

  // Load conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/messages");
      return Array.isArray(res) ? res : (res as any).data ?? [];
    },
    refetchInterval: 5000,
  });

  // Load messages for active thread
  const { data: messages = [] } = useQuery<ApiMessage[]>({
    queryKey: ["messages", activeBookingId],
    enabled: !!activeBookingId,
    queryFn: async () => {
      const res = await api.get(`/messages/thread?bookingId=${activeBookingId}`);
      return Array.isArray(res) ? res : (res as any).data ?? [];
    },
    refetchInterval: 3000,
  });

  // Send message
  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post("/messages", { bookingId: activeBookingId, content }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", activeBookingId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeBookingId) {
      setActiveBookingId(conversations[0].bookingId);
    }
  }, [conversations]);

  const activeConv = conversations.find(c => c.bookingId === activeBookingId);
  const otherPerson = activeConv
    ? (activeConv.senderId === user?.id ? activeConv.receiver : activeConv.sender)
    : null;

  const filtered = conversations.filter(c => {
    const other = c.senderId === user?.id ? c.receiver : c.sender;
    return (
      other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.booking?.listing?.title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  function handleSend() {
    if (!draft.trim() || !activeBookingId) return;
    sendMutation.mutate(draft.trim());
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Outfit, Segoe UI, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={() => navigate(-1)} style={{ background: card, border: `1px solid ${border}`, borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: text }}>
            <FiArrowLeft size={16}/>
          </button>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: text }}>Messages</h1>
        </div>

        <div style={{ display: "flex", height: "calc(100vh - 120px)", background: card, borderRadius: "20px", border: `1px solid ${border}`, overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{ width: "300px", flexShrink: 0, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px", borderBottom: `1px solid ${border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: inputBg, borderRadius: "10px", padding: "8px 12px" }}>
                <FiSearch size={13} color={sub}/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ border: "none", background: "transparent", fontSize: "13px", color: text, outline: "none", width: "100%" }}/>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {isLoading && (
                <div style={{ padding: "32px", textAlign: "center", color: sub, fontSize: "13px" }}>Loading...</div>
              )}
              {!isLoading && filtered.length === 0 && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <FiMessageSquare size={32} color={sub} style={{ marginBottom: "12px" }}/>
                  <p style={{ color: sub, fontSize: "13px", margin: 0 }}>No conversations yet</p>
                  <p style={{ color: sub, fontSize: "12px", margin: "8px 0 0" }}>Book a listing to start chatting with a host</p>
                </div>
              )}
              {filtered.map(conv => {
                const other = conv.senderId === user?.id ? conv.receiver : conv.sender;
                const isActive = conv.bookingId === activeBookingId;
                const name = other?.name ?? "Unknown";
                return (
                  <div key={conv.bookingId} onClick={() => setActiveBookingId(conv.bookingId)}
                    style={{ padding: "14px", cursor: "pointer", background: isActive ? (dark ? "#2a1008" : "#fff1ef") : "transparent", borderLeft: isActive ? `3px solid ${accent}` : "3px solid transparent", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: colorFor(name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                      {initials(name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: isActive ? accent : text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}>{name}</p>
                        <span style={{ fontSize: "10px", color: sub, flexShrink: 0 }}>{fmt(conv.createdAt)}</span>
                      </div>
                      <p style={{ margin: "0 0 2px", fontSize: "11px", color: accent, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.booking?.listing?.title}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>{conv.content}</p>
                        {conv.unread > 0 && (
                          <span style={{ background: accent, color: "#fff", borderRadius: "999px", padding: "1px 6px", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>{conv.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          {activeConv && otherPerson ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: colorFor(otherPerson.name ?? ""), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
                  {initials(otherPerson.name ?? "")}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: text }}>{otherPerson.name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: sub }}>{activeConv.booking?.listing?.title}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: sub, fontSize: "13px" }}>
                    No messages yet — say hello!
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: "8px", alignItems: "flex-end" }}>
                      {!isMe && (
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: colorFor(otherPerson.name ?? ""), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                          {initials(otherPerson.name ?? "")}
                        </div>
                      )}
                      <div style={{ maxWidth: "65%" }}>
                        <div style={{ background: isMe ? accent : inputBg, color: isMe ? "#fff" : text, padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: "13px", lineHeight: 1.5 }}>
                          {msg.content}
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "10px", color: sub, textAlign: isMe ? "right" : "left" }}>{fmt(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${border}`, display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <textarea value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                  style={{ flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: text, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5 }}/>
                <button onClick={handleSend} disabled={!draft.trim() || sendMutation.isPending}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", background: draft.trim() ? accent : (dark ? "#333" : "#ddd"), color: "#fff", border: "none", cursor: draft.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FiSend size={15}/>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <FiMessageSquare size={48} color={sub}/>
              <p style={{ color: sub, fontSize: "14px", margin: 0 }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
