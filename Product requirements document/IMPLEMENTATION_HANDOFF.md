# Frankie Resume AI: Implementation Handoff

## Purpose

This document is the starting point for any AI agent or developer taking over implementation. Read this file first, then consult the documents listed under **Authoritative Documents** before editing source code.

## Authoritative Documents

1. `01_EXECUTIVE_SUMMARY.md` - Product decisions, pricing, access model, anti-abuse rules, and launch constraints.
2. `SYSTEM_ARCHITECTURE.md` - Routes, anonymous sessions, payment state machine, authentication, security, retention, and optimization requirements.
3. `SEO_SPECIFICATION.md` - Public pages, metadata, navigation, structured data, and SEO requirements.
4. `PRD-README.md` - Project summary, implementation decisions, and unresolved approvals.
5. Root `copilot-instructions.md` - Source attribution requirements for newly written source files.

When documents conflict, treat the most recently confirmed user decision as controlling. `01_EXECUTIVE_SUMMARY.md` is authoritative for product scope and business decisions; `SYSTEM_ARCHITECTURE.md` is authoritative for technical decisions; `SEO_SPECIFICATION.md` is authoritative only for SEO and public-page requirements. Update all affected documents before implementing a decision. The handoff records status and next steps; it does not silently override product or architecture decisions.

## PRD Completion Requirements

The documents in this folder are the final product and implementation blueprints. Before treating them as complete, ensure they recommend only features justified by user needs, engineering best practices, security, or launch requirements. Keep speculative growth ideas and nonessential enhancements in a clearly labeled post-MVP section; do not present them as launch requirements.

- `01_EXECUTIVE_SUMMARY.md` must state the agreed product, audience, MVP workflow, launch constraints, measurable success criteria, and explicit out-of-scope items. Remove obsolete or unverified product, pricing, provider, and usage claims.
- `SYSTEM_ARCHITECTURE.md` must define one coherent, deployable architecture: data store, ownership and session model, API boundaries, AI request/quota accounting, payment lifecycle, PDF delivery, retention/cleanup, authentication, and failure handling. Use terminology and mechanisms that actually apply to the selected services. Record unresolved choices as blockers rather than describing conflicting alternatives as settled.
- `SEO_SPECIFICATION.md` must contain launch-critical technical SEO and public-page requirements separately from optional content marketing and growth work. Use current web standards and include only claims the product can support.
- `PRD-README.md` must summarize confirmed decisions and unresolved approvals accurately, link to the authoritative documents, and avoid duplicating details that can drift.
- `IMPLEMENTATION_HANDOFF.md` must distinguish verified implementation facts from planned requirements, list current mismatches and blockers, and give the next safe implementation step. Update it after each validated implementation slice.

Across all documents, specify acceptance criteria that can be tested; use consistent product names, routes, data ownership, states, retention periods, and scope. Do not require sensitive personal identifiers in source-code comments or other broadly replicated artifacts. Mark legacy documents outside this folder, including `docs/blueprint.md`, `docs/backend.json`, and `docs/schema.sql`, as non-authoritative or archive them so they cannot be mistaken for the final blueprint. Do not claim the documentation is finalized until its requirements agree with each other and material differences from the current code are explicitly recorded.

## Confirmed Product Decisions

- Public product name: Frankie Resume AI.
- Repository remains private permanently.
- Visitors do not create accounts or sign in.
- Visitors build and preview one resume through a temporary anonymous session.
- PDF export requires one-time verified payment.
- Launch price: USD $4.99 internationally or ZAR R99 in South Africa.
- South Africa routing: PayFast primary, Yoco alternative.
- International routing: PayPal primary, Lemon Squeezy alternative.
- Gemini is the only AI provider.
- Netlify is the only hosting and deployment platform.
- Only Franklin Coetzee has an admin account.
- Google and GitHub use Firebase providers; X.com uses a server-side OAuth adapter.
- B2B is the primary commercial audience, but MVP functionality is the same anonymous single-resume flow for B2B and B2C.
- Organization accounts, teams, bulk generation, and enterprise billing are future scope.

## Implementation Progress

