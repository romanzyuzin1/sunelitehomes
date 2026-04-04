/**
 * Contact Service — Supabase-backed with localStorage fallback.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Database } from './database.types';
import type { Contact, PropertyInterest } from '../data/contacts';

// ─── Type aliases ────────────────────────────────────────────────────

type ContactRow = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type InterestRow = Database['public']['Tables']['property_interests']['Row'];

// ─── Mappers ─────────────────────────────────────────────────────────

function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    phone2: row.phone2,
    isOwner: row.is_owner,
    isBuyer: row.is_buyer,
    ownerIntent: row.owner_intent as Contact['ownerIntent'],
    interestType: row.interest_type as Contact['interestType'],
    budgetMin: row.budget_min ? Number(row.budget_min) : null,
    budgetMax: row.budget_max ? Number(row.budget_max) : null,
    prefBeds: row.pref_beds,
    prefBaths: row.pref_baths,
    prefZones: row.pref_zones,
    prefTypes: row.pref_types,
    notes: row.notes,
    source: row.source,
    status: row.status as Contact['status'],
  };
}

function contactToInsert(c: Contact): ContactInsert {
  return {
    first_name: c.firstName,
    last_name: c.lastName,
    email: c.email,
    phone: c.phone,
    phone2: c.phone2,
    is_owner: c.isOwner,
    is_buyer: c.isBuyer,
    owner_intent: c.ownerIntent,
    interest_type: c.interestType,
    budget_min: c.budgetMin,
    budget_max: c.budgetMax,
    pref_beds: c.prefBeds,
    pref_baths: c.prefBaths,
    pref_zones: c.prefZones,
    pref_types: c.prefTypes,
    notes: c.notes,
    source: c.source,
    status: c.status,
  };
}

function rowToInterest(row: InterestRow): PropertyInterest {
  return {
    id: row.id,
    propertyId: row.property_id,
    contactId: row.contact_id,
    createdAt: row.created_at,
    interestLevel: row.interest_level as PropertyInterest['interestLevel'],
    notes: row.notes,
  };
}

// ─── localStorage fallback ───────────────────────────────────────────

const LS_CONTACTS = 'seh_admin_contacts';
const LS_INTERESTS = 'seh_admin_interests';

function lsLoadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(LS_CONTACTS);
    return raw ? (JSON.parse(raw) as Contact[]) : [];
  } catch {
    return [];
  }
}
function lsSaveContacts(c: Contact[]): void {
  localStorage.setItem(LS_CONTACTS, JSON.stringify(c));
}

function lsLoadInterests(): PropertyInterest[] {
  try {
    const raw = localStorage.getItem(LS_INTERESTS);
    return raw ? (JSON.parse(raw) as PropertyInterest[]) : [];
  } catch {
    return [];
  }
}
function lsSaveInterests(items: PropertyInterest[]): void {
  localStorage.setItem(LS_INTERESTS, JSON.stringify(items));
}

// ─── Contact CRUD ────────────────────────────────────────────────────

export async function fetchAllContacts(): Promise<Contact[]> {
  if (!isSupabaseConfigured()) return lsLoadContacts();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('[contactService] fetchAll error:', error);
    return lsLoadContacts();
  }
  return (data ?? []).map(rowToContact);
}

export async function fetchContactById(id: number): Promise<Contact | null> {
  if (!isSupabaseConfigured()) {
    return lsLoadContacts().find(c => c.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToContact(data);
}

export async function createContact(contact: Contact): Promise<Contact> {
  if (!isSupabaseConfigured()) {
    const all = lsLoadContacts();
    const maxId = Math.max(0, ...all.map(c => c.id));
    contact.id = maxId + 1;
    all.push(contact);
    lsSaveContacts(all);
    return contact;
  }

  const row = contactToInsert(contact);
  const { data, error } = await supabase
    .from('contacts')
    .insert(row)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Error al crear el contacto');
  }
  return rowToContact(data);
}

export async function updateContact(
  id: number,
  contact: Contact,
): Promise<Contact> {
  if (!isSupabaseConfigured()) {
    const all = lsLoadContacts();
    const idx = all.findIndex(c => c.id === id);
    if (idx !== -1) all[idx] = contact;
    else all.push(contact);
    lsSaveContacts(all);
    return contact;
  }

  const row = contactToInsert(contact);
  const { data, error } = await supabase
    .from('contacts')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Error al actualizar el contacto');
  }
  return rowToContact(data);
}

export async function deleteContact(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    lsSaveContacts(lsLoadContacts().filter(c => c.id !== id));
    return;
  }

  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Property Interest (many-to-many) ────────────────────────────────

export async function fetchInterestsByProperty(
  propertyId: number,
): Promise<PropertyInterest[]> {
  if (!isSupabaseConfigured()) {
    return lsLoadInterests().filter(i => i.propertyId === propertyId);
  }

  const { data, error } = await supabase
    .from('property_interests')
    .select('*')
    .eq('property_id', propertyId);

  if (error) {
    console.error('[contactService] fetchInterestsByProperty error:', error);
    return [];
  }
  return (data ?? []).map(rowToInterest);
}

export async function fetchInterestsByContact(
  contactId: number,
): Promise<PropertyInterest[]> {
  if (!isSupabaseConfigured()) {
    return lsLoadInterests().filter(i => i.contactId === contactId);
  }

  const { data, error } = await supabase
    .from('property_interests')
    .select('*')
    .eq('contact_id', contactId);

  if (error) {
    console.error('[contactService] fetchInterestsByContact error:', error);
    return [];
  }
  return (data ?? []).map(rowToInterest);
}

export async function addPropertyInterest(
  propertyId: number,
  contactId: number,
  interestLevel: PropertyInterest['interestLevel'] = 'medium',
  notes = '',
): Promise<PropertyInterest> {
  if (!isSupabaseConfigured()) {
    const all = lsLoadInterests();
    const maxId = Math.max(0, ...all.map(i => i.id));
    const item: PropertyInterest = {
      id: maxId + 1,
      propertyId,
      contactId,
      createdAt: new Date().toISOString(),
      interestLevel,
      notes,
    };
    all.push(item);
    lsSaveInterests(all);
    return item;
  }

  const { data, error } = await supabase
    .from('property_interests')
    .insert({
      property_id: propertyId,
      contact_id: contactId,
      interest_level: interestLevel,
      notes,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Error al vincular interesado');
  }
  return rowToInterest(data);
}

export async function removePropertyInterest(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    lsSaveInterests(lsLoadInterests().filter(i => i.id !== id));
    return;
  }

  const { error } = await supabase
    .from('property_interests')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Owner link on properties ────────────────────────────────────────

export async function setPropertyOwner(
  propertyId: number,
  contactId: number | null,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    // In localStorage fallback, we store owner links in a simple map
    const key = 'seh_property_owners';
    const map: Record<number, number | null> = JSON.parse(
      localStorage.getItem(key) || '{}',
    );
    map[propertyId] = contactId;
    localStorage.setItem(key, JSON.stringify(map));
    return;
  }

  const { error } = await supabase
    .from('properties')
    .update({ owner_contact_id: contactId })
    .eq('id', propertyId);

  if (error) throw new Error(error.message);
}

export async function getPropertyOwner(
  propertyId: number,
): Promise<Contact | null> {
  if (!isSupabaseConfigured()) {
    const key = 'seh_property_owners';
    const map: Record<number, number | null> = JSON.parse(
      localStorage.getItem(key) || '{}',
    );
    const ownerId = map[propertyId];
    if (!ownerId) return null;
    return lsLoadContacts().find(c => c.id === ownerId) ?? null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('owner_contact_id')
    .eq('id', propertyId)
    .single();

  if (error || !data?.owner_contact_id) return null;

  return fetchContactById(data.owner_contact_id);
}

/** Fetch all owner contacts (for dropdown lists). */
export async function fetchOwnerContacts(): Promise<Contact[]> {
  if (!isSupabaseConfigured()) {
    return lsLoadContacts().filter(c => c.isOwner);
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('is_owner', true)
    .order('first_name');

  if (error) return [];
  return (data ?? []).map(rowToContact);
}

/** Fetch all buyer contacts (for dropdown lists). */
export async function fetchBuyerContacts(): Promise<Contact[]> {
  if (!isSupabaseConfigured()) {
    return lsLoadContacts().filter(c => c.isBuyer);
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('is_buyer', true)
    .order('first_name');

  if (error) return [];
  return (data ?? []).map(rowToContact);
}
