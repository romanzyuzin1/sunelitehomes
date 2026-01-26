import { motion } from 'motion/react';
import { Building2, Search, TrendingUp, Shield } from 'lucide-react';

const services = [
  {
    icon: Building2,
    title: 'Venta de Residencias Exclusivas',
    description: 'Maximización del Valor y Discreción. Posicionamos su propiedad única en el mercado global, utilizando estrategias de marketing selecto y asegurando la máxima rentabilidad con absoluta confidencialidad.',
  },
  {
    icon: Search,
    title: 'Búsqueda de Propiedades Prime',
    description: 'Adquisición a Medida. Identificamos las propiedades más codiciadas y off-market que cumplen con su visión de vida e inversión, gestionando un proceso de adquisición impecable.',
  },
  {
    icon: TrendingUp,
    title: 'Valoración de Activos Inmobiliarios',
    description: 'Análisis Patrimonial Riguroso. Ofrecemos una valoración exhaustiva basada en la exclusividad de la ubicación, calidad de los acabados y potencial de revalorización de la propiedad.',
  },
  {
    icon: Shield,
    title: 'Gestión Legal y Fiduciaria',
    description: 'Transacciones con Seguridad Total. Asesoramiento legal, fiscal y fiduciario de élite para garantizar la protección de su inversión y la fluidez del traspaso de propiedad.',
  },
];

export function ServicesSection() {
  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-16 sm:py-32 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="h-[1px] w-16 bg-[var(--gold)] mx-auto mb-6" />
          <h2 className="mb-6">Servicios Inmobiliarios Premium</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Un servicio más allá de la transacción: una gestión de patrimonio.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white p-10 shadow-md hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
            >
              {/* Gold accent line on hover */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--gold)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <motion.div 
                    className="w-16 h-16 bg-black flex items-center justify-center group-hover:bg-[var(--gold)] transition-colors duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.button 
            onClick={scrollToContact}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative bg-black text-white px-10 py-4 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <span className="relative z-10">Solicitar Evaluación Confidencial</span>
            <motion.div 
              className="absolute inset-0 bg-[var(--gold)]"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              Solicitar Evaluación Confidencial
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}