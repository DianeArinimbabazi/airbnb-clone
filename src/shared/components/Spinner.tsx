export function Spinner() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Loading...
    </div>
  );
}