import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchContactById,
  createContact,
  updateContact,
} from '../../lib/contactService';
import {
  createEmptyContact,
  type Contact,
} from '../../data/contacts';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  Home,
  ShoppingCart,
} from 'lucide-react';

const SOURCE_OPTIONS = [
  'Web', 'Idealista', 'Fotocasa', 'Referencia', 'Cartel',
  'Redes Sociales', 'Portales', 'Otro',
];

const PROPERTY_TYPES = [
  'Casa', 'Piso', 'Ático', 'Dúplex', 'Chalet', 'Villa',
  'Adosado', 'Estudio', 'Local', 'Oficina', 'Terreno', 'Garaje',
];

export function ContactEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [contact, setContact] = useState<Contact>(createEmptyContact());
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [zoneInput, setZoneInput] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    fetchContactById(Number(id))
      .then(c => {
        if (c) setContact(c);
        else navigate('/admin/contactos');
      })
      .catch(() => navigate('/admin/contactos'))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateContact(Number(id), contact);
      } else {
        await createContact(contact);
      }
      navigate('/admin/contactos');
    } catch (err) {
      console.error('Error saving contact:', err);
      alert('Error al guardar el contacto.');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) =>
    setContact(prev => ({ ...prev, [key]: value }));

  const addZone = () => {
    const z = zoneInput.trim();
    if (z && !contact.prefZones.includes(z)) {
      set('prefZones', [...contact.prefZones, z]);
    }
    setZoneInput('');
  };

  const removeZone = (zone: string) =>
    set('prefZones', contact.prefZones.filter(z => z !== zone));

  const togglePrefType = (t: string) => {
    set(
      'prefTypes',
      contact.prefTypes.includes(t)
        ? contact.prefTypes.filter(x => x !== t)
        : [...contact.prefTypes, t],
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/contactos')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-playfair text-2xl text-gray-800 font-semibold">
          {isEdit ? 'Editar Contacto' : 'Nuevo Contacto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* ── Personal Info ── */}
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            <User className="w-4 h-4" /> Datos Personales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={contact.firstName}
                onChange={e => set('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Apellidos
              </label>
              <input
                type="text"
                value={contact.lastName}
                onChange={e => set('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="flex items-center gap-1 font-montserrat text-sm text-gray-600 mb-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={e => set('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 font-montserrat text-sm text-gray-600 mb-1">
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="flex items-center gap-1 font-montserrat text-sm text-gray-600 mb-1">
                <Phone className="w-3.5 h-3.5" /> Teléfono 2
              </label>
              <input
                type="tel"
                value={contact.phone2}
                onChange={e => set('phone2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Fuente
              </label>
              <select
                value={contact.source}
                onChange={e => set('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              >
                <option value="">— Sin especificar —</option>
                {SOURCE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Roles ── */}
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Tipo de Contacto
          </h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contact.isOwner}
                onChange={e => set('isOwner', e.target.checked)}
                className="w-4 h-4 accent-brand-gold"
              />
              <Home className="w-4 h-4 text-brand-gold" />
              <span className="font-montserrat text-sm">Propietario</span>
              <span className="text-xs text-gray-400">(quiere vender/alquilar)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contact.isBuyer}
                onChange={e => set('isBuyer', e.target.checked)}
                className="w-4 h-4 accent-brand-gold"
              />
              <ShoppingCart className="w-4 h-4 text-blue-500" />
              <span className="font-montserrat text-sm">Comprador / Inquilino</span>
              <span className="text-xs text-gray-400">(busca inmueble)</span>
            </label>
          </div>

          {/* Owner subsection */}
          {contact.isOwner && (
            <div className="mt-4 pl-4 border-l-2 border-brand-gold/30">
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Intención del propietario
              </label>
              <select
                value={contact.ownerIntent}
                onChange={e =>
                  set('ownerIntent', e.target.value as Contact['ownerIntent'])
                }
                className="w-full sm:w-56 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              >
                <option value="sell">Vender</option>
                <option value="rent">Alquilar</option>
                <option value="both">Ambos</option>
              </select>
            </div>
          )}

          {/* Buyer subsection */}
          {contact.isBuyer && (
            <div className="mt-4 pl-4 border-l-2 border-blue-300/50 space-y-4">
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Tipo de interés
                </label>
                <select
                  value={contact.interestType}
                  onChange={e =>
                    set('interestType', e.target.value as Contact['interestType'])
                  }
                  className="w-full sm:w-56 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                >
                  <option value="buy">Comprar</option>
                  <option value="rent">Alquilar</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Presupuesto Mín. (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={contact.budgetMin ?? ''}
                    onChange={e =>
                      set(
                        'budgetMin',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Presupuesto Máx. (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={contact.budgetMax ?? ''}
                    onChange={e =>
                      set(
                        'budgetMax',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Dormitorios mín.
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={contact.prefBeds ?? ''}
                    onChange={e =>
                      set(
                        'prefBeds',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-montserrat text-sm text-gray-600 mb-1">
                    Baños mín.
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={contact.prefBaths ?? ''}
                    onChange={e =>
                      set(
                        'prefBaths',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
              {/* Preferred zones */}
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Zonas preferidas
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={zoneInput}
                    onChange={e => setZoneInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addZone();
                      }
                    }}
                    placeholder="Ej: Marbella"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
                  />
                  <button
                    type="button"
                    onClick={addZone}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded font-montserrat text-sm transition-colors"
                  >
                    Añadir
                  </button>
                </div>
                {contact.prefZones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contact.prefZones.map(z => (
                      <span
                        key={z}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-montserrat"
                      >
                        {z}
                        <button
                          type="button"
                          onClick={() => removeZone(z)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Preferred property types */}
              <div>
                <label className="block font-montserrat text-sm text-gray-600 mb-1">
                  Tipos de inmueble
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => togglePrefType(t)}
                      className={`px-3 py-1 rounded text-xs font-montserrat transition-colors ${
                        contact.prefTypes.includes(t)
                          ? 'bg-brand-gold text-brand-navy font-semibold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Status & Notes ── */}
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Estado y Notas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-montserrat text-sm text-gray-600 mb-1">
                Estado
              </label>
              <select
                value={contact.status}
                onChange={e =>
                  set('status', e.target.value as Contact['status'])
                }
                className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block font-montserrat text-sm text-gray-600 mb-1">
              Notas internas
            </label>
            <textarea
              value={contact.notes}
              onChange={e => set('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold resize-y"
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-brand-navy font-montserrat text-sm font-semibold rounded hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando…' : isEdit ? 'Guardar Cambios' : 'Crear Contacto'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/contactos')}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 font-montserrat text-sm rounded hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
