/**
 * MatchPanel — Shows contacts that match a property, scored and ranked.
 * Placed inside PropertyDetailAdmin.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../../data/properties';
import type { Contact } from '../../data/contacts';
import { getContactFullName } from '../../data/contacts';
import { formatPrice } from '../../data/properties';
import { findMatches, matchTier, type ContactMatch } from '../../lib/matchService';
import { fetchAllContacts } from '../../lib/contactService';
import {
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  MapPin,
  Home,
  Bed,
  Bath,
  Euro,
  Filter,
  Star,
  Info,
} from 'lucide-react';

interface MatchPanelProps {
  property: Property;
  /** Contact IDs already linked as interested — show a badge */
  existingInterestContactIds?: number[];
}

// ── Tier visuals ─────────────────────────────────────────────────────

const TIER_STYLES: Record<ReturnType<typeof matchTier>, { bg: string; text: string; ring: string; label: string }> = {
  excellent: { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-400', label: 'Excelente' },
  good:      { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-400',  label: 'Bueno' },
  fair:      { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'ring-amber-400', label: 'Regular' },
  low:       { bg: 'bg-gray-50',   text: 'text-gray-500',   ring: 'ring-gray-300',  label: 'Bajo' },
};

// ── Score ring (circular progress) ───────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const tier = matchTier(score);
  const { text } = TIER_STYLES[tier];
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${text} transition-all duration-500`}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-montserrat text-xs font-bold ${text}`}>
        {score}
      </span>
    </div>
  );
}

// ── Tag chip ─────────────────────────────────────────────────────────

function TagChip({ label }: { label: string }) {
  const isCheck = label.includes('✓');
  const isApprox = label.includes('~');
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-montserrat text-[10px] font-medium ${
        isCheck
          ? 'bg-green-100 text-green-700'
          : isApprox
            ? 'bg-amber-100 text-amber-700'
            : 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </span>
  );
}

// ── Breakdown bar ────────────────────────────────────────────────────

const CRITERIA = [
  { key: 'price'        as const, label: 'Precio',         max: 30, icon: Euro,   color: 'bg-green-500' },
  { key: 'zone'         as const, label: 'Zona',           max: 25, icon: MapPin,  color: 'bg-blue-500' },
  { key: 'type'         as const, label: 'Tipo',           max: 15, icon: Home,    color: 'bg-purple-500' },
  { key: 'beds'         as const, label: 'Habitaciones',   max: 15, icon: Bed,     color: 'bg-amber-500' },
  { key: 'baths'        as const, label: 'Baños',          max: 10, icon: Bath,    color: 'bg-cyan-500' },
  { key: 'interestType' as const, label: 'Compra/Alquiler', max: 5,  icon: Target,  color: 'bg-pink-500' },
];

