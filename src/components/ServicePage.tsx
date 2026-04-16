import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LuxuryNavigation } from './LuxuryNavigation';
import { LuxuryFooter } from './LuxuryFooter';
import { optimizedSrc } from '../lib/media';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ServiceData {
  heroImage: string;
  heroAlt: string;
  title: string;
  tagline: string;
  intro: string;
  features: { title: string; desc: string }[];
  processTitle: string;
  steps: { num: string; title: string; desc: string }[];
  ctaText: string;
  galleryImages: string[];
}

const servicesES: Record<string, ServiceData> = {
  alquilamos: {
    heroImage: '/Fotos/RENDERS 1/Ed_Maristany Forum - 01.jpg',
    heroAlt: 'Alquiler de propiedades de lujo en la Costa Brava y Barcelona',
    title: 'Alquilamos',
    tagline: 'Gestión integral de alquileres premium.',
    intro: 'En SunEliteHomes gestionamos el alquiler de propiedades excepcionales con la máxima atención al detalle. Nos encargamos de todo para que usted solo disfrute de la rentabilidad y la tranquilidad.',
    features: [
      { title: 'Selección de Inquilinos', desc: 'Filtrado riguroso de candidatos solventes y respetuosos con su propiedad.' },
      { title: 'Gestión Integral', desc: 'Nos ocupamos de contratos, cobros, mantenimiento y atención 24/7 al inquilino.' },
      { title: 'Máxima Rentabilidad', desc: 'Estrategia de precios dinámica para optimizar la ocupación y el rendimiento.' },
      { title: 'Protección Total', desc: 'Seguros, garantías de impago y revisiones periódicas del estado de la propiedad.' },
    ],
    processTitle: 'Nuestro Proceso de Alquiler',
    steps: [
      { num: '01', title: 'Valoración del Alquiler', desc: 'Analizamos el mercado para fijar el precio óptimo de su propiedad.' },
      { num: '02', title: 'Preparación y Marketing', desc: 'Fotografía profesional, home staging y difusión en nuestra red de clientes cualificados.' },
      { num: '03', title: 'Selección y Contrato', desc: 'Verificación exhaustiva de inquilinos y redacción de contrato blindado.' },
      { num: '04', title: 'Gestión Continuada', desc: 'Seguimiento mensual, cobros, incidencias y renovaciones gestionadas por nosotros.' },
    ],
    ctaText: 'Solicitar gestión de alquiler',
    galleryImages: [
      '/Fotos/RENDERS 1/Ed_Maristany Forum - 03.jpg',
      '/Fotos/RENDERS 1/Ed_Maristany Forum - 05.jpg',
      '/Fotos/RENDERS 1/Ed_Maristany Forum - 08.jpg',
    ],
  },
  vendemos: {
    heroImage: '/Fotos/PROYECTO 2/P1546535-HDR-2.jpg',
    heroAlt: 'Venta de inmuebles de lujo con confidencialidad',
    title: 'Vendemos',
    tagline: 'Comercialización de élite. Máxima confidencialidad.',
    intro: 'Posicionamos su propiedad ante los compradores adecuados — no ante el mundo entero. Nuestra estrategia de comercialización combina discreción absoluta con alcance global a través de nuestra red de contactos cualificados.',
    features: [
      { title: 'Marketing Discreto', desc: 'Exposés personalizados, fotografía profesional y tours privados exclusivos.' },
      { title: 'Red Global de Compradores', desc: 'Acceso directo a inversores internacionales y family offices.' },
      { title: 'Valoración Precisa', desc: 'Análisis comparativo de mercado basado en transacciones reales, no en portales.' },
      { title: 'Protección del Vendedor', desc: 'Filtrado riguroso de compradores para garantizar operaciones serias.' },
    ],
    processTitle: 'Estrategia de Comercialización',
    steps: [
      { num: '01', title: 'Valoración Estratégica', desc: 'Determinamos el valor óptimo basándonos en comparables reales y tendencias de mercado.' },
      { num: '02', title: 'Preparación Premium', desc: 'Fotografía profesional, vídeo, home staging y exposé digital de alta gama.' },
      { num: '03', title: 'Distribución Selectiva', desc: 'Presentación confidencial a nuestra base de compradores cualificados.' },
      { num: '04', title: 'Cierre Seguro', desc: 'Acompañamiento legal completo hasta la escritura notarial.' },
    ],
    ctaText: 'Solicitar valoración de mi propiedad',
    galleryImages: [
      '/Fotos/PROYECTO 2/P1546028-HDR-2.jpg',
      '/Fotos/PROYECTO 2/P1546584-edit-2.jpg',
      '/Fotos/PROYECTO 2/P1546596-2.jpg',
    ],
  },
  reformamos: {
    heroImage: '/Fotos/RENDERS 1/Ed_Maristany Forum - 12.jpg',
    heroAlt: 'Reformas de lujo y diseño de interiores premium',
    title: 'Reformamos',
    tagline: 'Ingeniería de lujo. Diseño sin compromisos.',
    intro: 'Transformamos propiedades en obras de arte habitables. Nuestro equipo de arquitectos e interioristas trabaja con los mejores materiales y artesanos para crear espacios que superan expectativas.',
    features: [
      { title: 'Diseño Integral', desc: 'Arquitectura, interiorismo y paisajismo bajo una dirección creativa unificada.' },
      { title: 'Materiales Premium', desc: 'Mármoles italianos, maderas nobles, herrajes de diseño y domótica de última generación.' },
      { title: 'Gestión Llave en Mano', desc: 'Nos encargamos de todo: licencias, obra, decoración y entrega final.' },
      { title: 'Revalorización Garantizada', desc: 'Cada reforma maximiza el valor del inmueble con ROI demostrable.' },
    ],
    processTitle: 'El Proceso de Transformación',
    steps: [
      { num: '01', title: 'Visión y Briefing', desc: 'Entendemos su estilo de vida y definimos la visión del proyecto.' },
      { num: '02', title: 'Diseño y Proyecto', desc: 'Planos, renders 3D y presupuesto detallado antes de iniciar la obra.' },
      { num: '03', title: 'Ejecución Premium', desc: 'Obra supervisada diariamente con los mejores oficios del sector.' },
      { num: '04', title: 'Entrega y Decoración', desc: 'Amueblamiento, iluminación y los últimos detalles para una entrega impecable.' },
    ],
    ctaText: 'Solicitar presupuesto de reforma',
    galleryImages: [
      '/Fotos/RENDERS 2/Sant Adria_ Carme 105 - 1.jpg',
      '/Fotos/RENDERS 2/Sant Adria_ Carme 105 - 3.jpg',
      '/Fotos/RENDERS 2/Sant Adria_ Carme 105 - 5.jpg',
    ],
  },
};

