import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import BackgroundShader from './ui/background-shader';
import { optimizedSrc } from '../lib/media';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Animate a number from 0 to target value */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = (value >= 100 ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
      },
    });
    return () => { tween.kill(); };
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function TheFirmSection() {
  const { language } = useLanguage();
  const t = translations[language].firm;
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image cinematic reveal — clipPath expands from center
      if (imageRef.current) {
        const img = imageRef.current;
        gsap.fromTo(
          img,
          { clipPath: 'inset(50% 50% 50% 50%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: { trigger: img, start: 'top 85%' },
          },
        );
        // Gold badge pops in after image reveals
        const badge = img.querySelector('.se-badge');
        if (badge) {
          gsap.from(badge, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: img, start: 'top 65%' },
          });
        }
      }

      // Content — text lines stagger in
      if (contentRef.current) {
        gsap.from(contentRef.current.querySelectorAll('.firm-line'), {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 80%' },
        });
      }

      // Quote — fade from left + border grows
      if (quoteRef.current) {
        gsap.from(quoteRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
        });
        const border = quoteRef.current.querySelector('.quote-border');
        if (border) {
          gsap.fromTo(
            border,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
            },
          );
        }
      }

      // Stats — progress bars fill
      if (statsRef.current) {
        gsap.from(statsRef.current.querySelectorAll('.stat-bar-fill'), {
          scaleX: 0,
          duration: 1.8,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: { trigger: statsRef.current, start: 'top 88%' },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="firma"
      ref={sectionRef}
      className="section-padding bg-black relative overflow-hidden"
    >
      {/* Animated Shader Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundShader />
      </div>

      <div className="container-luxury relative z-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Image Side — cinematic clipPath reveal */}
          <div className="order-2 md:order-1">
            <div ref={imageRef} className="relative will-change-[clip-path]">
              <img
                src={optimizedSrc('/Fotos/PROYECTO 2/P1557037-2.jpg')}
                alt={
                  language === 'es'
                    ? 'SunEliteHomes — Asesoría inmobiliaria de lujo en España'
                    : 'SunEliteHomes — Luxury real estate advisory in Spain'
                }
                loading="lazy"
                decoding="async"
                className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="se-badge absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-brand-gold flex items-center justify-center">
                <span className="font-playfair text-brand-navy text-3xl sm:text-4xl font-bold">
                  SE
                </span>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 md:order-2" ref={contentRef}>
            <div className="firm-line gold-accent mb-6" />
            <h2 className="firm-line heading-luxury text-white mb-6">
              {t.title}
            </h2>
            <h3 className="firm-line font-montserrat text-xl md:text-2xl text-brand-gold font-semibold mb-8 tracking-wide">
              {t.tagline}
            </h3>

            <div className="space-y-6 mb-10">
              <p className="firm-line body-luxury text-white/80">{t.paragraph1}</p>
              <p className="firm-line body-luxury text-white/80">
                {t.paragraph2}{' '}
                <span className="font-semibold text-brand-gold">
                  {t.exceptionalValue}
                </span>
                {t.paragraph2b}
              </p>
              <p className="firm-line body-luxury text-white/80">{t.paragraph3}</p>
            </div>

            {/* Quote — animated border + fade */}
            <div ref={quoteRef} className="relative pl-6 mb-10">
              <div className="quote-border absolute left-0 top-0 bottom-0 w-[2px] bg-brand-gold origin-top" />
              <p className="font-playfair text-xl md:text-2xl text-white italic mb-2">
                {t.quote}
              </p>
              <p className="font-montserrat text-sm text-white/60 tracking-wider uppercase">
                {t.quoteAuthor}
              </p>
            </div>

            {/* Stats — count-up + gold progress bars */}
            <div ref={statsRef} className="grid grid-cols-3 gap-2 sm:gap-6 border-t border-white/20 pt-6 sm:pt-8">
              {[
                { value: 20, suffix: '+', label: t.stats.years },
                { value: 2.4, suffix: 'B', prefix: '€', label: t.stats.transactions },
                { value: 100, suffix: '%', label: t.stats.confidential },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-brand-gold mb-1">
                    {stat.prefix || ''}
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  {/* Progress bar */}
                  <div className="h-[2px] bg-white/10 rounded-full mb-2 overflow-hidden">
                    <div className="stat-bar-fill h-full bg-brand-gold origin-left" />
                  </div>
                  <p className="font-montserrat text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