### Completed

- Product requirements were reconciled across the PRD, architecture, and SEO documents.
- Anonymous-session, payment, admin, B2B-scope, privacy, retention, and optimization requirements are documented.
- Regional PDF pricing is documented as USD $4.99 internationally and ZAR R99 in South Africa.
- Payment routing is documented as PayFast/Yoco for South Africa and PayPal/Lemon Squeezy internationally.
- `src/components/landing-page.tsx` was aligned with anonymous build/preview and one-time PDF export messaging.
- Obsolete landing-page lifetime, subscription, `R199`, and unlimited-generation claims were removed.

### Validation Completed

- `npm run typecheck` passes after the landing-page changes.
- The landing-page diff was reviewed and contains no payment integration code yet.
- No GitHub push or commit was made from this checkpoint.

### Current Checkpoint

- The next source task is to remove or isolate the legacy public-account surface before implementing anonymous sessions.
- Start by inspecting `src/app/auth`, `src/app/api/users`, `src/app/app/account`, and their imports/usages.
- Preserve the existing resume editor until its ownership model can be changed safely to the temporary anonymous session.
- After the account-surface edit, run `npm run typecheck` immediately and update this progress section with the result.

## Milestone 1 Completion Checkpoint

### Verified Complete — Phase 1: Foundation

- Anonymous session middleware issues a `__gr_session` UUID cookie with HttpOnly, SameSite=Lax, Secure-in-production, and 24-hour lifetime protections.
- Existing anonymous-session cookies are renewed on matched application requests.
- Anonymous cookie IDs are restricted to issued UUIDv4-shaped values.
- Owner-bound resume create/read/update/delete flows query by `owner_hash`.
- Active resume queries require `expires_at > NOW()` and exclude soft-deleted records.
- Resume reads and edits renew the 24-hour inactivity expiry.
- Expired and soft-deleted resumes can be removed through the secret-protected cleanup endpoint.
- Unit tests, TypeScript validation, and the mocked integration smoke test pass.

### Milestone 1 Exit Gate

The anonymous user can create and edit a resume without a public account, and resume access is constrained by the anonymous owner hash. The implementation is ready to move to Phase 2 after deployment configuration supplies `ANONYMOUS_SESSION_SECRET` and `CLEANUP_SECRET`.

### Validation Recorded

- `npm run typecheck`: passed.
- Anonymous-session unit suite: 7 tests passed.
- Integration smoke test: passed.

The implementation of Milestone 2 should now begin in Slice 2.1. The legacy payment and public-account surfaces remain outside this milestone and must not be included in this completion claim.

## Milestone 2 Completion Checkpoint

### Verified Complete — Phase 2: Protection

- Anonymous identity keys combine the anonymous owner hash, anonymized IP subnet, and normalized user agent.
- Usage records and events enforce burst, hourly, daily, and monthly limits.
- Concurrent generation requests are locked and stale locks are released.
- Accepted, completed, and failed usage accounting is implemented.
- Provider failures remove failed attempts while successful attempts remain counted.
- Generation API responses include `429`, `409`, or `503` states as applicable with `Retry-After`.
- The preview and review screens display the required neutral anti-abuse notice.
- The production database usage tables are present.
- The configured monthly Gemini request circuit breaker is set to 30.

### Validation Recorded

- `npm run typecheck`: passed.
- Anti-abuse unit suite: 5 tests passed.
- Gemini provider check for `gemini-3-flash-preview`: passed with HTTP 200.

## Phase 3 Provider Configuration Checkpoint

### Verified

- Gemini is the only configured AI provider for production resume generation.
- `gemini-3-flash-preview` resolves successfully through the Genkit Google provider.
- Structured resume generation completed successfully and returned data matching `generatedResumeSchema`.
- Pro fallback resolution occurs only after Flash retries fail, preventing an unavailable Pro model from blocking Flash generation.
- Runtime generation-stage verification now covers ownership, rate limits, input validation, provider completion, output validation, database persistence, and completion.
- Provider failures are categorized as authentication, quota, model, timeout, or provider/network errors.
- Generation verification logs include only stage, result, resume ID, and request ID; provider responses, credentials, prompts, and resume data are not logged.
- Invalid provider output is rejected before database persistence and returned as a safe retryable client error.
- Database transactions are rolled back when generation persistence fails, while abuse-limit accounting is finalized as failed or completed appropriately.

