-- ============================================================
-- Correction de schéma : ajout de la colonne updated_at manquante
-- ============================================================

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();