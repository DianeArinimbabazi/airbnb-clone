const fs = require('fs');
fs.mkdirSync('src/features/ai', { recursive: true });

fs.writeFileSync('src/features/ai/AIChatWidget.tsx', `
import { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I am your DIAVELA assistant. Ask me anything about listings or bookings!' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: text, conversationHistory: messages });
      const reply = res?.data?.reply ?? res?.reply ?? 'Sorry, could not get a response.';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch { setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong.' }]); }
    finally { setLoading(false); }
  }
  return (
    <>
      <button onClick={() => setOpen(o => !o)} title="Chat with AI" style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:9999, width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,#FF385C,#ff6b35)', border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(255,56,92,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:'#fff' }}>
        {open ? 'x' : String.fromCodePoint(0x1F4AC)}
      </button>
      {open && (
        <div style={{ position:'fixed', bottom:'96px', right:'28px', zIndex:9998, width:'360px', height:'480px', background:'#fff', borderRadius:'20px', boxShadow:'0 8px 40px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'Outfit,sans-serif' }}>
          <div style={{ background:'linear-gradient(135deg,#FF385C,#ff6b35)', padding:'16px 20px', color:'#fff' }}>
            <p style={{ margin:'0 0 2px', fontWeight:800, fontSize:'15px' }}>DIAVELA Assistant</p>
            <p style={{ margin:0, fontSize:'12px', opacity:0.85 }}>AI-powered support</p>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? '#FF385C' : '#f5f5f5', color: m.role === 'user' ? '#fff' : '#222', fontSize:'13px', lineHeight:1.5 }}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{ display:'flex' }}><div style={{ background:'#f5f5f5', borderRadius:'18px', padding:'10px 16px', fontSize:'13px', color:'#888' }}>Typing...</div></div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'12px 16px', borderTop:'1px solid #f0f0f0', display:'flex', gap:'8px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything..." style={{ flex:1, padding:'10px 14px', border:'1.5px solid #eee', borderRadius:'50px', fontSize:'13px', outline:'none', fontFamily:'inherit' }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ width:'40px', height:'40px', borderRadius:'50%', background: input.trim() ? '#FF385C' : '#f0f0f0', border:'none', cursor:'pointer', color: input.trim() ? '#fff' : '#aaa', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>go</button>
          </div>
        </div>
      )}
    </>
  );
}
`.trim(), 'utf8');
console.log('AIChatWidget ok');

fs.writeFileSync('src/features/ai/AIReviewSummary.tsx', `
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { api } from '../../lib/api';

export function AIReviewSummary({ listingId, rating }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  async function load() {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await api.get('/ai/listings/' + listingId + '/review-summary');
      setSummary(res?.data?.summary ?? res?.summary ?? 'No summary available.');
      setLoaded(true);
    } catch { setSummary('Could not load AI summary.'); setLoaded(true); }
    finally { setLoading(false); }
  }
  return (
    <div style={{ padding:'24px 0' }}>
      <h3 style={{ fontSize:'18px', fontWeight:700, color:'#222', margin:'0 0 12px', display:'flex', alignItems:'center', gap:'8px' }}>
        <FaStar size={18} color="#FF385C" />
        {rating ? rating.toFixed(1) + ' Guest reviews' : 'Guest reviews'}
      </h3>
      {!loaded ? (
        <button onClick={load} disabled={loading} style={{ padding:'10px 20px', background:'#fff', border:'1.5px solid #FF385C', borderRadius:'50px', color: loading ? '#aaa' : '#FF385C', fontWeight:700, fontSize:'13px', cursor: loading ? 'default' : 'pointer', fontFamily:'inherit' }}>
          {loading ? 'Generating...' : 'Get AI review summary'}
        </button>
      ) : (
        <div style={{ background:'#fff5f6', border:'1.5px solid #ffd6db', borderRadius:'14px', padding:'20px 24px' }}>
          <p style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:700, color:'#FF385C', textTransform:'uppercase', letterSpacing:'1px' }}>AI Review Summary</p>
          <p style={{ margin:0, fontSize:'14px', color:'#444', lineHeight:1.7 }}>{summary}</p>
        </div>
      )}
    </div>
  );
}
`.trim(), 'utf8');
console.log('AIReviewSummary ok');

