import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import BackgroundShader from './ui/background-shader';
import { optimizedSrc } from '../lib/media';

export function TheFirmSection() {
  const { language } = useLanguage();
  const t = translations[language].firm;
  return (
    <section id="firma" className="section-padding bg-black relative overflow-hidden">
      {/* Animated Shader Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundShader />
      </div>
      
      <div className="container-luxury relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="order-2 md:order-1">
            <div className="relative">
              <img
                src={optimizedSrc("/Fotos/PROYECTO 2/P1557037-2.jpg")}
                alt="Principal agent of SunEliteHomes"
                loading="lazy"
                decoding="async"
                className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-brand-gold flex items-center justify-center">
                <span className="font-playfair text-brand-navy text-3xl sm:text-4xl font-bold">
                  SE
                </span>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 md:order-2">
            <div className="gold-accent mb-6" />
            <h2 className="heading-luxury text-white mb-6">
              {t.title}
            </h2>
            <h3 className="font-montserrat text-xl md:text-2xl text-brand-gold font-semibold mb-8 tracking-wide">
              {t.tagline}
            </h3>

            <div className="space-y-6 mb-10">
              <p className="body-luxury text-white/80">
                {t.paragraph1}
              </p>

              <p className="body-luxury text-white/80">
                {t.paragraph2}{' '}
                <span className="font-semibold text-brand-gold">
                  {t.exceptionalValue}
                </span>
                {t.paragraph2b}
              </p>

              <p className="body-luxury text-white/80">
                {t.paragraph3}
              </p>
            </div>

            <div className="border-l-2 border-brand-gold pl-6 mb-10">
              <p className="font-playfair text-xl md:text-2xl text-white italic mb-2">
                {t.quote}
              </p>
              <p className="font-montserrat text-sm text-white/60 tracking-wider uppercase">
                {t.quoteAuthor}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-6 border-t border-white/20 pt-6 sm:pt-8">
              <div>
                <p className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-brand-gold mb-1">
                  20+
                </p>
                <p className="font-montserrat text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                  {t.stats.years}
                </p>
              </div>
              <div>
                <p className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-brand-gold mb-1">
                  €2.4B
                </p>
                <p className="font-montserrat text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                  {t.stats.transactions}
                </p>
              </div>
              <div>
                <p className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-brand-gold mb-1">
                  100%
                </p>
                <p className="font-montserrat text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                  {t.stats.confidential}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
