-- This file provides the source of truth for the application's database schema.
-- It is intended for documentation and for use in setting up local or staging environments.

-- Main Users table to store profile information and monetization plan.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- Tiers: 'free', 'pro', 'lifetime'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Note: An `updated_at` trigger should be added to this table in a production environment.

-- Stores the metadata for each resume project.
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- e.g., DRAFT, AI_GENERATED, USER_EDITED
    template_id VARCHAR(50) DEFAULT 'modern',
    current_version_id INTEGER, -- Can be NULL initially
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores immutable versions of resume content as JSON blobs.
CREATE TABLE resume_versions (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_from_version_id INTEGER, -- Foreign key to self, for tracking history
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to resumes table after resume_versions is created.
-- This creates a circular dependency that is resolved by deferring the constraint.
-- ALTER TABLE resumes ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES resume_versions(id) DEFERRABLE INITIALLY DEFERRED;


-- Future table for tracking payments and subscriptions.
-- CREATE TABLE payments (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id),
--     plan_id VARCHAR(50) NOT NULL,
--     amount DECIMAL(10, 2) NOT NULL,
--     currency VARCHAR(3) NOT NULL,
--     status VARCHAR(50) NOT NULL, -- e.g., 'succeeded', 'pending', 'failed'
--     provider VARCHAR(50) NOT NULL, -- e.g., 'stripe'
--     provider_payment_id VARCHAR(255) UNIQUE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Future table for tracking feature usage to enforce limits for free users.
-- CREATE TABLE usage_tracking (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     resume_generations_today INTEGER NOT NULL DEFAULT 0,
--     downloads_today INTEGER NOT NULL DEFAULT 0,
--     last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE
-- );
