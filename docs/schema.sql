-- users: Stores a local copy of user information, linking Firebase Auth to our database.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- resumes: Core metadata for a resume project. Acts as a pointer to the current version.
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    current_version_id INTEGER, -- Nullable until the first version is created
    state VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (state IN ('DRAFT', 'AI_GENERATED', 'USER_EDITED', 'FINAL')),
    template_id VARCHAR(50) NOT NULL DEFAULT 'modern',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- resume_versions: An immutable, append-only log of every state of a resume's content.
CREATE TABLE resume_versions (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_from_version_id INTEGER REFERENCES resume_versions(id), -- Tracks lineage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign key constraint from resumes to resume_versions (added after both tables are defined)
ALTER TABLE resumes
ADD CONSTRAINT fk_current_resume_version
FOREIGN KEY (current_version_id) REFERENCES resume_versions(id);
