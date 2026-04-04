-- ============================================================
-- SunEliteHomes — Storage bucket for property images
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create a public bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Anyone can VIEW images (public website needs this)
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- 3. Authenticated agents can UPLOAD images
CREATE POLICY "Agents can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- 4. Authenticated agents can DELETE images
CREATE POLICY "Agents can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

-- 5. Authenticated agents can UPDATE (overwrite) images
CREATE POLICY "Agents can update property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');
