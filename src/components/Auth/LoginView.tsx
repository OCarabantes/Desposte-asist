import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  LogIn, 
  Sparkles
} from 'lucide-react';
import { AuthService, ADMIN_CREDENTIALS, UserSession } from '../../services/authService';
import logoImg from '../../img/LOGO.png';

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('ssoruco@karmac.cl');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(email, password);
      setIsLoading(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message || 'Error de autenticación');
      }
    }, 250);
  };

  const handleFillCredentials = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1.5rem',
      position: 'relative'
    }}>
      
      {/* Centered Login Card */}
      <div 
        className="card" 
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)'
        }}
      >
        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src={logoImg} 
            alt="Frigorífico Karmac" 
            style={{
              maxHeight: '68px',
              maxWidth: '200px',
              objectFit: 'contain',
              margin: '0 auto 0.85rem auto',
              display: 'block'
            }}
          />

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.2rem' }}>
            FRIGORÍFICO KARMAC
          </h1>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sistema de Control de Asistencia • Desposte
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0.85rem',
            marginBottom: '1.25rem',
            background: 'var(--color-absent-bg)',
            border: '1px solid var(--color-absent-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-absent)',
            fontSize: '0.775rem',
            lineHeight: 1.35
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Email field */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} color="var(--text-muted)" />
              <span>Correo de Usuario Administrador</span>
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@karmac.cl"
              className="input font-mono"
              required
              autoFocus
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Password field */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} color="var(--text-muted)" />
              <span>Contraseña de Acceso</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input font-mono"
                required
                style={{ paddingRight: '2.5rem', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem'
                }}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ 
              marginTop: '0.5rem', 
              padding: '0.75rem', 
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            <LogIn size={15} />
            <span>{isLoading ? 'Verificando...' : 'Ingresar al Sistema'}</span>
          </button>
        </form>

        {/* Quick fill helper chip for convenience */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleFillCredentials}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.725rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            title="Rellenar automáticamente correo y clave admin"
          >
            <Sparkles size={12} color="var(--text-secondary)" />
            <span>Autocompletar credenciales (Admin)</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} color="var(--color-present)" />
            <span>Acceso exclusivo Jefatura de Desposte Karmac</span>
          </div>
        </div>

      </div>
    </div>
  );
};
