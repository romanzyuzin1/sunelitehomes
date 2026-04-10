/**
 * AI Description Generator
 * Supports Groq (free, works in EU) and Google Gemini.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Property } from '../data/properties';

/* ── AI Config ─────────────────────────────────────────────────────── */

export type AIProvider = 'groq' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

const LS_AI_KEY = 'seh_ai_config';

const DEFAULT_CONFIG: AIConfig = {
  provider: 'groq',
  apiKey: '',
};

export async function loadAIConfig(): Promise<AIConfig> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ai_config')
      .single();
    if (data?.value) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(data.value) };
      } catch { /* fall through */ }
    }
  }

  try {
    const raw = localStorage.getItem(LS_AI_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* empty */ }

  return DEFAULT_CONFIG;
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  localStorage.setItem(LS_AI_KEY, JSON.stringify(config));

  if (isSupabaseConfigured()) {
    await supabase
      .from('settings')
      .upsert({ key: 'ai_config', value: JSON.stringify(config) })
      .select();
  }
}

/* ── Property context builder ──────────────────────────────────── */

function buildPropertyContext(property: Property): string {
  const lines: string[] = [];

  lines.push(`Tipo: ${property.type}`);
  if (property.title) lines.push(`Título: ${property.title}`);
  lines.push(`Operación: ${property.priceFreq === 'sale' ? 'Venta' : 'Alquiler'}`);
  if (property.price > 0) {
    const formatted = new Intl.NumberFormat('es-ES').format(property.price);
    lines.push(`Precio: ${formatted} ${property.currency || 'EUR'}`);
  }

  // Location
  if (property.town) lines.push(`Población: ${property.town}`);
  if (property.province) lines.push(`Provincia: ${property.province}`);
  if (property.location.address) lines.push(`Dirección: ${property.location.address}`);

  // Surfaces
  if (property.surfaceArea.built > 0) lines.push(`Superficie construida: ${property.surfaceArea.built} m²`);
  if (property.surfaceArea.habitable > 0) lines.push(`Superficie habitable: ${property.surfaceArea.habitable} m²`);
  if (property.surfaceArea.usable > 0) lines.push(`Superficie útil: ${property.surfaceArea.usable} m²`);
  if (property.surfaceArea.plot > 0) lines.push(`Superficie parcela: ${property.surfaceArea.plot} m²`);

  // Rooms
  if (property.beds > 0) lines.push(`Dormitorios: ${property.beds}`);
  if (property.baths > 0) lines.push(`Baños: ${property.baths}`);
  if (property.rooms && property.rooms > 0) lines.push(`Habitaciones totales: ${property.rooms}`);
  if (property.ensuiteBaths && property.ensuiteBaths > 0) lines.push(`Baños en suite: ${property.ensuiteBaths}`);

  // Features
  if (property.pool) lines.push('Piscina: Sí');
  if (property.hasLift) lines.push('Ascensor: Sí');
  if (property.hasPatio) lines.push('Patio: Sí');
  if (property.hasStudio) lines.push('Estudio independiente: Sí');
  if (property.hasServiceRoom) lines.push('Cuarto de servicio: Sí');
  if (property.parkingSpaces && property.parkingSpaces > 0) lines.push(`Plazas de garaje: ${property.parkingSpaces}`);
  if (property.orientation) lines.push(`Orientación: ${property.orientation}`);
  if (property.floor) lines.push(`Planta: ${property.floor}`);
  if (property.heatingType) lines.push(`Calefacción: ${property.heatingType}`);
  if (property.furnished) lines.push(`Amueblado: ${property.furnished}`);

  // Energy
  if (property.energyRating.consumption && property.energyRating.consumption !== 'none')
    lines.push(`Certificación energética: ${property.energyRating.consumption.toUpperCase()}`);

  // Build year
  if (property.buildYear) lines.push(`Año construcción: ${property.buildYear}`);

  // Extra features
  if (property.features.length > 0) lines.push(`Características: ${property.features.join(', ')}`);

  return lines.join('\n');
}

