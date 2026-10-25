import React, { useState } from 'react';
import { AlertTriangle, LogIn, Wrench } from 'lucide-react';
import { useAuth } from '../services/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar');
    } finally {
      setSubmitting(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-prominent)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)',
    fontSize: '0.95rem',
    outline: 'none',
  };
  const label: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at 20% 15%, rgba(6,182,212,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(99,102,241,0.18), transparent 45%), var(--bg-canvas)',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 36,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(18px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
              color: '#fff',
            }}
          >
            <Wrench size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              ANDALORE CMMS
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enterprise Asset &amp; Maintenance OS
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="login-email" style={label}>E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={field}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="login-password" style={label}>Senha</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={field}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 16,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-glow)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <button
          id="login-submit"
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', opacity: submitting ? 0.7 : 1 }}
        >
          <LogIn size={16} /> {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};