fs.writeFileSync('src/features/ai/AIRecommendations.tsx', `
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export function AIRecommendations() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  async function load() {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/recommend', {});
      setRecs(res?.data?.recommendations ?? res?.recommendations ?? []);
      setLoaded(true);
    } catch { setLoaded(true); }
    finally { setLoading(false); }
  }
  return (
    <section style={{ maxWidth:'1100px', margin:'0 auto 40px', padding:'0 32px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <h2 style={{ fontSize:'20px', fontWeight:800, color:'#111', margin:0 }}>AI Picks For You</h2>
        {!loaded && <button onClick={load} disabled={loading} style={{ padding:'10px 20px', background: loading ? '#f0f0f0' : '#FF385C', color: loading ? '#aaa' : '#fff', border:'none', borderRadius:'50px', fontWeight:700, fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>{loading ? 'Loading...' : 'Get recommendations'}</button>}
      </div>
      {loaded && recs.length === 0 && <div style={{ background:'#f9f9f9', borderRadius:'14px', padding:'24px', textAlign:'center', color:'#717171', fontSize:'14px' }}>Make a booking first and AI will recommend places based on your history.</div>}
      {recs.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
          {recs.map(r => (
            <div key={r.listingId} onClick={() => navigate('/listings/' + r.listingId)} style={{ background:'#fff', borderRadius:'16px', border:'1px solid #f0f0f0', padding:'20px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <h3 style={{ margin:0, fontSize:'15px', fontWeight:700, color:'#222' }}>{r.title}</h3>
                <span style={{ background:'#fff5f6', color:'#FF385C', fontSize:'11px', fontWeight:700, padding:'3px 8px', borderRadius:'20px', marginLeft:'8px' }}>{r.matchScore}%</span>
              </div>
              <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#717171' }}>{r.location}</p>
              <p style={{ margin:'0 0 12px', fontSize:'13px', color:'#555', lineHeight:1.5 }}>{r.reason}</p>
              <p style={{ margin:0, fontSize:'14px', fontWeight:700, color:'#222' }}>${r.pricePerNight}/night</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
`.trim(), 'utf8');
console.log('AIRecommendations ok');

fs.writeFileSync('src/features/ai/AISearchBar.tsx', `
import { useState } from 'react';
import { api } from '../../lib/api';

export function AISearchBar({ onResults, onClear }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  async function search() {
    if (!query.trim()) return;
    setLoading(true); setActive(true);
    try {
      const res = await api.post('/ai/search', { query });
      onResults(res?.data?.listings ?? res?.listings ?? []);
    } catch { onClear(); setActive(false); }
    finally { setLoading(false); }
  }
  function clear() { setQuery(''); setActive(false); onClear(); }
  return (
    <div style={{ padding:'16px 0 0', display:'flex', gap:'10px', alignItems:'center' }}>
      <div style={{ flex:1, display:'flex', gap:'8px', background:'#fff', border: active ? '1.5px solid #FF385C' : '1.5px solid #ddd', borderRadius:'50px', padding:'8px 16px', alignItems:'center' }}>
        <span style={{ fontSize:'13px', fontWeight:700, color:'#FF385C' }}>AI</span>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Try: beachfront villa under $200 or cabin with pool in Kigali..." style={{ flex:1, border:'none', outline:'none', fontSize:'14px', fontFamily:'inherit', background:'transparent' }} />
        {active && <button onClick={clear} style={{ background:'none', border:'none', color:'#717171', cursor:'pointer', fontSize:'16px', padding:0 }}>x</button>}
      </div>
      <button onClick={search} disabled={loading || !query.trim()} style={{ padding:'10px 20px', background: query.trim() ? '#FF385C' : '#f0f0f0', color: query.trim() ? '#fff' : '#aaa', border:'none', borderRadius:'50px', fontWeight:700, fontSize:'13px', cursor: query.trim() ? 'pointer' : 'default', fontFamily:'inherit', whiteSpace:'nowrap' }}>{loading ? 'Searching...' : 'AI Search'}</button>
    </div>
  );
}
`.trim(), 'utf8');
console.log('AISearchBar ok');

// Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('AIChatWidget')) {
  app = "import { AIChatWidget } from './features/ai/AIChatWidget';\n" + app;
  app = app.replace('      </Suspense>\n    </>', '      </Suspense>\n      <AIChatWidget />\n    </>');
  fs.writeFileSync('src/App.tsx', app, 'utf8');
  console.log('App.tsx updated');
}

