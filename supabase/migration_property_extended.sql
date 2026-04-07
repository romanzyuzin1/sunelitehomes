-- =============================================================
-- Migration: Extended property fields (Engel & Völkers style)
-- Run in Supabase SQL Editor
-- =============================================================

-- New surface fields
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_usable real DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS surface_habitable real DEFAULT 0;

-- Additional room/bath counts
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rooms integer DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ensuite_baths integer DEFAULT 0;

-- Boolean characteristics
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_patio boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_studio boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_service_room boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_lift boolean DEFAULT false;

-- Additional property details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces integer DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS orientation text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS heating_type text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished text DEFAULT '';

-- Visibility toggle (public/private)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Zone description & private notes (separate from property description)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_zone text DEFAULT '';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS private_notes text DEFAULT '';
