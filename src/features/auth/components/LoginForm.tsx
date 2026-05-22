  import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#222' }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1.5px solid #ddd',
            borderRadius: '10px',
            fontSize: '15px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#222' }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=""
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1.5px solid #ddd',
            borderRadius: '10px',
            fontSize: '15px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          background: '#9b8ec4',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '13px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginTop: '4px',
        }}
      >
        Log in to Diavela
      </button>
    </form>
  );
}

