# PostgreSQL Setup

The current resume API uses PostgreSQL via the `pg` package. This guide describes the database contract implemented by the API routes; it does not provision a database for you.

## Requirements

- A reachable PostgreSQL database. PostgreSQL 12 or later is recommended.
- A database role allowed to create the schema during initial setup and to read/write resume records at runtime.
- `psql` if applying the schema from a terminal, or access to the database provider's SQL editor.

The API requires a server-side `POSTGRES_URL` connection string. It must not be prefixed with `NEXT_PUBLIC_`, committed, or exposed to browser code. Keep it in the ignored local `.env` file for development and in the hosting platform's server-side secret/environment configuration for deployments:

```dotenv
POSTGRES_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Use the connection string supplied by your PostgreSQL provider. Do not commit the real value or paste it into issue reports or chat. The application reads `.env` through Next.js when it starts; restart the dev server after changing it.

## Create The Schema

Apply [`database/schema.sql`](../database/schema.sql) once to a new database. From a shell where `POSTGRES_URL` is already available as an environment variable, run:

```sh
psql "$POSTGRES_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
```

Alternatively, open `database/schema.sql` in your database provider's SQL editor and execute the whole file. The file creates the `resumes` and `resume_versions` tables, constraints, and indexes used by the current API. It is safe to re-run against the same schema; it is an initial bootstrap, not a versioned migration system. Put future schema changes in reviewed, ordered migration files rather than editing a deployed schema by hand.

The API connects with TLS enabled and currently sets `rejectUnauthorized: false` in [`src/lib/db.ts`](../src/lib/db.ts). Use a trusted PostgreSQL provider and review certificate verification before production; this setting encrypts the connection but does not verify the server certificate. A local PostgreSQL server without TLS will not work with the current connection helper unless that helper is changed.

## Verify The Connection

1. Set `POSTGRES_URL` in `.env` and restart `npm run dev`.
2. Open `http://localhost:9002/editor/new` once. The middleware creates the anonymous session cookie used to own drafts.
3. Check the read-only resume-list endpoint with that browser session at `http://localhost:9002/api/resumes`. An empty database should return `[]`; a database/configuration problem should be visible in the server log.
4. To test persistence, fill and review a resume, then choose **Generate with AI**. This creates a draft and calls the configured AI providers; generation can incur provider usage charges. Do not use this as a database-only smoke test.

For curl-based checks, first save the cookie from a page request and then reuse it for the API request:

```sh
curl -sS -c /tmp/frankieresume-cookies.txt http://localhost:9002/editor/new -o /dev/null
curl -i -b /tmp/frankieresume-cookies.txt http://localhost:9002/api/resumes
```

The first API request without a cookie may return `401` while middleware issues the session cookie. Retry with the cookie; a `500` and a server log mentioning `POSTGRES_URL` means the server was started without the required connection setting.

## Current Data Lifecycle

- New drafts are inserted with `expires_at = NOW() + INTERVAL '1 day'`.
- List and ownership queries exclude expired or soft-deleted records.
- Generation and edit operations append to `resume_versions` and move `resumes.current_version_id` to the new version.
- Current API updates do not extend `expires_at`, and no scheduled job physically deletes expired records. The 24-hour value is therefore an access-expiry filter, not a complete cleanup system.
- The project contains earlier Firestore/TTL design documents. Those describe a planned architecture and do not match the PostgreSQL implementation currently used by the resume API.

Before production, define and test a retention cleanup job, verify provider backup/deletion settings, and reconcile the older Firestore requirements with the active PostgreSQL implementation.