const servicesEN: Record<string, ServiceData> = {
  alquilamos: {
    ...servicesES.alquilamos,
    title: 'We Rent',
    tagline: 'Comprehensive premium rental management.',
    intro: 'At SunEliteHomes we manage the rental of exceptional properties with the utmost attention to detail. We take care of everything so you can simply enjoy the returns and peace of mind.',
    features: [
      { title: 'Tenant Selection', desc: 'Rigorous screening of solvent, property-respecting candidates.' },
      { title: 'Full Management', desc: 'We handle contracts, payments, maintenance and 24/7 tenant support.' },
      { title: 'Maximum Returns', desc: 'Dynamic pricing strategy to optimise occupancy and yield.' },
      { title: 'Total Protection', desc: 'Insurance, non-payment guarantees and regular property inspections.' },
    ],
    processTitle: 'Our Rental Process',
    steps: [
      { num: '01', title: 'Rental Valuation', desc: 'We analyse the market to set the optimal price for your property.' },
      { num: '02', title: 'Preparation & Marketing', desc: 'Professional photography, home staging and distribution to our qualified client network.' },
      { num: '03', title: 'Selection & Contract', desc: 'Thorough tenant verification and watertight contract drafting.' },
      { num: '04', title: 'Ongoing Management', desc: 'Monthly monitoring, payments, incidents and renewals managed by us.' },
    ],
    ctaText: 'Request rental management',
  },
  vendemos: {
    ...servicesES.vendemos,
    title: 'We Sell',
    tagline: 'Elite marketing. Maximum confidentiality.',
    intro: 'We position your property before the right buyers — not the entire world. Our marketing strategy combines absolute discretion with global reach through our network of qualified contacts.',
    features: [
      { title: 'Discreet Marketing', desc: 'Custom exposés, professional photography and exclusive private tours.' },
      { title: 'Global Buyer Network', desc: 'Direct access to international investors and family offices.' },
      { title: 'Precise Valuation', desc: 'Market analysis based on real transactions, not portal listings.' },
      { title: 'Seller Protection', desc: 'Rigorous buyer screening to ensure serious transactions.' },
    ],
    processTitle: 'Marketing Strategy',
    steps: [
      { num: '01', title: 'Strategic Valuation', desc: 'We determine optimal value based on real comparables and market trends.' },
      { num: '02', title: 'Premium Preparation', desc: 'Professional photography, video, home staging and high-end digital exposé.' },
      { num: '03', title: 'Selective Distribution', desc: 'Confidential presentation to our qualified buyer base.' },
      { num: '04', title: 'Secure Closing', desc: 'Full legal support through to notarial deed.' },
    ],
    ctaText: 'Request property valuation',
  },
  reformamos: {
    ...servicesES.reformamos,
    title: 'We Renovate',
    tagline: 'Luxury engineering. Uncompromising design.',
    intro: 'We transform properties into liveable works of art. Our team of architects and interior designers works with the finest materials and craftsmen to create spaces that exceed expectations.',
    features: [
      { title: 'Integrated Design', desc: 'Architecture, interiors and landscaping under unified creative direction.' },
      { title: 'Premium Materials', desc: 'Italian marbles, noble woods, designer fittings and state-of-the-art home automation.' },
      { title: 'Turnkey Management', desc: 'We handle everything: permits, construction, decoration and final handover.' },
      { title: 'Guaranteed Value Increase', desc: 'Every renovation maximises property value with demonstrable ROI.' },
    ],
    processTitle: 'The Transformation Process',
    steps: [
      { num: '01', title: 'Vision & Briefing', desc: 'We understand your lifestyle and define the project vision.' },
      { num: '02', title: 'Design & Planning', desc: 'Blueprints, 3D renders and detailed budget before construction starts.' },
      { num: '03', title: 'Premium Execution', desc: 'Construction supervised daily with the finest craftsmen in the sector.' },
      { num: '04', title: 'Handover & Decoration', desc: 'Furnishing, lighting and finishing touches for an impeccable delivery.' },
    ],
    ctaText: 'Request renovation quote',
  },
};