/* ── Prompt templates ───────────────────────────────────────────── */

const SYSTEM_PROMPT = `Eres un redactor inmobiliario profesional especializado en propiedades de lujo en España. 
Trabajas para SunEliteHomes, una agencia inmobiliaria premium en la Costa del Sol y Madrid.
Tu estilo es elegante, profesional y persuasivo, orientado a compradores de alto poder adquisitivo.
Escribes siempre en español de España. No uses hashtags ni emojis.
No inventes datos que no se proporcionen (superficies, precios, características que no existen).
Si no tienes suficiente información sobre algo, no lo menciones.`;

function getPropertyDescriptionPrompt(property: Property): string {
  return `Genera una descripción de venta profesional para el siguiente inmueble.
La descripción debe ser atractiva, detallada (4-6 párrafos), y resaltar las mejores cualidades de la propiedad.
No repitas el precio ni datos numéricos exactos ya que se muestran en la ficha. Evita frases genéricas como "no pierdas esta oportunidad".
Enfócate en la experiencia de vivir en esta propiedad: los espacios, la luz, la calidad, el estilo de vida.

DATOS DEL INMUEBLE:
${buildPropertyContext(property)}

Genera SOLO la descripción, sin títulos ni encabezados. Texto plano sin formato markdown.`;
}

function getZoneDescriptionPrompt(property: Property): string {
  return `Genera una descripción profesional de la ZONA donde se ubica este inmueble.
Describe el entorno, servicios cercanos, ambiente del barrio, transporte, colegios, comercios, ocio.
Usa tu conocimiento real sobre la zona. Si no la conoces con seguridad, genera una descripción genérica pero plausible basándote en los datos proporcionados.
2-3 párrafos máximo.

DATOS DE UBICACIÓN:
Población: ${property.town || 'No especificada'}
Provincia: ${property.province || 'No especificada'}
Dirección: ${property.location.address || 'No especificada'}
Código postal: ${property.postcode || 'No especificado'}
Tipo de inmueble: ${property.type}

Genera SOLO la descripción de la zona, sin títulos ni encabezados. Texto plano sin formato markdown.`;
}

/* ── API calls ──────────────────────────────────────────────────── */

/** Groq — free tier, works in EU. Uses Llama 3.3 70B. */
async function callGroq(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    if (res.status === 401) {
      throw new Error('La clave API de Groq no es válida. Revisa la configuración.');
    }
    if (res.status === 429) {
      throw new Error('Has superado el límite de peticiones de Groq. Espera un momento e inténtalo de nuevo.');
    }
    throw new Error(`Error de Groq (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('No se recibió respuesta del modelo. Inténtalo de nuevo.');
  }
  return text.trim();
}

/** Google Gemini — free tier (may not work in EU/EEA). */
async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    if (res.status === 400 && errBody.includes('API_KEY_INVALID')) {
      throw new Error('La clave API de Gemini no es válida. Revisa la configuración.');
    }
    if (res.status === 429) {
      throw new Error('Has superado el límite de peticiones. Espera un momento e inténtalo de nuevo.');
    }
    throw new Error(`Error de Gemini (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No se recibió respuesta del modelo. Inténtalo de nuevo.');
  }
  return text.trim();
}

/* ── Public API ─────────────────────────────────────────────────── */

export type DescriptionType = 'property' | 'zone';

export async function generateDescription(
  property: Property,
  type: DescriptionType,
): Promise<string> {
  const config = await loadAIConfig();

  if (!config.apiKey) {
    const name = config.provider === 'groq' ? 'Groq' : 'Gemini';
    throw new Error(
      `No se ha configurado la clave API de ${name}. Ve a Configuración > Inteligencia Artificial para añadirla.`,
    );
  }

  const userPrompt = type === 'property'
    ? getPropertyDescriptionPrompt(property)
    : getZoneDescriptionPrompt(property);

  if (config.provider === 'groq') {
    return callGroq(config.apiKey, SYSTEM_PROMPT, userPrompt);
  }
  return callGemini(config.apiKey, SYSTEM_PROMPT, userPrompt);
}
