import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';
import { Shield, Clock, Users } from 'lucide-react';

export function OffMarketSection() {
  const { language } = useLanguage();
  const t = translations[language].offMarket;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contacto" className="section-padding bg-brand-navy text-white">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 border border-brand-gold text-brand-gold text-sm font-montserrat tracking-wider uppercase mb-6">
              {t.badge}
            </div>
            <h2 className="heading-luxury text-white mb-6">
              {t.title}
            </h2>
            <p className="body-luxury text-white/90 mb-8">
              {t.subtitle}
            </p>
            <p className="body-luxury text-white/70 mb-12">
              {t.description}
            </p>

            {/* Trust Indicators */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-white mb-1">
                    {t.trust1Title}
                  </h4>
                  <p className="text-sm text-white/60">
                    {t.trust1Desc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-white mb-1">
                    {t.trust2Title}
                  </h4>
                  <p className="text-sm text-white/60">
                    {t.trust2Desc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-gold" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-white mb-1">
                    {t.trust3Title}
                  </h4>
                  <p className="text-sm text-white/60">
                    {t.trust3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white/5 backdrop-blur-sm p-8 lg:p-10">
            <h3 className="font-playfair text-2xl md:text-3xl text-white mb-2">
              {t.formTitle}
            </h3>
            <p className="text-white/60 text-sm mb-8">
              {t.formSubtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-montserrat text-white/80 mb-2">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.namePlaceholder}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-montserrat text-white/80 mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-montserrat text-white/80 mb-2">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.phonePlaceholder}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-montserrat text-white/80 mb-2">
                  {t.interestsLabel}
                </label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder={t.interestsPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-gold text-brand-navy font-montserrat font-semibold uppercase tracking-wider hover:bg-brand-gold/90 transition-colors"
              >
                {t.submit}
              </button>

              <p className="text-xs text-white/50 text-center">
                {t.privacy}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
