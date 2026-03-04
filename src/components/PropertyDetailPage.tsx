import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { formatPrice } from '../data/properties';
import { getPropertyByIdFromAll } from '../lib/propertyStorage';
import { LuxuryNavigation } from './LuxuryNavigation';
import { LuxuryFooter } from './LuxuryFooter';
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  Home,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  Waves,
  Wind,
  Shield,
  Car,
  Tv,
  Sun,
  Mountain,
  TreePine,
  Dumbbell,
  Lock,
  Eye,
  Phone,
  Warehouse,
  Flame,
  Droplets,
  DoorOpen,
  Building2,
  Fence,
  Baby,
  ShoppingBag,
  Bus,
  Stethoscope,
  Shirt,
  Music,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/** Map feature keywords to Lucide icons */
const featureIconMap: Record<string, LucideIcon> = {
  'aire acondicionado': Wind,
  'calefacción': Flame,
  'calefacción central': Flame,
  'calefacción gasoil': Flame,
  'bomba frio calor': Wind,
  'ascensor': Building2,
  'piscina': Waves,
  'piscina cubierta': Waves,
  'piscina de comunidad': Waves,
  'garaje doble': Car,
  'garaje': Car,
  'trastero': Warehouse,
  'alarma': Shield,
  'video portero': Eye,
  'vigilancia': Shield,
  'puerta blindada': Lock,
  'domótica': Tv,
  'energía solar': Sun,
  'vistas': Eye,
  'vistas al mar': Eye,
  'soleado': Sun,
  'montaña': Mountain,
  'primera linea': Sun,
  'mirador': Eye,
  'costa': Waves,
  'exterior': Sun,
  'interior': DoorOpen,
  'obra nueva': Sparkles,
  'vallado': Fence,
  'urbanización': Building2,
  'conserje': Shield,
  'despensa': Warehouse,
  'buhardilla': Home,
  'sotano': Warehouse,
  'armario empotrado': DoorOpen,
  'diafano': Maximize,
  'doble ventana': DoorOpen,
  'galería': DoorOpen,
  'caja fuerte': Lock,
  'hilo musical': Music,
  'parabólica': Tv,
  'linea teléfono': Phone,
  'lavanderia': Shirt,
  'deposito de agua': Droplets,
  'gas ciudad': Flame,
  'c/i gas': Flame,
  'pista de pádel': Dumbbell,
  'pista de tenis': Dumbbell,
  'pista de fútbol': Dumbbell,
  'cancha de baloncesto': Dumbbell,
  'txoko': Home,
  'camarote': Bed,
  'acceso movilidad reducida': DoorOpen,
  'entidad bancaria': Building2,
  'centros comerciales': ShoppingBag,
  'colegios': Building2,
  'zonas infantiles': Baby,
  'arboles': TreePine,
  'parada autobus': Bus,
  'tranvia': Bus,
  'hospitales': Stethoscope,
};

