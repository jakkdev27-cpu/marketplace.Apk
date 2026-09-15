-- ============================================================
-- Phase 8 — Add missing columns to users table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
