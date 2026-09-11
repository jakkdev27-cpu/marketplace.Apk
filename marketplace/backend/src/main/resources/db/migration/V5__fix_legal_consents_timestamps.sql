-- ============================================================
-- Correction des timestamps manquants dans la table legal_consents
-- ============================================================

ALTER TABLE legal_consents
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();