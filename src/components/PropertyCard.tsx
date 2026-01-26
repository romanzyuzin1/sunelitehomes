import { Bed, Bath, Maximize } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

interface PropertyCardProps {
  image: string;
  status?: 'Nueva Captación' | 'Vendida' | 'Exclusiva';
  name: string;
  location: string;
  beds?: number;
  baths?: number;
  sqm?: number;
}

export function PropertyCard({
  image,
  status,
  name,
  location,
  beds,
  baths,
  sqm,
}: PropertyCardProps) {
  const { language } = useLanguage();
  const t = translations[language].collection;

  const statusTranslations = {
    'Nueva Captación': language === 'es' ? 'Nueva Captación' : 'New Listing',
    'Vendida': language === 'es' ? 'Vendida' : 'Sold',
    'Exclusiva': language === 'es' ? 'Exclusiva' : 'Exclusive',
  };

  const statusColors = {
    'Nueva Captación': 'bg-brand-gold text-brand-navy',
    'Vendida': 'bg-brand-charcoal text-white',
    'Exclusiva': 'bg-brand-gold text-brand-navy',
  };

  return (
    <article className="property-card group cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-charcoal">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Status Tag */}
        {status && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`${statusColors[status]} px-4 py-1.5 text-xs font-montserrat font-semibold tracking-widest uppercase`}
            >
              {statusTranslations[status]}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <button className="btn-gold-outline transform scale-90 group-hover:scale-100 transition-transform">
            {t.details}
          </button>
        </div>
      </div>

      {/* Property Info */}
      <div className="py-6 px-1">
        {/* Name & Location */}
        <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-brand-charcoal mb-2 group-hover:text-brand-gold transition-colors">
          {name}
        </h3>
        <p className="font-montserrat text-sm text-brand-lightgrey tracking-wide mb-4">
          {location}
        </p>

        {/* Specs */}
        {(beds || baths || sqm) && (
          <div className="flex items-center gap-5 pt-4 border-t border-brand-lightgrey/20">
            {beds && (
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-brand-lightgrey" />
                <span className="font-montserrat text-sm text-brand-charcoal font-medium">
                  {beds}
                </span>
              </div>
            )}
            {baths && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-brand-lightgrey" />
                <span className="font-montserrat text-sm text-brand-charcoal font-medium">
                  {baths}
                </span>
              </div>
            )}
            {sqm && (
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-brand-lightgrey" />
                <span className="font-montserrat text-sm text-brand-charcoal font-medium">
                  {sqm.toLocaleString()} m²
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
