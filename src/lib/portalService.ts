/**
 * Portal Syndication Service — export properties to real estate portals.
 *
 * Supported portals:
 *  - Idealista (XML feed)
 *  - Fotocasa  (XML feed)
 *  - Habitaclia (XML feed)
 *  - Kyero (XML feed – international)
 *  - pisos.com (XML feed)
 *
 * Each portal has its own XML format. This service generates the XML
 * and can push it via API or download.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Property } from '../data/properties';

// ─── Portal configuration types ─────────────────────────────────────

export interface PortalConfig {
  id: string;
  name: string;
  icon: string;        // emoji for display
  enabled: boolean;
  apiKey: string;
  apiUrl: string;      // endpoint to push XML
  feedUrl: string;     // auto-generated feed URL (for hosted feeds)
  lastExport: string | null;
  exportedCount: number;
}

export const PORTAL_TEMPLATES: Omit<PortalConfig, 'enabled' | 'apiKey' | 'apiUrl' | 'feedUrl' | 'lastExport' | 'exportedCount'>[] = [
  { id: 'idealista', name: 'Idealista', icon: '🏠' },
  { id: 'fotocasa', name: 'Fotocasa', icon: '📸' },
  { id: 'habitaclia', name: 'Habitaclia', icon: '🏡' },
  { id: 'kyero', name: 'Kyero', icon: '🌍' },
  { id: 'pisos', name: 'pisos.com', icon: '🏢' },
  { id: 'inmobiliaria', name: 'Inmobiliaria.com', icon: '🔑' },
];

const LS_KEY = 'seh_portal_configs';

// ─── Load / Save portal configs ─────────────────────────────────────

export async function loadPortalConfigs(): Promise<PortalConfig[]> {
  // Try Supabase first (settings table)
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'portal_configs')
      .single();
    if (data?.value) {
      try {
        return JSON.parse(data.value) as PortalConfig[];
      } catch { /* fall through */ }
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as PortalConfig[];
  } catch { /* empty */ }

  // Return defaults
  return PORTAL_TEMPLATES.map(t => ({
    ...t,
    enabled: false,
    apiKey: '',
    apiUrl: '',
    feedUrl: '',
    lastExport: null,
    exportedCount: 0,
  }));
}

export async function savePortalConfigs(configs: PortalConfig[]): Promise<void> {
  // localStorage always
  localStorage.setItem(LS_KEY, JSON.stringify(configs));

  // Supabase upsert
  if (isSupabaseConfigured()) {
    await supabase
      .from('settings')
      .upsert({ key: 'portal_configs', value: JSON.stringify(configs) })
      .select();
  }
}