export function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const data = (language === 'es' ? servicesES : servicesEN)[slug || ''];

  useEffect(() => {
    if (!data) return;
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // Hero parallax
      if (heroRef.current) {
        gsap.to(heroRef.current.querySelector('img'), {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        // Hero text reveal
        gsap.from(heroRef.current.querySelectorAll('.hero-anim'), {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3,
        });
      }

      // Features stagger
      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        });
      }

      // Steps stagger
      if (stepsRef.current) {
        gsap.from(stepsRef.current.querySelectorAll('.step-item'), {
          x: -40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 80%',
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [data, slug]);

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <p className="text-white font-montserrat">Servicio no encontrado</p>
      </div>
    );
  }

  const scrollToContact = () => {
    const el = document.getElementById('service-cta');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" ref={sectionRef}>
      <LuxuryNavigation />

      {/* Hero */}
      <div ref={heroRef} className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <img
          src={optimizedSrc(data.heroImage)}
          alt={data.heroAlt}
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-20 max-w-5xl">
          <Link
            to="/#servicios"
            className="hero-anim inline-flex items-center gap-2 text-white/60 hover:text-brand-gold font-montserrat text-sm mb-6 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'es' ? 'Volver a servicios' : 'Back to services'}
          </Link>
          <h1 className="hero-anim font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            {data.title}
          </h1>
          <p className="hero-anim font-montserrat text-lg sm:text-xl md:text-2xl text-brand-gold font-semibold tracking-wide mb-4">
            {data.tagline}
          </p>
          <p className="hero-anim font-montserrat text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
            {data.intro}
          </p>
        </div>
      </div>

      {/* Features */}
      <section className="bg-white py-16 sm:py-20 md:py-28 px-4 sm:px-6" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-[1px] w-16 bg-brand-gold mx-auto mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-4">
              {language === 'es' ? '¿Por qué elegirnos?' : 'Why choose us?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {data.features.map((f, i) => (
              <div
                key={i}
                className="feature-card group p-6 md:p-8 border border-gray-200 hover:border-brand-gold/40 hover:shadow-lg transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-montserrat text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-gold transition-colors">
                      {f.title}
                    </h3>
                    <p className="font-montserrat text-sm text-gray-600 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-brand-navy py-16 sm:py-20 md:py-28 px-4 sm:px-6" ref={stepsRef}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="h-[1px] w-16 bg-brand-gold mx-auto mb-6" />
            <h2 className="font-playfair text-3xl md:text-4xl text-white">
              {data.processTitle}
            </h2>
          </div>
          <div className="space-y-0">
            {data.steps.map((step, i) => (
              <div key={i} className="step-item flex gap-6 md:gap-10 py-8 border-b border-white/10 last:border-b-0">
                <span className="font-playfair text-4xl md:text-5xl font-bold text-brand-gold/30 leading-none flex-shrink-0 w-16 md:w-20">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-montserrat text-lg md:text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="font-montserrat text-sm md:text-base text-white/60 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-black py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {data.galleryImages.map((img, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden group">
              <img
                src={optimizedSrc(img)}
                alt={`${data.title} - ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="service-cta" className="bg-white py-16 sm:py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="h-[1px] w-16 bg-brand-gold mx-auto mb-6" />
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-4">
            {language === 'es' ? '¿Listo para empezar?' : 'Ready to start?'}
          </h2>
          <p className="font-montserrat text-gray-600 mb-8">
            {language === 'es'
              ? 'Contacte con nuestro equipo y reciba asesoramiento personalizado sin compromiso.'
              : 'Contact our team and receive personalised advice with no obligation.'}
          </p>
          <Link
            to="/#contacto"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-gold text-brand-navy font-montserrat font-semibold hover:bg-brand-gold/90 transition-colors"
          >
            {data.ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}
