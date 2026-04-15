import { useState, useEffect, type FormEvent } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Shield, Check, AlertTriangle, Loader2, Sparkles, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { loadAIConfig, saveAIConfig, type AIConfig, type AIProvider } from '../../lib/aiService';

export function AdminSettings() {
  const { changePassword } = useAdminAuth();
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // AI Config
  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'gemini', apiKey: '' });
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadAIConfig()
      .then(cfg => setAiConfig(cfg))
      .finally(() => setAiLoading(false));
  }, []);

  const handleSaveAI = async () => {
    setAiSaving(true);
    setAiMessage(null);
    try {
      await saveAIConfig(aiConfig);
      setAiMessage({ type: 'success', text: 'Configuración de IA guardada correctamente.' });
    } catch {
      setAiMessage({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setAiSaving(false);
    }
  };

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

      {/* AI Settings */}
      <div className="bg-white p-6 shadow-sm rounded-lg max-w-lg mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500">
            Inteligencia Artificial
          </h2>
        </div>

        <p className="font-montserrat text-sm text-gray-600 mb-4">
          Genera descripciones de inmuebles automáticamente con IA. Elige un proveedor y añade tu clave API gratuita.
        </p>

        {aiLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="font-montserrat text-sm text-gray-400">Cargando configuración…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Provider selector */}
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Proveedor de IA
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  {
                    id: 'groq' as AIProvider,
                    name: 'Groq',
                    desc: 'Gratuito · Funciona en España/UE',
                    url: 'https://console.groq.com/keys',
                    urlLabel: 'Obtener clave en Groq Console',
                    placeholder: 'gsk_...',
                  },
                  {
                    id: 'gemini' as AIProvider,
                    name: 'Google Gemini',
                    desc: 'Gratuito · No disponible en UE',
                    url: 'https://aistudio.google.com/apikey',
                    urlLabel: 'Obtener clave en Google AI Studio',
                    placeholder: 'AIzaSy...',
                  },
                ]).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAiConfig(prev => ({ ...prev, provider: p.id }))}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      aiConfig.provider === p.id
                        ? 'border-brand-gold bg-brand-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-montserrat text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="font-montserrat text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Link to get API key */}
            <a
              href={aiConfig.provider === 'groq' ? 'https://console.groq.com/keys' : 'https://aistudio.google.com/apikey'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-montserrat text-sm text-brand-gold hover:text-brand-gold/80 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {aiConfig.provider === 'groq'
                ? 'Obtener clave API gratuita en Groq Console'
                : 'Obtener clave API gratuita en Google AI Studio'}
            </a>

            {/* API Key input */}
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Clave API de {aiConfig.provider === 'groq' ? 'Groq' : 'Gemini'}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={aiConfig.apiKey}
                  onChange={e => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  placeholder={aiConfig.provider === 'groq' ? 'gsk_...' : 'AIzaSy...'}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {aiMessage && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded font-montserrat text-sm ${
                  aiMessage.type === 'success'
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {aiMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {aiMessage.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveAI}
              disabled={aiSaving}
              className="px-6 py-2.5 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold rounded hover:bg-brand-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {aiSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {aiSaving ? 'Guardando…' : 'Guardar configuración'}
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-white p-6 shadow-sm rounded-lg max-w-lg mt-6">
        <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Información
        </h2>
        <div className="space-y-2 font-montserrat text-sm text-gray-600">
          <p>
            Los datos se almacenan en Supabase (base de datos en la nube).
            Todos los agentes comparten la misma información en tiempo real.
          </p>
          <p>
            Si Supabase no está configurado, los datos se guardan localmente
            en el navegador (localStorage) como respaldo.
          </p>
        </div>
      </div>
    </div>
  );
}
