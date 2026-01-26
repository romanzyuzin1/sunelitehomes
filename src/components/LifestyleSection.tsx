import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

export function LifestyleSection() {
  const { language } = useLanguage();
  const t = translations[language].lifestyle;
  return (
    <section className="relative py-0 overflow-hidden">
      {/* Full-Width Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
        {/* Image 1 - Yacht */}
        <div className="relative h-[350px] sm:h-[400px] md:h-[600px] overflow-hidden group">
          <img
            src="/Fotos/RENDERS 1/Ed_Maristany Forum - 01.jpg"
            alt="Luxury yacht lifestyle"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="gradient-overlay" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-8 md:p-12">
            <div className="text-white">
              <div className="gold-accent mb-3 md:mb-4" />
              <h3 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 md:mb-3">
                {t.coast}
              </h3>
              <p className="font-montserrat text-sm md:text-base text-white/90 max-w-sm">
                {t.coastDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Image 2 - Fine Dining/Interior */}
        <div className="relative h-[400px] md:h-[600px] overflow-hidden group">
          <img
            src="/Fotos/PROYECTO 2/P1546535-HDR-2.jpg"
            alt="Luxury interior design"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="gradient-overlay" />
          <div className="absolute inset-0 flex items-end p-8 md:p-12">
            <div className="text-white">
              <div className="gold-accent mb-4" />
              <h3 className="font-playfair text-3xl md:text-4xl font-semibold mb-3">
                {t.design}
              </h3>
              <p className="font-montserrat text-sm md:text-base text-white/90 max-w-sm">
                {t.designDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Image 3 - Urban Cityscape */}
        <div className="relative h-[400px] md:h-[600px] overflow-hidden group">
          <img
            src="/Fotos/RENDERS 1/Ed_Maristany Forum - 12.jpg"
            alt="Luxury city living"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="gradient-overlay" />
          <div className="absolute inset-0 flex items-end p-8 md:p-12">
            <div className="text-white">
              <div className="gold-accent mb-4" />
              <h3 className="font-playfair text-3xl md:text-4xl font-semibold mb-3">
                {t.city}
              </h3>
              <p className="font-montserrat text-sm md:text-base text-white/90 max-w-sm">
                {t.cityDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Statement */}
      <div className="bg-brand-navy py-16 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="container-luxury max-w-4xl mx-auto text-center">
          <div className="gold-accent mx-auto mb-6 md:mb-8" />
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight">
            {t.statement1}
            <br />
            <span className="text-brand-gold">{t.statement2}</span>
          </h2>
          <p className="font-montserrat text-lg md:text-xl text-brand-offwhite/80 leading-relaxed max-w-3xl mx-auto">
            {t.description}
          </p>
        </div>
      </div>
    </section>
  );
}
