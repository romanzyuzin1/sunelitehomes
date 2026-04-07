/**
 * Email Service — send follow-up emails from the CRM.
 *
 * Supports:
 *  1. Resend API (if key configured in settings)
 *  2. Fallback: opens mailto: link (default mail client)
 *
 * Email history is stored in Supabase (or localStorage).
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'none';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailAttachment {
  /** File name (e.g. "expose-REF123.pdf") */
  filename: string;
  /** Base64-encoded content (without data:... prefix) */
  content: string;
  /** MIME type */
  contentType: string;
}

export interface EmailMessage {
  to: string;
  toName: string;
  subject: string;
  html: string;
  /** Plain text fallback */
  text: string;
  /** Optional file attachments */
  attachments?: EmailAttachment[];
}

export interface SentEmail {
  id: number;
  sentAt: string;
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
  propertyId: number | null;
  contactId: number | null;
  status: 'sent' | 'failed' | 'mailto';
}

// ─── Config management ───────────────────────────────────────────────

const LS_CONFIG_KEY = 'seh_email_config';
const LS_HISTORY_KEY = 'seh_email_history';

const DEFAULT_CONFIG: EmailConfig = {
  provider: 'none',
  apiKey: '',
  fromEmail: 'info@sunelitehomes.com',
  fromName: 'SunEliteHomes',
};

export async function loadEmailConfig(): Promise<EmailConfig> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'email_config')
      .single();
    if (data?.value) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(data.value) };
      } catch { /* fall through */ }
    }
  }

  try {
    const raw = localStorage.getItem(LS_CONFIG_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* empty */ }

  return DEFAULT_CONFIG;
}

export async function saveEmailConfig(config: EmailConfig): Promise<void> {
  localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(config));

  if (isSupabaseConfigured()) {
    await supabase
      .from('settings')
      .upsert({ key: 'email_config', value: JSON.stringify(config) })
      .select();
  }
}

// ─── Email sending ───────────────────────────────────────────────────

/**
 * Send email via configured provider, or fall back to mailto:.
 * Returns { ok, method } where method is 'api' | 'mailto'.
 */
export async function sendEmail(
  msg: EmailMessage,
  config?: EmailConfig,
): Promise<{ ok: boolean; method: 'api' | 'mailto'; error?: string }> {
  const cfg = config ?? (await loadEmailConfig());

  // ── Resend ──
  if (cfg.provider === 'resend' && cfg.apiKey) {
    try {
      const payload: Record<string, unknown> = {
        from: `${cfg.fromName} <${cfg.fromEmail}>`,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      };

      // Add attachments if present
      if (msg.attachments && msg.attachments.length > 0) {
        payload.attachments = msg.attachments.map(a => ({
          filename: a.filename,
          content: a.content,
          content_type: a.contentType,
        }));
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) return { ok: true, method: 'api' };

      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        method: 'api',
        error: body?.message || `Error ${res.status}`,
      };
    } catch (err) {
      return {
        ok: false,
        method: 'api',
        error: (err as Error).message,
      };
    }
  }

  // ── SendGrid ──
  if (cfg.provider === 'sendgrid' && cfg.apiKey) {
    try {
      const sgPayload: Record<string, unknown> = {
        personalizations: [{ to: [{ email: msg.to, name: msg.toName }] }],
        from: { email: cfg.fromEmail, name: cfg.fromName },
        subject: msg.subject,
        content: [
          { type: 'text/plain', value: msg.text },
          { type: 'text/html', value: msg.html },
        ],
      };

      // Add attachments if present
      if (msg.attachments && msg.attachments.length > 0) {
        sgPayload.attachments = msg.attachments.map(a => ({
          filename: a.filename,
          content: a.content,
          type: a.contentType,
          disposition: 'attachment',
        }));
      }

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sgPayload),
      });

      if (res.ok || res.status === 202) return { ok: true, method: 'api' };

      const body = await res.text().catch(() => '');
      return {
        ok: false,
        method: 'api',
        error: body.slice(0, 200) || `Error ${res.status}`,
      };
    } catch (err) {
      return {
        ok: false,
        method: 'api',
        error: (err as Error).message,
      };
    }
  }

  // ── Fallback: mailto ──
  // mailto: can't carry attachments — auto-download the PDF first
  if (msg.attachments && msg.attachments.length > 0) {
    for (const att of msg.attachments) {
      downloadBase64File(att.content, att.filename, att.contentType);
    }
  }
  openMailto(msg);
  return { ok: true, method: 'mailto' };
}

