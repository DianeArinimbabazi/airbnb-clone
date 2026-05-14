import { useState } from 'react';
import { api } from '../../lib/api';

export function AISearchBar({ onResults, onClear }: { onResults: (l: any[]) => void; onClear: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  async function search() {
    if (!query.trim()) return;
    setLoading(true); setActive(true);
    try {
      const r = await api.post<any>('/ai/search', { query });
      onResults(r?.data?.listings ?? r?.listings ?? []);
    } catch { onClear(); setActive(false); }
    finally { setLoading(false); }
  }
  function clear() { setQuery(''); setActive(false); onClear(); }
  return (
    <div style={{ padding: '16px 0 8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', gap: '8px', background: '#fff', border: active ? '1.5px solid #FF385C' : '1.5px solid #ddd', borderRadius: '50px', padding: '8px 16px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF385C' }}>AI</span>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Try: beachfront villa under $200 or cabin with pool in Kigali..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', background: 'transparent' }} />
        {active && <button onClick={clear} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px', padding: 0 }}>x</button>}
      </div>
      <button onClick={search} disabled={loading || !query.trim()} style={{ padding: '10px 20px', background: query.trim() ? '#FF385C' : '#f0f0f0', color: query.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '13px', cursor: query.trim() ? 'pointer' : 'default', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{loading ? 'Searching...' : 'AI Search'}</button>
    </div>
  );
}