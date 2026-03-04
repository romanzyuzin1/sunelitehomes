/**
 * Media path utilities for optimized assets.
 * 
 * Transforms /Fotos/PROYECTO 1/image.jpg → /Fotos-optimized/PROYECTO 1/image.webp
 * Falls back gracefully if optimized version doesn't exist.
 */

/** Convert an original image path to its optimized WebP version */
export function optimizedSrc(originalPath: string): string {
  if (!originalPath || !originalPath.startsWith('/Fotos/')) return originalPath;
  return originalPath
    .replace('/Fotos/', '/Fotos-optimized/')
    .replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/** Convert an original image path to its thumbnail WebP version */
export function thumbSrc(originalPath: string): string {
  if (!originalPath || !originalPath.startsWith('/Fotos/')) return originalPath;
  const optimized = optimizedSrc(originalPath);
  const parts = optimized.split('/');
  const filename = parts.pop()!;
  return `${parts.join('/')}/thumbs/${filename}`;
}

/** Convert an original image path to its micro placeholder WebP version */
export function microSrc(originalPath: string): string {
  if (!originalPath || !originalPath.startsWith('/Fotos/')) return originalPath;
  const optimized = optimizedSrc(originalPath);
  const parts = optimized.split('/');
  const filename = parts.pop()!;
  return `${parts.join('/')}/micro/${filename}`;
}
