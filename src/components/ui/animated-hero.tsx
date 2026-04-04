import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/i18n/translations";

function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  const [titleNumber, setTitleNumber] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [showPoster, setShowPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTransitioned = useRef(false);
  
  const titles = useMemo(
    () => language === 'es' 
      ? ["excepcional", "exclusivo", "prestigioso", "elegante", "único"]
      : ["exceptional", "exclusive", "prestigious", "elegant", "unique"],
    [language]
  );

  const fontStyles = useMemo(
    () => [
      { fontFamily: 'Deutschlands', fontWeight: 400, fontStyle: 'normal' },
      { fontFamily: 'Gencha Koplexs Studio', fontWeight: 400, fontStyle: 'normal' },
      { fontFamily: 'Deutschlands', fontWeight: 400, fontStyle: 'normal' },
      { fontFamily: 'Noverich Syauqi Studio', fontWeight: 400, fontStyle: 'normal' },
      { fontFamily: 'Gencha Koplexs Studio', fontWeight: 400, fontStyle: 'normal' },
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
      setAnimationKey(prev => prev + 1);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  // Wait until the video is actually playing and has rendered a few frames
  // before removing the poster — this avoids the frozen-frame flash
  const handlePlaying = useCallback(() => {
    if (hasTransitioned.current) return;
    hasTransitioned.current = true;
    // Small delay so the video renders at least a couple of frames
    // before the poster starts to fade out
    setTimeout(() => setShowPoster(false), 300);
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center relative overflow-hidden">
      {/* Video Background — sits behind the poster, always rendering */}
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
          style={{ willChange: 'auto' }}
        >
          <source
            src="/Fotos-optimized/Video/landing_background.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Poster Image — sits on TOP, fades out once video is really playing */}
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
      <div className="absolute inset-0 bg-brand-navy/80" style={{ zIndex: 2 }} />
      
      <div className="container-luxury mx-auto px-4 sm:px-6 relative" style={{ zIndex: 3 }}>
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
          <div className="flex gap-6 flex-col">
            <h1 className="text-4xl sm:text-5xl md:text-7xl max-w-4xl tracking-tight text-center font-playfair">
              <span className="text-white font-light">
                {t.title1}
              </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                <AnimatePresence>
                  <motion.span
                    key={animationKey}
                    className="absolute"
                    style={{
                      color: '#D4AF37',
                      ...fontStyles[titleNumber]
                    }}
                    initial={{ opacity: 0, y: 150 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -150 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  >
                    {titles[titleNumber]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button 
              size="lg" 
              className="gap-4 bg-white text-[#0F172A] hover:bg-white/90 transition-all font-montserrat"
            >
              <PhoneCall className="w-4 h-4" />
              {t.cta}
            </Button>
            <Button 
              size="lg" 
              className="gap-4 bg-brand-navy text-white hover:bg-brand-navy/90 font-montserrat font-semibold border-2 border-white"
            >
              {language === 'es' ? 'Ver Colección' : 'View Collection'}
              <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
