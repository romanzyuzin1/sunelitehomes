import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { thumbSrc } from '../lib/media';
import { ProjectGalleryModal } from './ProjectGalleryModal';
import { Bed, Bath, Maximize, MapPin, Images } from 'lucide-react';
import { formatPrice, type Property } from '../data/properties';
import { fetchAllProperties } from '../lib/propertyService';

const properties = [
  {
    image: '/Fotos/PROYECTO 1/AT5A9597.jpg',
    status: 'Nueva Captación' as const,
    name: 'Villa Serenitas',
    location: 'Costa del Sol, Marbella',
    beds: 6,
    baths: 7,
    sqm: 850,
    projectFolder: 'PROYECTO 1',
    allImages: [
      '/Fotos/PROYECTO 1/AT5A9597.jpg',
      '/Fotos/PROYECTO 1/AT5A9598.jpg',
      '/Fotos/PROYECTO 1/AT5A9626.jpg',
      '/Fotos/PROYECTO 1/AT5A9650.jpg',
      '/Fotos/PROYECTO 1/AT5A9673.jpg',
      '/Fotos/PROYECTO 1/AT5A9679.jpg',
      '/Fotos/PROYECTO 1/AT5A9694.jpg',
    ],
  },
  {
    image: '/Fotos/PROYECTO 2/P1546067-edit-2.jpg',
    status: 'Exclusiva' as const,
    name: 'Residencia Lumière',
    location: 'Barcelona, Pedralbes',
    beds: 5,
    baths: 6,
    sqm: 680,
    projectFolder: 'PROYECTO 2',
    allImages: [
      '/Fotos/PROYECTO 2/P1545946-HDR-2.jpg',
      '/Fotos/PROYECTO 2/P1546028-HDR-2.jpg',
      '/Fotos/PROYECTO 2/P1546067-edit-2.jpg',
      '/Fotos/PROYECTO 2/P1546072-edit-2.jpg',
      '/Fotos/PROYECTO 2/P1546120-2.jpg',
      '/Fotos/PROYECTO 2/P1546188-2.jpg',
      '/Fotos/PROYECTO 2/P1546482-HDR-2.jpg',
      '/Fotos/PROYECTO 2/P1546535-HDR-2.jpg',
      '/Fotos/PROYECTO 2/P1546584-edit-2.jpg',
      '/Fotos/PROYECTO 2/P1546596-2.jpg',
      '/Fotos/PROYECTO 2/P1556787-2.jpg',
      '/Fotos/PROYECTO 2/P1556807-2.jpg',
      '/Fotos/PROYECTO 2/P1556912-2.jpg',
      '/Fotos/PROYECTO 2/P1556921-2.jpg',
      '/Fotos/PROYECTO 2/P1556990-2.jpg',
      '/Fotos/PROYECTO 2/P1557028-2.jpg',
      '/Fotos/PROYECTO 2/P1557037-2.jpg',
      '/Fotos/PROYECTO 2/P1557057-2.jpg',
      '/Fotos/PROYECTO 2/P1557064-HDR-2.jpg',
    ],
  },
  {
    image: '/Fotos/PROYECTO 3/VISTA ENTRADA .jpg',
    name: 'Casa Horizonte',
    location: 'Ibiza, Cala Comte',
    beds: 4,
    baths: 5,
    sqm: 520,
    projectFolder: 'PROYECTO 3',
    allImages: [
      '/Fotos/PROYECTO 3/VISTA ENTRADA .jpg',
      '/Fotos/PROYECTO 3/SALON COCINA.jpg',
      '/Fotos/PROYECTO 3/RECIBIDOR BAÑO 2.jpg',
      '/Fotos/PROYECTO 3/PARED RECIBIDOR .jpg',
      '/Fotos/PROYECTO 3/ESPEJOS ENTRADA .jpg',
      '/Fotos/PROYECTO 3/COCINA PARTE .jpg',
      '/Fotos/PROYECTO 3/COCINA DE SALON .jpg',
      '/Fotos/PROYECTO 3/COCINA .jpg',
      '/Fotos/PROYECTO 3/BAÑON1 VENTANA .jpg',
      '/Fotos/PROYECTO 3/BAÑO DOS .jpg',
      '/Fotos/PROYECTO 3/BAÑO 2 .jpg',
      '/Fotos/PROYECTO 3/BAÑO 1 .jpg',
    ],
  },
  {
    image: '/Fotos/PROYECTO 4/_DSC9890.jpeg',
    name: 'Penthouse Celestia',
    location: 'Madrid, Salamanca',
    beds: 4,
    baths: 4,
    sqm: 420,
    projectFolder: 'PROYECTO 4',
    allImages: [
      '/Fotos/PROYECTO 4/_DSC9890.jpeg',
      '/Fotos/PROYECTO 4/_DSC9883.jpeg',
      '/Fotos/PROYECTO 4/_DSC9879.jpeg',
      '/Fotos/PROYECTO 4/_DSC9871.jpeg',
      '/Fotos/PROYECTO 4/_DSC9865.jpeg',
      '/Fotos/PROYECTO 4/_DSC9862.jpeg',
      '/Fotos/PROYECTO 4/_DSC9853.jpeg',
      '/Fotos/PROYECTO 4/_DSC9843.jpeg',
      '/Fotos/PROYECTO 4/_DSC9837.jpeg',
      '/Fotos/PROYECTO 4/_DSC9836.jpeg',
    ],
  },
  {
    image: '/Fotos/PROYECTO 5/AT5A5606.jpg',
    status: 'Vendida' as const,
    name: 'Villa Mediterránea',
    location: 'Valencia, Albufera',
    beds: 7,
    baths: 8,
    sqm: 950,
    projectFolder: 'PROYECTO 5',
    allImages: [
      '/Fotos/PROYECTO 5/AT5A5591.jpg',
      '/Fotos/PROYECTO 5/AT5A5590.jpg',
      '/Fotos/PROYECTO 5/AT5A5594.jpg',
      '/Fotos/PROYECTO 5/AT5A5595.jpg',
      '/Fotos/PROYECTO 5/AT5A5596.jpg',
      '/Fotos/PROYECTO 5/AT5A5606.jpg',
      '/Fotos/PROYECTO 5/AT5A5609.jpg',
      '/Fotos/PROYECTO 5/AT5A5605.jpg',
      '/Fotos/PROYECTO 5/AT5A5600.jpg',
      '/Fotos/PROYECTO 5/AT5A5599.jpg',
      '/Fotos/PROYECTO 5/AT5A5593.jpg',
      '/Fotos/PROYECTO 5/AT5A5611.jpg',
      '/Fotos/PROYECTO 5/Дрон.jpg',
      '/Fotos/PROYECTO 5/AT5A5644.jpg',
      '/Fotos/PROYECTO 5/AT5A5618.jpg',
      '/Fotos/PROYECTO 5/AT5A5616.jpg',
      '/Fotos/PROYECTO 5/AT5A5612.jpg',
      '/Fotos/PROYECTO 5/AT5A5613.jpg',
    ],
  },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  'Nueva Captación': { bg: 'bg-brand-gold', text: 'text-brand-navy' },
  'Exclusiva':       { bg: 'bg-white/90', text: 'text-brand-navy' },
  'Vendida':         { bg: 'bg-red-800/80', text: 'text-white' },
};

