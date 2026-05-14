import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useTheme } from '../../shared/context/ThemeContext';

interface Rec {
  listingId: string;
  title: string;
  reason: string;
  matchScore: number;
  pricePerNight: number;
  location: string;
  photos?: { url: string }[];
}

export function AIRecommendations() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [noHistory, setNoHistory] = useState(false);

  const bg     = dark ? "#1a1a1a" : "#fafafa";
  const card   = dark ? "#2a2a2a" : "#ffffff";
  const text   = dark ? "#f0f0f0" : "#111111";
  const sub    = dark ? "#aaaaaa" : "#717171";
  const border = dark ? "#333333" : "#f0f0f0";

  async function load() {
    if (loaded) return;
    setLoading(true);
    try {
      const r = await api.post<any>('/ai/recommend', {});
      const rawRecs: Rec[] = (r?.data?.recommendations ?? r?.recommendations ?? []).map((rec: any) => ({ ...rec, listingId: rec.listingId || rec.id }));

      const recsWithPhotos = await Promise.all(
        rawRecs
          .filter(rec => rec.listingId && rec.listingId !== 'undefined')
          .map(async (rec) => {
            try {
              const listing = await api.get<any>('/listings/' + rec.listingId);
              const photos = listing?.data?.photos ?? listing?.photos ?? [];
              return { ...rec, photos };
            } catch {
              return rec;
            }
          })
      );

      setRecs(recsWithPhotos);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? '';
      if (msg.toLowerCase().includes('no booking')) {
        setNoHistory(true);
      }
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }

  return (
    <section style={{ background: bg, padding: '40px 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: text, margin: 0 }}>AI Picks For You</h2>
          {!loaded && (
            <button onClick={load} disabled={loading}
              style={{ padding: '10px 20px', background: loading ? (dark ? '#333' : '#f0f0f0') : '#FF385C', color: loading ? sub : '#fff', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '13px', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Loading...' : 'Get recommendations'}
            </button>
          )}
        </div>

        {loaded && (noHistory || recs.length === 0) && (
          <div style={{ background: card, border: '1px solid ' + border, borderRadius: '14px', padding: '24px', textAlign: 'center', color: sub, fontSize: '14px' }}>
            Make a booking first and AI will recommend places based on your history.
          </div>
        )}

        {recs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '16px' }}>
            {recs.map((r, i) => {
              const photoUrl = r.photos?.[0]?.url;
              const key = r.listingId || ('rec-' + i);
              return (
                <div key={key}
                  onClick={() => r.listingId && navigate('/listings/' + r.listingId)}
                  style={{ background: card, borderRadius: '16px', border: '1px solid ' + border, overflow: 'hidden', cursor: r.listingId ? 'pointer' : 'default', transition: 'transform 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  <div style={{ width: '100%', height: '180px', background: dark ? '#333' : '#f5f5f5', overflow: 'hidden', position: 'relative' }}>
                    {photoUrl
                      ? <img src={photoUrl} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🏠</div>
                    }
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#FF385C', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                      {r.matchScore}% match
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: text }}>{r.title}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: sub }}>{r.location}</p>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: sub, lineHeight: 1.5 }}>{r.reason}</p>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: text }}>${r.pricePerNight}<span style={{ fontWeight: 400, fontSize: '13px', color: sub }}>/night</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
