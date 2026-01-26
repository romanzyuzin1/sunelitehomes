import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

export function LuxuryFooter() {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const navT = translations[language].nav;
  
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer id="contacto" className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="section-padding border-b border-brand-gold/20">
        <div className="container-luxury">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-16">
            {/* Column 1: Logo & Tagline */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-gold flex items-center justify-center mb-4">
                  <span className="font-playfair text-brand-navy text-2xl font-bold">
                    SE
                  </span>
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">
                  SunEliteHomes
                </h3>
              </div>
              <p className="font-montserrat text-sm text-brand-lightgrey leading-relaxed mb-6">
                {t.tagline}
              </p>
              <div className="gold-accent" />
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-montserrat text-sm font-semibold uppercase tracking-widest text-brand-gold mb-6">
                {t.navigation}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#collection"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    {navT.collection}
                  </a>
                </li>
                <li>
                  <a
                    href="#firma"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    {navT.firm}
                  </a>
                </li>
                <li>
                  <a
                    href="#servicios"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    {navT.services}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    {t.privacy}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    {t.terms}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Newsletter */}
            <div>
              <h4 className="font-montserrat text-sm font-semibold uppercase tracking-widest text-brand-gold mb-6">
                {t.privateList}
              </h4>
              <p className="font-montserrat text-sm text-brand-lightgrey mb-6">
                {t.newsletterDesc}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full bg-white/10 border border-brand-gold/30 text-white px-4 py-3 font-montserrat text-sm focus:outline-none focus:border-brand-gold transition-colors"
                />
                <button
                  type="submit"
                  className="w-full btn-gold text-xs py-3"
                >
                  {t.subscribe}
                </button>
              </form>
            </div>

            {/* Column 4: Contact Details */}
            <div>
              <h4 className="font-montserrat text-sm font-semibold uppercase tracking-widest text-brand-gold mb-6">
                {t.contactTitle}
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-montserrat text-sm text-brand-offwhite">
                      Paseo de la Castellana 95
                    </p>
                    <p className="font-montserrat text-sm text-brand-lightgrey">
                      28046 Madrid, España
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-gold flex-shrink-0" />
                  <a
                    href="tel:+34912345678"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    +34 91 234 5678
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-gold flex-shrink-0" />
                  <a
                    href="mailto:contact@sunelitehomes.com"
                    className="font-montserrat text-sm text-brand-offwhite hover:text-brand-gold transition-colors"
                  >
                    contact@sunelitehomes.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h5 className="font-montserrat text-xs font-semibold uppercase tracking-widest text-brand-offwhite mb-4">
                  {t.followUs}
                </h5>
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all group"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-brand-gold group-hover:text-brand-navy transition-colors" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all group"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-brand-gold group-hover:text-brand-navy transition-colors" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all group"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-brand-gold group-hover:text-brand-navy transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 px-6 md:px-12">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-montserrat text-xs text-brand-lightgrey">
              {t.copyright}
            </p>
            <p className="font-montserrat text-xs text-brand-lightgrey">
              {t.designed}{' '}
              <span className="text-brand-gold">{t.excellence}</span> {t.and}{' '}
              <span className="text-brand-gold">{t.discretion}</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
