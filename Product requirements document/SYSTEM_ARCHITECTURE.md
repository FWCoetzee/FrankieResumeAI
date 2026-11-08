# Frankie Resume AI: System Design & Architecture

## Overview

This document outlines the system architecture and design decisions for FrankieResumeAI, focusing on scalability, performance, and maintainability within the constraints of a solo-developer project using Netlify hosting and free-tier services.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Web)                             │
│                  Next.js 15 + React + Tailwind                  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                            │
│              (/api/resumes, /api/generate, etc.)                │
└────────────────────┬──────────────────────────┬─────────────────┘
                     │                          │
         ┌───────────▼────────────┐  ┌───────────▼────────┐  ┌───────────▼────────┐
         │   Firebase Services    │  │    PostgreSQL     │  │    AI Services     │
         │  - Auth               │  │  - Resume records │  │  - Google Gemini   │
         │  - Storage (Files)    │  │  - Version history│  │  - Genkit (SDK)    │
         └───────────────────────┘  └────────────────────┘  └────────────────────┘
```

## Core Components

### 1. Frontend Layer (Client)

**Technology:** Next.js 15, React, TypeScript, Tailwind CSS, Radix UI

**Key Features:**
- Server-side rendering for SEO
- Static generation for marketing pages
- Client-side interactivity for resume builder
- Progressive Web App (PWA) capabilities

**Responsibilities:**
- Resume form data collection
- Real-time preview rendering
- Template selection and customization
- Anonymous visitor workflow; no public user-account UI
- Public About and Contact pages
- Public Privacy and Terms pages
- Payment UI for PDF export
- PDF download only after verified payment
- Error-reporting link for failed payment or download flows
- Visible AI rate-limit notice on the resume preview page
- Use `Background/Frankie resume ai background_preview.jpeg` as the background for the resume preview page
- Use `Background/Frankie resume ai background_downloadpdf.jpeg` as the background for the landing page

### 2. API Layer (Next.js Routes)

**Location:** `/app/api/*` (App Router pattern)

**Core Endpoints:**
- `POST /api/resumes` - Create new resume
- `GET /api/resumes` - List resumes in the current anonymous session
- `GET /api/resumes/:id` - Fetch specific resume
- `PUT /api/resumes/:id` - Update a resume in the current anonymous session
- `DELETE /api/resumes/:id` - Delete a resume from the current anonymous session
- `POST /api/resumes/:id/generate` - Generate AI content
- `POST /api/resumes/:id/preview` - Prepare the resume/CV preview
- `POST /api/payments/create` - Create a PDF export payment session with a supported provider
- `POST /api/payments/webhook` - Receive and validate payment-provider events
- `GET /api/resumes/:id/download` - Start the PDF download after verified payment
- `POST /api/errors/report` - Submit a payment or download error report

**Design Principles:**
- RESTful conventions
- JSON request/response
- Error handling with consistent format
- Server-side validation and rate limiting on every AI generation request
- Never trust client-provided usage counters or payment status

### 3. Database Layer (Current Implementation: PostgreSQL)

The active resume API uses PostgreSQL through the `pg` package and the server-only `POSTGRES_URL` connection string. The bootstrap schema is maintained in `database/schema.sql`; setup and local smoke-test instructions are in `docs/database-setup.md`.

- `resumes` stores the anonymous owner hash, title, template, status, active version pointer, soft-delete flag, and expiry timestamp.
- `resume_versions` stores each resume content snapshot as JSONB and links it to its source version when applicable.
- API queries filter resume access by the owner hash derived from the `__gr_session` cookie.
- Expired records are excluded from list and ownership queries. Automatic physical deletion is not currently implemented.

The Firestore collections and TTL approach described in earlier project materials are not the persistence implementation used by the current resume API. Reconcile those future product requirements separately before switching or expanding the storage architecture.

**Anonymous session model:**
- On the first resume-builder request, issue a cryptographically random session ID in a Secure, HttpOnly, SameSite cookie.
- Store only a server-side hash of the session ID; never place resume content, payment state, or personal data in the cookie.
- A session remains active for 24 hours after its last activity and is renewed only while the visitor is actively using the builder.
- Resume documents expire 24 hours after their last activity and are deleted by a scheduled cleanup process.
- Resume APIs must verify that the request's session owns the requested resume ID before reading or changing it.
- Payment sessions and download tokens must be bound to both the resume ID and anonymous session ID.
- A verified payment may be used once for one PDF export and expires after 15 minutes if unused.
- Clearing cookies, changing devices, or allowing the session to expire means the visitor cannot recover the draft; the UI must state this limitation before generation.
- Do not use an email address or social login to recover anonymous drafts.

### 4. Authentication Layer (Firebase Auth)

**Service:** Firebase Authentication

**Supported Methods:**
- No public user authentication
- Admin-only Google OAuth 2.0
- Admin-only GitHub OAuth
- Admin-only X.com OAuth

**Security Measures:**
- HTTPS only
- Secure session management
- CORS configuration
- Rate limiting on admin authentication endpoints
- No public signup, password reset, or end-user login flow

### 4.1 Creator Admin Dashboard

**Owner:** Franklin Coetzee only

**Sign-in methods:** Google, GitHub, and X.com social login.

**Requirements:**
- Provide a dedicated admin sign-in page with buttons for Google, GitHub, and X.com.
- A successful social login must not automatically grant administrator access.
- Grant the admin role only when the verified Firebase account matches Franklin Coetzee's configured allowlisted identity or identities.
- Maintain a separate allowlist entry for each provider and verify the provider's immutable subject/user ID, with email as a secondary check only.
- Implement X.com through a server-side OAuth adapter and exchange only verified identity claims for the admin session. Google and GitHub may use Firebase's standard OAuth providers.
- Store the allowlist and provider configuration in server-side environment variables or secure Firebase configuration; never expose them in client code.
- Protect every admin page, API route, and server action with server-side role checks and redirect unauthorized users away from the dashboard.
- Use a secure session with automatic expiry, sign-out, CSRF protection, and audit logging for admin actions.
- Deny access by default when provider identity verification, email verification, or allowlist matching fails.
- Keep the admin dashboard separate from ordinary user resume data and enforce least-privilege access to administrative functions.

**Initial dashboard scope:**
- View platform health, anonymous session activity, AI usage and rate-limit events, payment status, PDF export failures, and visitor error reports.
- Review abuse flags and unblock legitimate users after verification.
- Monitor Gemini quota usage and payment-provider webhook status.

### 4.2 Public Information Pages

**About page (`/about`):**
- Introduce Frankie Resume AI and explain its purpose as an AI-assisted resume/CV builder.
- Explain the visitor workflow: build with Gemini, preview without an account, and pay before downloading a PDF.
- Identify Franklin Coetzee as the creator, with clear credit for AI assistance.
- Explain the site's B2B-first positioning and secondary B2C availability.

**Contact page (`/contact`):**
- Identify Franklin Coetzee as the creator and contact owner.
- Display the public contact email `salazar3593@gmail.com`.
- Provide clear links or a form for reporting payment, PDF download, AI-generation, rate-limit, and general product errors.
- Do not require a public user account to submit a contact or error report.
- Validate and rate-limit submissions to prevent contact-form spam, and provide a useful confirmation or failure message.
- Keep personal information limited to what is necessary for contact and support.

**Privacy page (`/privacy`) and Terms page (`/terms`):**
- Publish both pages before production launch and link them from the global footer and payment flow.
- State that Frankie Resume AI is an independent product and is not affiliated with or endorsed by Google unless that status changes through formal authorization.
- Explain that resume content is processed by Google Gemini to provide requested generation features, including the categories of data sent and the retention period.
- Explain that payment details are handled by the selected payment provider and that the app does not store card or bank details.
- State the anonymous session, payment record, error-report, and rate-limit retention periods in user-facing language.
- Provide a process for requesting deletion of support data and any retained resume or payment metadata where legally applicable.
- Document essential cookies, security logging, analytics, consent requirements, and contact details for privacy questions.

### 4.4 Data Retention Defaults

- Anonymous resume content and session metadata: delete 24 hours after last activity.
- Unused payment sessions and download tokens: expire after 15 minutes.
- Payment records and provider references: retain only as long as required for accounting, fraud prevention, disputes, and legal obligations.
- Error reports and support messages: retain for 12 months, then delete or anonymize unless a legal or active support reason requires longer retention.
- Anonymous abuse-prevention keys: expire according to the enforcement window and never persist indefinitely.
- Admin audit logs: retain for 12 months, restrict to the creator admin, and exclude resume content and secrets.

### 4.5 Personal Information Boundaries

- Do not display Franklin Coetzee's ID number in the public About or Contact pages, metadata, logs, payment records, or user-facing error reports.
- The creator's public contact email may appear on the Contact page and support forms.
- Keep the ID number, provider identity allowlist, OAuth secrets, payment credentials, and Gemini credentials in secure server-side configuration only.
- Do not send payment credentials, OAuth tokens, or unnecessary identity data to Gemini.
- Because source headers contain the creator ID number by requirement, keep the source repository private permanently. Never commit API keys, OAuth secrets, payment credentials, or other secrets; store them only in secure Netlify/Firebase environment configuration.

### 4.3 MVP Commercial Scope

- B2B is the primary commercial audience, but the MVP has no organization, team, or business-account data model.
- B2B visitors use the same anonymous single-resume workflow as B2C visitors.
- Do not present organization accounts, bulk generation, team permissions, or enterprise billing as available MVP features.
- Reserve organization workspaces, team administration, bulk exports, invoicing, and enterprise reporting for a future phase.

### 5. AI Integration Layer (Genkit + Google Gemini)

**Service:** Google Genkit with Google Gemini API

**Responsibilities:**
- Resume content generation
- Job description analysis
- Section optimization suggestions
- Keyword extraction and matching

**Design Patterns:**
- Prompt caching for repeated queries
- Streaming responses for long-form content
- Graceful degradation on API failures
- Rate limiting: 60 req/min (free tier)

**Cost Optimization:**
- Use Gemini free tier (2M tokens/month)
- Cache common prompts
- Batch operations where possible
- Avoid real-time personalization

### AI Generation Anti-Abuse Policy

All limits are enforced by the server before calling Gemini. Client-side counters are informational only.

| Control | Anonymous visitor | Creator admin |
|---------|-------------------|---------------|
| Hourly generation limit | 3 per IP/device identity | Same abuse controls apply |
| Daily generation limit | 10 per IP/device identity | Same abuse controls apply |
| Monthly generation limit | 30 per IP/device identity | Same abuse controls apply |
| Burst limit | 3 requests per 10 minutes | Same abuse controls apply |
| Concurrent generations | 1 | 1 |
| Maximum input | 8,000 tokens | 8,000 tokens |
| Maximum output | 4,000 tokens | 4,000 tokens |

**Enforcement rules:**
- Identify the creator admin session by verified Firebase identity; identify visitors with a privacy-conscious combination of IP and expiring device token.
- Apply the strictest applicable limit across admin identity, IP address, device token, and global Gemini quota.
- Use an atomic counter or transaction so simultaneous requests cannot bypass limits.
- Reserve a generation slot before calling Gemini and release or mark it complete after the provider response.
- Count accepted attempts, including provider errors and timeouts, to prevent retry abuse.
- Return HTTP `429 Too Many Requests` with a `Retry-After` header when a limit is reached.
- Reject invalid, oversized, repeated, or automated payloads before consuming a Gemini request.
- Temporarily block identities that repeatedly exceed limits or rotate identifiers; use escalating windows such as 15 minutes, 1 hour, and 24 hours.
- Do not reveal whether a block was triggered by the admin identity, IP address, or device token.
- Stop new AI requests when the configured monthly Gemini budget or provider quota is reached and show a service-limit message.
- Keep anonymous identifiers and request metadata only for the minimum enforcement period, then expire them automatically.
- Log generation outcome, limit type, timestamp, and anonymized enforcement key; never log API keys or full resume content in abuse logs.
- Provide a support/error-report link for legitimate users who believe a limit or block was applied incorrectly.

**Preview-page notice:**
- Display the notice near the AI generation and preview controls on every resume preview page, including for anonymous users.
- Use accessible, plain language and do not disclose exact quotas, identity signals, or abuse-detection rules.
- Include a working report link for users who believe they were limited or blocked incorrectly.
- Recommended copy: "To protect the service from abuse by malicious users and automated bots, AI generation is rate-limited. Please submit requests responsibly. If you believe you have been limited in error, report the issue here."

### 6. File Storage Layer (Firebase Storage)

**Service:** Firebase Cloud Storage

**Use Cases:**
- Anonymous resume exports (PDF)
- Template assets
- Backup storage

### 7. Payment and PDF Export Layer

**Payment providers:** PayPal, Lemon Squeezy, and PayFast

**Payment configuration:**
- Configure two regional PDF export prices for the MVP: USD $4.99 internationally and ZAR R99 for South African visitors.
- Use USD as the fallback when the visitor's market cannot be determined, and show the final amount and currency before checkout.
- Route South African checkouts to PayFast by default.
- Route international checkouts to PayPal by default, with Lemon Squeezy available as the international alternative.
- Keep all four providers configured behind one payment adapter interface; provider availability must not change the amount, currency, or payment-verification rules.
- Review the prices after the first 100 paid exports using conversion, provider fees, refunds, and support volume.
- Keep provider credentials, webhook secrets, and price configuration server-side.
- Use a provider adapter interface so all four gateways produce the same internal payment states.

**Payment state machine:** `created` -> `redirected` -> `pending_verification` -> `paid` -> `exported`.
Terminal states are `cancelled`, `failed`, `expired`, and `paid_export_failed`.

**Workflow:**
- Allow anonymous resume generation and preview without a user account or subscription sign-up
- When the user chooses **Download as PDF**, create an idempotency key bound to the resume, session, amount, and currency.
- Display the routed provider and an alternative-provider option before redirecting to checkout.
- Send the user to the selected payment gateway using a server-created checkout session.
- If a provider is unavailable before payment begins, allow a new provider selection without creating a second transaction.
- Treat browser return or redirect data as untrusted; verify payment server-side through a signed webhook or provider API.
- Accept a payment only when the provider reference, amount, currency, and resume/session binding match the pending transaction.
- Make webhook processing idempotent so retries cannot create duplicate exports or charges.
- Start PDF generation only after successful server-side verification and issue a short-lived, one-time download token.
- On cancellation, timeout, or failed verification, do not generate a PDF and show a retry option plus the error-reporting link.
- If payment is verified but PDF generation fails, retain the payment reference, mark the transaction `paid_export_failed`, and provide a support link without requesting another payment.
- If a provider reports a refund or chargeback, revoke unused download tokens and record the event for admin review.
- Record provider, transaction ID, amount, currency, state transitions, timestamps, resume ID, and anonymous session hash; never store card or bank details.

## Data Flow

### Resume Creation Flow

```
1. User submits form (Client)
   ↓
2. API validates input (POST /api/resumes)
   ↓
3. Store in Firestore with a temporary anonymous session ID
   ↓
4. Return resumeId to client
   ↓
5. Client caches resume data locally
```

### AI Content Generation Flow

```
1. User requests generation (Client)
   ↓
2. Send prompt to API (POST /api/resumes/:id/generate)
   ↓
3. API fetches resume from Firestore
   ↓
4. Prepare structured prompt with resume context
   ↓
5. Call Genkit → Google Gemini
   ↓
6. Stream response back to client
   ↓
7. Optional: Save generated content to Firestore
```

### PDF Export and Payment Flow

```
1. User builds a resume with Gemini and previews the resume/CV
   ↓
2. User selects Download as PDF
   ↓
3. API creates a payment session with PayPal, Lemon Squeezy, or PayFast
   ↓
4. User completes payment at the selected gateway
   ↓
5. Server verifies the payment response or webhook
   ↓
6. Generate and start the PDF download
   ↓
7. If any step fails, show a link to report the error
```

## Scalability Considerations

### Current Constraints
- Firebase free tier: ~50k concurrent connections, sufficient for MVP
- Netlify free tier: 100 req/sec
- Google Gemini free tier: 60 req/min, 2M tokens/month

### Scaling Strategy (Post-MVP)

**Phase 1: Optimize Within Free Tier**
- Implement caching (Redis via Firebase or Upstash)
- Optimize query patterns
- Reduce API payload sizes

**Phase 2: Paid Tier Upgrade**
- Firebase: Pay-as-you-go model
- Continue hosting on Netlify with the appropriate plan
- Scale Firebase services as usage grows

## Performance Optimization

### MVP Optimization Requirements

- Keep the first public page lightweight: defer editor, template, payment, and admin-only code until needed.
- Use Next.js server rendering or static generation for About, Contact, Privacy, Terms, and other public pages.
- Lazy-load resume templates, PDF libraries, charts, and admin dashboard modules.
- Send only the minimum resume context required to Gemini and enforce the documented input/output token caps.
- Cache safe, non-personalized responses and avoid caching resume content, payment state, or admin data in shared caches.
- Use Firestore transactions for session ownership, AI usage counters, and payment state transitions.
- Delete expired anonymous resumes and temporary payment data automatically.
- Generate the PDF only after verified payment and avoid storing the generated file longer than necessary.
- Optimize images and fonts, prevent layout shifts, and measure Core Web Vitals on mobile and desktop.
- Monitor Gemini token usage, Firestore reads/writes, Netlify execution time, PDF generation time, payment failures, and error-report volume.
- Set alerts for rising latency, repeated payment failures, Gemini quota usage, and storage growth before free-tier limits are reached.
- Run a production build and typecheck before deployment; do not treat development-server performance as production performance.

### Client-Side
- Code splitting (Next.js dynamic imports)
- Image optimization (Next.js Image component)
- Lazy loading for resume templates
- LocalStorage caching for draft data

### Server-Side
- API response caching (1-5 minute TTL)
- Database query optimization
- Connection pooling
- Request deduplication

### Network
- Compression (gzip)
- CDN for static assets (Netlify CDN included)
- HTTP/2 support
- Minimal bundle size

## Security Architecture

### Authentication & Authorization
- JWT tokens for API security
- Row-level security (RLS) in Firestore
- Session isolation (each visitor can access only their current temporary resume data)
- Admin access is deny-by-default and requires a verified creator identity allowlist match
- Enforce admin authorization server-side on every dashboard route and administrative API
- Do not use a client-side role flag or social-provider selection as proof of admin access

### Data Protection
- Encryption in transit (HTTPS)
- Encryption at rest (Firebase default)
- Secure environment variables (.env.local)
- API key rotation strategy

### Monitoring & Logging
- Firebase Console monitoring
- Error tracking (consider Sentry integration)
- Audit logging for sensitive operations
- Monitor AI requests per minute, daily and monthly quota usage, rejected requests, HTTP 429 responses, concurrent generations, token usage, and identity blocks
- Alert before Gemini reaches 80% and 100% of its configured monthly quota

## Future Enhancements

### Phase 1 (MVP)
- [ ] Basic CRUD operations
- [ ] AI content generation
- [ ] Creator admin authentication
- [ ] Resume export (PDF)

### Phase 2 (Post-Launch)
- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced analytics
- [ ] A/B testing framework
- [ ] Email notifications

### Phase 3 (Growth)
- [ ] Webhook integrations (job boards)
- [ ] Mobile app (React Native)
- [ ] Advanced API features
- [ ] Marketplace for templates

## Deployment Architecture

### Hosting
- **Frontend:** Netlify (Next.js optimized)
- **API:** Netlify Functions / Next.js API Routes
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication for creator admin only
- **Storage:** Firebase Cloud Storage

### CI/CD Pipeline
- Netlify continuous deployment from the main branch
- Environment-based secrets management
- Rollback capability

## Monitoring & Observability

### Key Metrics
- API response times
- Database query latency
- Error rates and types
- User engagement metrics
- AI API usage and costs

### Alerting
- Firebase Console alerts
- Email notifications for critical errors
- Dashboard for performance overview

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 15 + React | SSR for SEO, built-in optimizations |
| Styling | Tailwind CSS | Utility-first, minimal bundle size |
| UI Components | Radix UI | Accessible, unstyled components |
| Language | TypeScript | Type safety, better DX |
| Backend | Next.js API Routes | Serverless, no extra infrastructure |
| Database | Firestore | Real-time, free tier, managed |
| Auth | Firebase Auth | Creator admin only; Google, GitHub, and X.com providers |
| Storage | Firebase Storage | Integrated, cost-effective |
| AI | Google Gemini + Genkit | Free credits, low latency |
| Hosting | Netlify | Free tier, Next.js optimized |
| Deployment | Netlify | Continuous deployment and hosting |
