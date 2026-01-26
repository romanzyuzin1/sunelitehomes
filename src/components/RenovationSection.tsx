import { motion } from 'motion/react';
import { Palette, Home, Cpu } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const renovationServices = [
  {
    icon: Palette,
    title: 'Diseño de Interiores Personalizado',
    description: 'Creación de ambientes únicos con materiales premium y acabados de primera calidad.',
  },
  {
    icon: Home,
    title: 'Renovación Integral Boutique',
    description: 'Proyectos llave en mano, desde la concepción hasta el último detalle decorativo.',
  },
  {
    icon: Cpu,
    title: 'Automatización Domótica Avanzada',
    description: 'Integración de tecnología de punta para una vida de confort y seguridad inigualables.',
  },
];

export function RenovationSection() {
  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-[1px] w-16 bg-[var(--gold)] mb-6" />
            <h2 className="mb-8">De Lujo a Legado: Diseño y Ejecución de Reformas de Alta Ingeniería</h2>
            
            <p className="text-gray-600 text-lg mb-12 leading-relaxed">
              Entendemos que la excelencia no termina con la compra. Colaboramos con arquitectos y diseñadores 
              de renombre para transformar su nueva adquisición en la residencia soñada o para optimizar su valor 
              de venta mediante una renovación estratégica.
            </p>

            <div className="space-y-8 mb-12">
              {renovationServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0">
                    <motion.div 
                      className="w-12 h-12 bg-black group-hover:bg-[var(--gold)] flex items-center justify-center transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onClick={scrollToContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-black text-white px-10 py-4 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10">Consultar Diseño Premium</span>
              <motion.div 
                className="absolute inset-0 bg-[var(--gold)]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Consultar Diseño Premium
              </span>
            </motion.button>
          </motion.div>

          {/* Right: Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <motion.div 
                className="aspect-square overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762811054950-b74e0a055c80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwcmVub3ZhdGlvbnxlbnwxfHx8fDE3NjM3MjQ5MTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Luxury Renovation"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
              <motion.div 
                className="aspect-[4/3] overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1638127369513-18e87b426e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMGRlc2lnbiUyMG1hcmJsZXxlbnwxfHx8fDE3NjM3MjQ5MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Premium Materials"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
            </div>
            <div className="space-y-6 mt-12">
              <motion.div 
                className="aspect-[4/3] overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581784878214-8d5596b98a01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwxfHx8fDE3NjM2NjEzMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Interior Design"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
              <motion.div 
                className="aspect-square overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1640109229792-a26a0ee366ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYzNzI0ODY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Modern Architecture"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}