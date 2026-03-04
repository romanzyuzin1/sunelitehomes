import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import logoImg from '@/assets/logo.png';

export function LuxuryNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, setLanguage } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const t = translations[language].nav;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 50);
      
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#' + sectionId);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLanguageChange = (lang: 'es' | 'en') => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  const isDetailPage = location.pathname.startsWith('/inmueble');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isDetailPage ? 'bg-[#0F172A] shadow-lg' : 'bg-transparent'
      } ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="container-luxury px-4 sm:px-6 md:px-12 py-1.5 md:py-2">
        <div className="flex items-center justify-between">
          {/* Logo Text - Left */}
          <div className="flex-1">
            <a
              href="/"
              className="font-montserrat text-base sm:text-lg md:text-xl font-bold tracking-tight transition-colors flex items-center gap-2 text-white"
            >
              <img 
                src={logoImg} 
                alt="SunEliteHomes Logo" 
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
              SunEliteHomes
            </a>
          </div>

          {/* Desktop Navigation - Center/Right */}
          <div className="hidden lg:flex flex-1 items-center justify-end gap-6 xl:gap-8">
            <button
              onClick={() => scrollToSection('collection')}
              className="font-montserrat text-sm font-medium tracking-wider uppercase transition-colors hover:text-brand-gold text-white"
            >
              {t.collection}
            </button>
            <button
              onClick={() => scrollToSection('firma')}
              className="font-montserrat text-sm font-medium tracking-wider uppercase transition-colors hover:text-brand-gold text-white"
            >
              {t.firm}
            </button>
            <button
              onClick={() => scrollToSection('servicios')}
              className="font-montserrat text-sm font-medium tracking-wider uppercase transition-colors hover:text-brand-gold text-white"
            >
              {t.services}
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="font-montserrat text-sm font-medium tracking-wider uppercase transition-colors hover:text-brand-gold text-white"
            >
              {t.contact}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 font-montserrat text-sm font-medium tracking-wider uppercase transition-colors hover:text-brand-gold text-white"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>

              {/* Dropdown */}
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-brand-navy border border-brand-gold/30 shadow-lg">
                  <button
                    onClick={() => handleLanguageChange('es')}
                    className={`w-full text-left px-4 py-2 font-montserrat text-sm transition-colors hover:bg-brand-gold/20 ${
                      language === 'es' ? 'text-brand-gold' : 'text-white'
                    }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-2 font-montserrat text-sm transition-colors hover:bg-brand-gold/20 ${
                      language === 'en' ? 'text-brand-gold' : 'text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Private Area Button */}
            <button
              onClick={() => navigate('/admin')}
              className="btn-gold-outline"
            >
              {t.privateArea}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden transition-colors ${isScrolled ? 'text-white' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 border-t border-brand-gold/30 pt-6">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('collection')}
                className="font-montserrat text-sm font-medium tracking-wider uppercase text-brand-offwhite hover:text-brand-gold transition-colors text-left"
              >
                {t.collection}
              </button>
              <button
                onClick={() => scrollToSection('firma')}
                className="font-montserrat text-sm font-medium tracking-wider uppercase text-brand-offwhite hover:text-brand-gold transition-colors text-left"
              >
                {t.firm}
              </button>
              <button
                onClick={() => scrollToSection('servicios')}
                className="font-montserrat text-sm font-medium tracking-wider uppercase text-brand-offwhite hover:text-brand-gold transition-colors text-left"
              >
                {t.services}
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="font-montserrat text-sm font-medium tracking-wider uppercase text-brand-offwhite hover:text-brand-gold transition-colors text-left"
              >
                {t.contact}
              </button>

              {/* Mobile Language Selector */}
              <div className="flex gap-3 mt-2 pt-4 border-t border-brand-gold/20">
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`flex items-center gap-2 font-montserrat text-sm font-medium px-4 py-2 border border-brand-gold/30 transition-colors ${
                    language === 'es'
                      ? 'bg-brand-gold text-brand-navy'
                      : 'text-brand-offwhite hover:bg-brand-gold/20'
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`flex items-center gap-2 font-montserrat text-sm font-medium px-4 py-2 border border-brand-gold/30 transition-colors ${
                    language === 'en'
                      ? 'bg-brand-gold text-brand-navy'
                      : 'text-brand-offwhite hover:bg-brand-gold/20'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                className="btn-gold-outline mt-4"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }}
              >
                {t.privateArea}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