export function CollectionSection() {
  const { language } = useLanguage();
  const t = translations[language].collection;
  const [inmuebles, setInmuebles] = useState<Property[]>([]);
  const [gallery, setGallery] = useState<{ images: string[]; name: string } | null>(null);

  useEffect(() => {
    fetchAllProperties().then(setInmuebles).catch(() => {});
  }, []);

  const openGallery = useCallback((property: typeof properties[0]) => {
    setGallery({ images: property.allImages, name: property.name });
  }, []);

  return (
    <section id="collection" className="section-padding bg-black">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="gold-accent mx-auto mb-6" />
          <h2 className="heading-luxury text-white mb-6">
            {t.title}
          </h2>
          <p className="body-luxury max-w-2xl mx-auto text-white/70">
            {t.subtitle}
          </p>
        </div>

        {/* Inmuebles from CMS */}
        {inmuebles.filter(p => p.images.length > 0).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {inmuebles
              .filter((p) => p.images.length > 0)
              .map((property) => (
                <Link
                  to={`/inmueble/${property.id}`}
                  key={property.id}
                  className="group cursor-pointer block"
                >
                  <article>
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden mb-4">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                      {/* Price badge */}
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-montserrat font-semibold uppercase tracking-wider bg-brand-gold text-brand-navy">
                        {formatPrice(property.price, property.currency, property.priceFreq, language)}
                      </span>

                      {/* Type badge */}
                      <span className="absolute top-4 right-4 px-3 py-1 text-xs font-montserrat font-semibold uppercase tracking-wider bg-white/90 text-brand-navy">
                        {property.type}
                      </span>

                      {/* Images count */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 text-white text-xs font-montserrat opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Images className="w-3.5 h-3.5" />
                        {property.images.length}
                      </div>

                      {/* Gold bottom accent on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>

                    {/* Info */}
                    <div className="px-1">
                      <h3 className="font-playfair text-xl md:text-2xl text-white font-semibold mb-1.5 group-hover:text-brand-gold transition-colors duration-300">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/50 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-montserrat text-sm">
                          {property.town}, {property.province}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-5 text-white/60 font-montserrat text-sm border-t border-white/10 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-brand-gold/70" />
                          <span>{property.beds}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-brand-gold/70" />
                          <span>{property.baths}</span>
                        </div>
                        {property.surfaceArea.built > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4 text-brand-gold/70" />
                            <span>{property.surfaceArea.built} m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        )}

        {/* Portfolio Gallery */}
        <div className="text-center mt-20 mb-12">
          <div className="gold-accent mx-auto mb-6" />
          <h3 className="font-playfair text-2xl md:text-3xl text-white mb-4">
            {language === 'es' ? 'Nuestros Proyectos' : 'Our Projects'}
          </h3>
          <p className="body-luxury max-w-2xl mx-auto text-white/70">
            {language === 'es'
              ? 'Descubra una selección de nuestros proyectos más destacados.'
              : 'Discover a selection of our most outstanding projects.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {properties.map((property, index) => {
            const status = property.status;
            const style = status ? statusStyles[status] : null;

            return (
              <article
                key={index}
                className="group cursor-pointer"
                onClick={() => openGallery(property)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden mb-4">
                  <img
                    src={thumbSrc(property.image)}
                    alt={property.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Status Badge */}
                  {status && style && (
                    <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-montserrat font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}>
                      {status === 'Nueva Captación' ? t.newListing
                        : status === 'Vendida' ? t.sold
                        : t.exclusive}
                    </span>
                  )}

                  {/* Gallery indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 text-white text-xs font-montserrat opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Images className="w-3.5 h-3.5" />
                    {property.allImages.length}
                  </div>

                  {/* Gold bottom accent on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>

                {/* Info */}
                <div className="px-1">
                  <h3 className="font-playfair text-xl md:text-2xl text-white font-semibold mb-1.5 group-hover:text-brand-gold transition-colors duration-300">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/50 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-montserrat text-sm">{property.location}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-5 text-white/60 font-montserrat text-sm border-t border-white/10 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-brand-gold/70" />
                      <span>{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-brand-gold/70" />
                      <span>{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize className="w-4 h-4 text-brand-gold/70" />
                      <span>{property.sqm} m²</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black transition-all font-montserrat font-semibold">
            {t.viewAll}
          </button>
        </div>
      </div>

      {/* Gallery Modal — images load on demand only when opened */}
      {gallery && (
        <ProjectGalleryModal
          isOpen={true}
          onClose={() => setGallery(null)}
          images={gallery.images}
          projectName={gallery.name}
        />
      )}
    </section>
  );
}
