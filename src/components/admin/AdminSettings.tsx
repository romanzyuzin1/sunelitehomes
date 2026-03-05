import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Shield, Check, AlertTriangle, Loader2 } from 'lucide-react';

export function AdminSettings() {
  const { changePassword } = useAdminAuth();
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPwd !== confirmPwd) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPwd.length < 6) {
      setMessage({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const ok = await changePassword(newPwd);
      if (ok) {
        setMessage({
          type: 'success',
          text: 'Contraseña actualizada correctamente.',
        });
        setNewPwd('');
        setConfirmPwd('');
      } else {
        setMessage({
          type: 'error',
          text: 'Error al actualizar la contraseña.',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Inténtelo más tarde.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
          Configuración
        </h1>
        <p className="font-montserrat text-sm text-gray-500 mt-1">
          Ajustes de seguridad y acceso
        </p>
      </div>

      {/* Change password */}
      <div className="bg-white p-6 shadow-sm rounded-lg max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-brand-gold" />
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500">
            Cambiar Contraseña
          </h2>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded mb-4 font-montserrat text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-montserrat text-sm text-gray-600 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block font-montserrat text-sm text-gray-600 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold rounded hover:bg-brand-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Actualizando…' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div className="bg-white p-6 shadow-sm rounded-lg max-w-lg mt-6">
        <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Información
        </h2>
        <div className="space-y-2 font-montserrat text-sm text-gray-600">
          <p>
            Los datos de propiedades se almacenan localmente en este navegador
            (localStorage).
          </p>
          <p>
            Para un sistema compartido entre múltiples agentes, se recomienda
            configurar un servidor backend.
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Credenciales por defecto: admin@sunelitehomes.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
