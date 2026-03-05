-- ============================================================
-- SunEliteHomes CRM — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  title         TEXT NOT NULL DEFAULT '',
  ref           TEXT NOT NULL DEFAULT '',
  price         NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  price_freq    TEXT NOT NULL DEFAULT 'sale' CHECK (price_freq IN ('sale', 'month')),
  type          TEXT NOT NULL DEFAULT 'Casa',
  build_year    INT,
  town          TEXT NOT NULL DEFAULT '',
  postcode      TEXT NOT NULL DEFAULT '',
  province      TEXT NOT NULL DEFAULT '',
  address       TEXT NOT NULL DEFAULT '',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  beds          INT NOT NULL DEFAULT 0,
  baths         INT NOT NULL DEFAULT 0,
  pool          BOOLEAN NOT NULL DEFAULT false,
  surface_built INT NOT NULL DEFAULT 0,
  surface_plot  INT NOT NULL DEFAULT 0,
  energy_consumption TEXT NOT NULL DEFAULT 'none',
  energy_emissions   TEXT NOT NULL DEFAULT 'none',
  description   TEXT NOT NULL DEFAULT '',
  features      TEXT[] NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'disponible',
  images        TEXT[] NOT NULL DEFAULT '{}',
  agent_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 3. Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see properties (for the website)
CREATE POLICY "Public can read properties"
  ON properties FOR SELECT
  USING (true);

-- Authenticated agents can insert
CREATE POLICY "Agents can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated agents can update their own or any (small team)
CREATE POLICY "Agents can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated agents can delete
CREATE POLICY "Agents can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (true);

-- 4. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_ref ON properties(ref);
CREATE INDEX IF NOT EXISTS idx_properties_town ON properties(town);
CREATE INDEX IF NOT EXISTS idx_properties_province ON properties(province);

-- 5. Insert the default/seed properties from the existing hardcoded data
-- (Optional: you can skip this if you want to start fresh and re-import via XML)
INSERT INTO properties (id, created_at, title, ref, price, currency, price_freq, type, build_year, town, postcode, province, address, latitude, longitude, beds, baths, pool, surface_built, surface_plot, energy_consumption, energy_emissions, description, features, status, images)
VALUES
(1, '2023-10-27', 'Hermoso Apartamento en el Centro de Madrid', '00077', 695000, 'EUR', 'sale', 'Casa', 1983, 'Majadahonda', '28030', 'Madrid', 'Camino Vinateros, 13', 40.410908763692944, -3.6564329914782396, 2, 2, false, 102, 89, 'none', 'none',
 'Este hermoso apartamento de 2 dormitorios está ubicado en el corazón de Madrid.',
 ARRAY['trastero','aire acondicionado','ascensor','despensa','domótica','parabólica','pista de fútbol','txoko','video portero','garaje doble','linea teléfono','piscina de comunidad','sotano','buhardilla','vallado'],
 'disponible',
 ARRAY['https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716a69e_Pagina_web_inmobiliaria_0.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716aba2_Pagina_web_inmobiliaria_4.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b078_Pagina_web_inmobiliaria_11.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b5c3_Pagina_web_inmobiliaria_12.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716b9fa_Pagina_web_inmobiliaria_8.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716bd7e_Pagina_web_inmobiliaria_2.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c0e8_Pagina_web_inmobiliaria_3.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c427_Pagina_web_inmobiliaria_5.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716c704_Pagina_web_inmobiliaria_7.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716ca7f_Pagina_web_inmobiliaria_9.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716cf67_Pagina_web_inmobiliaria_6.jpeg','https://nunibU4IP5.inmocms.com/store/inmuebles/653b03716d2f4_Pagina_web_inmobiliaria_1.jpeg']
);

-- Reset the sequence to avoid ID conflicts
SELECT setval('properties_id_seq', (SELECT COALESCE(MAX(id), 0) FROM properties) + 1);
