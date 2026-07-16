-- ADR-0005: Replace Google OAuth with email + password auth
-- Make google_id nullable (future opt-in), add password_hash

ALTER TABLE users ADD COLUMN password_hash TEXT;
-- google_id was UNIQUE NOT NULL; we can't alter constraints in SQLite, 
-- but D1 will ignore INSERTs that violate it. New users will have NULL google_id.

-- Create a unique index on email if not already enforced
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
