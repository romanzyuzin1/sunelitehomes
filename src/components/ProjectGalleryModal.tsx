import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { optimizedSrc, thumbSrc } from '../lib/media';

interface ProjectGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  projectName: string;
}

export function ProjectGalleryModal({ isOpen, onClose, images, projectName }: ProjectGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-brand-gold transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Project Name */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-playfair text-2xl text-white">{projectName}</h3>
        <p className="font-montserrat text-sm text-white/70">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-brand-gold transition-colors"
      >
        <ChevronLeft className="w-12 h-12" />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-brand-gold transition-colors"
      >
        <ChevronRight className="w-12 h-12" />
      </button>

      {/* Main Image */}
      <div className="max-w-7xl max-h-[90vh] mx-auto px-4 sm:px-12 lg:px-20">
        <img
          src={optimizedSrc(images[currentIndex])}
          alt={`${projectName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] sm:max-w-2xl md:max-w-4xl px-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-20 h-20 border-2 transition-all ${
              idx === currentIndex ? 'border-brand-gold' : 'border-white/30'
            }`}
          >
            <img
              src={thumbSrc(img)}
              alt={`Thumbnail ${idx + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
