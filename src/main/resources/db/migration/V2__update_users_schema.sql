-- Update users table by adding signin_provider column
ALTER TABLE users ADD COLUMN IF NOT EXISTS signin_provider VARCHAR(255);