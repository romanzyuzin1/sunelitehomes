import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import img1_1 from 'figma:asset/8d7ee862e6a6dc405a8f6a2ded0609b40b0f5504.png';
import img1_2 from 'figma:asset/370ee23f1ade3f38aae4ce2c058001a13a04acf8.png';
import img1_3 from 'figma:asset/df64afce9c8855ba33a58601747fdcd4478b8b20.png';

// INSTRUCCIONES PARA ACTUALIZAR IMÁGENES:
// Cada proyecto puede tener múltiples imágenes en un array 'images'
// Todas las imágenes se mostrarán en un slider automático

interface Project {
  id: number;
  location: string;
  images: string[];
}

const projects: Project[] = [
  {
    id: 1,
    location: 'Barcelona, España',
    images: [img1_1, img1_2, img1_3],
  },
  {
    id: 2,
    location: 'Barcelona, España',
    images: [
      'https://images.unsplash.com/photo-1707299231603-6c0a93e0f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY3MzgzODg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxlbGVnYW50JTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY3MzgzODg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 3,
    location: 'Barcelona, España',
    images: [
      'https://images.unsplash.com/photo-1568115286680-d203e08a8be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjB2aWV3fGVufDF8fHx8MTc2NzQyNjExOXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBwZW50aG91c2UlMjB2aWV3fGVufDF8fHx8MTc2NzQyNjExOXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 4,
    location: 'Barcelona, España',
    images: [
      'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYXxlbnwxfHx8fDE3Njc0NTkyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYXxlbnwxfHx8fDE3Njc0NTkyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 5,
    location: 'Barcelona, España',
    images: [
      'https://images.unsplash.com/photo-1758193431355-54df41421657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwcmVzaWRlbnRpYWwlMjBleHRlcmlvcnxlbnwxfHx8fDE3Njc0NTkyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwcmVtaXVtJTIwcmVzaWRlbnRpYWwlMjBleHRlcmlvcnxlbnwxfHx8fDE3Njc0NTkyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
];

function ProjectSlider({ project, index }: { project: Project; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out'>('in');

  const totalImages = project.images.length;

  // Slider automático cuando hay hover
  useEffect(() => {
    if (isHovered && totalImages > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
      }, 4000); // Cambia de imagen cada 4 segundos

      return () => clearInterval(interval);
    }
  }, [isHovered, totalImages]);

  // Alternar zoom in/out cuando hay hover
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setZoomDirection((prev) => (prev === 'in' ? 'out' : 'in'));
      }, 8000); // Alterna zoom cada 8 segundos

      return () => clearInterval(interval);
    } else {
      // Reset zoom cuando sale el hover
      setZoomDirection('in');
    }
  }, [isHovered]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-screen w-full overflow-hidden snap-start"
    >
      {/* Slider de imágenes */}
      <div className="absolute inset-0">
        {project.images.map((image, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{
              opacity: idx === currentImageIndex ? 1 : 0,
              scale: idx === currentImageIndex && isHovered
                ? (zoomDirection === 'in' ? 1.15 : 1.0)
                : 1.0, // Sin hover = sin zoom
            }}
            transition={{
              opacity: { duration: 1, ease: 'easeInOut' },
              scale: { duration: 8, ease: 'easeInOut' } // Zoom suave de 8 segundos
            }}
            className="absolute inset-0"
          >
            <img
              src={image}
              alt={`Proyecto ${project.id} - ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}

        {/* Overlay sutil solo en los bordes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Información minimalista - Solo ubicación */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 border border-white/10"
        >
          <svg className="w-4 h-4 text-[var(--gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-white text-xs sm:text-sm tracking-wide">{project.location}</span>
        </motion.div>
      </div>

      {/* Número del proyecto - esquina superior derecha */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10 text-white/30 text-xs sm:text-sm tracking-widest">
        0{project.id}
      </div>

      {/* Controles de navegación de imágenes */}
      {totalImages > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[var(--gold)] text-white p-2 sm:p-3 transition-all duration-300 backdrop-blur-sm border border-white/10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[var(--gold)] text-white p-2 sm:p-3 transition-all duration-300 backdrop-blur-sm border border-white/10"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Indicadores de navegación (dots) - minimalistas */}
      {totalImages > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 flex items-center gap-1.5 sm:gap-2 z-20">
          {project.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`transition-all duration-300 ${
                idx === currentImageIndex
                  ? 'w-6 sm:w-8 h-1 bg-[var(--gold)]'
                  : 'w-4 sm:w-6 h-1 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Barra de progreso automático - SOLO cuando hay hover */}
      {isHovered && totalImages > 1 && (
        <motion.div
          className="absolute top-0 left-0 h-[1px] bg-[var(--gold)] z-30"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 8,
            ease: 'linear',
            repeat: Infinity,
          }}
          key={`${currentImageIndex}-${zoomDirection}`}
        />
      )}
    </motion.div>
  );
}

export function PortfolioSection() {
  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="portfolio" className="relative bg-black">
      {/* Sliders de proyectos */}
      <div className="snap-y snap-mandatory">
        {projects.map((project, index) => (
          <ProjectSlider key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* Sección CTA minimalista */}
      <div className="relative z-10 bg-black py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="h-[1px] w-16 bg-[var(--gold)] mx-auto mb-6 sm:mb-8" />
            <p className="text-white/60 text-sm sm:text-base mb-8 sm:mb-10 max-w-xl mx-auto px-4">
              ¿Le gustaría discutir su próximo proyecto exclusivo?
            </p>
            <motion.button
              onClick={scrollToContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-[var(--gold)] text-black px-8 sm:px-10 py-3 sm:py-4 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10 text-xs sm:text-sm tracking-wide">Consulta Confidencial</span>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 text-sm tracking-wide">
                Consulta Confidencial
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}