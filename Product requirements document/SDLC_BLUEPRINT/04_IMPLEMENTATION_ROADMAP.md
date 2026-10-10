# Frankie Resume AI — Implementation Roadmap

## Purpose

This roadmap translates the SDLC blueprint into a practical delivery sequence for the Frankie Resume AI MVP. It is built around the project’s real constraints: a solo developer, limited budget, free-tier infrastructure, anonymous visitor flows, AI abuse prevention, and payment-gated PDF export.

The roadmap is intentionally scoped to the MVP and keeps post-MVP growth work clearly separated.

## Delivery Principle

The product should be implemented in small, verifiable slices rather than broad feature batches. Each slice must:

- map to a PRD requirement or architecture rule
- be testable in isolation
- be valuable to the launch user journey
- avoid creating hidden technical or security debt

## MVP Delivery Goal

Deliver a working version of:

- anonymous resume creation and editing
- AI-powered resume generation with rate limiting
- preview and export flows
- verified payment before PDF delivery
- creator-only admin access
- support and issue-reporting paths

## Capacity Assumption

The project is planned for roughly 100 hours over six months, approximately 4 hours per week on average. Therefore, the roadmap prioritizes the highest-value slices first and delays speculative growth features.

---

## Phase 1: Foundation — The Anonymous Core

### Objective

Enable the core product experience without requiring public accounts or sign-in.

### Slice 1.1 — Anonymous Session Middleware

**PRD alignment:** anonymous workflow, temporary session ownership, privacy model

**Tasks**

- implement secure anonymous session issuance and verification
- set and validate the `__gr_session` cookie
- define the session ownership hash and server-side verification logic
- ensure `HttpOnly`, `Secure`, and `SameSite` protections are used correctly
- ensure the session still functions within the 24-hour inactivity model

**Deliverables**

- anonymous session utilities
- session verification middleware or route-level guard
- ownership hash helper

**Validation**

- first visit creates a session cookie
- cookie is not readable by client-side JavaScript
- session is invalidated or expired according to the retention model

### Slice 1.2 — Owner-Bound Resume CRUD

**PRD alignment:** temporary session data model, secure ownership checks, anonymous resume lifecycle

**Tasks**

- update resume create, read, update, and delete flows to include owner-bound metadata
- include `ownerHash` and expiry timestamps in the resume record
- validate that a request can only access the resume it owns
- enforce removal or expiry of stale data

**Deliverables**

- secure resume API layer
- owner enforcement rules
- data expiry metadata and cleanup readiness

**Validation**

- a user with a modified or fake session cannot read another visitor’s resume
- expired resumes are not returned

### Exit gate for Phase 1

The product must allow a visitor to create a resume and interact with it without a public user account, and ownership must be protected from cross-session access.

---

## Phase 2: Protection — The Anti-Abuse Layer

### Objective

Protect the service from abusive AI usage and prevent the Gemini free tier from being accidentally exhausted or attacked.

### Slice 2.1 — Fingerprinting and Usage Tracking

**PRD alignment:** anti-abuse logic, anonymous rate limiting, session correlation, usage counters

**Tasks**

- implement the anonymous device or identity fingerprinting approach
- create the usage record collection and schema in Firestore
- store minimal, expiring usage metadata only
- link request identity to session, IP, and device data without exposing sensitive details

**Deliverables**

- usage records with TTL-friendly expiry
- enforcement key generation
- anonymous identity model

**Validation**

- counters increment only for accepted requests under the enforcement model
- records expire according to the documented retention policy

### Slice 2.2 — Rate Limit Enforcement and Concurrency Control

**PRD alignment:** hourly, daily, monthly windows; burst and concurrency controls; 429 and retry-after logic

**Tasks**

- enforce request windows for burst, hourly, daily, and monthly limits
- implement an atomic or transaction-based counter update pattern
- add a concurrency lock so only one generation is active per identity at a time
- return 429 responses with `Retry-After` behavior and a neutral user message

**Deliverables**

- server-side AI guard layer
- concurrency lock logic
- standard error response format for abuse states

**Validation**

- repeated generation requests are rejected with a clear rate-limit response
- simultaneous requests do not bypass the concurrency policy

### Exit gate for Phase 2

AI generation is not available without the abuse controls, and user-facing behavior is neutral, safe, and compatible with the product’s trust model.

---

## Phase 3: AI Engine — Resume Generation

### Objective

Deliver the core value of the product: generating resume content with Gemini in a way that is reliable, structured, and safe.

### Slice 3.1 — Structured Prompting and Resume Schema Integration

**PRD alignment:** Genkit + Gemini architecture, resume schema, AI generation requirements

**Tasks**

- integrate the finalized resume schema into Genkit flow configuration
- implement structured prompt design for high-quality resume sections
- validate output structure against the Zod schema
- ensure prompts stay within token and request limits
- handle provider errors gracefully and count failed attempts correctly

**Deliverables**

- working AI generation flow
- typed resume output contract
- graceful provider error handling

**Validation**

- generated content conforms to the resume schema
- oversized or invalid requests are rejected before provider execution
- provider failures are surfaced properly instead of silently succeeding

### Slice 3.2 — Preview and AI Feedback Loop

**PRD alignment:** preview page, AI generation notice, safe user experience

**Tasks**

- integrate AI-generated content into the resume preview experience
- display the required rate-limit notice on the preview page
- ensure the user can retry without exposing hidden system details

**Deliverables**

- preview-ready generation output
- visible anti-abuse notice
- helpful user feedback messaging

