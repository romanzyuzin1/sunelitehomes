import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Home, Briefcase, Award, Hammer, Mail, Menu, X } from 'lucide-react';
import { ExpandableTabs } from './ui/expandable-tabs';
import logoImg from '@/assets/logo.png';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    // Cerrar el menú móvil cuando se selecciona una opción
    setIsMobileMenuOpen(false);
    
    switch (index) {
      case 0:
        scrollToTop();
        break;
      case 1:
        scrollToSection('portfolio');
        break;
      case 2:
        scrollToSection('valores');
        break;
      case 3:
        scrollToSection('renovacion');
        break;
      case 4:
        scrollToSection('contacto');
        break;
    }
  };

  const tabs = [
    { title: "Inicio", icon: Home },
    { title: "Portfolio", icon: Briefcase },
    { title: "Valores", icon: Award },
    { title: "Renovación", icon: Hammer },
    { title: "Contacto", icon: Mail },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        {/* Decorative gold line at bottom */}
        {isScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50" />
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              onClick={scrollToTop}
              className="text-white tracking-wider relative group cursor-pointer flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src={logoImg} 
                alt="SunEliteHomes Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl">SunEliteHomes</span>
              <div className="h-[2px] w-0 group-hover:w-full bg-[var(--gold)] transition-all duration-300 absolute -bottom-1 left-0" />
            </motion.button>

            {/* Desktop Menu with ExpandableTabs */}
            <div className="hidden md:block">
              <ExpandableTabs
                tabs={tabs}
                activeColor="text-[var(--gold)]"
                className="border-white/20 bg-black/60 backdrop-blur-md"
                onChange={handleTabChange}
              />
            </div>

            {/* Mobile Hamburger Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed top-20 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.title}
                    onClick={() => handleTabChange(index)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[var(--gold)] hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-lg">{tab.title}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-20"
        />
      )}
    </>
  );
}