/**
 * Download a base64-encoded file to the user's device.
 */
function downloadBase64File(base64: string, filename: string, contentType: string): void {
  try {
    const byteChars = atob(base64);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArray], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('[emailService] Could not auto-download attachment:', err);
  }
}

/** Open the default mail client with properly encoded subject & body */
export function openMailto(msg: EmailMessage): void {
  // Use encodeURIComponent (produces %20 for spaces) — NOT URLSearchParams (uses + for spaces)
  const subject = encodeURIComponent(msg.subject);
  const body = encodeURIComponent(msg.text);
  window.open(`mailto:${encodeURIComponent(msg.to)}?subject=${subject}&body=${body}`, '_blank');
}

// ─── Email history ───────────────────────────────────────────────────

export async function saveEmailToHistory(
  email: Omit<SentEmail, 'id'>,
): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase
      .from('email_history')
      .insert({
        sent_at: email.sentAt,
        to_email: email.toEmail,
        to_name: email.toName,
        subject: email.subject,
        body: email.body,
        property_id: email.propertyId,
        contact_id: email.contactId,
        status: email.status,
      })
      .select();
    return;
  }

  // localStorage
  const all = loadEmailHistoryLocal();
  const maxId = Math.max(0, ...all.map(e => e.id));
  all.push({ ...email, id: maxId + 1 });
  localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(all));
}

function loadEmailHistoryLocal(): SentEmail[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SentEmail[]) : [];
  } catch {
    return [];
  }
}

export async function loadEmailHistory(
  filters?: { contactId?: number; propertyId?: number },
): Promise<SentEmail[]> {
  if (isSupabaseConfigured()) {
    let query = supabase
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false });

    if (filters?.contactId) query = query.eq('contact_id', filters.contactId);
    if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);

    const { data } = await query;
    if (data) {
      return data.map(
        (r: Record<string, unknown>) =>
          ({
            id: r.id as number,
            sentAt: r.sent_at as string,
            toEmail: r.to_email as string,
            toName: r.to_name as string,
            subject: r.subject as string,
            body: r.body as string,
            propertyId: r.property_id as number | null,
            contactId: r.contact_id as number | null,
            status: r.status as SentEmail['status'],
          }) satisfies SentEmail,
      );
    }
  }

  // localStorage fallback
  let all = loadEmailHistoryLocal();
  if (filters?.contactId) all = all.filter(e => e.contactId === filters.contactId);
  if (filters?.propertyId) all = all.filter(e => e.propertyId === filters.propertyId);
  return all;
}

// ─── Templates ───────────────────────────────────────────────────────

