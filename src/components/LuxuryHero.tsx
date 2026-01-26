import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

export function LuxuryHero() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-aerial-view-of-a-luxury-villa-7297/1080p.mp4"
            type="video/mp4"
          />
          {/* Fallback to image if video doesn't load */}
        </video>
        
        {/* Fallback Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071')",
          }}
        />
        
        {/* Dark Overlay for text readability */}
        <div className="gradient-overlay-dark" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 max-w-5xl">
          {/* Main Headline */}
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight animate-fade-in">
            {t.title1}
            <br className="hidden sm:block" />
            <span className="text-brand-gold"> {t.title2}</span>
          </h1>

          {/* Subheadline */}
          <p className="font-montserrat text-base sm:text-lg md:text-xl lg:text-2xl text-brand-offwhite/90 mb-8 md:mb-12 max-w-2xl mx-auto font-light tracking-wide animate-slide-up">
            {t.subtitle}
          </p>

          {/* CTA Button */}
          <button className="btn-gold animate-slide-up hover:scale-105 transform transition-transform text-xs sm:text-sm">
            {t.cta}
          </button>

          {/* Scroll Indicator */}
          <div className="hidden md:block absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-brand-gold rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-brand-gold rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
