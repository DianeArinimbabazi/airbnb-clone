import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../hooks/useListings';
import { ListingCard } from '../components/ListingCard';

const CATEGORIES = [
  { icon: '🏙️', label: 'City Stays', count: 124 },
  { icon: '🌊', label: 'Lakeside', count: 48 },
  { icon: '⛰️', label: 'Mountain', count: 63 },
  { icon: '🌿', label: 'Forest', count: 37 },
  { icon: '🏡', label: 'Countryside', count: 91 },
  { icon: '🏊', label: 'With Pool', count: 55 },
  { icon: '🌅', label: 'Beachfront', count: 29 },
  { icon: '🏰', label: 'Unique Stays', count: 42 },
];

const DESTINATIONS = [
  { city: 'Kigali', label: 'Capital city', count: '180+ stays', img: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80' },
  { city: 'Gisenyi', label: 'Lake Kivu shores', count: '64+ stays', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80' },
  { city: 'Musanze', label: 'Gorilla country', count: '52+ stays', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80' },
  { city: 'Nyungwe', label: 'Forest canopy', count: '28+ stays', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
];

const STATS = [
  { value: '10K+', label: 'Happy guests', icon: '😊' },
  { value: '500+', label: 'Unique listings', icon: '🏠' },
  { value: '50+', label: 'Destinations', icon: '📍' },
  { value: '4.9★', label: 'Average rating', icon: '⭐' },
];

const HOW = [
  { step: '01', icon: '🔍', title: 'Search your destination', desc: 'Enter your location and dates to find available verified properties near you.' },
  { step: '02', icon: '🏡', title: 'Choose your perfect stay', desc: 'Compare listings with real reviews, photos, and transparent pricing.' },
  { step: '03', icon: '✅', title: 'Book with confidence', desc: 'Secure payment, host-verified identity, and our stay guarantee protect every booking.' },
];

const REVIEWS = [
  { name: 'Amara N.', location: 'Nairobi, Kenya', text: 'Found an incredible lakeside villa in Gisenyi. The host was amazing and the property was exactly as described. Will book again!', rating: 5, avatar: 'AN' },
  { name: 'David K.', location: 'Kampala, Uganda', text: 'DIAVELA made it so easy to find a verified stay in Kigali. I felt safe knowing every host is vetted. Highly recommend.', rating: 5, avatar: 'DK' },
  { name: 'Sophie M.', location: 'Dar es Salaam, Tanzania', text: 'The mountain cabin in Musanze was breathtaking. The booking process was seamless and the guarantee gave us peace of mind.', rating: 5, avatar: 'SM' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { data: listings = [] } = useListings();
  const [searchLocation, setSearchLocation] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const featured = listings.slice(0, 6);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8f8f8', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ position: 'relative', background: 'linear-gradient(150deg, #111111 0%, #1a1a1a 45%, #222222 75%, #2a2a2a 100%)', padding: '80px 24px 100px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(220,38,38,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.10) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '50px', padding: '7px 20px', fontSize: '13px', color: '#f87171', fontWeight: 600, marginBottom: '28px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            Trusted by 10,000+ travellers across East Africa
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#fff', margin: '0 0 20px', lineHeight: 1.08, letterSpacing: '-2px' }}>
            Find Your Perfect<br /><span style={{ color: '#ef4444' }}>Stay in Rwanda</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#d1d5db', margin: '0 auto 44px', lineHeight: 1.7, maxWidth: '540px' }}>
            Every listing verified. Every host vetted. Every stay guaranteed.
          </p>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '8px', display: 'flex', gap: '8px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: '#fef2f2', borderRadius: '12px', border: '1.5px solid #fecaca' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <input type="text" placeholder="Where are you going?" value={searchLocation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLocation(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '15px', background: 'transparent', flex: 1, color: '#111', fontFamily: 'inherit' }} />
            </div>
            <button onClick={() => navigate('/listings?q=' + searchLocation)}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Search
            </button>
          </div>
          <p style={{ marginTop: '18px', color: '#f87171', fontSize: '13px', opacity: 0.85 }}>
            Popular: <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSearchLocation('Kigali')}>Kigali</span>
            {' · '}<span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSearchLocation('Gisenyi')}>Gisenyi</span>
            {' · '}<span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSearchLocation('Musanze')}>Musanze</span>
          </p>
        </div>
        <div style={{ position: 'relative', maxWidth: '860px', margin: '52px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
              <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#fff' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 0' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Browse</p>
        <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Explore by category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
          {CATEGORIES.map(c => (
            <button key={c.label} onClick={() => setActiveCategory(activeCategory === c.label ? '' : c.label)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 12px', borderRadius: '16px', border: activeCategory === c.label ? '2px solid #dc2626' : '1.5px solid #e5e7eb', background: activeCategory === c.label ? '#fef2f2' : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontSize: '28px' }}>{c.icon}</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: activeCategory === c.label ? '#b91c1c' : '#333' }}>{c.label}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{c.count} stays</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 0' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Discover</p>
        <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Popular destinations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 200px', gap: '14px' }}>
          {DESTINATIONS.map((d, i) => (
            <div key={d.city} onClick={() => navigate('/listings?location=' + d.city)}
              style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', gridRow: i === 0 ? '1 / 3' : 'auto' }}>
              <img src={d.img} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: '18px', left: '20px' }}>
                <p style={{ margin: '0 0 3px', fontSize: i === 0 ? '22px' : '16px', fontWeight: 800, color: '#fff' }}>{d.city}</p>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>{d.label}</p>
                <span style={{ background: 'rgba(220,38,38,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#fff', fontWeight: 600 }}>{d.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Top picks</p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Featured stays</h2>
          </div>
          <button onClick={() => navigate('/listings')} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '50px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {featured.map(listing => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Simple process</p>
            <h2 style={{ margin: '0 0 14px', fontSize: '32px', fontWeight: 800, color: '#111' }}>How DIAVELA works</h2>
            <p style={{ margin: '0 auto', color: '#888', fontSize: '16px', maxWidth: '480px', lineHeight: 1.7 }}>Three simple steps from search to check-in, backed by our stay guarantee</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {HOW.map(h => (
              <div key={h.step} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #111111, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(220,38,38,0.28)' }}>{h.icon}</div>
                <span style={{ display: 'inline-block', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', marginBottom: '12px', letterSpacing: '1px' }}>STEP {h.step}</span>
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800, color: '#111' }}>{h.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#888', lineHeight: 1.7 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ background: '#fef2f2', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Our promise</p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#111' }}>Why guests choose DIAVELA</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '✅', title: 'Every listing verified', desc: 'We personally review and approve every property before it goes live.' },
              { icon: '🛡️', title: 'Every host vetted', desc: 'All hosts complete identity verification and background checks before listing.' },
              { icon: '💳', title: 'Secure payments', desc: 'Payments are held safely and only released to hosts after you successfully check in.' },
              { icon: '🎯', title: 'Stay guarantee', desc: "If your stay doesn't match the listing, we'll find you a comparable place immediately." },
            ].map(t => (
              <div key={t.title} style={{ background: '#fff', borderRadius: '20px', padding: '32px 28px', border: '1px solid #fecaca', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '24px', flexShrink: 0, width: '52px', height: '52px', background: '#fef2f2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#111' }}>{t.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>Testimonials</p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#111' }}>Loved by travellers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {REVIEWS.map(r => (
              <div key={r.name} style={{ background: '#fafafa', borderRadius: '20px', padding: '28px', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(r.rating)].map((_, i) => <span key={i} style={{ color: '#dc2626', fontSize: '14px' }}>★</span>)}
                </div>
                <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#444', lineHeight: 1.8, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #111111, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px' }}>{r.avatar}</div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: '#111' }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOST CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #222222 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px' }}>For hosts</p>
            <h2 style={{ margin: '0 0 16px', fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px' }}>Turn your space into income</h2>
            <p style={{ margin: '0 0 32px', color: '#d1d5db', fontSize: '16px', lineHeight: 1.7 }}>Join thousands of verified hosts earning extra income. We handle the trust layer — you focus on great hospitality.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/signup')} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50px', padding: '16px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Start hosting</button>
              <button style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '50px', padding: '16px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Learn more</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[{ value: '$850', label: 'Avg. monthly earnings' }, { value: '48h', label: 'Average first booking' }, { value: '4.9★', label: 'Host satisfaction' }, { value: '0%', label: 'Hidden fees' }].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0a0a', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '32px', borderBottom: '1px solid #1a1a1a', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>DIAVELA</p>
              <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>Great hosts. Unforgettable stays.</p>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {['About', 'How it works', 'Become a host', 'Help centre', 'Privacy'].map(l => (
                <span key={l} style={{ fontSize: '13px', color: '#666', cursor: 'pointer', fontWeight: 500 }}>{l}</span>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ margin: 0, color: '#444', fontSize: '12px' }}>2025 DIAVELA · Every listing verified · Every stay guaranteed.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['✅ Verified', '🛡️ Vetted', '🎯 Guaranteed'].map(b => (
                <span key={b} style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', background: 'rgba(220,38,38,0.10)', padding: '3px 10px', borderRadius: '20px' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}