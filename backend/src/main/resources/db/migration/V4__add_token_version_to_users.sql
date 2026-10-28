-- Add token_version column to users table for instantaneous token invalidation on credential/email changes
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;
UPDATE users SET token_version = 1 WHERE token_version IS NULL;

