import { useState, useEffect } from 'react';
import {
  loadPortalConfigs,
  savePortalConfigs,
  generateXmlForPortal,
  downloadXml,
  pushToPortalApi,
  type PortalConfig,
} from '../../lib/portalService';
import {
  loadEmailConfig,
  saveEmailConfig,
  type EmailConfig,
} from '../../lib/emailService';
import { fetchAllProperties } from '../../lib/propertyService';
import type { Property } from '../../data/properties';
import {
  Globe,
  Key,
  Save,
  Download,
  Upload,
  Loader2,
  Check,
  AlertTriangle,
  Mail,
  Settings,
} from 'lucide-react';

export function PortalSettings() {
  const [portals, setPortals] = useState<PortalConfig[]>([]);
  const [emailCfg, setEmailCfg] = useState<EmailConfig>({
    provider: 'none',
    apiKey: '',
    fromEmail: 'info@sunelitehomes.com',
    fromName: 'SunEliteHomes',
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([loadPortalConfigs(), fetchAllProperties(), loadEmailConfig()])
      .then(([cfgs, props, eCfg]) => {
        setPortals(cfgs);
        setProperties(props);
        setEmailCfg(eCfg);
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePortal = (id: string, partial: Partial<PortalConfig>) => {
    setPortals(prev =>
      prev.map(p => (p.id === id ? { ...p, ...partial } : p)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        savePortalConfigs(portals),
        saveEmailConfig(emailCfg),
      ]);
      setMsg({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch {
      setMsg({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadXml = (portal: PortalConfig) => {
    const available = properties.filter(p => p.status === 'disponible');
    const xml = generateXmlForPortal(portal.id, available);
    downloadXml(xml, `${portal.id}-feed.xml`);
  };

  const handlePushApi = async (portal: PortalConfig) => {
    if (!portal.apiUrl) {
      setMsg({ type: 'error', text: `Configura la URL de API para ${portal.name}` });
      return;
    }
    setExporting(portal.id);
    setMsg(null);

    const available = properties.filter(p => p.status === 'disponible');
    const xml = generateXmlForPortal(portal.id, available);
    const result = await pushToPortalApi(portal.apiUrl, portal.apiKey, xml);

    if (result.ok) {
      updatePortal(portal.id, {
        lastExport: new Date().toISOString(),
        exportedCount: available.length,
      });
      setMsg({ type: 'success', text: `${portal.name}: ${result.message} (${available.length} inmuebles)` });
    } else {
      setMsg({ type: 'error', text: `${portal.name}: ${result.message}` });
    }
    setExporting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
            Portales y Email
          </h1>
          <p className="font-montserrat text-sm text-gray-500 mt-1">
            Exporta inmuebles a portales inmobiliarios y configura el envío de emails.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded font-montserrat text-sm hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar todo
        </button>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded mb-6 font-montserrat text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* ── Email Config ── */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          <Mail className="w-4 h-4" /> Configuración de Email
        </h2>
        <p className="font-montserrat text-xs text-gray-400 mb-4">
          Configura un proveedor de email para enviar seguimientos directamente desde el CRM.
          Sin proveedor, se abrirá tu cliente de correo predeterminado.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">Proveedor</label>
            <select
              value={emailCfg.provider}
              onChange={e => setEmailCfg(prev => ({ ...prev, provider: e.target.value as EmailConfig['provider'] }))}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            >
              <option value="none">Sin proveedor (mailto:)</option>
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">API Key</label>
            <input
              type="password"
              value={emailCfg.apiKey}
              onChange={e => setEmailCfg(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={emailCfg.provider === 'none' ? 'No necesaria' : 'Introduce tu API key'}
              disabled={emailCfg.provider === 'none'}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">Email remitente</label>
            <input
              type="email"
              value={emailCfg.fromEmail}
              onChange={e => setEmailCfg(prev => ({ ...prev, fromEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">Nombre remitente</label>
            <input
              type="text"
              value={emailCfg.fromName}
              onChange={e => setEmailCfg(prev => ({ ...prev, fromName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      </div>

      {/* ── Portals ── */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          <Globe className="w-4 h-4" /> Portales Inmobiliarios
        </h2>
        <p className="font-montserrat text-xs text-gray-400 mb-6">
          Activa los portales a los que quieras exportar. Puedes descargar el XML o enviar
          directamente a su API si la tienen disponible. Actualmente hay{' '}
          <strong>{properties.filter(p => p.status === 'disponible').length}</strong>{' '}
          inmuebles disponibles para exportar.
        </p>

        <div className="space-y-4">
          {portals.map(portal => (
            <div
              key={portal.id}
              className={`border rounded-lg p-4 transition-colors ${
                portal.enabled
                  ? 'border-brand-gold/40 bg-brand-gold/5'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{portal.icon}</span>
                <div className="flex-1">
                  <p className="font-montserrat text-sm font-semibold text-gray-800">
                    {portal.name}
                  </p>
                  {portal.lastExport && (
                    <p className="font-montserrat text-[10px] text-gray-400">
                      Última exportación:{' '}
                      {new Date(portal.lastExport).toLocaleString('es-ES')} ·{' '}
                      {portal.exportedCount} inmuebles
                    </p>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portal.enabled}
                    onChange={e => updatePortal(portal.id, { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-checked:bg-brand-gold rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>

              {/* Config fields — only when enabled */}
              {portal.enabled && (
                <div className="space-y-3 ml-10">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1 font-montserrat text-xs text-gray-500 mb-1">
                        <Key className="w-3 h-3" /> API Key
                      </label>
                      <input
                        type="password"
                        value={portal.apiKey}
                        onChange={e =>
                          updatePortal(portal.id, { apiKey: e.target.value })
                        }
                        placeholder="Opcional — para envío directo"
                        className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 font-montserrat text-xs text-gray-500 mb-1">
                        <Settings className="w-3 h-3" /> URL API
                      </label>
                      <input
                        type="url"
                        value={portal.apiUrl}
                        onChange={e =>
                          updatePortal(portal.id, { apiUrl: e.target.value })
                        }
                        placeholder="https://api.portal.com/feed"
                        className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-xs focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleDownloadXml(portal)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-montserrat text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar XML
                    </button>
                    <button
                      onClick={() => handlePushApi(portal)}
                      disabled={!portal.apiUrl || exporting === portal.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded font-montserrat text-xs hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
                    >
                      {exporting === portal.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Enviar a API
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
