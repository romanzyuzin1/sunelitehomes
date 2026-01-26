import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Empresario',
    content: 'La discreción y profesionalidad en cada etapa del proceso fue impecable. Encontraron la propiedad perfecta que ni siquiera sabía que existía.',
    rating: 5,
  },
  {
    name: 'Isabella R.',
    role: 'Inversora Internacional',
    content: 'Su red de contactos y acceso a propiedades off-market es incomparable. Una experiencia de servicio verdaderamente de élite.',
    rating: 5,
  },
  {
    name: 'Alejandro V.',
    role: 'Director Financiero',
    content: 'La gestión integral desde la valoración hasta la renovación superó todas mis expectativas. Un socio de confianza en mi patrimonio.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="120" fill="currentColor">
            "
          </text>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="h-[1px] w-16 bg-[var(--gold)] mx-auto mb-6" />
          <h2 className="mb-6">La Confianza de Nuestros Clientes</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Referencias discretas de quienes han confiado en nuestra excelencia.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div className="bg-zinc-50 p-8 h-full relative overflow-hidden">
                {/* Gold accent corner */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 italic mb-8 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-[var(--gold)]/30 bg-white">
            <div className="w-2 h-2 bg-[var(--gold)] rounded-full animate-pulse" />
            <p className="text-sm text-gray-600">
              Más de 500 transacciones de lujo completadas con absoluta discreción
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
