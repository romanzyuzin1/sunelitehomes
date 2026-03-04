import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';

/**
 * Maps an original image path (e.g. /Fotos/PROYECTO 1/image.jpg)
 * to its optimized WebP version (e.g. /Fotos-optimized/PROYECTO 1/image.webp)
 */
function getOptimizedPath(originalSrc: string, variant: 'full' | 'thumb' | 'micro' = 'full'): string {
  // Only transform local /Fotos/ paths
  if (!originalSrc.startsWith('/Fotos/') && !originalSrc.startsWith('Fotos/')) {
    return originalSrc;
  }

  const normalized = originalSrc.startsWith('/') ? originalSrc : `/${originalSrc}`;
  const withoutExt = normalized.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const optimizedBase = withoutExt.replace('/Fotos/', '/Fotos-optimized/');

  switch (variant) {
    case 'thumb': {
      const parts = optimizedBase.split('/');
      const filename = parts.pop()!;
      return `${parts.join('/')}/thumbs/${filename}.webp`;
    }
    case 'micro': {
      const parts = optimizedBase.split('/');
      const filename = parts.pop()!;
      return `${parts.join('/')}/micro/${filename}.webp`;
    }
    default:
      return `${optimizedBase}.webp`;
  }
}

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Original image path (e.g. /Fotos/PROYECTO 1/image.jpg) */
  src: string;
  /** Use thumbnail version for smaller displays */
  variant?: 'full' | 'thumb';
  /** Enable blur-up placeholder effect */
  blurUp?: boolean;
  /** Eager loading (for above-the-fold images) */
  priority?: boolean;
}

export function OptimizedImage({
  src,
  variant = 'full',
  blurUp = false,
  priority = false,
  className = '',
  alt = '',
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const optimizedSrc = getOptimizedPath(src, variant);
  const microSrc = blurUp ? getOptimizedPath(src, 'micro') : undefined;

  // Check if already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [optimizedSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={props.style}>
      {/* Blur-up placeholder */}
      {blurUp && microSrc && !loaded && (
        <img
          src={microSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Main optimized image */}
      <picture>
        <source srcSet={optimizedSrc} type="image/webp" />
        {/* Fallback to original */}
        <img
          ref={imgRef}
          src={error ? src : optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!error) {
              setError(true);
              setLoaded(true);
            }
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            blurUp && !loaded ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
          style={undefined}
        />
      </picture>
    </div>
  );
}

export { getOptimizedPath };
