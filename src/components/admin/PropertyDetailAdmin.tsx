import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPropertyById } from '../../lib/propertyService';
import {
  getPropertyOwner,
  fetchInterestsByProperty,
  removePropertyInterest,
} from '../../lib/contactService';
import { getContactFullName } from '../../data/contacts';
import type { Contact, PropertyInterest } from '../../data/contacts';
import type { Property } from '../../data/properties';
import { formatPrice } from '../../data/properties';
import { fetchContactById } from '../../lib/contactService';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Loader2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Waves,
  Home,
  User,
  Trash2,
  Image as ImageIcon,
  Send,
  FileDown,
  Mail,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { EmailComposer } from './EmailComposer';
import { MatchPanel } from './MatchPanel';
import { generateExpose, type ExposeProgress, type ExposeResult } from '../../lib/exposeGenerator';
import {
  sendEmail,
  loadEmailConfig,
  saveEmailToHistory,
  buildExposeEmail,
  type EmailAttachment,
} from '../../lib/emailService';

export function PropertyDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<Contact | null>(null);
  const [interests, setInterests] = useState<PropertyInterest[]>([]);
  const [interestContacts, setInterestContacts] = useState<
    Record<number, Contact | null>
  >({});
  const [showEmail, setShowEmail] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<ExposeProgress | null>(null);
  const [exposeSending, setExposeSending] = useState<Record<number, 'idle' | 'generating' | 'sending' | 'sent' | 'error'>>({}); // keyed by contactId
  const [exposeSendAll, setExposeSendAll] = useState<'idle' | 'generating' | 'sending' | 'sent' | 'error'>('idle');

  const loadData = useCallback(async () => {
    const pid = Number(id);
    if (!pid) {
      navigate('/admin/dashboard');
      return;
    }

    setLoading(true);

    const [prop, ownerContact, ints] = await Promise.all([
      fetchPropertyById(pid),
      getPropertyOwner(pid),
      fetchInterestsByProperty(pid),
    ]);

    if (!prop) {
      navigate('/admin/dashboard');
      return;
    }

    setProperty(prop);
    setOwner(ownerContact);
    setInterests(ints);

    // Resolve contact names for interests
    const contactMap: Record<number, Contact | null> = {};
    await Promise.all(
      ints.map(async i => {
        contactMap[i.contactId] = await fetchContactById(i.contactId);
      }),
    );
    setInterestContacts(contactMap);

    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveInterest = async (interestId: number) => {
    if (!confirm('¿Eliminar este interés?')) return;
    try {
      await removePropertyInterest(interestId);
      await loadData();
    } catch (err) {
      console.error('Error removing interest:', err);
    }
  };

  /** Send the exposé PDF to a single contact by email */
  const handleSendExpose = async (contact: Contact) => {
    if (!property || !contact.email) return;

    setExposeSending(prev => ({ ...prev, [contact.id]: 'generating' }));

    try {
      // 1) Generate PDF as blob
      const result = await generateExpose(property, undefined, { returnBlob: true }) as ExposeResult;
      if (!result) throw new Error('No se pudo generar el PDF');

      setExposeSending(prev => ({ ...prev, [contact.id]: 'sending' }));

      // 2) Convert blob to base64 (strip data:...;base64, prefix)
      const base64Raw = result.base64.split(',')[1] || result.base64;

      // 3) Build email with attachment
      const propertyUrl = `${window.location.origin}/inmueble/${property.id}`;
      const emailTemplate = buildExposeEmail(
        getContactFullName(contact),
        property.title,
        property.ref,
        propertyUrl,
        result.filename,
      );

      const attachment: EmailAttachment = {
        filename: result.filename,
        content: base64Raw,
        contentType: 'application/pdf',
      };

      const cfg = await loadEmailConfig();

      const sendResult = await sendEmail(
        {
          ...emailTemplate,
          to: contact.email,
          toName: getContactFullName(contact),
          attachments: [attachment],
        },
        cfg,
      );

      // 4) Save to history
      await saveEmailToHistory({
        sentAt: new Date().toISOString(),
        toEmail: contact.email,
        toName: getContactFullName(contact),
        subject: emailTemplate.subject,
        body: emailTemplate.html,
        propertyId: property.id,
        contactId: contact.id,
        status: sendResult.ok ? (sendResult.method === 'mailto' ? 'mailto' : 'sent') : 'failed',
      });

      setExposeSending(prev => ({
        ...prev,
        [contact.id]: sendResult.ok ? 'sent' : 'error',
      }));

      // Reset status after 4s
      setTimeout(() => {
        setExposeSending(prev => ({ ...prev, [contact.id]: 'idle' }));
      }, 4000);
    } catch (err) {
      console.error('Error sending exposé:', err);
      setExposeSending(prev => ({ ...prev, [contact.id]: 'error' }));
      setTimeout(() => {
        setExposeSending(prev => ({ ...prev, [contact.id]: 'idle' }));
      }, 4000);
    }
  };

  /** Send the exposé to ALL interested contacts with email */
  const handleSendExposeToAll = async () => {
    if (!property) return;

    const contactsWithEmail = interests
      .map(i => interestContacts[i.contactId])
      .filter((c): c is Contact => !!c && !!c.email);

    if (contactsWithEmail.length === 0) return;

    setExposeSendAll('generating');

    try {
      // 1) Generate PDF once
      const result = await generateExpose(property, undefined, { returnBlob: true }) as ExposeResult;
      if (!result) throw new Error('No se pudo generar el PDF');

      setExposeSendAll('sending');

      const base64Raw = result.base64.split(',')[1] || result.base64;
      const propertyUrl = `${window.location.origin}/inmueble/${property.id}`;
      const cfg = await loadEmailConfig();

      const attachment: EmailAttachment = {
        filename: result.filename,
        content: base64Raw,
        contentType: 'application/pdf',
      };

      // 2) Send to each contact
      let allOk = true;
      for (const contact of contactsWithEmail) {
        setExposeSending(prev => ({ ...prev, [contact.id]: 'sending' }));

        const emailTemplate = buildExposeEmail(
          getContactFullName(contact),
          property.title,
          property.ref,
          propertyUrl,
          result.filename,
        );

        const sendResult = await sendEmail(
          {
            ...emailTemplate,
            to: contact.email,
            toName: getContactFullName(contact),
            attachments: [attachment],
          },
          cfg,
        );

        await saveEmailToHistory({
          sentAt: new Date().toISOString(),
          toEmail: contact.email,
          toName: getContactFullName(contact),
          subject: emailTemplate.subject,
          body: emailTemplate.html,
          propertyId: property.id,
          contactId: contact.id,
          status: sendResult.ok ? (sendResult.method === 'mailto' ? 'mailto' : 'sent') : 'failed',
        });

        const ok = sendResult.ok;
        setExposeSending(prev => ({
          ...prev,
          [contact.id]: ok ? 'sent' : 'error',
        }));
        if (!ok) allOk = false;
      }

      setExposeSendAll(allOk ? 'sent' : 'error');

      // Reset after 5s
      setTimeout(() => {
        setExposeSendAll('idle');
        setExposeSending({});
      }, 5000);
    } catch (err) {
      console.error('Error sending exposé to all:', err);
      setExposeSendAll('error');
      setTimeout(() => {
        setExposeSendAll('idle');
        setExposeSending({});
      }, 4000);
    }
  };

  const statusColor = (s: string) =>
    s === 'disponible'
      ? 'bg-green-100 text-green-700'
      : s === 'reservado'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-600';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-playfair text-2xl text-gray-800 font-semibold truncate">
            {property.title || property.ref || `Inmueble #${property.id}`}
          </h1>
          <div className="flex items-center gap-3 mt-1 font-montserrat text-sm text-gray-400">
            <span>Ref: {property.ref}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(property.status)}`}
            >
              {property.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (pdfProgress) return;
              setPdfProgress({ phase: 'Iniciando…', percent: 0 });
              try {
                await generateExpose(property, setPdfProgress);
              } catch (err) {
                console.error('Error generating exposé:', err);
              } finally {
                setTimeout(() => setPdfProgress(null), 2000);
              }
            }}
            disabled={!!pdfProgress}
            className="flex items-center gap-2 px-4 py-2 border border-brand-gold text-brand-gold rounded font-montserrat text-sm hover:bg-brand-gold/10 transition-colors disabled:opacity-60"
          >
            {pdfProgress ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="max-w-[120px] truncate">{pdfProgress.phase}</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" /> Exposé PDF
              </>
            )}
          </button>
          <Link
            to={`/inmueble/${property.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded font-montserrat text-sm hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver en web
          </Link>
          <Link
            to={`/admin/propiedades/${property.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded font-montserrat text-sm hover:bg-brand-navy/90 transition-colors"
          >
            <Edit className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Images */}
        <div className="lg:col-span-2">
          {property.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
              <div className="col-span-2">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              {property.images.slice(1, 5).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              ))}
              {property.images.length > 5 && (
                <div className="h-32 bg-gray-100 flex items-center justify-center font-montserrat text-sm text-gray-500 rounded">
                  <ImageIcon className="w-4 h-4 mr-1.5" />+
                  {property.images.length - 5} más
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Quick info card */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="font-playfair text-2xl text-brand-navy font-semibold mb-1">
            {formatPrice(property.price, property.currency, property.priceFreq)}
          </p>
          <p className="font-montserrat text-xs text-gray-400 uppercase mb-6">
            {property.priceFreq === 'sale' ? 'Venta' : 'Alquiler mensual'}
          </p>

          <div className="space-y-3 text-sm font-montserrat">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-brand-gold" />
              {property.town}, {property.province}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Home className="w-4 h-4 text-brand-gold" />
              {property.type}
              {property.buildYear && ` · ${property.buildYear}`}
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-brand-gold" /> {property.beds}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-brand-gold" /> {property.baths}
              </span>
              {property.surfaceArea.built > 0 && (
                <span className="flex items-center gap-1">
                  <Maximize className="w-4 h-4 text-brand-gold" />{' '}
                  {property.surfaceArea.built} m²
                </span>
              )}
            </div>
            {property.pool && (
              <div className="flex items-center gap-2 text-gray-600">
                <Waves className="w-4 h-4 text-brand-gold" /> Piscina
              </div>
            )}
          </div>

          {property.location.address && (
            <p className="mt-4 pt-4 border-t border-gray-100 font-montserrat text-xs text-gray-400">
              {property.location.address}
            </p>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {property.description && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Descripción del inmueble
          </h2>
          <p className="font-montserrat text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {property.description}
          </p>
        </div>
      )}

      {/* ── Zone Description ── */}
      {property.descriptionZone && property.descriptionZone.trim() && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Descripción de la zona
          </h2>
          <p className="font-montserrat text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {property.descriptionZone}
          </p>
        </div>
      )}

      {/* ── Private Notes ── */}
      {property.privateNotes && property.privateNotes.trim() && (
        <div className="bg-amber-50 border border-amber-200 shadow-sm rounded-lg p-6 mb-6">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2">
            🔒 Nota privada
          </h2>
          <p className="font-montserrat text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">
            {property.privateNotes}
          </p>
        </div>
      )}

      {/* ── Visibility Status ── */}
      <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
        property.isPublic !== false
          ? 'bg-green-50 border border-green-200'
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {property.isPublic !== false ? (
          <>
            <Eye className="w-5 h-5 text-green-600" />
            <span className="font-montserrat text-sm text-green-700">
              Este inmueble <strong>es visible</strong> en la web pública.
            </span>
          </>
        ) : (
          <>
            <EyeOff className="w-5 h-5 text-amber-600" />
            <span className="font-montserrat text-sm text-amber-700">
              Este inmueble <strong>NO es visible</strong> en la web pública.
            </span>
          </>
        )}
      </div>

      {/* ── Features ── */}
      {property.features.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Características
          </h2>
          <div className="flex flex-wrap gap-2">
            {property.features.map((f, i) => (
              <span
                key={i}
                className="bg-gray-50 border border-gray-200 rounded px-3 py-1 font-montserrat text-xs text-gray-600 capitalize"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Owner ── */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          <User className="w-4 h-4" /> Propietario
        </h2>
        {owner ? (
          <Link
            to={`/admin/contactos/${owner.id}/detalle`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-brand-gold/5 hover:border-brand-gold/30 border border-transparent transition-colors"
          >
            <div className="w-10 h-10 bg-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center font-montserrat font-semibold text-sm flex-shrink-0">
              {(owner.firstName || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-montserrat text-sm font-medium text-brand-navy">
                {getContactFullName(owner)}
              </p>
              <p className="font-montserrat text-xs text-gray-400">
                {owner.phone} {owner.email && `· ${owner.email}`}
              </p>
            </div>
          </Link>
        ) : (
          <p className="font-montserrat text-sm text-gray-400">
            Sin propietario asignado —{' '}
            <Link
              to={`/admin/propiedades/${property.id}`}
              className="text-brand-gold hover:underline"
            >
              asignar desde el editor
            </Link>
          </p>
        )}
      </div>

      {/* ── Interests ── */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500">
            Interesados
            <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full">
              {interests.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            {/* Send Exposé to all */}
            {interests.length > 0 && interests.some(i => interestContacts[i.contactId]?.email) && (
              <button
                onClick={handleSendExposeToAll}
                disabled={exposeSendAll !== 'idle'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-montserrat text-xs transition-colors ${
                  exposeSendAll === 'sent'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : exposeSendAll === 'error'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90'
                } disabled:opacity-60`}
                title="Generar y enviar el exposé PDF por email a todos los interesados"
              >
                {exposeSendAll === 'generating' ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando PDF…</>
                ) : exposeSendAll === 'sending' ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando…</>
                ) : exposeSendAll === 'sent' ? (
                  <><Check className="w-3.5 h-3.5" /> Exposé enviado a todos</>
                ) : exposeSendAll === 'error' ? (
                  <><AlertTriangle className="w-3.5 h-3.5" /> Error al enviar</>
                ) : (
                  <><FileDown className="w-3.5 h-3.5" /> Enviar exposé a todos</>
                )}
              </button>
            )}
            {/* Existing send email button */}
            {interests.length > 0 && (
              <button
                onClick={() => setShowEmail(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-white rounded font-montserrat text-xs hover:bg-brand-gold/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Email seguimiento
              </button>
            )}
          </div>
        </div>

        {interests.length === 0 ? (
          <p className="font-montserrat text-sm text-gray-400">
            No hay interesados registrados todavía.
          </p>
        ) : (
          <div className="space-y-2">
            {interests.map(interest => {
              const contact = interestContacts[interest.contactId];
              const sendState = contact ? (exposeSending[contact.id] || 'idle') : 'idle';
              return (
                <div
                  key={interest.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-montserrat font-semibold text-xs flex-shrink-0">
                    {contact
                      ? (contact.firstName || '?').charAt(0).toUpperCase()
                      : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {contact ? (
                      <Link
                        to={`/admin/contactos/${contact.id}/detalle`}
                        className="font-montserrat text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors"
                      >
                        {getContactFullName(contact)}
                      </Link>
                    ) : (
                      <span className="font-montserrat text-sm text-gray-500">
                        Contacto #{interest.contactId}
                      </span>
                    )}
                    <p className="font-montserrat text-xs text-gray-400">
                      {contact?.phone} {contact?.email && `· ${contact.email}`}
                    </p>
                  </div>
                  {levelBadge(interest.interestLevel)}

                  {/* Send Exposé to individual contact */}
                  {contact?.email && (
                    <button
                      onClick={() => handleSendExpose(contact)}
                      disabled={sendState !== 'idle'}
                      className={`flex items-center gap-1 px-2 py-1 rounded font-montserrat text-[11px] transition-colors ${
                        sendState === 'sent'
                          ? 'bg-green-100 text-green-700'
                          : sendState === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-brand-navy/10 text-brand-navy hover:bg-brand-navy hover:text-white'
                      } disabled:opacity-60`}
                      title={`Enviar exposé PDF a ${contact.email}`}
                    >
                      {sendState === 'generating' ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> PDF…</>
                      ) : sendState === 'sending' ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Enviando</>
                      ) : sendState === 'sent' ? (
                        <><Check className="w-3 h-3" /> Enviado</>
                      ) : sendState === 'error' ? (
                        <><AlertTriangle className="w-3 h-3" /> Error</>
                      ) : (
                        <><Mail className="w-3 h-3" /> Exposé</>
                      )}
                    </button>
                  )}

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

      {/* ── Match Panel ── */}
      <MatchPanel
        property={property}
        existingInterestContactIds={interests.map(i => i.contactId)}
      />

      {/* ── Email Composer Modal ── */}
      {showEmail && (
        <EmailComposer
          recipients={interests
            .map(i => {
              const c = interestContacts[i.contactId];
              return c && c.email
                ? { name: getContactFullName(c), email: c.email, contactId: String(c.id) }
                : null;
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)}
          property={property}
          onClose={() => setShowEmail(false)}
        />
      )}
    </div>
  );
}
