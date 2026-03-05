/**
 * Property Service — Supabase-backed with localStorage fallback.
 *
 * When Supabase is configured (env vars set), all reads/writes go to the
 * remote database. When it isn't, we fall back to the existing localStorage
 * layer so the app still works in development or without a backend.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Database } from './database.types';
import {
  properties as defaultProperties,
  type Property,
} from '../data/properties';

// ─── Type aliases ────────────────────────────────────────────────────

type DbRow = Database['public']['Tables']['properties']['Row'];
type DbInsert = Database['public']['Tables']['properties']['Insert'];

// ─── Mappers (DB row ↔ frontend Property) ────────────────────────────

function rowToProperty(row: DbRow): Property {
  return {
    id: row.id,
    date: row.created_at.split('T')[0],
    title: row.title,
    ref: row.ref,
    price: Number(row.price),
    currency: row.currency,
    priceFreq: row.price_freq,
    type: row.type,
    buildYear: row.build_year,
    town: row.town,
    postcode: row.postcode,
    province: row.province,
    location: {
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address,
    },
    beds: row.beds,
    baths: row.baths,
    pool: row.pool,
    surfaceArea: { built: row.surface_built, plot: row.surface_plot },
    energyRating: {
      consumption: row.energy_consumption,
      emissions: row.energy_emissions,
    },
    description: row.description,
    features: row.features,
    status: row.status,
    images: row.images,
  };
}

function propertyToInsert(p: Property): DbInsert {
  return {
    title: p.title,
    ref: p.ref,
    price: p.price,
    currency: p.currency,
    price_freq: p.priceFreq,
    type: p.type,
    build_year: p.buildYear,
    town: p.town,
    postcode: p.postcode,
    province: p.province,
    address: p.location.address,
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    beds: p.beds,
    baths: p.baths,
    pool: p.pool,
    surface_built: p.surfaceArea.built,
    surface_plot: p.surfaceArea.plot,
    energy_consumption: p.energyRating.consumption,
    energy_emissions: p.energyRating.emissions,
    description: p.description,
    features: p.features,
    status: p.status,
    images: p.images,
  };
}

// ─── localStorage fallback (keeps existing behaviour) ────────────────

const LS_KEY = 'seh_admin_properties';

function lsLoad(): Property[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
}

function lsSave(props: Property[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(props));
}

// ─── Public API ──────────────────────────────────────────────────────

/** Fetch all properties. Returns Supabase rows or fallback defaults. */
export async function fetchAllProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured()) {
    const stored = lsLoad();
    return stored.length > 0 ? stored : defaultProperties;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('[propertyService] fetchAll error:', error);
    // Graceful fallback
    const stored = lsLoad();
    return stored.length > 0 ? stored : defaultProperties;
  }

  return (data ?? []).map(rowToProperty);
}

/** Fetch a single property by id. */
export async function fetchPropertyById(id: number): Promise<Property | null> {
  if (!isSupabaseConfigured()) {
    const stored = lsLoad();
    const found = stored.find(p => p.id === id) ?? defaultProperties.find(p => p.id === id);
    return found ?? null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    // Fallback to local defaults
    return defaultProperties.find(p => p.id === id) ?? null;
  }
  return rowToProperty(data);
}

/** Create a new property. Returns the created property with its new id. */
export async function createProperty(property: Property): Promise<Property> {
  if (!isSupabaseConfigured()) {
    const all = lsLoad();
    const maxId = Math.max(...all.map(p => p.id), ...defaultProperties.map(p => p.id), 0);
    property.id = maxId + 1;
    all.push(property);
    lsSave(all);
    return property;
  }

  const row = propertyToInsert(property);
  const { data, error } = await supabase
    .from('properties')
    .insert(row)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Error al crear el inmueble');
  }
  return rowToProperty(data);
}

/** Update an existing property. */
export async function updatePropertyById(
  id: number,
  property: Property,
): Promise<Property> {
  if (!isSupabaseConfigured()) {
    const all = lsLoad();
    const idx = all.findIndex(p => p.id === id);
    if (idx !== -1) {
      all[idx] = property;
    } else {
      all.push(property);
    }
    lsSave(all);
    return property;
  }

  const row = propertyToInsert(property);
  const { data, error } = await supabase
    .from('properties')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Error al actualizar el inmueble');
  }
  return rowToProperty(data);
}

/** Delete a property by id. */
export async function deletePropertyById(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const all = lsLoad().filter(p => p.id !== id);
    lsSave(all);
    return;
  }

  const { error } = await supabase.from('properties').delete().eq('id', id);

  if (error) {
    throw new Error(error.message ?? 'Error al eliminar el inmueble');
  }
}

/** Bulk insert properties (used by XML import). Returns inserted count. */
export async function bulkInsertProperties(
  properties: Property[],
): Promise<number> {
  if (!isSupabaseConfigured()) {
    const existing = lsLoad();
    const merged = [
      ...existing.filter(
        p => !properties.some(np => np.ref === p.ref),
      ),
      ...properties,
    ];
    lsSave(merged);
    return properties.length;
  }

  const rows = properties.map(propertyToInsert);
  const { data, error } = await supabase
    .from('properties')
    .upsert(rows, { onConflict: 'ref' })
    .select();

  if (error) {
    throw new Error(error.message ?? 'Error en la importación masiva');
  }

  return data?.length ?? 0;
}

/** Create a blank property shell (for the editor form). */
export function createEmptyProperty(): Property {
  return {
    id: 0,
    date: new Date().toISOString().split('T')[0],
    title: '',
    ref: '',
    price: 0,
    currency: 'EUR',
    priceFreq: 'sale',
    type: 'Casa',
    buildYear: null,
    town: '',
    postcode: '',
    province: '',
    location: { latitude: null, longitude: null, address: '' },
    beds: 0,
    baths: 0,
    pool: false,
    surfaceArea: { built: 0, plot: 0 },
    energyRating: { consumption: 'none', emissions: 'none' },
    description: '',
    features: [],
    status: 'disponible',
    images: [],
  };
}
