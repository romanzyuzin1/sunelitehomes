import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/admin/dashboard');
      } else {
        setError('Credenciales incorrectas. Inténtelo de nuevo.');
      }
    } catch {
      setError('Error de conexión. Inténtelo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-gold flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-brand-navy" />
          </div>
          <h1 className="font-playfair text-3xl text-white font-bold">
            SunEliteHomes
          </h1>
          <p className="font-montserrat text-sm text-white/60 mt-2">
            Panel de Administración
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm p-8 space-y-6"
        >
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 text-sm font-montserrat">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-montserrat text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors font-montserrat"
              placeholder="admin@sunelitehomes.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-montserrat text-white/80 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors font-montserrat pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-brand-gold text-brand-navy font-montserrat font-semibold uppercase tracking-wider hover:bg-brand-gold/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <p className="text-center text-white/40 font-montserrat text-xs">
            Acceso restringido a agentes autorizados
          </p>
        </form>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-white/50 hover:text-brand-gold font-montserrat text-sm transition-colors"
          >
            ← Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  );
}
