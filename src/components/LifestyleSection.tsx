import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { optimizedSrc } from '../lib/media';
import { Link } from 'react-router-dom';

export function LifestyleSection() {
  const { language } = useLanguage();
  const t = translations[language].lifestyle;

  const services = [
    {
      to: '/servicios/alquilamos',
      image: '/Fotos/RENDERS 1/Ed_Maristany Forum - 01.jpg',
      alt: language === 'es'
        ? 'Alquiler de propiedades de lujo en España'
        : 'Luxury property rental in Spain',
      title: t.coast,
      desc: t.coastDesc,
    },
    {
      to: '/servicios/vendemos',
      image: '/Fotos/PROYECTO 2/P1546535-HDR-2.jpg',
      alt: language === 'es'
        ? 'Venta de inmuebles exclusivos'
        : 'Exclusive property sales',
      title: t.design,
      desc: t.designDesc,
    },
    {
      to: '/servicios/reformamos',
      image: '/Fotos/RENDERS 1/Ed_Maristany Forum - 12.jpg',
      alt: language === 'es'
        ? 'Reformas de lujo y diseño de interiores'
        : 'Luxury renovations and interior design',
      title: t.city,
      desc: t.cityDesc,
    },
  ];

  return (
    <section id="servicios" className="relative py-0 overflow-hidden">
      {/* Full-Width Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
        {services.map((service) => (
          <Link
            key={service.to}
            to={service.to}
            className="relative h-[350px] sm:h-[400px] md:h-[600px] overflow-hidden group block"
          >
            <img
              src={optimizedSrc(service.image)}
              alt={service.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="gradient-overlay" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8 md:p-12">
              <div className="text-white">
                <div className="gold-accent mb-3 md:mb-4" />
                <h3 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 md:mb-3">
                  {service.title}
                </h3>
                <p className="font-montserrat text-sm md:text-base text-white/90 max-w-sm">
                  {service.desc}
                </p>
                <span className="inline-flex items-center gap-2 mt-4 font-montserrat text-xs font-semibold uppercase tracking-widest text-brand-gold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {language === 'es' ? 'Descubrir más' : 'Discover more'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
