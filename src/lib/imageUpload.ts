/**
 * Image Upload Service — uploads files to Supabase Storage.
 * Falls back to a local object-URL preview when Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET = 'property-images';

/**
 * Upload a single image file.
 * Returns the public URL of the uploaded image.
 */
export async function uploadPropertyImage(
  file: File,
  propertyRef: string,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Fallback: return a local blob URL (only works in current session)
    return URL.createObjectURL(file);
  }

  // Sanitise file name and add unique timestamp
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const timestamp = Date.now();
  const folder = propertyRef || 'sin-ref';
  const path = `${folder}/${timestamp}_${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',   // 1 year cache
      upsert: false,
    });

  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Upload multiple image files in parallel.
 * Returns an array of public URLs.
 */
export async function uploadPropertyImages(
  files: File[],
  propertyRef: string,
): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map(f => uploadPropertyImage(f, propertyRef)),
  );

  const urls: string[] = [];
  const errors: string[] = [];

  for (const r of results) {
    if (r.status === 'fulfilled') urls.push(r.value);
    else errors.push(r.reason?.message || 'Error desconocido');
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
