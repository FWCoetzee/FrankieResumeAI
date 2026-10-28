# Database Deployment Checklist

This document outlines the remaining steps required to transition from the local in-memory database fallback to a production-ready PostgreSQL environment.

## 🚨 Critical Action Items for Production
The app currently uses a `pg-mem` fallback in `src/lib/db.ts` when no environment variables are found. This is for **development only** and does not persist data.

### 1. Provision Cloud SQL
- [ ] Create a PostgreSQL 15 instance in Google Cloud SQL.
- [ ] Create a dedicated database (e.g., `frankie_resume_db`).
- [ ] Set a strong root password.
- [ ] Configure Authorized Networks (or use Cloud SQL Proxy) to allow the App Hosting environment to connect.

### 2. Bootstrap Schema
- [ ] Execute the SQL commands found in `database/schema.sql` against the live instance.
- [ ] Verify that `resumes` and `resume_versions` tables are created with correct indexes.

### 3. Configure Environment Variables
Add the following to the production environment (Secret Manager / App Hosting):
- `POSTGRES_URL=postgres://postgres:PASSWORD@PUBLIC_IP/frankie_resume_db`

## How to Verify
Once configured, the app should no longer log:
`"No Postgres environment is configured. Falling back to an in-memory PostgreSQL database..."`
and data created in the editor should persist across server restarts.