**Validation**

- preview page shows the notice in the correct location
- the user understands the limitation without seeing internal system details

### Exit gate for Phase 3

The product can generate a valid resume preview through the AI flow while honoring limits and preserving user trust.

---

## Phase 4: Monetization — Payment and PDF Export

### Objective

Require verified payment for PDF export without exposing checkout as proof of payment.

### Slice 4.1 — Payment Provider Factory

**PRD alignment:** provider strategy, one-time payment export, payment routing

**Tasks**

- define a shared payment provider interface
- implement provider adapters for the configured launch options
- keep international and South African routing rules in the provider selection flow
- handle provider errors and user fallback choices cleanly

**Deliverables**

- payment provider abstraction
- safe checkout entry flow
- explicit provider routing logic

**Validation**

- appropriate provider is chosen based on region or configuration
- the user can switch providers without duplicate charges

### Slice 4.2 — Server-Side Verification and Download Token Logic

**PRD alignment:** verified payment before download, idempotency, secure payment lifecycle

**Tasks**

- implement server-side payment verification using the provider response or webhook
- maintain idempotent payment state records
- generate a time-limited download token after verified payment
- ensure the PDF is only created and served after this token is valid
- log and handle failed or incomplete payment states safely

**Deliverables**

- verified payment state machine
- one-time export token flow
- payment failure recovery path

**Validation**

- PDF is not downloadable before payment verification
- repeated requests do not trigger duplicate processing
- failed payment state does not create an unverified export

### Slice 4.3 — PDF Generation and Support Recovery

**PRD alignment:** support flows, failed payment/download recovery, secure export records

**Tasks**

- generate and serve the PDF only after verified payment
- keep payment records distinct from resume content and anonymous identity data
- provide a recovery or report path if payment succeeds but PDF generation fails

**Deliverables**

- PDF generation and download path
- recovery/reporting workflow
- safe support metadata handling

**Validation**

- a valid payment leads to one export only
- failed generation does not silently charge again or falsely claim success

### Exit gate for Phase 4

The product satisfies the core commercial flow: build, preview, verify payment, download PDF, and recover safely from failure states.

---

## Phase 5: Administration and Operations

### Objective

Provide the creator-only admin functionality required for operation, moderation, and support without exposing the dashboard to the public.

### Slice 5.1 — Admin Identity and Allowlist

**PRD alignment:** creator-only admin dashboard, provider identity allowlisting, Google/GitHub/X.com access

**Tasks**

- implement provider-based admin sign-in flow
- verify user identity server-side, not client-side
- enforce allowlist rules
- deny access by default when provider identity verification fails

**Deliverables**

- secure admin auth flow
- identity allowlist rules
- default-deny admin access model

**Validation**

- only Franklin Coetzee can access the dashboard
- unauthorized users are rejected or redirected

### Slice 5.2 — Dashboard, Usage Monitoring, and Cleanup

**PRD alignment:** admin dashboard, abuse monitoring, retention and data cleanup

**Tasks**

- show key operational data such as usage, payment health, and support queues
- surface AI quota and abuse signal information
- implement cleanup or TTL enforcement for expired anonymous records
- keep audit logs restricted to admin visibility

**Deliverables**

- admin dashboard
- operational reporting views
- retention sweeper or scheduled cleanup mechanism

**Validation**

- anonymous data expires according to policy
- admin views do not leak user-level details beyond the allowed operational scope

### Exit gate for Phase 5

The operational layer supports safe maintenance and abuse handling without creating new public-facing access risks.

---

## Phase 6: Trust and Launch Readiness

### Objective

Prepare the product for public launch in a legally and operationally defensible way.

### Tasks

- ensure About, Contact, Privacy, and Terms pages exist and are linked
- verify content describes the anonymous flow, AI processing, payment provider handling, and retention rules
- confirm source attribution and private-repository obligations are satisfied
- validate no secret or credential is committed to source control
- run production-safe validation and release checks

### Validation

- all trust and legal pages are live
- payment and AI processing disclosures are consistent with actual behavior
- support path is visible and functional
- no production secrets are present in the repo

### Exit gate

The product is launch-ready from a trust, compliance, product, and deployment standpoint.

---

## Phase 7: Post-MVP Growth (Explicitly Deferred)

### Objective

Keep non-MVP growth work separate from the core launch path.

### Deferred features

- organization accounts
- team workspaces
- bulk generation
- enterprise billing
- broad multi-user collaboration
- programmatic SEO expansion beyond launch priorities

### Rule

These items should live in a separate roadmap and should never be treated as launch requirements for this MVP.

---

## Recommended Execution Sequence

1. Anonymous session middleware
2. Owner-bound resume CRUD
3. Usage tracking and fingerprinting
4. Rate-limit enforcement and concurrency controls
5. Structured AI generation flow
6. Preview and anti-abuse notice
7. Payment provider factory
8. Verified payment and download token flow
9. PDF generation and recovery flow
10. Admin dashboard and allowlist
11. Cleanup and operational monitoring
12. Trust pages and launch validation

## Decision Gate Summary

Each phase should end with a decision gate:

- does the feature meet the PRD?
- is it secure and within budget?
- is it valuable enough for launch?
- does it create downstream complexity we can support?

If the answer is no, the feature should be deferred or simplified.

## Final Roadmap Principle

This implementation sequence is designed for the product’s actual reality: a lean MVP that must be useful, safe, and launchable without drifting into unbounded complexity.