function getFeatureIcon(feature: string): LucideIcon {
  const key = feature.toLowerCase();
  if (featureIconMap[key]) return featureIconMap[key];
  for (const [k, icon] of Object.entries(featureIconMap)) {
    if (key.includes(k) || k.includes(key)) return icon;
  }
  return Sparkles;
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].propertyDetail;

  const property = getPropertyByIdFromAll(Number(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!property) {
    return (
      <>
        <LuxuryNavigation />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="font-playfair text-4xl text-brand-navy mb-4">{t.notFound}</h1>
            <p className="text-gray-500 mb-8">{t.notFoundDesc}</p>
            <button onClick={() => navigate('/')} className="btn-gold-outline">
              {t.backToHome}
            </button>
          </div>
        </div>
        <LuxuryFooter />
      </>
    );
  }

  const nextImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const energyLabel = (value: string) => {
    if (value === 'none') return 'N/D';
    return value.toUpperCase();
  };

  const energyColor = (value: string) => {
    const colors: Record<string, string> = {
      a: 'bg-green-500',
      b: 'bg-green-400',
      c: 'bg-yellow-400',
      d: 'bg-yellow-500',
      e: 'bg-orange-400',
      f: 'bg-orange-500',
      g: 'bg-red-500',
    };
    return colors[value] || 'bg-gray-400';
  };

  return (
    <>
      <LuxuryNavigation />

      {/* Hero Image Gallery */}
      <section className="relative pt-20 bg-gray-50">
        {/* Back button */}
        <div className="absolute top-24 left-6 z-20">
          <Link
            to="/#collection"
            className="flex items-center gap-2 text-white/90 hover:text-brand-gold transition-colors font-montserrat text-sm drop-shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Link>
        </div>

        {property.images.length > 0 ? (
          <div className="relative">
            {/* Main Image */}
            <div
              className="relative w-full h-[50vh] md:h-[65vh] lg:h-[70vh] cursor-pointer overflow-hidden bg-gray-200"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                key={currentImageIndex}
                src={property.images[currentImageIndex]}
                alt={`${property.title} - ${currentImageIndex + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

              {/* Image counter */}
              <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm px-4 py-2 text-white text-sm font-montserrat rounded-full">
                {currentImageIndex + 1} / {property.images.length}
              </div>

              {/* Action buttons */}
              <div className="absolute top-6 right-6 flex gap-3">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm text-brand-navy hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center rounded-full shadow-md">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm text-brand-navy hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center rounded-full shadow-md">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-[calc(50%-2rem)] w-12 h-12 bg-white/80 backdrop-blur-sm text-brand-navy hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-[calc(50%-2rem)] w-12 h-12 bg-white/80 backdrop-blur-sm text-brand-navy hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center rounded-full shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail Grid */}
            {property.images.length > 1 && (
              <div className="container-luxury px-4 py-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImageLoaded(false);
                        setCurrentImageIndex(i);
                      }}
                      className={`w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 overflow-hidden transition-all rounded ${
                        i === currentImageIndex
                          ? 'ring-2 ring-brand-gold opacity-100 scale-105'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[40vh] bg-gray-100 flex items-center justify-center">
            <Home className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </section>

      {/* Property Info */}
      <section className="section-padding bg-white">
        <div className="container-luxury">
          {/* Header */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-16 mb-12 lg:mb-20">
            <div className="lg:col-span-2">
              {/* Type & Ref */}
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-montserrat font-semibold uppercase tracking-wider rounded">
                  {property.type}
                </span>
                <span className="text-gray-400 font-montserrat text-sm">
                  Ref: {property.ref}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-brand-navy font-semibold mb-4">
                {property.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-500 mb-6">
                <MapPin className="w-5 h-5 text-brand-gold" />
                <span className="font-montserrat text-lg">
                  {property.town}, {property.province}
                  {property.location.address && ` — ${property.location.address}`}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 py-6 border-t border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-brand-gold" />
                  <span className="text-brand-navy font-montserrat font-medium">
                    {property.beds} {t.beds}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-brand-gold" />
                  <span className="text-brand-navy font-montserrat font-medium">
                    {property.baths} {t.baths}
                  </span>
                </div>
                {property.surfaceArea.built > 0 && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-brand-gold" />
                    <span className="text-brand-navy font-montserrat font-medium">
                      {property.surfaceArea.built} m² {t.built}
                    </span>
                  </div>
                )}
                {property.surfaceArea.plot > 0 && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-brand-gold/60" />
                    <span className="text-gray-500 font-montserrat">
                      {property.surfaceArea.plot} m² {t.plot}
                    </span>
                  </div>
                )}
                {property.pool && (
                  <div className="flex items-center gap-2">
                    <Waves className="w-5 h-5 text-brand-gold" />
                    <span className="text-brand-navy font-montserrat font-medium">{t.pool}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Card */}
            <div className="lg:col-span-1">
              <div className="bg-brand-navy p-8 rounded-lg shadow-xl sticky top-28">
                <p className="text-white/60 font-montserrat text-sm uppercase tracking-wider mb-2">
                  {property.priceFreq === 'month' ? t.rentalPrice : t.salePrice}
                </p>
                <p className="font-playfair text-3xl md:text-4xl text-brand-gold font-semibold mb-6">
                  {formatPrice(property.price, property.currency, property.priceFreq, language)}
                </p>

                <a
                  href="#contacto"
                  className="block w-full py-4 bg-brand-gold text-brand-navy font-montserrat font-semibold uppercase tracking-wider text-center hover:bg-brand-gold/90 transition-colors mb-3 rounded"
                >
                  {t.contactUs}
                </a>
                <a
                  href={`https://wa.me/34650717943?text=${encodeURIComponent(language === 'es' ? `Hola, me interesa la propiedad: ${property.title} (Ref: ${property.ref})` : `Hello, I'm interested in the property: ${property.title} (Ref: ${property.ref})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 border-2 border-brand-gold text-brand-gold font-montserrat font-semibold uppercase tracking-wider text-center hover:bg-brand-gold hover:text-brand-navy transition-all rounded"
                >
                  WhatsApp
                </a>

                <div className="mt-6 space-y-3 text-sm font-montserrat">
                  {property.buildYear && (
                    <div className="flex justify-between text-white/60">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t.buildYear}
                      </span>
                      <span className="text-white">{property.buildYear}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {t.energy}
                    </span>
                    <span
                      className={`w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded ${energyColor(property.energyRating.consumption)}`}
                    >
                      {energyLabel(property.energyRating.consumption)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>{t.status}</span>
                    <span className="text-brand-gold capitalize">{property.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="font-playfair text-2xl md:text-3xl text-brand-navy mb-6">
                {t.description}
              </h2>
              <div className="text-gray-600 font-montserrat leading-relaxed space-y-4">
                {property.description.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Features with icons */}
              {property.features.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-playfair text-2xl md:text-3xl text-brand-navy mb-6">
                    {t.features}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, i) => {
                      const Icon = getFeatureIcon(feature);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 py-3 px-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />
                          <span className="text-gray-700 font-montserrat text-sm capitalize">
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Location Map */}
            <div className="lg:col-span-1">
              {property.location.latitude && property.location.longitude && (
                <div>
                  <h3 className="font-playfair text-xl text-brand-navy mb-4">
                    {t.location}
                  </h3>
                  <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      title="Property Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`}
                    />
                  </div>
                  <p className="text-gray-400 font-montserrat text-xs mt-2">
                    {property.location.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {isLightboxOpen && property.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 text-white hover:text-brand-gold transition-colors flex items-center justify-center"
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {property.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 text-white hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center rounded-full"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 text-white hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center rounded-full"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 font-montserrat text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}

      <LuxuryFooter />
    </>
  );
}