export function buildFollowUpEmail(
  contactName: string,
  propertyTitle: string,
  propertyRef: string,
  propertyUrl: string,
  customMessage: string,
): EmailMessage & { subject: string; html: string; text: string } {
  const subject = `Seguimiento – ${propertyTitle} (Ref: ${propertyRef})`;

  const text = `Hola ${contactName},

${customMessage || `Le escribimos para darle seguimiento sobre el inmueble "${propertyTitle}" (Ref: ${propertyRef}).`}

Puede ver más detalles aquí:
${propertyUrl}

Un saludo,
SunEliteHomes`;

  const html = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: #0F172A; padding: 24px; text-align: center;">
    <h1 style="color: #C9A96E; font-size: 20px; margin: 0;">SunEliteHomes</h1>
  </div>
  <div style="padding: 32px 24px;">
    <p>Hola <strong>${contactName}</strong>,</p>
    <p>${customMessage || `Le escribimos para darle seguimiento sobre el inmueble <strong>"${propertyTitle}"</strong> (Ref: ${propertyRef}).`}</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${propertyUrl}" style="display: inline-block; background: #C9A96E; color: #0F172A; padding: 14px 28px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
        Ver inmueble
      </a>
    </p>
    <p>Un saludo,<br/><strong>SunEliteHomes</strong></p>
  </div>
  <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999;">
    SunEliteHomes · info@sunelitehomes.com
  </div>
</div>`;

  return { to: '', toName: contactName, subject, html, text };
}

/**
 * Build a branded email for sending an exposé PDF to an interested contact.
 */
export function buildExposeEmail(
  contactName: string,
  propertyTitle: string,
  propertyRef: string,
  propertyUrl: string,
  pdfFilename: string,
): Omit<EmailMessage, 'attachments'> {
  const subject = `Exposé exclusivo — ${propertyTitle} (Ref: ${propertyRef})`;

  const text = `Estimado/a ${contactName},

Gracias por su interés en el inmueble "${propertyTitle}" (Ref: ${propertyRef}).

Adjunto encontrará el exposé completo con toda la información, galería de imágenes y ficha técnica de la propiedad.

Puede ver más detalles en línea:
${propertyUrl}

Si desea concertar una visita o tiene alguna consulta, no dude en contactarnos.

Cordialmente,
SunEliteHomes
info@sunelitehomes.com`;

  const html = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e5e5;">
  <!-- Header -->
  <div style="background: #0F172A; padding: 28px 24px; text-align: center;">
    <h1 style="color: #C9A96E; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: 2px;">SUN ELITE HOMES</h1>
    <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 8px 0 0; letter-spacing: 1px; text-transform: uppercase;">Exposé exclusivo</p>
  </div>

  <!-- Body -->
  <div style="padding: 36px 28px;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">Estimado/a <strong>${contactName}</strong>,</p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Gracias por su interés en el inmueble <strong style="color: #0F172A;">"${propertyTitle}"</strong> (Ref: ${propertyRef}).
    </p>
    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
      Adjunto encontrará el exposé completo con toda la información, galería de imágenes y ficha técnica de la propiedad.
    </p>

    <!-- Attachment indicator -->
    <div style="background: #f8f8f8; border: 1px solid #eee; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px; display: flex; align-items: center;">
      <div style="background: #C9A96E; color: #0F172A; font-weight: bold; font-size: 11px; padding: 6px 10px; border-radius: 4px; margin-right: 12px;">PDF</div>
      <div>
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #333;">${pdfFilename}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #999;">Archivo adjunto</p>
      </div>
    </div>

    <!-- CTA -->
    <p style="text-align: center; margin: 28px 0;">
      <a href="${propertyUrl}" style="display: inline-block; background: #C9A96E; color: #0F172A; padding: 14px 32px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1.5px; border-radius: 4px;">
        Ver inmueble online
      </a>
    </p>

    <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666;">
      Si desea concertar una visita o tiene alguna consulta, no dude en contactarnos.
    </p>
    <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6;">
      Cordialmente,<br/><strong style="color: #0F172A;">SunEliteHomes</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="background: #0F172A; padding: 20px 24px; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4);">
      SunEliteHomes · info@sunelitehomes.com
    </p>
    <p style="margin: 6px 0 0; font-size: 10px; color: rgba(255,255,255,0.25);">
      Este email ha sido enviado porque usted ha mostrado interés en una de nuestras propiedades.
    </p>
  </div>
</div>`;

  return { to: '', toName: contactName, subject, html, text };
}
