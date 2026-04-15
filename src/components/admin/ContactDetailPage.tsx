import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchContactById,
  fetchInterestsByContact,
  addPropertyInterest,
  removePropertyInterest,
} from '../../lib/contactService';
import {
  fetchPropertiesByOwner,
  fetchPropertyById,
} from '../../lib/propertyService';
import { getContactFullName } from '../../data/contacts';
import type { Contact, PropertyInterest } from '../../data/contacts';
import type { Property } from '../../data/properties';
import { formatPrice } from '../../data/properties';
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  ShoppingCart,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Edit,
  ExternalLink,
  Send,
  MessageCircle,
  Calendar,
  Tag,
  FileText,
  MapPin,
  Clock,
} from 'lucide-react';
import { EmailComposer } from './EmailComposer';

type Tab = 'general' | 'propiedades' | 'intereses' | 'actividad';

/**
 * Contact Detail Page — Engel & Völkers–inspired layout:
 * Left sidebar (contact card) | Center (tabbed content) | Right sidebar (info)
 */
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Owned properties split by intent
  const [ownedProperties, setOwnedProperties] = useState<Property[]>([]);

  // Interest links + resolved property data
  const [interests, setInterests] = useState<PropertyInterest[]>([]);
  const [interestProperties, setInterestProperties] = useState<
    Record<number, Property | null>
  >({});

  // Add interest form
  const [addPropertyId, setAddPropertyId] = useState('');
  const [addLevel, setAddLevel] = useState<PropertyInterest['interestLevel']>('medium');
  const [addingInterest, setAddingInterest] = useState(false);
  const [emailProperty, setEmailProperty] = useState<Property | null>(null);

  // ── Load everything ──
  const loadData = useCallback(async () => {
    const cid = Number(id);
    if (!cid) {
      navigate('/admin/contactos');
      return;
    }

    setLoading(true);

    const [c, owned, ints] = await Promise.all([
      fetchContactById(cid),
      fetchPropertiesByOwner(cid),
      fetchInterestsByContact(cid),
    ]);

    if (!c) {
      navigate('/admin/contactos');
      return;
    }

    setContact(c);
    setOwnedProperties(owned);
    setInterests(ints);

    // Resolve property names for interests
    const propMap: Record<number, Property | null> = {};
    await Promise.all(
      ints.map(async i => {
        propMap[i.propertyId] = await fetchPropertyById(i.propertyId);
      }),
    );
    setInterestProperties(propMap);

    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Add interest ──
  const handleAddInterest = async () => {
    const pid = Number(addPropertyId);
    if (!pid || !contact) return;
    setAddingInterest(true);
    try {
      await addPropertyInterest(pid, contact.id, addLevel);
      setAddPropertyId('');
      await loadData();
    } catch (err) {
      console.error('Error adding interest:', err);
    } finally {
      setAddingInterest(false);
    }
  };

  // ── Remove interest ──
  const handleRemoveInterest = async (interestId: number) => {
    if (!confirm('¿Eliminar este interés?')) return;
    try {
      await removePropertyInterest(interestId);
      await loadData();
    } catch (err) {
      console.error('Error removing interest:', err);
    }
  };

  // ── Helpers ──
  const saleProp = ownedProperties.filter(p => p.priceFreq === 'sale');
  const rentProp = ownedProperties.filter(p => p.priceFreq === 'month');

  const levelBadge = (level: PropertyInterest['interestLevel']) => {
    const cls =
      level === 'high'
        ? 'bg-green-100 text-green-700'
        : level === 'medium'
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-600';
    const label =
      level === 'high' ? 'Alto' : level === 'medium' ? 'Medio' : 'Bajo';
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cls}`}
      >
        {label}
      </span>
    );
  };

  const statusColor = (s: string) =>
    s === 'disponible'
      ? 'bg-green-100 text-green-700'
      : s === 'reservado'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-600';

  const formatWhatsApp = (phone: string) => {
    const digits = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    return `https://wa.me/${digits}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!contact) return null;

  const initials = `${(contact.firstName || '?')[0]}${(contact.lastName || '')[0] || ''}`.toUpperCase();
  const roleBadges: string[] = [];
  if (contact.isOwner) roleBadges.push('Propietario');
  if (contact.isBuyer) roleBadges.push('Comprador');

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'general', label: 'Descripción General' },
    { key: 'propiedades', label: 'Propiedades', count: ownedProperties.length },
    { key: 'intereses', label: 'Intereses', count: interests.length },
    { key: 'actividad', label: 'Actividad' },
  ];

  return (
    <div>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/admin/contactos')}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded font-montserrat text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Contactos
        </button>
        <Link
          to={`/admin/contactos/${contact.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded font-montserrat text-sm hover:bg-brand-gold/90 transition-colors"
        >
          <Edit className="w-4 h-4" /> Editar
        </Link>
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4 lg:gap-5">

        {/* ═══════ LEFT SIDEBAR — Contact Card ═══════ */}
        <div className="space-y-4">
          {/* Avatar + Name + Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-navy text-white flex items-center justify-center font-playfair text-2xl font-bold mb-3">
              {initials}
            </div>

            {/* Name */}
            <h1 className="font-playfair text-xl text-gray-800 font-semibold leading-tight">
              {getContactFullName(contact)}
            </h1>
            <p className="font-montserrat text-xs text-gray-400 mt-0.5">
              C-{String(contact.id).padStart(5, '0')}
            </p>

            {/* 3 Action Buttons — Call · Email · WhatsApp */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Llamar"
                >
                  <Phone className="w-5 h-5" />
                </a>
              ) : (
                <span className="w-11 h-11 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center cursor-not-allowed">
                  <Phone className="w-5 h-5" />
                </span>
              )}

              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Enviar email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              ) : (
                <span className="w-11 h-11 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center cursor-not-allowed">
                  <Mail className="w-5 h-5" />
                </span>
              )}

              {contact.phone ? (
                <a
                  href={formatWhatsApp(contact.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              ) : (
                <span className="w-11 h-11 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center cursor-not-allowed">
                  <MessageCircle className="w-5 h-5" />
                </span>
              )}
            </div>

            {/* Role badges */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {roleBadges.map(b => (
                <span
                  key={b}
                  className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold font-montserrat text-[11px] font-semibold rounded-full"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Info Fields */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Información de contacto
            </h3>

            {contact.phone && (
              <InfoRow label="Teléfono" icon={<Phone className="w-3.5 h-3.5" />}>
                <a href={`tel:${contact.phone}`} className="text-brand-navy hover:underline">
                  {contact.phone}
                </a>
              </InfoRow>
            )}
            {contact.phone2 && (
              <InfoRow label="Teléfono 2" icon={<Phone className="w-3.5 h-3.5 text-gray-400" />}>
                <a href={`tel:${contact.phone2}`} className="text-brand-navy hover:underline">
                  {contact.phone2}
                </a>
              </InfoRow>
            )}
            {contact.email && (
              <InfoRow label="Email" icon={<Mail className="w-3.5 h-3.5" />}>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-brand-navy hover:underline truncate block"
                >
                  {contact.email}
                </a>
              </InfoRow>
            )}
            {contact.source && (
              <InfoRow label="Fuente" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                {contact.source}
              </InfoRow>
            )}

            {/* Buyer preferences */}
            {contact.isBuyer && (
              <>
                {contact.interestType && (
                  <InfoRow label="Interés" icon={<Tag className="w-3.5 h-3.5" />}>
                    {contact.interestType === 'buy'
                      ? 'Comprar'
                      : contact.interestType === 'rent'
                        ? 'Alquilar'
                        : 'Comprar / Alquilar'}
                  </InfoRow>
                )}
                {(contact.budgetMin != null || contact.budgetMax != null) && (
                  <InfoRow label="Presupuesto" icon={<Tag className="w-3.5 h-3.5" />}>
                    {contact.budgetMin != null && `${contact.budgetMin.toLocaleString('es-ES')} €`}
                    {contact.budgetMin != null && contact.budgetMax != null && ' – '}
                    {contact.budgetMax != null && `${contact.budgetMax.toLocaleString('es-ES')} €`}
                  </InfoRow>
                )}
                {contact.prefBeds != null && (
                  <InfoRow label="Dormitorios" icon={<Home className="w-3.5 h-3.5" />}>
                    {contact.prefBeds}+
                  </InfoRow>
                )}
                {contact.prefZones.length > 0 && (
                  <InfoRow label="Zonas" icon={<MapPin className="w-3.5 h-3.5" />}>
                    {contact.prefZones.join(', ')}
                  </InfoRow>
                )}
                {contact.prefTypes.length > 0 && (
                  <InfoRow label="Tipos" icon={<Building2 className="w-3.5 h-3.5" />}>
                    {contact.prefTypes.join(', ')}
                  </InfoRow>
                )}
              </>
            )}
          </div>
        </div>

        {/* ═══════ CENTER — Tabbed Content ═══════ */}
        <div className="min-w-0">
          {/* Tab bar */}
          <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-3 font-montserrat text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === t.key
                      ? 'border-brand-gold text-brand-gold font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                  {t.count != null && t.count > 0 && (
                    <span className="ml-1.5 text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-full font-bold">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-b-lg shadow-sm p-5 min-h-[400px]">

            {/* ── TAB: General ── */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Notes */}
                <div>
                  <h3 className="flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    <FileText className="w-3.5 h-3.5" /> Notas
                  </h3>
                  {contact.notes ? (
                    <p className="font-montserrat text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {contact.notes}
                    </p>
                  ) : (
                    <p className="font-montserrat text-sm text-gray-400 italic">Sin notas</p>
                  )}
                </div>

                {/* Connected properties summary */}
                <div>
                  <h3 className="flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <Home className="w-3.5 h-3.5" /> Propiedades conectadas ({ownedProperties.length + interests.length})
                  </h3>

                  {ownedProperties.length === 0 && interests.length === 0 ? (
                    <p className="font-montserrat text-sm text-gray-400 italic">Sin propiedades conectadas</p>
                  ) : (
                    <div className="space-y-2">
                      {ownedProperties.map(p => (
                        <ConnectedPropertyRow
                          key={`own-${p.id}`}
                          property={p}
                          role="Propietario"
                          statusColor={statusColor}
                        />
                      ))}
                      {interests.map(interest => {
                        const prop = interestProperties[interest.propertyId];
                        if (!prop) return null;
                        return (
                          <ConnectedPropertyRow
                            key={`int-${interest.id}`}
                            property={prop}
                            role={
                              interest.interestLevel === 'high'
                                ? 'Interesante para captación'
                                : interest.interestLevel === 'medium'
                                  ? 'Interesante para captación'
                                  : 'Interesante para captación'
                            }
                            statusColor={statusColor}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Propiedades ── */}
            {activeTab === 'propiedades' && (
              <div className="space-y-6">
                {/* Venta */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <Home className="w-3.5 h-3.5" /> Propiedades en Venta
                      <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-full font-bold">
                        {saleProp.length}
                      </span>
                    </h3>
                    <Link
                      to="/admin/propiedades/nueva"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded font-montserrat text-xs hover:bg-brand-navy/90 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nuevo
                    </Link>
                  </div>
                  {saleProp.length === 0 ? (
                    <EmptyState text="No tiene propiedades en venta" />
                  ) : (
                    <div className="space-y-2">
                      {saleProp.map(p => (
                        <PropertyRow key={p.id} property={p} statusColor={statusColor} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Alquiler */}
                <div>
                  <h3 className="flex items-center gap-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    <Building2 className="w-3.5 h-3.5" /> Propiedades en Alquiler
                    <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-full font-bold">
                      {rentProp.length}
                    </span>
                  </h3>
                  {rentProp.length === 0 ? (
                    <EmptyState text="No tiene propiedades en alquiler" />
                  ) : (
                    <div className="space-y-2">
                      {rentProp.map(p => (
                        <PropertyRow key={p.id} property={p} statusColor={statusColor} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: Intereses ── */}
            {activeTab === 'intereses' && (
              <div className="space-y-4">
                {/* Add interest form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-montserrat text-xs text-gray-400 mb-2">
                    Añadir interés por un inmueble
                  </p>
                  <div className="flex gap-2 items-end flex-wrap">
                    <input
                      type="number"
                      placeholder="ID propiedad"
                      value={addPropertyId}
                      onChange={e => setAddPropertyId(e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold bg-white"
                    />
                    <select
                      value={addLevel}
                      onChange={e =>
                        setAddLevel(
                          e.target.value as PropertyInterest['interestLevel'],
                        )
                      }
                      className="px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold bg-white"
                    >
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      disabled={!addPropertyId || addingInterest}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-white rounded font-montserrat text-sm hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
                    >
                      {addingInterest ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Interest list */}
                {interests.length === 0 ? (
                  <EmptyState text="No tiene intereses registrados" />
                ) : (
                  <div className="space-y-2">
                    {interests.map(interest => {
                      const prop = interestProperties[interest.propertyId];
                      return (
                        <div
                          key={interest.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {prop?.images?.[0] ? (
                              <img
                                src={prop.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Home className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/admin/propiedades/${interest.propertyId}/detalle`}
                              className="font-montserrat text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors truncate block"
                            >
                              {prop ? prop.title || prop.ref || `#${prop.id}` : `Propiedad #${interest.propertyId}`}
                            </Link>
                            <p className="font-montserrat text-xs text-gray-400 mt-0.5">
                              {prop ? `${prop.town} · ${formatPrice(prop.price, prop.currency)}` : ''}
                            </p>
                          </div>

                          {/* Level badge */}
                          {levelBadge(interest.interestLevel)}

                          {/* Email */}
                          {contact.email && (
                            <button
                              onClick={() => setEmailProperty(prop || null)}
                              className="p-1.5 text-gray-400 hover:text-brand-gold transition-colors"
                              title="Enviar email sobre este inmueble"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Remove */}
                          <button
                            onClick={() => handleRemoveInterest(interest.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar interés"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Actividad ── */}
            {activeTab === 'actividad' && (
              <div>
                <p className="font-montserrat text-sm text-gray-400 italic text-center py-10">
                  No hay actividad registrada hasta el momento.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ RIGHT SIDEBAR ═══════ */}
        <div className="space-y-4">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Estado
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                contact.status === 'activo'
                  ? 'bg-green-100 text-green-700'
                  : contact.status === 'inactivo'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-600'
              }`}
            >
              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-3">
            <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Resumen
            </h3>
            <div className="flex items-center gap-2 text-sm font-montserrat text-gray-600">
              <Home className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>{ownedProperties.length} propiedades</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-montserrat text-gray-600">
              <ShoppingCart className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>{interests.length} intereses</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-montserrat text-gray-600">
              <Calendar className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>
                Alta: {new Date(contact.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-montserrat text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-xs">
                Actualizado: {new Date(contact.updatedAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-2">
            <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Acciones rápidas
            </h3>
            {contact.email && (
              <button
                onClick={() => setEmailProperty(null as unknown as Property)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-montserrat text-gray-600 hover:bg-brand-gold/5 hover:text-brand-gold rounded transition-colors"
              >
                <Send className="w-4 h-4" /> Enviar email seguimiento
              </button>
            )}
            <Link
              to={`/admin/contactos/${contact.id}`}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-montserrat text-gray-600 hover:bg-brand-gold/5 hover:text-brand-gold rounded transition-colors"
            >
              <Edit className="w-4 h-4" /> Editar ficha
            </Link>
            <Link
              to="/admin/propiedades/nueva"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-montserrat text-gray-600 hover:bg-brand-gold/5 hover:text-brand-gold rounded transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo inmueble
            </Link>
          </div>
        </div>
      </div>

      {/* ── Email Composer Modal ── */}
      {emailProperty !== null && contact.email && (
        <EmailComposer
          recipients={[
            {
              name: getContactFullName(contact),
              email: contact.email,
              contactId: String(contact.id),
            },
          ]}
          property={emailProperty || undefined}
          onClose={() => setEmailProperty(null)}
        />
      )}
    </div>
  );
}

/* ─────────────── Inline helper components ─────────────── */

/** Left sidebar info row */
function InfoRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-montserrat text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
        {icon} {label}
      </p>
      <div className="font-montserrat text-sm text-gray-700 pl-5">{children}</div>
    </div>
  );
}

/** Empty state */
function EmptyState({ text }: { text: string }) {
  return (
    <p className="font-montserrat text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center italic">
      {text}
    </p>
  );
}

/** Property row inside the "General" tab connected-properties table */
function ConnectedPropertyRow({
  property,
  role,
  statusColor,
}: {
  property: Property;
  role: string;
  statusColor: (s: string) => string;
}) {
  return (
    <Link
      to={`/admin/propiedades/${property.id}/detalle`}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-colors group"
    >
      <span className="font-montserrat text-[11px] text-gray-400 w-20 flex-shrink-0 truncate">
        {role}
      </span>
      <span className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded text-xs font-montserrat text-gray-700 flex-shrink-0">
        <Home className="w-3 h-3 text-gray-400" />
        {property.title || property.ref || `#${property.id}`}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${statusColor(property.status)}`}>
        {property.status}
      </span>
      <span className="flex-1" />
      <span className="font-montserrat text-xs text-gray-500">
        {formatPrice(property.price, property.currency)}
      </span>
    </Link>
  );
}

/** Property card row for Propiedades tab */
function PropertyRow({
  property,
  statusColor,
}: {
  property: Property;
  statusColor: (s: string) => string;
}) {
  return (
    <Link
      to={`/admin/propiedades/${property.id}/detalle`}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow group"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Home className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-montserrat text-sm font-medium text-brand-navy group-hover:text-brand-gold transition-colors truncate">
          {property.title || property.ref || `#${property.id}`}
        </p>
        <p className="font-montserrat text-xs text-gray-400 mt-0.5">
          {property.type} · {property.town}
          {property.beds > 0 && ` · ${property.beds} hab.`}
        </p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-montserrat text-sm font-semibold text-brand-navy">
          {formatPrice(property.price, property.currency)}
        </p>
        <p className="font-montserrat text-[10px] text-gray-400 uppercase">
          {property.priceFreq === 'sale' ? 'Venta' : 'Alquiler'}
        </p>
      </div>

      {/* Status */}
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${statusColor(property.status)}`}
      >
        {property.status}
      </span>
    </Link>
  );
}
