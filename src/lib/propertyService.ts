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
    surfaceArea: {
      built: row.surface_built,
      plot: row.surface_plot,
      usable: (row as any).surface_usable ?? 0,
      habitable: (row as any).surface_habitable ?? 0,
    },
    energyRating: {
      consumption: row.energy_consumption,
      emissions: row.energy_emissions,
    },
    description: row.description,
    descriptionZone: (row as any).description_zone ?? '',
    privateNotes: (row as any).private_notes ?? '',
    isPublic: (row as any).is_public ?? true,
    features: row.features,
    status: row.status,
    images: row.images,
    rooms: (row as any).rooms ?? 0,
    ensuiteBaths: (row as any).ensuite_baths ?? 0,
    hasPatio: (row as any).has_patio ?? false,
    hasStudio: (row as any).has_studio ?? false,
    hasServiceRoom: (row as any).has_service_room ?? false,
    parkingSpaces: (row as any).parking_spaces ?? 0,
    orientation: (row as any).orientation ?? '',
    floor: (row as any).floor ?? '',
    hasLift: (row as any).has_lift ?? false,
    heatingType: (row as any).heating_type ?? '',
    furnished: (row as any).furnished ?? '',
  };
}

/** Flag: whether the extended columns (migration_property_extended.sql) exist. */
let _extendedColumnsAvailable: boolean | null = null;
/** Flag: whether the visibility/zone columns exist. */
let _visibilityColumnsAvailable: boolean | null = null;

async function hasExtendedColumns(): Promise<boolean> {
  if (_extendedColumnsAvailable !== null) return _extendedColumnsAvailable;
  try {
    const { error } = await supabase
      .from('properties')
      .select('ensuite_baths')
      .limit(1);
    _extendedColumnsAvailable = !error;
  } catch {
    _extendedColumnsAvailable = false;
  }
  return _extendedColumnsAvailable;
}

async function hasVisibilityColumns(): Promise<boolean> {
  if (_visibilityColumnsAvailable !== null) return _visibilityColumnsAvailable;
  try {
    const { error } = await supabase
      .from('properties')
      .select('description_zone')
      .limit(1);
    _visibilityColumnsAvailable = !error;
  } catch {
    _visibilityColumnsAvailable = false;
  }
  return _visibilityColumnsAvailable;
}

function propertyToInsert(p: Property, includeExtended = true, includeVisibility = true): Record<string, unknown> {
  const base: Record<string, unknown> = {
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

  if (includeVisibility) {
    Object.assign(base, {
      description_zone: p.descriptionZone ?? '',
      private_notes: p.privateNotes ?? '',
      is_public: p.isPublic ?? true,
    });
  }

  if (includeExtended) {
    Object.assign(base, {
      surface_usable: p.surfaceArea.usable,
      surface_habitable: p.surfaceArea.habitable,
      rooms: p.rooms ?? 0,
      ensuite_baths: p.ensuiteBaths ?? 0,
      has_patio: p.hasPatio ?? false,
      has_studio: p.hasStudio ?? false,
      has_service_room: p.hasServiceRoom ?? false,
      parking_spaces: p.parkingSpaces ?? 0,
      orientation: p.orientation ?? '',
      floor: p.floor ?? '',
      has_lift: p.hasLift ?? false,
      heating_type: p.heatingType ?? '',
      furnished: p.furnished ?? '',
    });
  }

  return base;
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

  const ext = await hasExtendedColumns();
  const vis = await hasVisibilityColumns();
  const row = propertyToInsert(property, ext, vis);
  const { data, error } = await supabase
    .from('properties')
    .insert(row as any)
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

  const ext = await hasExtendedColumns();
  const vis = await hasVisibilityColumns();
  const row = propertyToInsert(property, ext, vis);
  const { data, error } = await supabase
    .from('properties')
    .update(row as any)
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

  const ext = await hasExtendedColumns();
  const vis = await hasVisibilityColumns();
  const rows = properties.map(p => propertyToInsert(p, ext, vis));
  const { data, error } = await supabase
    .from('properties')
    .upsert(rows as any, { onConflict: 'ref' })
    .select();

  if (error) {
    throw new Error(error.message ?? 'Error en la importación masiva');
  }

  return data?.length ?? 0;
}

/** Fetch all properties owned by a given contact. */
export async function fetchPropertiesByOwner(
  contactId: number,
): Promise<Property[]> {
  if (!isSupabaseConfigured()) {
    // localStorage fallback: check owner map
    const map: Record<number, number | null> = JSON.parse(
      localStorage.getItem('seh_property_owners') || '{}',
    );
    const ids = Object.entries(map)
      .filter(([, ownerId]) => ownerId === contactId)
      .map(([pid]) => Number(pid));
    return lsLoad().filter(p => ids.includes(p.id));
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_contact_id', contactId)
    .order('id', { ascending: true });

  if (error) {
    console.error('[propertyService] fetchByOwner error:', error);
    return [];
  }
  return (data ?? []).map(rowToProperty);
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
    surfaceArea: { built: 0, plot: 0, usable: 0, habitable: 0 },
    energyRating: { consumption: 'none', emissions: 'none' },
    description: '',
    descriptionZone: '',
    privateNotes: '',
    isPublic: true,
    features: [],
    status: 'disponible',
    images: [],
    rooms: 0,
    ensuiteBaths: 0,
    hasPatio: false,
    hasStudio: false,
    hasServiceRoom: false,
    parkingSpaces: 0,
    orientation: '',
    floor: '',
    hasLift: false,
    heatingType: '',
    furnished: '',
  };
}
