/**
 * Match Service — Scores contacts against a property to find best buyer/renter matches.
 *
 * Scoring breakdown (max 100):
 *   Price match:       30 pts  — budget range covers the property price
 *   Zone match:        25 pts  — preferred zones include property town/province
 *   Type match:        15 pts  — preferred property types include property type
 *   Beds match:        15 pts  — preferred beds align
 *   Baths match:       10 pts  — preferred baths align
 *   Buy/Rent match:     5 pts  — interest type aligns with priceFreq
 */

import type { Contact } from '../data/contacts';
import type { Property } from '../data/properties';

// ─── Types ───────────────────────────────────────────────────────────

export interface MatchBreakdown {
  price: number;       // 0–30
  zone: number;        // 0–25
  type: number;        // 0–15
  beds: number;        // 0–15
  baths: number;       // 0–10
  interestType: number; // 0–5
}

export interface ContactMatch {
  contact: Contact;
  score: number;         // 0–100
  breakdown: MatchBreakdown;
  tags: string[];        // human-readable labels like "Precio ✓", "Zona ✓"
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Normalise a string for fuzzy comparison (lowercase, trimmed, no accents) */
function norm(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ─── Scoring functions ───────────────────────────────────────────────

function scorePrice(contact: Contact, property: Property): number {
  const { budgetMin, budgetMax } = contact;
  const price = property.price;
  if (!price) return 0;

  // No budget set → can't score
  if (budgetMin == null && budgetMax == null) return 0;

  const min = budgetMin ?? 0;
  const max = budgetMax ?? Infinity;

  // Exact fit
  if (price >= min && price <= max) return 30;

  // Within 15% margin → partial
  const margin = price * 0.15;
  if (price >= min - margin && price <= max + margin) return 18;

  // Within 30% margin → low
  const marginWide = price * 0.30;
  if (price >= min - marginWide && price <= max + marginWide) return 8;

  return 0;
}

function scoreZone(contact: Contact, property: Property): number {
  if (!contact.prefZones || contact.prefZones.length === 0) return 0;

  const propTown = norm(property.town);
  const propProvince = norm(property.province);

  for (const z of contact.prefZones) {
    const nz = norm(z);
    // Exact town match
    if (nz === propTown) return 25;
    // Zone substring match (e.g. "costa del sol" in town or province)
    if (propTown.includes(nz) || nz.includes(propTown)) return 25;
  }

  // Province-level match (partial)
  for (const z of contact.prefZones) {
    const nz = norm(z);
    if (nz === propProvince || propProvince.includes(nz) || nz.includes(propProvince)) return 15;
  }

  return 0;
}

function scoreType(contact: Contact, property: Property): number {
  if (!contact.prefTypes || contact.prefTypes.length === 0) return 0;
  const propType = norm(property.type);
  if (!propType) return 0;

  for (const t of contact.prefTypes) {
    const nt = norm(t);
    if (nt === propType || propType.includes(nt) || nt.includes(propType)) return 15;
  }

  return 0;
}

function scoreBeds(contact: Contact, property: Property): number {
  if (contact.prefBeds == null) return 0;
  const diff = property.beds - contact.prefBeds;
  if (diff === 0) return 15;           // exact
  if (diff === 1 || diff === -1) return 10; // off by 1
  if (diff === 2) return 5;            // property has 2 more → still ok
  return 0;
}

function scoreBaths(contact: Contact, property: Property): number {
  if (contact.prefBaths == null) return 0;
  const diff = property.baths - contact.prefBaths;
  if (diff === 0) return 10;
  if (diff === 1 || diff === -1) return 6;
  if (diff === 2) return 3;
  return 0;
}

function scoreInterestType(contact: Contact, property: Property): number {
  const freq = property.priceFreq; // 'sale' | 'month'
  const interest = contact.interestType; // 'buy' | 'rent' | 'both'

  if (interest === 'both') return 5;
  if (freq === 'sale' && interest === 'buy') return 5;
  if (freq === 'month' && interest === 'rent') return 5;

  return 0;
}

// ─── Tags ────────────────────────────────────────────────────────────

function buildTags(bd: MatchBreakdown): string[] {
  const tags: string[] = [];
  if (bd.price >= 18) tags.push('Precio ✓');
  else if (bd.price >= 8) tags.push('Precio ~');
  if (bd.zone >= 15) tags.push('Zona ✓');
  if (bd.type >= 15) tags.push('Tipo ✓');
  if (bd.beds >= 10) tags.push('Habitaciones ✓');
  if (bd.baths >= 6) tags.push('Baños ✓');
  if (bd.interestType >= 5) tags.push(bd.interestType === 5 ? 'Compra/Alquiler ✓' : '');
  return tags.filter(Boolean);
}

// ─── Main scoring ────────────────────────────────────────────────────

function scoreContact(contact: Contact, property: Property): ContactMatch {
  const breakdown: MatchBreakdown = {
    price: scorePrice(contact, property),
    zone: scoreZone(contact, property),
    type: scoreType(contact, property),
    beds: scoreBeds(contact, property),
    baths: scoreBaths(contact, property),
    interestType: scoreInterestType(contact, property),
  };

  const score =
    breakdown.price +
    breakdown.zone +
    breakdown.type +
    breakdown.beds +
    breakdown.baths +
    breakdown.interestType;

  return {
    contact,
    score,
    breakdown,
    tags: buildTags(breakdown),
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Given a property and a list of all contacts, return contacts ranked by match score.
 * Only active buyers with score > 0 are returned.
 *
 * @param minScore  Minimum score to include (default 10)
 */
export function findMatches(
  property: Property,
  contacts: Contact[],
  minScore = 10,
): ContactMatch[] {
  const results: ContactMatch[] = [];

  for (const c of contacts) {
    // Only consider active buyers/renters
    if (c.status !== 'activo') continue;
    if (!c.isBuyer) continue;

    const match = scoreContact(c, property);
    if (match.score >= minScore) {
      results.push(match);
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Label for a match score tier.
 */
export function matchTier(score: number): 'excellent' | 'good' | 'fair' | 'low' {
  if (score >= 70) return 'excellent';
  if (score >= 45) return 'good';
  if (score >= 25) return 'fair';
  return 'low';
}
