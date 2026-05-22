 import { Transition } from '@headlessui/react';
import { useStore } from '../../../store/StoreContext';

export function SavedListings() {
  const { state } = useStore();
  const savedListings = state.listings.filter((l) => state.saved.includes(l.id));
  const show = savedListings.length > 0;

  return (
    <Transition
      show={show}
      enter="transition-all duration-300 ease-out"
      enterFrom="opacity-0 translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-200 ease-in"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-4"
    >
      <div style={{
        background: '#f5f3ff',
        border: '1.5px solid #c4b5fd',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#7c6fa8', marginBottom: '16px' }}>
           Saved Homes ({savedListings.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {savedListings.map((listing) => (
            <div key={listing.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(155,142,196,0.1)',
            }}>
              <div>
                <p style={{ fontWeight: 600, color: '#222', margin: 0 }}>{listing.title}</p>
                <p style={{ fontSize: '13px', color: '#717171', margin: '2px 0 0' }}>{listing.location}</p>
              </div>
              <p style={{ fontWeight: 700, color: '#9b8ec4', margin: 0 }}>
                ${listing.pricePerNight}<span style={{ fontWeight: 400, color: '#aaa', fontSize: '13px' }}>/night</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Transition>
  );
}


