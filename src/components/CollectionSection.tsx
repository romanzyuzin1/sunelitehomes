import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { useState, useCallback, useMemo } from 'react';

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
      '/Fotos/PROYECTO 1/AT5A9694.jpg',
    ],
  },
];

export function CollectionSection() {
  const { language } = useLanguage();
  const t = translations[language].collection;
  const [expandedMobileIndex, setExpandedMobileIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

        {/* Properties Library Grid - Desktop */}
        <div className="hidden md:flex gap-2 pb-8 justify-center">
          {properties.map((property, index) => {
            const isHovered = hoveredIndex === index;
            const currentImg = currentImageIndex[index] || 0;
            
            const nextImage = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => ({
                ...prev,
                [index]: (prev[index] || 0) + 1 >= property.allImages.length ? 0 : (prev[index] || 0) + 1
              }));
            };
            
            const prevImage = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => ({
                ...prev,
                [index]: (prev[index] || 0) - 1 < 0 ? property.allImages.length - 1 : (prev[index] || 0) - 1
              }));
            };
            
            return (
              <div 
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative group cursor-pointer h-[600px] overflow-hidden transition-all duration-700 ease-out ${
                  isHovered ? 'w-[600px]' : 'w-48'
                }`}
              >
                {/* Background Image */}
                <img
                  src={isHovered ? property.allImages[currentImg] : property.image}
                  alt={property.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                
                {/* Vertical Text (when not hovered) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                  isHovered ? 'opacity-0' : 'opacity-100'
                }`}>
                  <h3 
                    className="font-playfair text-3xl font-bold text-white tracking-wider"
                    style={{ 
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed'
                    }}
                  >
                    {property.name.toUpperCase()}
                  </h3>
                </div>

                {/* Navigation Buttons */}
                {isHovered && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-brand-gold/80 text-white hover:text-black transition-all flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-brand-gold/80 text-white hover:text-black transition-all flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 z-10 bg-black/50 px-3 py-1 text-white text-sm font-montserrat">
                      {currentImg + 1} / {property.allImages.length}
                    </div>
                  </>
                )}

                {/* Gold vertical line accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Properties Library Grid - Mobile */}
        <div className="md:hidden flex flex-col gap-2">
          {properties.map((property, index) => {
            const isExpanded = expandedMobileIndex === index;
            const currentImg = currentImageIndex[index] || 0;
            
            const nextImage = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => ({
                ...prev,
                [index]: (prev[index] || 0) + 1 >= property.allImages.length ? 0 : (prev[index] || 0) + 1
              }));
            };
            
            const prevImage = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCurrentImageIndex(prev => ({
                ...prev,
                [index]: (prev[index] || 0) - 1 < 0 ? property.allImages.length - 1 : (prev[index] || 0) - 1
              }));
            };
            
            return (
              <div 
                key={index}
                onClick={() => setExpandedMobileIndex(isExpanded ? null : index)}
                className={`relative cursor-pointer overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'h-96' : 'h-32'
                }`}
              >
                {/* Background Image */}
                <img
                  src={isExpanded ? property.allImages[currentImg] : property.image}
                  alt={property.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                />
                
                {/* Dark Overlay */}
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isExpanded ? 'bg-black/20' : 'bg-black/40'
                }`} />
                
                {/* Horizontal Text (when collapsed) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                  isExpanded ? 'opacity-0' : 'opacity-100'
                }`}>
                  <h3 className="font-playfair text-2xl font-bold text-white tracking-wider">
                    {property.name.toUpperCase()}
                  </h3>
                </div>

                {/* Navigation Buttons (when expanded) */}
                {isExpanded && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-brand-gold/80 text-white hover:text-black transition-all flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-brand-gold/80 text-white hover:text-black transition-all flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-2 right-2 z-10 bg-black/50 px-3 py-1 text-white text-sm font-montserrat">
                      {currentImg + 1} / {property.allImages.length}
                    </div>
                  </>
                )}

                {/* Top border accent */}
                <div className={`absolute left-0 right-0 top-0 h-1 bg-brand-gold transition-opacity duration-300 ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`} />
              </div>
            );
          })}
        </div>

        {/* CTA to View All */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black transition-all font-montserrat font-semibold">
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
}