// ─── XML generators ─────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Idealista XML format */
export function generateIdealistaXml(properties: Property[]): string {
  const items = properties
    .map(
      p => `  <property>
    <id>${escapeXml(p.ref || String(p.id))}</id>
    <date>${escapeXml(p.date)}</date>
    <ref>${escapeXml(p.ref)}</ref>
    <price>${p.price}</price>
    <currency>${escapeXml(p.currency)}</currency>
    <price_freq>${p.priceFreq === 'sale' ? 'sale' : 'month'}</price_freq>
    <type>${escapeXml(p.type)}</type>
    <town>${escapeXml(p.town)}</town>
    <province>${escapeXml(p.province)}</province>
    <postcode>${escapeXml(p.postcode)}</postcode>
    <location_detail>${escapeXml(p.location.address)}</location_detail>
    <beds>${p.beds}</beds>
    <baths>${p.baths}</baths>
    <surface_area>
      <built>${p.surfaceArea.built}</built>
      <plot>${p.surfaceArea.plot}</plot>
    </surface_area>
    <energy_rating>
      <consumption>${escapeXml(p.energyRating.consumption)}</consumption>
      <emissions>${escapeXml(p.energyRating.emissions)}</emissions>
    </energy_rating>
    <pool>${p.pool ? '1' : '0'}</pool>
    <description><![CDATA[${p.description}]]></description>
    <features>${p.features.map(f => `<feature>${escapeXml(f)}</feature>`).join('')}</features>
    <images>${p.images.map((img, i) => `<image id="${i + 1}"><url>${escapeXml(img)}</url></image>`).join('')}</images>
  </property>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<idealista>
${items}
</idealista>`;
}

/** Kyero XML format (English-oriented, international) */
export function generateKyeroXml(properties: Property[]): string {
  const items = properties
    .map(
      p => `  <property>
    <id>${p.id}</id>
    <date>${escapeXml(p.date)}</date>
    <ref>${escapeXml(p.ref)}</ref>
    <price>${p.price}</price>
    <currency>${escapeXml(p.currency)}</currency>
    <price_freq>${p.priceFreq === 'sale' ? 'sale' : 'month'}</price_freq>
    <type><en>${escapeXml(p.type)}</en></type>
    <town>${escapeXml(p.town)}</town>
    <province>${escapeXml(p.province)}</province>
    <country>Spain</country>
    <location>
      <latitude>${p.location.latitude ?? ''}</latitude>
      <longitude>${p.location.longitude ?? ''}</longitude>
    </location>
    <beds>${p.beds}</beds>
    <baths>${p.baths}</baths>
    <surface_area>
      <built>${p.surfaceArea.built}</built>
      <plot>${p.surfaceArea.plot}</plot>
    </surface_area>
    <energy_rating>
      <consumption>${escapeXml(p.energyRating.consumption)}</consumption>
      <emissions>${escapeXml(p.energyRating.emissions)}</emissions>
    </energy_rating>
    <pool>${p.pool ? '1' : '0'}</pool>
    <desc><en><![CDATA[${p.description}]]></en></desc>
    <features>${p.features.map(f => `<feature>${escapeXml(f)}</feature>`).join('')}</features>
    <images>${p.images.map((img, i) => `<image id="${i + 1}"><url>${escapeXml(img)}</url></image>`).join('')}</images>
  </property>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kyero>
  <feed_version>3</feed_version>
${items}
</kyero>`;
}

/** Generic XML format (works for Fotocasa, Habitaclia, pisos.com, etc.) */
export function generateGenericXml(properties: Property[], rootTag = 'inmuebles'): string {
  const items = properties
    .map(
      p => `  <inmueble>
    <codigo>${escapeXml(p.ref || String(p.id))}</codigo>
    <fecha>${escapeXml(p.date)}</fecha>
    <referencia>${escapeXml(p.ref)}</referencia>
    <precio>${p.price}</precio>
    <moneda>${escapeXml(p.currency)}</moneda>
    <operacion>${p.priceFreq === 'sale' ? 'venta' : 'alquiler'}</operacion>
    <tipo>${escapeXml(p.type)}</tipo>
    <poblacion>${escapeXml(p.town)}</poblacion>
    <provincia>${escapeXml(p.province)}</provincia>
    <codigo_postal>${escapeXml(p.postcode)}</codigo_postal>
    <direccion>${escapeXml(p.location.address)}</direccion>
    <latitud>${p.location.latitude ?? ''}</latitud>
    <longitud>${p.location.longitude ?? ''}</longitud>
    <habitaciones>${p.beds}</habitaciones>
    <banos>${p.baths}</banos>
    <superficie_construida>${p.surfaceArea.built}</superficie_construida>
    <superficie_parcela>${p.surfaceArea.plot}</superficie_parcela>
    <certificado_energetico>${escapeXml(p.energyRating.consumption)}</certificado_energetico>
    <piscina>${p.pool ? 'si' : 'no'}</piscina>
    <descripcion><![CDATA[${p.description}]]></descripcion>
    <caracteristicas>${p.features.map(f => `<item>${escapeXml(f)}</item>`).join('')}</caracteristicas>
    <imagenes>${p.images.map((img, i) => `<imagen orden="${i + 1}">${escapeXml(img)}</imagen>`).join('')}</imagenes>
  </inmueble>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag}>
${items}
</${rootTag}>`;
}

/** Get the right XML generator for a portal */
export function generateXmlForPortal(
  portalId: string,
  properties: Property[],
): string {
  switch (portalId) {
    case 'idealista':
      return generateIdealistaXml(properties);
    case 'kyero':
      return generateKyeroXml(properties);
    default:
      return generateGenericXml(properties);
  }
}

/** Download XML string as a file */
export function downloadXml(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Push XML to a portal API endpoint (POST or PUT).
 * Returns true on success.
 */
export async function pushToPortalApi(
  apiUrl: string,
  apiKey: string,
  xml: string,
): Promise<{ ok: boolean; message: string }> {
  if (!apiUrl.trim()) {
    return { ok: false, message: 'No se ha configurado la URL de la API' };
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        Authorization: `Bearer ${apiKey}`,
        'X-Api-Key': apiKey,
      },
      body: xml,
    });

    if (res.ok) {
      return { ok: true, message: `Exportación exitosa (${res.status})` };
    }

    const body = await res.text().catch(() => '');
    return {
      ok: false,
      message: `Error ${res.status}: ${body.slice(0, 200) || res.statusText}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: `Error de conexión: ${(err as Error).message}`,
    };
  }
}
