import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { api } from '../../lib/api';
import { useTheme } from '../../shared/context/ThemeContext';

interface SummaryData {
  summary: string;
  positives: string[];
  negatives: string[];
  averageRating: number;
  totalReviews: number;
}

export function AIReviewSummary({ listingId, rating }: { listingId: string | undefined; rating?: number | null }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { dark } = useTheme();

  const text     = dark ? '#f1f5f9' : '#222';
  const bodyText = dark ? '#cbd5e1' : '#444';
  const cardBg   = dark ? '#1e293b' : '#fff5f6';
  const cardBdr  = dark ? '#334155' : '#ffd6db';
  const btnBg    = dark ? '#0f172a' : '#fff';

  async function load() {
    if (loaded) return;
    setLoading(true);
    setError('');
    try {
      const r = await api.get<any>('/ai/listings/' + (listingId ?? '') + '/review-summary');
      const d = r?.data ?? r;
      setData({
        summary: d.summary ?? 'No summary available.',
        positives: d.positives ?? [],
        negatives: d.negatives ?? [],
        averageRating: d.averageRating ?? 0,
        totalReviews: d.totalReviews ?? 0,
      });
      setLoaded(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Could not load AI summary.';
      setError(msg.includes('minimum 3') || msg.includes('Minimum 3')
        ? 'Not enough reviews yet. At least 3 reviews are needed to generate a summary.'
        : msg);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaStar size={18} color="#FF385C" />
        {rating ? Number(rating).toFixed(1) + ' · Guest reviews' : 'Guest reviews'}
      </h3>

      {!loaded ? (
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: '10px 20px', background: btnBg, border: '1.5px solid #FF385C', borderRadius: '50px', color: loading ? '#aaa' : '#FF385C', fontWeight: 700, fontSize: '13px', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}
        >
          {loading ? 'Generating...' : 'Get AI review summary'}
        </button>
      ) : error ? (
        <div style={{ background: cardBg, border: '1.5px solid ' + cardBdr, borderRadius: '14px', padding: '20px 24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#FF385C' }}>{error}</p>
        </div>
      ) : data && (
        <div style={{ background: cardBg, border: '1.5px solid ' + cardBdr, borderRadius: '14px', padding: '20px 24px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#FF385C', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AI Review Summary
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: text }}>{data.averageRating.toFixed(1)}</span>
            <div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <FaStar key={s} size={12} color={s <= Math.round(data.averageRating) ? '#FF385C' : '#ddd'} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: bodyText }}>{data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <p style={{ margin: '0 0 14px', fontSize: '14px', color: bodyText, lineHeight: 1.7 }}>{data.summary}</p>

          {data.positives.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#008a05' }}>What guests loved</p>
              {data.positives.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: bodyText, marginBottom: '4px' }}>
                  <span style={{ color: '#008a05', flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
            </div>
          )}

          {data.negatives.length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#c13515' }}>Areas for improvement</p>
              {data.negatives.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: bodyText, marginBottom: '4px' }}>
                  <span style={{ color: '#c13515', flexShrink: 0 }}>–</span>{n}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
