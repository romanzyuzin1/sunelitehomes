import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { useState, useRef, useCallback } from 'react';

export function LuxuryHero() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  const [showPoster, setShowPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTransitioned = useRef(false);

  const handlePlaying = useCallback(() => {
    if (hasTransitioned.current) return;
    hasTransitioned.current = true;
    setTimeout(() => setShowPoster(false), 300);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background — always rendering underneath */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={handlePlaying}
          className="w-full h-full object-cover"
        >
          <source
            src="/Fotos-optimized/Video/landing_background.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Poster Image — on top, fades out once video is playing */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          opacity: showPoster ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          pointerEvents: showPoster ? 'auto' : 'none',
        }}
      >
        <img
          src="/Fotos-optimized/Video/landing_poster.webp"
          alt=""
          className="w-full h-full object-cover"
          // @ts-ignore – valid HTML attribute, React 18 warns on camelCase
          fetchpriority="high"
        />
      </div>
        
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 gradient-overlay-dark" style={{ zIndex: 2 }} />

      {/* Hero Content */}
      <div className="relative h-full flex items-center justify-center" style={{ zIndex: 3 }}>
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
