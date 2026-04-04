-- ============================================================
-- SunEliteHomes CRM — Contacts Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Personal info
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  phone2        TEXT NOT NULL DEFAULT '',

  -- Role: what is this contact? (can be both)
  is_owner      BOOLEAN NOT NULL DEFAULT false,   -- propietario (wants to sell/rent out)
  is_buyer      BOOLEAN NOT NULL DEFAULT false,    -- comprador/inquilino (wants to buy/rent)

  -- If buyer/tenant: what are they looking for?
  interest_type TEXT NOT NULL DEFAULT 'buy'
    CHECK (interest_type IN ('buy', 'rent', 'both')),

  -- If owner: what do they want to do?
  owner_intent  TEXT NOT NULL DEFAULT 'sell'
    CHECK (owner_intent IN ('sell', 'rent', 'both')),

  -- Buyer preferences
  budget_min    NUMERIC(12,2),
  budget_max    NUMERIC(12,2),
  pref_beds     INT,
  pref_baths    INT,
  pref_zones    TEXT[] NOT NULL DEFAULT '{}',       -- preferred towns/zones
  pref_types    TEXT[] NOT NULL DEFAULT '{}',       -- preferred property types

  -- General
  notes         TEXT NOT NULL DEFAULT '',
  source        TEXT NOT NULL DEFAULT '',           -- how did they find us (portal, referral, etc.)
  status        TEXT NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo', 'inactivo', 'cerrado')),

  agent_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Junction table: property ↔ owner (a property has one owner contact)
-- We add owner_contact_id directly to properties table
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS owner_contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL;

-- 3. Junction table: property ↔ interested contacts (many-to-many)
CREATE TABLE IF NOT EXISTS property_interests (
  id            BIGSERIAL PRIMARY KEY,
  property_id   BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contact_id    BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  interest_level TEXT NOT NULL DEFAULT 'medium'
    CHECK (interest_level IN ('low', 'medium', 'high')),
  notes         TEXT NOT NULL DEFAULT '',
  UNIQUE(property_id, contact_id)
);

-- 4. Auto-update updated_at for contacts
DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 5. Row Level Security for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can see contacts (private CRM data)
CREATE POLICY "Agents can read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Agents can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Agents can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Agents can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- 6. Row Level Security for property_interests
ALTER TABLE property_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can read property_interests"
  ON property_interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Agents can insert property_interests"
  ON property_interests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Agents can update property_interests"
  ON property_interests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Agents can delete property_interests"
  ON property_interests FOR DELETE
  TO authenticated
  USING (true);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_is_owner ON contacts(is_owner);
CREATE INDEX IF NOT EXISTS idx_contacts_is_buyer ON contacts(is_buyer);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_property_interests_property ON property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_contact ON property_interests(contact_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_contact_id);
