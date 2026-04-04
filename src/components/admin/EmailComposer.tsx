import { useState, useEffect } from 'react';
import {
  sendEmail,
  loadEmailConfig,
  saveEmailToHistory,
  buildFollowUpEmail,
  type EmailConfig,
} from '../../lib/emailService';
import type { Property } from '../../data/properties';
import { X, Send, Loader2, Check, AlertTriangle } from 'lucide-react';

interface Recipient {
  name: string;
  email: string;
  contactId?: string;
}

interface EmailComposerProps {
  /** One or many recipients */
  recipients: Recipient[];
  /** Optional property context for template */
  property?: Property | null;
  /** Close handler */
  onClose: () => void;
}

export function EmailComposer({ recipients, property, onClose }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailCfg, setEmailCfg] = useState<EmailConfig | null>(null);

  // Build default subject / body from template
  useEffect(() => {
    loadEmailConfig().then(setEmailCfg);

    if (property) {
      setSubject(`Seguimiento: ${property.title || property.ref || 'Inmueble'}`);
      const propertyUrl = `${window.location.origin}/inmueble/${property.id}`;
      const emailMsg = buildFollowUpEmail(
        recipients[0]?.name || 'Estimado/a cliente',
        property.title,
        property.ref,
        propertyUrl,
        '',
      );
      // Strip HTML for the plain-text body that the user edits
      const temp = document.createElement('div');
      temp.innerHTML = emailMsg.html;
      setBody(temp.textContent || temp.innerText || '');
    } else {
      setSubject('Seguimiento SunEliteHomes');
      setBody(
        `Estimado/a ${recipients[0]?.name || 'cliente'},\n\nNos ponemos en contacto desde SunEliteHomes para informarle sobre novedades que podrían interesarle.\n\n¿Le gustaría que concertáramos una cita?\n\nSaludos cordiales,\nSunEliteHomes`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!emailCfg) return;
    setSending(true);
    setStatus(null);

    const htmlBody = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px">${body
      .split('\n')
      .map(l => `<p>${l || '&nbsp;'}</p>`)
      .join('')}</div>`;

    let allOk = true;
    for (const r of recipients) {
      const result = await sendEmail(
        {
          to: r.email,
          toName: r.name,
          subject,
          html: htmlBody,
          text: body,
        },
        emailCfg,
      );

      await saveEmailToHistory({
        sentAt: new Date().toISOString(),
        toEmail: r.email,
        toName: r.name,
        subject,
        body: htmlBody,
        propertyId: property?.id ?? null,
        contactId: r.contactId ? Number(r.contactId) : null,
        status: result.ok ? (result.method === 'mailto' ? 'mailto' : 'sent') : 'failed',
      });

      if (!result.ok) allOk = false;
    }

    if (allOk) {
      setStatus({
        type: 'success',
        text:
          emailCfg.provider === 'none'
            ? 'Se ha abierto tu cliente de correo. Envía el email manualmente.'
            : `Email enviado a ${recipients.length} destinatario(s).`,
      });
    } else {
      setStatus({ type: 'error', text: 'Algunos correos no pudieron enviarse.' });
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-playfair text-lg font-semibold text-gray-800">
            Enviar email de seguimiento
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Recipients */}
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">
              Destinatarios ({recipients.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {recipients.map((r, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-brand-gold/10 text-brand-gold text-xs rounded font-montserrat"
                >
                  {r.name} &lt;{r.email}&gt;
                </span>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block font-montserrat text-xs text-gray-500 mb-1">Mensaje</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-200 rounded font-montserrat text-sm focus:outline-none focus:border-brand-gold resize-y"
            />
          </div>

          {/* Provider hint */}
          {emailCfg && emailCfg.provider === 'none' && (
            <p className="font-montserrat text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
              No tienes un proveedor de email configurado. Al pulsar "Enviar" se abrirá tu
              cliente de correo predeterminado (mailto:). Puedes configurar Resend o SendGrid en{' '}
              <strong>Portales y Email</strong>.
            </p>
          )}

          {/* Status */}
          {status && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded font-montserrat text-sm ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {status.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 font-montserrat text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || recipients.length === 0 || !subject.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-brand-navy text-white rounded font-montserrat text-sm hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
