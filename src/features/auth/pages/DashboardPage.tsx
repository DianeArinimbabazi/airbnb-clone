import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../../store/StoreContext';
import { useListings } from '../../listings/hooks/useListings';
import { useNavigate } from 'react-router-dom';

type ActiveView =
  | 'today' | 'inbox' | 'calendar' | 'insights'
  | 'quality' | 'occupancy' | 'conversion'
  | 'superhost' | 'properties' | 'bookings' | 'guests' | 'finances' | 'tasks' | 'housekeeping';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', padding: '28px 32px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};
const cardTitle: React.CSSProperties = {
  fontSize: '18px', fontWeight: 700, color: '#222', margin: '0 0 20px',
};
const mkBadge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: 700, color, background: bg,
});

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveView>('superhost');
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  useListings();

  const handleLogout = () => { logout(); navigate('/login'); };
  const savedListings = state.listings.filter((l) => state.saved.includes(l.id));

  const stats = [
    { label: 'Overall rating', value: '4.9★', sub: 'Criteria: 4.8' },
    { label: 'Response rate', value: '100%', sub: 'Criteria: 90%' },
    { label: 'Stays', value: savedListings.length.toString(), sub: 'Criteria: 10 stays' },
    { label: 'Cancellation rate', value: '0.0%', sub: 'Criteria: less than 1%' },
  ];

  const sideNav = [
    {
      group: 'Overview',
      items: [
        { id: 'today' as ActiveView, label: '📅 Today' },
        { id: 'inbox' as ActiveView, label: '📬 Inbox' },
        { id: 'calendar' as ActiveView, label: '🗓️ Calendar' },
        { id: 'insights' as ActiveView, label: '📈 Insights' },
      ],
    },
    {
      group: 'Performance',
      items: [
        { id: 'quality' as ActiveView, label: '🎯 Quality' },
        { id: 'occupancy' as ActiveView, label: '🏨 Occupancy & rates' },
        { id: 'conversion' as ActiveView, label: '🔄 Conversion' },
      ],
    },
    {
      group: 'Manage',
      items: [
        { id: 'superhost' as ActiveView, label: '⭐ Superhost' },
        { id: 'properties' as ActiveView, label: '🏠 Properties' },
        { id: 'bookings' as ActiveView, label: '📅 Bookings' },
        { id: 'guests' as ActiveView, label: '👥 Guests' },
        { id: 'finances' as ActiveView, label: '💰 Finances' },
        { id: 'tasks' as ActiveView, label: '📋 Tasks' },
        { id: 'housekeeping' as ActiveView, label: '✨ Housekeeping' },
      ],
    },
  ];

  const pageTitle: Record<ActiveView, string> = {
    today: 'Today', inbox: 'Inbox', calendar: 'Calendar', insights: 'Insights',
    quality: 'Quality', occupancy: 'Occupancy & Rates', conversion: 'Conversion',
    superhost: 'Superhost', properties: 'My Properties', bookings: 'Bookings',
    guests: 'Guests', finances: 'Finances', tasks: 'Tasks', housekeeping: 'Housekeeping',
  };

  /* ── OVERVIEW ── */

  const renderToday = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={card}>
        <h2 style={cardTitle}>👋 Good morning!</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Here's what's happening at your properties today.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { icon: '🧳', label: 'Check-ins today', value: '2' },
          { icon: '🚪', label: 'Check-outs today', value: '1' },
          { icon: '💬', label: 'Unread messages', value: '3' },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>{icon}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', margin: '0 0 16px' }}>Upcoming tasks</h3>
        {['Confirm booking for Kigali Hills Villa', 'Reply to guest about parking', 'Update availability for June'].map((task) => (
          <div key={task} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #9b8ec4', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{task}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInbox = () => (
    <div style={card}>
      <h2 style={cardTitle}>📬 Inbox</h2>
      {[
        { name: 'Alice M.', msg: 'Hi, is the pool heated?', time: '10 min ago', unread: true },
        { name: 'Bob K.', msg: 'Thanks for the quick check-in!', time: '1 hr ago', unread: true },
        { name: 'Carol N.', msg: 'We loved the place. 5 stars!', time: 'Yesterday', unread: false },
      ].map(({ name, msg, time, unread }) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: unread ? '#9b8ec4' : '#e0d7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unread ? '#fff' : '#9b8ec4', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
            {name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <p style={{ margin: 0, fontWeight: unread ? 700 : 400, fontSize: '14px', color: '#222' }}>{name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{time}</p>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg}</p>
          </div>
          {unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9b8ec4', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );

  const renderCalendar = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const booked = [3, 4, 5, 12, 13, 20, 21, 22];
    return (
      <div style={card}>
        <h2 style={cardTitle}>🗓️ May 2026</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
          {days.map(d => <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', padding: '6px 0' }}>{d}</div>)}
          {Array.from({ length: 4 }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
            const isBooked = booked.includes(d);
            const isToday = d === 7;
            return (
              <div key={d} style={{ padding: '8px 4px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: isToday ? '#9b8ec4' : isBooked ? '#f0ebff' : 'transparent', color: isToday ? '#fff' : isBooked ? '#7c6fa8' : '#333', fontWeight: isToday || isBooked ? 700 : 400 }}>
                {d}
                {isBooked && !isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9b8ec4', margin: '2px auto 0' }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#888' }}>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#9b8ec4', marginRight: '4px' }} />Today</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f0ebff', border: '1px solid #c9b8f0', marginRight: '4px' }} />Booked</span>
        </div>
      </div>
    );
  };

  const renderInsights = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total earnings', value: '$4,280', change: '+12% vs last month', up: true },
          { label: 'Occupancy rate', value: '78%', change: '+5% vs last month', up: true },
          { label: 'Avg nightly rate', value: '$94', change: '-2% vs last month', up: false },
        ].map(({ label, value, change, up }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#222', margin: '0 0 6px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: up ? '#1a7f45' : '#d93025', margin: 0, fontWeight: 600 }}>{up ? '↑' : '↓'} {change}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', margin: '0 0 20px' }}>Monthly earnings (2026)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
          {[{ month: 'Jan', pct: 55 }, { month: 'Feb', pct: 72 }, { month: 'Mar', pct: 60 }, { month: 'Apr', pct: 88 }, { month: 'May', pct: 45 }].map(({ month, pct }) => (
            <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '100%', background: '#9b8ec4', borderRadius: '6px 6px 0 0', height: `${pct}%` }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>{month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── PERFORMANCE ── */

  const renderQuality = () => (
    <div style={card}>
      <h2 style={cardTitle}>🎯 Quality Score</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(#9b8ec4 0% 92%, #f0ebff 92%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: '#222' }}>4.9</div>
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#222' }}>Excellent</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Top 5% of hosts in Kigali</p>
        </div>
      </div>
      {[{ label: 'Cleanliness', score: 4.9 }, { label: 'Accuracy', score: 4.8 }, { label: 'Communication', score: 5.0 }, { label: 'Location', score: 4.7 }, { label: 'Check-in', score: 4.9 }, { label: 'Value', score: 4.8 }].map(({ label, score }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <p style={{ width: '120px', margin: 0, fontSize: '13px', color: '#555', flexShrink: 0 }}>{label}</p>
          <div style={{ flex: 1, height: '6px', background: '#1a7f45', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: '#9b8ec4', borderRadius: '3px' }} />
          </div>
          <p style={{ width: '30px', margin: 0, fontSize: '13px', fontWeight: 700, color: '#222', textAlign: 'right' }}>{score}</p>
        </div>
      ))}
    </div>
  );

  const renderOccupancy = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={card}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>Occupancy rate</p>
          <p style={{ fontSize: '36px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>78%</p>
          <p style={{ fontSize: '12px', color: '#1a7f45', fontWeight: 600, margin: 0 }}>↑ Above market avg (62%)</p>
        </div>
        <div style={card}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>Avg nightly rate</p>
          <p style={{ fontSize: '36px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>$94</p>
          <p style={{ fontSize: '12px', color: '#1a7f45', fontWeight: 600, margin: 0 }}>↑ Above market avg ($78)</p>
        </div>
      </div>
      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', margin: '0 0 16px' }}>Occupancy by day of week</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
          {[{ day: 'Mon', pct: 60 }, { day: 'Tue', pct: 55 }, { day: 'Wed', pct: 65 }, { day: 'Thu', pct: 70 }, { day: 'Fri', pct: 90 }, { day: 'Sat', pct: 95 }, { day: 'Sun', pct: 80 }].map(({ day, pct }) => (
            <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '100%', background: '#9b8ec4', borderRadius: '4px 4px 0 0', height: `${pct}%`, opacity: pct >= 80 ? 1 : 0.5 }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>{day}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConversion = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[{ label: 'Profile views', value: '1,240', sub: 'Last 30 days' }, { label: 'Listing clicks', value: '387', sub: 'Last 30 days' }, { label: 'Bookings made', value: '24', sub: 'Last 30 days' }].map(({ label, value, sub }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', margin: '0 0 16px' }}>Conversion funnel</h3>
        {[{ stage: 'Views', count: 1240, color: '#e0d7f7' }, { stage: 'Clicks', count: 387, color: '#c9b8f0' }, { stage: 'Inquiries', count: 58, color: '#9b8ec4' }, { stage: 'Bookings', count: 24, color: '#7c6fa8' }].map(({ stage, count, color }) => (
          <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <p style={{ width: '80px', margin: 0, fontSize: '13px', color: '#555' }}>{stage}</p>
            <div style={{ flex: 1, height: '28px', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / 1240) * 100}%`, height: '100%', background: color, borderRadius: '6px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: count > 200 ? '#7c6fa8' : '#fff' }}>{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── MANAGE ── */

  const renderSuperhost = () => (
    <>
      <p style={{ color: '#9b8ec4', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer', margin: '0 0 24px' }}>Learn more about the Diavela Host program</p>
      <div style={{ ...card, marginBottom: '16px' }}>
        <h2 style={cardTitle}>Your Diavela Host stats</h2>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', background: '#f5f3ff', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
          {['Assessment period', 'Jan 1, 2025 – Dec 31, 2025'].map((t, i) => (
            <div key={i} style={{ padding: '6px 16px', fontSize: '13px', background: i === 0 ? '#fff' : 'transparent', borderRadius: '6px', color: '#444', fontWeight: i === 0 ? 600 : 400 }}>{t}</div>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px', maxWidth: '380px', lineHeight: 1.6 }}>Every 3 months, we check if you've met the Diavela Host criteria for the past year.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {stats.map(({ label, value, sub }) => (
            <div key={label} style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#444', margin: '0 0 6px' }}>{label}</p>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 10px' }}>{sub}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px' }}>✅</span>
                <span style={{ fontSize: '12px', color: '#1a7f45', fontWeight: 600 }}>Doing great</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <h2 style={cardTitle}>💜 Saved Homes ({savedListings.length})</h2>
        {state.loading ? <p style={{ color: '#9b8ec4' }}>Loading...</p> : savedListings.length === 0 ? (
          <p style={{ color: '#888', fontSize: '15px' }}>No saved homes yet. Go explore! 🏡</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {savedListings.map((listing) => (
              <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={listing.img} alt={listing.title} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#222', margin: '0 0 2px', fontSize: '14px' }}>{listing.title}</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{listing.location}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 700, color: '#9b8ec4', margin: 0 }}>${listing.pricePerNight}<span style={{ fontWeight: 400, color: '#aaa', fontSize: '12px' }}>/night</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderProperties = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[{ label: 'Total properties', value: '3' }, { label: 'Active listings', value: '3' }, { label: 'Avg rating', value: '4.9★' }].map(({ label, value }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#222', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h2 style={cardTitle}>🏠 My Properties</h2>
        {[
          { name: 'Kigali Hills Villa', location: 'Kigali, Rwanda', price: 120, rating: 4.9 },
          { name: 'Lake Kivu Retreat', location: 'Gisenyi, Rwanda', price: 85, rating: 4.8 },
          { name: 'Nyungwe Forest Lodge', location: 'Nyungwe, Rwanda', price: 95, rating: 5.0 },
        ].map(({ name, location, price, rating }) => (
          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f0ebff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏠</div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: '#222' }}>{name}</p>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>{location}</p>
                <span style={mkBadge('#1a7f45', '#d4f5e2')}>Active</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#9b8ec4', fontSize: '15px' }}>${price}<span style={{ fontWeight: 400, color: '#aaa', fontSize: '12px' }}>/night</span></p>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>⭐ {rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[{ label: 'Upcoming', value: '4', color: '#7c6fa8' }, { label: 'Active now', value: '1', color: '#1a7f45' }, { label: 'Completed', value: '19', color: '#888' }].map(({ label, value, color }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h2 style={cardTitle}>📅 All Bookings</h2>
        {[
          { guest: 'Alice M.', property: 'Kigali Hills Villa', checkin: 'May 10', checkout: 'May 14', nights: 4, total: 480, status: 'Upcoming' },
          { guest: 'Bob K.', property: 'Lake Kivu Retreat', checkin: 'May 7', checkout: 'May 9', nights: 2, total: 170, status: 'Active' },
          { guest: 'Carol N.', property: 'Nyungwe Forest Lodge', checkin: 'Apr 20', checkout: 'Apr 25', nights: 5, total: 475, status: 'Completed' },
          { guest: 'David R.', property: 'Kigali Hills Villa', checkin: 'May 20', checkout: 'May 23', nights: 3, total: 360, status: 'Upcoming' },
          { guest: 'Eva L.', property: 'Lake Kivu Retreat', checkin: 'Jun 1', checkout: 'Jun 5', nights: 4, total: 340, status: 'Upcoming' },
        ].map(({ guest, property, checkin, checkout, nights, total, status }) => {
          const sc = status === 'Active' ? { c: '#1a7f45', bg: '#d4f5e2' } : status === 'Upcoming' ? { c: '#7c6fa8', bg: '#f0ebff' } : { c: '#888', bg: '#f0f0f0' };
          return (
            <div key={guest + checkin} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#222' }}>{guest}</p>
                  <span style={mkBadge(sc.c, sc.bg)}>{status}</span>
                </div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>🏠 {property}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{checkin} → {checkout} · {nights} nights</p>
              </div>
              <p style={{ margin: 0, fontWeight: 700, color: '#9b8ec4', fontSize: '15px' }}>${total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGuests = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[{ label: 'Total guests', value: '48' }, { label: 'Returning guests', value: '12' }, { label: 'Avg stay length', value: '3.4 nights' }].map(({ label, value }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#222', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h2 style={cardTitle}>👥 Recent Guests</h2>
        {[
          { name: 'Alice M.', country: '🇺🇸 USA', stays: 1, rating: 5, note: 'Great guest, left everything spotless.' },
          { name: 'Bob K.', country: '🇬🇧 UK', stays: 2, rating: 5, note: 'Very communicative and respectful.' },
          { name: 'Carol N.', country: '🇩🇪 Germany', stays: 1, rating: 5, note: 'Would love to host again!' },
          { name: 'David R.', country: '🇫🇷 France', stays: 3, rating: 4, note: 'Returning guest — always a pleasure.' },
          { name: 'Eva L.', country: '🇿🇦 South Africa', stays: 1, rating: 5, note: 'Quiet and respectful stay.' },
        ].map(({ name, country, stays, rating, note }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0ebff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#9b8ec4', flexShrink: 0 }}>
              {name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#222' }}>{name}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#f5a623' }}>{'★'.repeat(rating)}</p>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888' }}>{country} · {stays} stay{stays > 1 ? 's' : ''}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', fontStyle: 'italic' }}>"{note}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinances = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'This month', value: '$1,820', up: true },
          { label: 'Last month', value: '$2,340', up: false },
          { label: 'YTD earnings', value: '$14,280', up: true },
          { label: 'Pending payout', value: '$680', up: null },
        ].map(({ label, value, up }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>{value}</p>
            {up !== null && <p style={{ fontSize: '12px', color: up ? '#1a7f45' : '#d93025', fontWeight: 600, margin: 0 }}>{up ? '↑ Up' : '↓ Down'} vs prior</p>}
          </div>
        ))}
      </div>
      <div style={card}>
        <h2 style={cardTitle}>💰 Transaction History</h2>
        {[
          { desc: 'Payout — Bob K. stay', date: 'May 9, 2026', amount: '+$170', pos: true },
          { desc: 'Payout — Carol N. stay', date: 'Apr 25, 2026', amount: '+$475', pos: true },
          { desc: 'Cleaning fee refund', date: 'Apr 22, 2026', amount: '-$30', pos: false },
          { desc: 'Payout — David batch', date: 'Apr 15, 2026', amount: '+$360', pos: true },
          { desc: 'Platform service fee', date: 'Apr 15, 2026', amount: '-$54', pos: false },
        ].map(({ desc, date, amount, pos }) => (
          <div key={desc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '14px', color: '#222' }}>{desc}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{date}</p>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: pos ? '#1a7f45' : '#d93025' }}>{amount}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const taskList = [
    { id: 1, text: 'Confirm booking for Kigali Hills Villa', priority: 'High', due: 'Today' },
    { id: 2, text: 'Reply to Alice M. about pool heating', priority: 'High', due: 'Today' },
    { id: 3, text: 'Update June availability calendar', priority: 'Medium', due: 'May 10' },
    { id: 4, text: 'Replace kitchen towels at Lake Kivu', priority: 'Medium', due: 'May 12' },
    { id: 5, text: 'Order extra toiletries for Nyungwe Lodge', priority: 'Low', due: 'May 15' },
    { id: 6, text: 'Review and respond to Carol N. review', priority: 'Low', due: 'May 16' },
  ];

  const renderTasks = () => (
    <div style={card}>
      <h2 style={cardTitle}>📋 Tasks</h2>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[{ label: 'All', count: taskList.length }, { label: 'Done', count: checkedTasks.length }, { label: 'Remaining', count: taskList.length - checkedTasks.length }].map(({ label, count }) => (
          <div key={label} style={{ padding: '10px 20px', background: '#f5f3ff', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 800, color: '#7c6fa8' }}>{count}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{label}</p>
          </div>
        ))}
      </div>
      {taskList.map(({ id, text, priority, due }) => {
        const done = checkedTasks.includes(id);
        const pc = priority === 'High' ? mkBadge('#d93025', '#fde8e8') : priority === 'Medium' ? mkBadge('#b45309', '#fef3c7') : mkBadge('#888', '#f0f0f0');
        return (
          <div key={id}
            onClick={() => setCheckedTasks(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '6px', background: done ? '#f9f9f9' : '#fff', border: '1px solid #f0f0f0' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
            onMouseLeave={e => (e.currentTarget.style.background = done ? '#f9f9f9' : '#fff')}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${done ? '#9b8ec4' : '#ddd'}`, background: done ? '#9b8ec4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {done && <span style={{ color: '#1a7f45', fontSize: '12px', fontWeight: 700 }}>✓</span>}
            </div>
            <p style={{ flex: 1, margin: 0, fontSize: '14px', color: done ? '#aaa' : '#222', textDecoration: done ? 'line-through' : 'none' }}>{text}</p>
            <span style={pc}>{priority}</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#aaa', flexShrink: 0 }}>📅 {due}</p>
          </div>
        );
      })}
    </div>
  );

  const renderHousekeeping = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[{ label: 'Cleanings this month', value: '8' }, { label: 'Avg turnaround', value: '2.5 hrs' }, { label: 'Issues reported', value: '1' }].map(({ label, value }) => (
          <div key={label} style={card}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: '#222', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={card}>
        <h2 style={cardTitle}>✨ Housekeeping Schedule</h2>
        {[
          { property: 'Kigali Hills Villa', date: 'May 9 — 11:00 AM', cleaner: 'Grace N.', done: true },
          { property: 'Lake Kivu Retreat', date: 'May 10 — 10:00 AM', cleaner: 'Jean P.', done: false },
          { property: 'Nyungwe Forest Lodge', date: 'May 12 — 9:00 AM', cleaner: 'Grace N.', done: false },
          { property: 'Kigali Hills Villa', date: 'May 14 — 11:00 AM', cleaner: 'Jean P.', done: false },
        ].map(({ property, date, cleaner, done }) => (
          <div key={property + date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#222' }}>{property}</p>
                <span style={mkBadge(done ? '#1a7f45' : '#7c6fa8', done ? '#d4f5e2' : '#f0ebff')}>{done ? 'Completed' : 'Scheduled'}</span>
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#888' }}>📅 {date}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>🧹 {cleaner}</p>
            </div>
            <button style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e0d7f7', background: '#fff', color: '#9b8ec4', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {done ? 'View report' : 'Reschedule'}
            </button>
          </div>
        ))}
      </div>
      <div style={card}>
        <h3 style={{ ...cardTitle, marginBottom: '16px' }}>🛒 Supplies checklist</h3>
        {[
          { item: 'Towels (set of 6)', ok: true },
          { item: 'Toiletry kits', ok: false },
          { item: 'Coffee pods', ok: true },
          { item: 'Cleaning spray', ok: false },
          { item: 'Bed linen sets', ok: true },
        ].map(({ item, ok }) => (
          <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{item}</p>
            <span style={mkBadge(ok ? '#1a7f45' : '#d93025', ok ? '#d4f5e2' : '#fde8e8')}>{ok ? 'OK' : 'Low'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (active) {
      case 'today': return renderToday();
      case 'inbox': return renderInbox();
      case 'calendar': return renderCalendar();
      case 'insights': return renderInsights();
      case 'quality': return renderQuality();
      case 'occupancy': return renderOccupancy();
      case 'conversion': return renderConversion();
      case 'superhost': return renderSuperhost();
      case 'properties': return renderProperties();
      case 'bookings': return renderBookings();
      case 'guests': return renderGuests();
      case 'finances': return renderFinances();
      case 'tasks': return renderTasks();
      case 'housekeeping': return renderHousekeeping();
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', background: '#fafafa', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#1a7f45', borderRight: '1px solid #eee', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#9b8ec4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
              {user?.email?.[0]?.toUpperCase() ?? 'D'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? 'Diavela Host'}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9b8ec4', fontWeight: 600 }}>⭐ Superhost</p>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sideNav.map(({ group, items }, gi) => (
            <div key={group} style={{ padding: '0 8px', marginBottom: gi < sideNav.length - 1 ? '4px' : 0 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 8px 8px' }}>{group}</p>
              {items.map(({ id, label }) => (
                <div key={id} onClick={() => setActive(id)}
                  style={{ padding: '9px 12px', cursor: 'pointer', borderRadius: '8px', margin: '2px 0', fontWeight: active === id ? 700 : 400, background: active === id ? '#f5f3ff' : 'transparent', color: active === id ? '#7c6fa8' : '#555', fontSize: '14px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = '#f9f9f9'; }}
                  onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {label}
                </div>
              ))}
              {gi < sideNav.length - 1 && <div style={{ height: '1px', background: '#f0f0f0', margin: '12px 8px' }} />}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', marginTop: '8px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #e0d7f7', background: '#fff', color: '#9b8ec4', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            🚪 Log out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#222', margin: '0 0 4px' }}>{pageTitle[active]}</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Welcome back, <strong>{user?.email ?? 'Host'}</strong> 💜</p>
          </div>
          <span style={{ fontSize: '22px', cursor: 'pointer' }}>🔔</span>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