// Update GuestDashboard
let gd = fs.readFileSync('src/features/auth/pages/GuestDashboard.tsx', 'utf8');
if (!gd.includes('AIRecommendations')) {
  gd = "import { AIRecommendations } from '../../ai/AIRecommendations';\n" + gd;
  gd = gd.replace('<footer style', '<AIRecommendations />\n      <footer style');
  fs.writeFileSync('src/features/auth/pages/GuestDashboard.tsx', gd, 'utf8');
  console.log('GuestDashboard updated');
}

// Update ListingsPage
let lp = fs.readFileSync('src/features/listings/pages/ListingsPage.tsx', 'utf8');
if (!lp.includes('AISearchBar')) {
  lp = "import { AISearchBar } from '../../ai/AISearchBar';\n" + lp;
  lp = lp.replace('  const [savedOnly, setSavedOnly] = useState(false);', '  const [savedOnly, setSavedOnly] = useState(false);\n  const [aiResults, setAiResults] = useState(null);');
  lp = lp.replace('    let result = listings;', '    let result = aiResults ?? listings;');
  lp = lp.replace('    <div style={{ maxWidth:"1280px"', '    <>\n    <AISearchBar onResults={(r) => setAiResults(r)} onClear={() => setAiResults(null)} />\n    <div style={{ maxWidth:"1280px"');
  lp = lp.replace('    </div>\n  );\n}', '    </div>\n    </>\n  );\n}');
  fs.writeFileSync('src/features/listings/pages/ListingsPage.tsx', lp, 'utf8');
  console.log('ListingsPage updated');
}

// Update ListingDetail
let ld = fs.readFileSync('src/features/listings/pages/ListingDetail.tsx', 'utf8');
if (!ld.includes('AIReviewSummary')) {
  ld = "import { AIReviewSummary } from '../../ai/AIReviewSummary';\n" + ld;
  const start = ld.indexOf('          {/* Reviews */}');
  const end = ld.indexOf('\n        </div>', start) + 15;
  if (start !== -1) {
    ld = ld.slice(0, start) + '          <AIReviewSummary listingId={id} rating={listing.rating} />' + ld.slice(end);
  }
  fs.writeFileSync('src/features/listings/pages/ListingDetail.tsx', ld, 'utf8');
  console.log('ListingDetail updated');
}

// Update CreateListingPage
let cl = fs.readFileSync('src/features/host/pages/CreateListingPage.tsx', 'utf8');
if (!cl.includes('generateDescription')) {
  cl = cl.replace(
    "  const [uploadProgress, setUploadProgress] = useState(\"\");",
    "  const [uploadProgress, setUploadProgress] = useState(\"\");\n  const [aiGenerating, setAiGenerating] = useState(false);"
  );
  cl = cl.replace(
    'formState: { errors } } = useForm<FormData>({',
    'setValue, watch, formState: { errors } } = useForm<FormData>({'
  );
  const genFn = `
  async function generateDescription() {
    const title = watch('title');
    const loc = watch('location');
    const type = watch('type');
    if (!title || title.length < 5) { toast.error('Enter a title first'); return; }
    setAiGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(BASE + '/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ message: 'Write a compelling 3-paragraph Airbnb listing description for: ' + title + ' located in ' + (loc || 'a great location') + '. Property type: ' + (type || 'property') + '. Make it warm, inviting and detailed. Return only the description.' })
      });
      const data = await res.json();
      const desc = data?.data?.reply ?? data?.reply ?? '';
      if (desc) { setValue('description', desc); toast.success('Description generated!'); }
      else toast.error('Could not generate description');
    } catch { toast.error('AI generation failed'); }
    finally { setAiGenerating(false); }
  }
`;
  cl = cl.replace('  const mutation = useMutation({', genFn + '\n  const mutation = useMutation({');
  cl = cl.replace(
    '<label style={lbl}>Description *</label>',
    '<label style={lbl}>Description * <button type="button" onClick={generateDescription} disabled={aiGenerating} style={{ marginLeft:"8px", padding:"3px 12px", background: aiGenerating ? "#f5f5f5" : "#fff5f6", color: aiGenerating ? "#aaa" : "#FF385C", border:"1px solid #ffd6db", borderRadius:"20px", fontSize:"11px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{aiGenerating ? "Generating..." : "AI Generate"}</button></label>'
  );
  fs.writeFileSync('src/features/host/pages/CreateListingPage.tsx', cl, 'utf8');
  console.log('CreateListingPage updated');
}

console.log('ALL DONE');
