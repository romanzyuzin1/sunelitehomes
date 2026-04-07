/**
 * Image Upload Service — uploads files to Supabase Storage.
 * Includes client-side compression (resize + quality) for faster uploads.
 * Falls back to a local object-URL preview when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'property-images';

// ─── Compression settings ────────────────────────────────────────────

const MAX_DIMENSION = 2048;   // max width/height in px
const JPEG_QUALITY = 0.82;    // 0-1
const MAX_FILE_SIZE = 600_000; // if compressed result > 600 KB, reduce quality further

/**
 * Compress / resize an image file on the client before uploading.
 * Returns a Blob (JPEG or WebP) significantly smaller than the original.
 */
async function compressImage(file: File): Promise<Blob> {
  // Skip SVGs and tiny files
  if (file.type === 'image/svg+xml' || file.size < 80_000) return file;

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      // Try JPEG first, fall back to PNG
      const outputType = 'image/jpeg';

      canvas.toBlob(
        blob => {
          if (!blob) { resolve(file); return; }

          // If still too large, try lower quality
          if (blob.size > MAX_FILE_SIZE) {
            canvas.toBlob(
              blob2 => resolve(blob2 || blob),
              outputType,
              0.65,
            );
          } else {
            resolve(blob);
          }
        },
        outputType,
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback: upload original
    };

    img.src = url;
  });
}

// ─── Progress callback types ─────────────────────────────────────────

export interface UploadProgress {
  /** Index of current file (0-based) */
  currentIndex: number;
  /** Total files in batch */
  total: number;
  /** Original file name */
  fileName: string;
  /** 'compressing' | 'uploading' | 'done' | 'error' */
  phase: 'compressing' | 'uploading' | 'done' | 'error';
  /** Local preview URL (blob) */
  previewUrl?: string;
  /** Error message if phase === 'error' */
  errorMessage?: string;
}

// ─── Single upload ───────────────────────────────────────────────────

/**
 * Upload a single image file (already compressed).
 * Returns the public URL of the uploaded image.
 */
export async function uploadPropertyImage(
  file: File | Blob,
  propertyRef: string,
  originalName?: string,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(file);
  }

  const name = originalName || (file instanceof File ? file.name : 'image.jpg');
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const timestamp = Date.now();
  const folder = propertyRef || 'sin-ref';
  const path = `${folder}/${timestamp}_${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// ─── Batch upload with progress ──────────────────────────────────────

/**
 * Upload multiple image files sequentially with compression and per-file progress.
 * Returns an array of public URLs (only successful uploads).
 */
export async function uploadPropertyImages(
  files: File[],
  propertyRef: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string[]> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const previewUrl = URL.createObjectURL(file);

    try {
      // Phase: compressing
      onProgress?.({
        currentIndex: i,
        total: files.length,
        fileName: file.name,
        phase: 'compressing',
        previewUrl,
      });

      const compressed = await compressImage(file);

      // Phase: uploading
      onProgress?.({
        currentIndex: i,
        total: files.length,
        fileName: file.name,
        phase: 'uploading',
        previewUrl,
      });

      const url = await uploadPropertyImage(compressed, propertyRef, file.name);
      urls.push(url);

      // Phase: done
      onProgress?.({
        currentIndex: i,
        total: files.length,
        fileName: file.name,
        phase: 'done',
        previewUrl,
      });
    } catch (err: any) {
      const msg = err?.message || 'Error desconocido';
      errors.push(`${file.name}: ${msg}`);

      onProgress?.({
        currentIndex: i,
        total: files.length,
        fileName: file.name,
        phase: 'error',
        previewUrl,
        errorMessage: msg,
      });
    }
  }

  if (errors.length > 0) {
    console.warn('[imageUpload] Some uploads failed:', errors);
  }

  return urls;
}

/**
 * Delete an image from storage by its public URL.
 */
export async function deletePropertyImage(publicUrl: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Extract path from URL: .../storage/v1/object/public/property-images/PATH
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // not a storage URL, skip

  const path = decodeURIComponent(publicUrl.slice(idx + marker.length));

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn('[imageUpload] delete failed:', error.message);
  }
}