### Phase 3 Verification Tests

- `npm run typecheck`: passed.
- Generation verification unit suite: 2 tests passed.
- Generation-flow and limit verification suite: 10 tests passed.
- Owner, rate-limit, provider, schema, transaction, and provider-error classification paths are covered.

### Remaining Phase 3 Work

- Replace the hardcoded resume intent, experience level, style, and language values in the generation route with values captured from the user.
- Complete end-to-end preview verification against the current UI and database configuration.
- Re-run the production build with enough time for Next.js compilation.
- Complete final verification of real provider, database persistence, and preview rendering with production-like configuration.

## Verified Checks

- `npm run typecheck` passes.
- No `.env`, private-key, OAuth-secret, or payment-credential files were found in the tracked project scan.
- The Firebase browser API key in `src/firebase/config.ts` is client configuration, not a server secret; server credentials must remain in environment configuration.
- The production build was attempted but stalled during Next.js compilation with an OpenTelemetry warning and was stopped. Re-run it later with a reasonable timeout.
- The repository has not been pushed from this handoff.

## Current Source-Code Mismatch

The source code is not yet aligned with the requirements. Do not claim the MVP is implementation-complete until these are addressed:

1. Remove or replace public account flows and routes, including signup, login, user APIs, account pages, and user-owned resume assumptions.
2. Implement temporary anonymous sessions with Secure, HttpOnly, SameSite cookies, server-side session ownership checks, 24-hour inactivity expiry, and cleanup.
3. Replace the legacy subscription and Stripe placeholder UI with the PDF-only payment workflow and the four configured providers.
4. Implement server-side payment verification, webhook idempotency, payment states, one-time download tokens, refund/chargeback handling, and paid-export failure recovery.
5. Add the creator-only admin dashboard with Google, GitHub, and X.com authentication and server-side allowlist authorization.
6. Add About, Contact, Privacy, and Terms pages and global links.
7. Add the preview-page AI rate-limit notice and server-side anti-abuse enforcement.
8. Reconcile existing source behavior with the finalized architecture and Firestore rules.

## Safe Implementation Order

1. Inspect the exact source slice and nearby tests before editing.
2. Make one focused change only.
3. Immediately run the narrowest available validation, normally `npm run typecheck` or a focused test.
4. Review the diff and search for stale behavior before starting the next slice.
5. Keep unrelated user changes. Do not reset, checkout, or delete existing work.
6. Do not commit or push unless the user explicitly requests it.
7. Before any push, scan tracked files for `.env` files, private keys, OAuth secrets, payment credentials, and generated build output.

## Required Final Validation

Before declaring the implementation ready:

- `npm run typecheck` passes.
- `npm run build` completes successfully without being stopped.
- Anonymous resume creation, editing, preview, expiry, and ownership checks work.
- Gemini limits and the visible preview notice work.
- Payment verification is server-side and idempotent for all four providers.
- PDF download cannot start before verified payment.
- Failed paid exports do not charge the visitor again.
- Admin authorization is deny-by-default and restricted to Franklin's provider identities.
- About, Contact, Privacy, and Terms pages are reachable and linked.
- Firestore rules prevent cross-session access.
- No secrets or sensitive production credentials are tracked.

## Open Approvals

- Legal approval of Privacy and Terms content, retention periods, and the independent-brand statement.
- Production provider credentials and webhook configuration.
- Final creator provider identity allowlist values.
- Exact production environment variables and Netlify configuration.

## Handoff Rule

The next agent should begin by reading this file, `PRD-README.md`, `01_EXECUTIVE_SUMMARY.md`, and `SYSTEM_ARCHITECTURE.md`. It should then verify the current Git status, read **Implementation Progress**, and inspect only the source slice named in **Current Checkpoint**. After each validated source slice, update this document so the next agent can resume from the exact stopping point.
