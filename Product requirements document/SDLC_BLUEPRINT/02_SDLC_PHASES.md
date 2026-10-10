# SDLC Phases for Frankie Resume AI

## Phase 1: Initiation and Scope Definition

### Objective

Confirm that the project is worth doing, feasible under constraints, and properly bounded.

### Activities

- review the executive summary and business assumptions
- confirm MVP boundaries and out-of-scope items
- validate free-tier deployment model and solo-dev capacity
- define business value and measurable success criteria
- identify primary risks and launch blockers

### Required outputs

- approved goal statement
- MVP scope statement
- risk register
- decision log
- clear list of deferred features

### Exit criteria

- product purpose is clear
- feasibility fits the selected stack and constraints
- no unresolved scope ambiguity remains

## Phase 2: Requirements Governance

### Objective

Translate the product intent into actionable requirements and acceptance criteria.

### Activities

- define unsupported public login requirements and admin-only model
- formalize anonymous session behavior
- define payment-gated PDF export flow
- define rate-limit and anti-abuse requirements
- document privacy, terms, and support behavior
- list exact acceptance criteria for each critical user journey

### Critical user journeys

1. anonymous user creates resume and previews it
2. AI generation is attempted under normal load
3. AI generation is rejected under limit conditions
4. user proceeds to payment and downloads PDF only after verification
5. failed payment or generation is reported and resolved safely
6. creator admin accesses hidden dashboard with verified identity only

### Exit criteria

- all launch-critical requirements are written down
- all scope decisions are traceable to the PRD
- required policies and support flows are covered

## Phase 3: Architecture and Design

### Objective

Convert requirements into a deployable, narrow, and secure technical blueprint.

### Design focus

- Next.js app router and public-facing pages
- anonymous session ownership through secure server-managed cookies and session checks
- Firestore-based resume data storage with expiry rules
- Firebase Auth for creator admin only
- Genkit + Google Gemini for AI generation
- server-side payment verification with provider-specific states
- storage and audit logging boundaries
- public pages and support/contact features

### Architecture decisions that matter for this project

- public pages are not user-owned accounts
- anonymous resume content is temporary and time-bounded
- payment state is server-validated, not client-trusted
- admin routes must deny by default
- API limits are enforced server-side before Gemini calls

### Exit criteria

- architecture matches the PRD
- security boundaries are explicit
- failure-handling states are defined
- no design conflict remains between product and engineering choices

## Phase 4: Implementation and Build

### Objective

Build the minimum viable product in a controlled, reviewable manner.

### Delivery model for this project

Because the project is a solo build, implementation should be broken into small, reviewable slices:

- anonymous session and cookie model
- resume CRUD and storage ownership
- AI generation with server-side throttle logic
- payment flow and verified export gating
- admin access and dashboard
- public support pages and legal pages
- PDF generation and error-reporting path

### Implementation rules

- do not build features outside the launch scope
- isolate any speculative features into roadmap items
- keep source attribution and secret-handling rules intact
- validate the smallest slice before moving to the next one

### Exit criteria

- every implemented slice is aligned to the architecture
- each slice has a verification method
- code does not create new contradictions with the PRD

## Phase 5: Verification and Quality Assurance

### Objective

Prove that the product works under realistic conditions and that safety controls are active.

### Quality categories to validate

#### Functional quality

- resume creation and editing
- preview rendering
- generation workflow
- payment and download gating
- support/error reporting

#### Security quality

- admin auth is restricted and deny-by-default
- anonymous session ownership is enforced
- payment verification is server-side
- secrets remain outside repo and client code

#### Abuse quality

- generation limits are enforced
- concurrency controls work
- retry and abuse behavior is explicit
- rate-limit notices are visible to users

#### Privacy and trust quality

- public pages are published before launch
- retention rules match the documented policy
- support reporting and deletion mechanisms are documented

### Exit criteria

- all critical product flows work in realistic conditions
- rate limiting, auth, and payment protections have been tested
- the project is launch-ready from a technical and compliance standpoint

## Phase 6: Release and Deployment

### Objective

Deploy the product only when it passes the release gate and can safely operate in production.

### Deployment requirements

- use the approved Netlify-only hosting model
- keep secrets in secure environment settings only
- verify public pages and legal pages are live
- verify no route bypasses security rules
- verify live payment provider configuration and webhook triggers
- verify Gemini usage and limit protection are active

### Release gate

A release should be approved only when:

- the build passes required checks
- payment verification works end-to-end
- AI abuse controls are functional
- public pages and privacy policies are accessible
- admin access is restricted and tested
- there are no obvious operational or compliance gaps

### Exit criteria

- release is documented
- deployment state is known and monitorable
- support path and issue workflow are ready

## Phase 7: Operations, Maintenance, and Learning

### Objective

Keep the product stable after launch and close the loop on lessons learned.

### Ongoing operations

- monitor AI usage and provider limits
- monitor payment verification and failed exports
- review abuse reports and legitimate block reversals
- review support tickets and user issues
- update documentation when a product decision changes
- manage cleanup of expired anonymous session data

### Post-launch learning loop

The project should take a measured approach to iteration:

- do not expand scope without confirming value
- use support data and payment data to guide next-step improvements
- refine UX and anti-abuse rules based on observed behavior
- add future-phase features only after the MVP stabilizes

### Exit criteria

- the product is stable, supportable, and strategically aligned
- lessons are captured in a maintainable project record
- next-phase roadmap is clearly separated from the MVP

## Phase Summary

The SDLC for Frankie Resume AI is intentionally conservative and outcome-focused. It is built around the realities of a single developer, free-tier infrastructure, anonymous access, anti-abuse protection, and one-time verified payment flows.
