import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-20 relative overflow-hidden">
      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl tracking-wider mb-6 relative inline-block">
              LUXURY ESTATE
              <div className="h-[2px] w-12 bg-[var(--gold)] mt-2" />
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Asesoría inmobiliaria de alto nivel con servicios de diseño y renovación premium.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-6 text-sm tracking-wider relative inline-block">
              SERVICIOS
              <div className="h-[1px] w-8 bg-[var(--gold)] mt-2" />
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-[var(--gold)] transition-colors">
                  Venta de Residencias
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--gold)] transition-colors">
                  Búsqueda de Propiedades
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--gold)] transition-colors">
                  Valoración de Activos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--gold)] transition-colors">
                  Gestión Legal
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--gold)] transition-colors">
                  Renovación Premium
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-sm tracking-wider relative inline-block">
              CONTACTO
              <div className="h-[1px] w-8 bg-[var(--gold)] mt-2" />
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover:text-[var(--gold)] transition-colors" />
                <span className="group-hover:text-white transition-colors">info@sunelitehomes.com</span>
              </li>
              <li className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover:text-[var(--gold)] transition-colors" />
                <span className="group-hover:text-white transition-colors">+34 650 717 943</span>
              </li>
              <li className="flex items-start gap-3 group">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 group-hover:text-[var(--gold)] transition-colors" />
                <span className="group-hover:text-white transition-colors">Avenida Riera de Cassoles 43-45<br />08012 Barcelona, España</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-6 text-sm tracking-wider relative inline-block">
              SÍGUENOS
              <div className="h-[1px] w-8 bg-[var(--gold)] mt-2" />
            </h4>
            <div className="flex gap-4">
              <motion.a
                href="#"
                whileHover={{ y: -5 }}
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -5 }}
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -5 }}
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
            <p>© {currentYear} Luxury Estate. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[var(--gold)] transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-[var(--gold)] transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="hover:text-[var(--gold)] transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}