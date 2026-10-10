# Quality Assurance, Release Governance, and Launch Readiness

## 1. Quality Principles

This product requires quality standards stronger than a generic MVP because it mixes three sensitive domains:

- AI-generated content
- anonymous visitor access
- payment-gated access and billing certainty

Quality assurance must therefore be defined around trust, correctness, and operational resilience.

## 2. Quality Layers

### Layer 1: Product correctness

Verify that the core flow works:

- anonymous visitor can create and edit a resume
- generated content is usable and previewable
- payment is required before PDF export
- the export process generates a file only after verification

### Layer 2: Security correctness

Verify:

- no public sign-up flow exists
- no unsupported public user accounts are required
- admin access is restricted by provider allowlists
- all secure routes are protected server-side
- session ownership is enforced with no cross-session leaks

### Layer 3: Trust correctness

Verify:

- AI rate-limit notice appears in the right place
- user-facing messages explain limitations neutrally and clearly
- payment or generation errors are easy to report
- legal and privacy pages are published before launch

### Layer 4: Operational correctness

Verify:

- logs do not expose secrets or user data inappropriately
- cleanup jobs expire anonymous data within the documented windows
- provider errors are surfaced without creating duplicate charges
- the build and deployment remain within the project’s hosting and cost constraints

## 3. Required Test Strategy

### Unit tests

Focus on deterministic logic:

- session ownership checks
- payment state transitions
- rate-limit calculation and window checks
- admin authorization logic
- retry-after and 429 response behavior

### Integration tests

Validate that the system works as a whole:

- resume create/update/delete flow
- AI generation call sequence with rate limits
- payment verification and PDF generation path
- error reporting and fallback states
- admin dashboard access restrictions

### Contract tests

For provider behavior:

- Gemini error handling and quota exhaustion
- payment provider webhook verification and idempotency
- PDF export failure states and retry behavior

### Manual validation checklist

- public site loads correctly without requiring a login
- anonymous preview page shows the AI rate-limit notice
- payment flow is visible before download and not bypassable
- successful payment triggers one valid export only
- failed payment or generation is easy to report
- admin dashboard is accessible only to the authorized creator

## 4. Anti-Abuse Validation

The anti-abuse controls are a launch-critical part of the product. They must not be treated as a late-stage refinement.

QA should validate:

- hourly, daily, and monthly request caps are enforced
- repeated requests trigger 429 responses with retry-after guidance
- concurrent generation requests are blocked
- oversized prompts are rejected server-side
- monthly Gemini budget is enforced before provider calls overflow
- malicious or malformed traffic does not bypass limits

## 5. Payment Validation

The payment gate is a core product requirement, not a convenience feature.

Tests must ensure:

- no PDF can be served before verified payment
- no duplicate charge occurs for the same verified payment
- payment state is idempotent across retries
- provider return pages are not treated as proof of payment
- failed generation after a successful payment does not silently charge again

## 6. Privacy and Compliance Validation

Before launch, verify:

- Privacy page is live and user-readable
- Terms page is live and user-readable
- the product clearly states anonymous session handling and data retention
- AI usage and provider processing is disclosed clearly
- contact and issue-reporting paths are available and functional
- the project does not make unsupported claims about endorsements or affiliations

## 7. Deployment Readiness Checklist

Release readiness requires:

- no secrets committed to the repository
- secure configuration manager used for all credentials
- Firebase and Netlify environments configured correctly
- provider webhooks configured and tested
- admin identity allowlist set and verified
- legal pages live before public launch
- error-reporting path accessible
- no leftover public account, subscription, or unsupported user feature remains visible

## 8. Release Governance

### Release approval rule

The product should not be released unless the release gate is passed in writing, with evidence.

### Release gate conditions

- requirements are complete and traceable
- architecture and security design are satisfied
- the build and QA checks pass
- payment and AI protections have been tested
- product pages and legal pages are in place
- support process is prepared

### Release documentation

Each release should include:

- scope shipped
- known limitations
- monitored risks
- support contact process
- rollback or issue-handling plan

## 9. Post-Launch Monitoring

After launch, monitor:

- provider failures
- AI quota exhaustion or throttling
- payment verification anomalies
- support submissions and product reports
- rate-limit abuse patterns
- session expiry and cleanup performance

## 10. Final Quality Principle

For Frankie Resume AI, quality is not just whether the feature works. It is whether the product remains trustworthy, secure, monetizable, and sustainable within the constraints of a solo-developed MVP.
