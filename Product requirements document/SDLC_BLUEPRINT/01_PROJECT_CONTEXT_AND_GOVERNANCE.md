# Project Context and Governance

## 1. Product Mission

Frankie Resume AI is designed to make AI-assisted resume generation easy, useful, and safe for anonymous visitors while protecting the business from abuse, fraud, and unscalable support loads.

The product must not become a general-purpose SaaS app with broad public user accounts. It is intentionally narrower: resume generation, preview, and verified PDF export.

## 2. Project Constraints

These constraints define the SDLC model:

- Solo developer capacity: around 4 hours per week on average over a 6-month MVP window
- Free-tier infrastructure: Firebase + Netlify + Gemini free limits
- Anonymous access model: no public user account creation
- Payment-gated PDF export: verified payment before download
- Strict anti-abuse controls: AI rate limiting and malicious traffic mitigation
- Private repository and confidential source attribution requirements
- Need for privacy, terms, and trust pages before public launch

## 3. Governance Model

The project follows a lightweight but disciplined governance model:

### Product governance

- PRD and architecture documents are the primary source of truth
- Business scope is controlled by the executive summary and PRD decisions
- Revenue model, pricing, and MVP scope are reviewed before any expansion

### Technical governance

- All technical work must align with the architecture blueprint
- API, authentication, payment, and storage decisions must not bypass the approved design
- Security and abuse controls are not optional add-ons; they are core product requirements

### Delivery governance

- Every feature must be mapped to a product need, user need, or launch requirement
- Out-of-scope work must be explicitly deferred
- Each phase must be documented with exit criteria

## 4. Decision Framework for the Project

The project uses the AI Frankie decision rules as operational guardrails:

### Mind check

Before implementation, confirm:

- Is this technically valid?
- Is it aligned with the selected stack and architecture?
- Does it fit within budget and free-tier constraints?
- Does it create operational or security risk?

### Heart check

Before implementation, confirm:

- Does it honor the user’s intent and trust model?
- Does it respect privacy and consent?
- Does it avoid manipulative or overly aggressive monetization?
- Does it remain honest about limitations and support paths?

### Calm-before-clarity rule

If uncertainty or stress is high, reduce the scope and structure the problem before coding.

## 5. Decision Gates

The SDLC includes mandatory review gates:

### Gate A: Scope validation

Before implementation, confirm:

- problem is real and clearly framed
- user path is within MVP boundaries
- feature is justified by requirements
- any hidden complexity is known

### Gate B: Architecture validation

Before implementation, confirm:

- route, data model, and ownership model are consistent
- security and anti-abuse measures are addressed
- infrastructure constraints are respected
- admin and public access boundaries are explicit

### Gate C: Release validation

Before production release, confirm:

- payment verification works correctly
- rate limiting and abuse protections work
- preview and preview notice are visible and compliant
- no secrets or credentials are exposed
- privacy, terms, and support paths are live and correct

## 6. Scope Boundaries

### Included in launch scope

- Anonymous resume session flow
- Resume form, template selection, and preview
- AI generation with rate limits
- Payment-gated PDF export
- Support and error-reporting flow
- Privacy and terms pages
- Creator-only admin access

### Explicitly deferred

- Organization accounts
- Authenticated end-user accounts
- Team workspaces
- Bulk generation
- Enterprise billing
- Advanced revenue/analytics expansion

## 7. Risk Register

### Product risk: scope creep

Mitigation:

- every feature must tie to MVP product need
- add explicit "post-MVP" tracking when necessary

### Product risk: abuse or quota exhaustion

Mitigation:

- server-side rate limiting
- concurrency controls
- monthly usage caps
- temporary block logic

### Product risk: fraudulent or failed payments

Mitigation:

- server-side verification only
- idempotent payment state management
- no download until confirmed payment
- support path for failed exports

### Product risk: security or identity misuse

Mitigation:

- deny-by-default admin model
- allowlist of verified identities
- secure session management and cookie rules
- no public user authentication surfaces

### Product risk: support overload

Mitigation:

- keep the product simple
- provide error reporting links
- use clear user messaging and payment states

## 8. Artifact Standards

Every feature or fix must produce clear artifacts:

- requirement statement
- design decision
- implementation evidence
- verification output
- release impact assessment

This keeps the project manageable despite the solo-developer constraint.

## 9. Final Governance Principle

The product is successful only if it remains simple, honest, secure, and testable. The SDLC must therefore favor sustainable execution over feature breadth.