function BreakdownDetail({ match }: { match: ContactMatch }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CRITERIA.map(c => {
        const val = match.breakdown[c.key];
        const pct = (val / c.max) * 100;
        const Icon = c.icon;
        return (
          <div key={c.key} className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-montserrat text-[10px] text-gray-500">{c.label}</span>
                <span className="font-montserrat text-[10px] font-semibold text-gray-600">{val}/{c.max}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.color} transition-all duration-300`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Filter bar ───────────────────────────────────────────────────────

type TierFilter = 'all' | 'excellent' | 'good' | 'fair';

const FILTER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'excellent', label: '70+ Excelente' },
  { value: 'good',      label: '45+ Bueno' },
  { value: 'fair',      label: '25+ Regular' },
];

// ── Main component ───────────────────────────────────────────────────

export function MatchPanel({ property, existingInterestContactIds = [] }: MatchPanelProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all = await fetchAllContacts();
      if (!cancelled) {
        setContacts(all);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Compute matches
  const allMatches = useMemo(
    () => findMatches(property, contacts, 10),
    [property, contacts],
  );

  // Filter by tier
  const filteredMatches = useMemo(() => {
    if (tierFilter === 'all') return allMatches;
    const minScore = tierFilter === 'excellent' ? 70 : tierFilter === 'good' ? 45 : 25;
    return allMatches.filter(m => m.score >= minScore);
  }, [allMatches, tierFilter]);

  // Limit display
  const INITIAL_SHOW = 8;
  const displayMatches = showAll ? filteredMatches : filteredMatches.slice(0, INITIAL_SHOW);

  const existingSet = useMemo(() => new Set(existingInterestContactIds), [existingInterestContactIds]);

  // Stats
  const tierCounts = useMemo(() => {
    const c = { excellent: 0, good: 0, fair: 0, low: 0 };
    allMatches.forEach(m => c[matchTier(m.score)]++);
    return c;
  }, [allMatches]);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 font-montserrat text-sm font-semibold uppercase tracking-wider text-gray-500">
          <TrendingUp className="w-4 h-4" /> Match Interesados
          {!loading && (
            <span className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full normal-case tracking-normal">
              {allMatches.length} candidato{allMatches.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
      </div>

      {/* Summary chips */}
      {!loading && allMatches.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tierCounts.excellent > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 font-montserrat text-xs text-green-700">
              <Star className="w-3 h-3" /> {tierCounts.excellent} excelente{tierCounts.excellent !== 1 ? 's' : ''}
            </span>
          )}
          {tierCounts.good > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 font-montserrat text-xs text-blue-700">
              {tierCounts.good} bueno{tierCounts.good !== 1 ? 's' : ''}
            </span>
          )}
          {tierCounts.fair > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 font-montserrat text-xs text-amber-700">
              {tierCounts.fair} regular{tierCounts.fair !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && allMatches.length > 0 && (
        <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => { setTierFilter(f.value); setShowAll(false); }}
              className={`px-3 py-1 rounded font-montserrat text-xs transition-colors ${
                tierFilter === f.value
                  ? 'bg-white shadow-sm text-brand-navy font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-montserrat text-sm">Analizando contactos…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && allMatches.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-montserrat text-sm text-gray-400">
            No se encontraron contactos que coincidan con este inmueble.
          </p>
          <p className="font-montserrat text-xs text-gray-300 mt-1">
            Los compradores activos con preferencias configuradas aparecerán aquí.
          </p>
        </div>
      )}

      {/* Filtered empty */}
      {!loading && allMatches.length > 0 && filteredMatches.length === 0 && (
        <p className="font-montserrat text-sm text-gray-400 py-4 text-center">
          Ningún contacto cumple el filtro seleccionado.
        </p>
      )}

      {/* Match list */}
      {!loading && filteredMatches.length > 0 && (
        <div className="space-y-2">
          {displayMatches.map(match => {
            const tier = matchTier(match.score);
            const style = TIER_STYLES[tier];
            const isExpanded = expanded === match.contact.id;
            const isLinked = existingSet.has(match.contact.id);

            return (
              <div
                key={match.contact.id}
                className={`rounded-lg border transition-all ${isExpanded ? `${style.bg} border-transparent ring-1 ${style.ring}` : 'border-gray-100 hover:border-gray-200'}`}
              >
                {/* Main row */}
                <div className="flex items-center gap-3 p-3">
                  {/* Score ring */}
                  <ScoreRing score={match.score} />

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-semibold text-xs flex-shrink-0 ${
                    tier === 'excellent' ? 'bg-green-100 text-green-700'
                      : tier === 'good' ? 'bg-blue-100 text-blue-700'
                        : tier === 'fair' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                  }`}>
                    {(match.contact.firstName || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/contactos/${match.contact.id}/detalle`}
                        className="font-montserrat text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors truncate"
                      >
                        {getContactFullName(match.contact)}
                      </Link>
                      {isLinked && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold font-montserrat text-[10px] rounded">
                          Ya interesado
                        </span>
                      )}
                      <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full font-montserrat text-[10px] font-semibold ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    {/* Quick info */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {match.contact.budgetMin != null || match.contact.budgetMax != null ? (
                        <span className="font-montserrat text-[11px] text-gray-400">
                          {match.contact.budgetMin != null ? formatPrice(match.contact.budgetMin, 'EUR') : '—'}
                          {' – '}
                          {match.contact.budgetMax != null ? formatPrice(match.contact.budgetMax, 'EUR') : '∞'}
                        </span>
                      ) : null}
                      {match.contact.prefZones.length > 0 && (
                        <span className="font-montserrat text-[11px] text-gray-400">
                          <MapPin className="w-3 h-3 inline -mt-px" /> {match.contact.prefZones.slice(0, 2).join(', ')}
                          {match.contact.prefZones.length > 2 && ` +${match.contact.prefZones.length - 2}`}
                        </span>
                      )}
                    </div>
                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.tags.map((t, i) => (
                        <TagChip key={i} label={t} />
                      ))}
                    </div>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : match.contact.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver detalle del match"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <BreakdownDetail match={match} />
                    {/* Contact details */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                      {match.contact.phone && (
                        <span className="font-montserrat text-xs text-gray-500">
                          📞 {match.contact.phone}
                        </span>
                      )}
                      {match.contact.email && (
                        <span className="font-montserrat text-xs text-gray-500">
                          ✉️ {match.contact.email}
                        </span>
                      )}
                      {match.contact.prefBeds != null && (
                        <span className="font-montserrat text-xs text-gray-500">
                          Busca {match.contact.prefBeds} hab.
                        </span>
                      )}
                      {match.contact.prefBaths != null && (
                        <span className="font-montserrat text-xs text-gray-500">
                          {match.contact.prefBaths} baños
                        </span>
                      )}
                      {match.contact.prefTypes.length > 0 && (
                        <span className="font-montserrat text-xs text-gray-500">
                          Tipo: {match.contact.prefTypes.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Link
                        to={`/admin/contactos/${match.contact.id}/detalle`}
                        className="font-montserrat text-xs text-brand-gold hover:underline"
                      >
                        Ver ficha completa →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show more / less */}
      {!loading && filteredMatches.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-center font-montserrat text-xs text-gray-400 hover:text-brand-gold transition-colors"
        >
          {showAll
            ? `Mostrar menos`
            : `Ver ${filteredMatches.length - INITIAL_SHOW} más…`
          }
        </button>
      )}

      {/* Info footnote */}
      {!loading && allMatches.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" />
          <p className="font-montserrat text-[10px] text-gray-300 leading-relaxed">
            La puntuación se calcula en base a precio (30 pts), zona (25 pts), tipo (15 pts),
            habitaciones (15 pts), baños (10 pts) y tipo de operación (5 pts).
            Solo se muestran compradores activos con puntuación ≥ 10.
          </p>
        </div>
      )}
    </div>
  );
}
