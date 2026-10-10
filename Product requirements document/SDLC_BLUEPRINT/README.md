# Frankie Resume AI — SDLC Blueprint

## Purpose

This SDLC blueprint defines how the Frankie Resume AI product should be developed, validated, released, and operated in a way that is consistent with the project’s product requirements, architecture, anti-abuse controls, and solo-developer realities.

It is intentionally written for this specific project, not as a generic software lifecycle template.

## Source of Truth

This blueprint is derived from and constrained by:

- `AI Context/AI_Frankie_1.0_README.md`
- `AI Context/GENERAL_PROJECT_MANAGEMENT_README.md`
- `Product requirements document/01_EXECUTIVE_SUMMARY.md`
- `Product requirements document/SYSTEM_ARCHITECTURE.md`
- `Product requirements document/LOGIC_BLUEPRINT_ANTI_ABUSE.md`
- `Product requirements document/IMPLEMENTATION_HANDOFF.md`
- `Product requirements document/PRD-README.md`

When product decisions differ, the PRD and architecture documents govern. The AI-context guidance governs how decisions are made when the team is under stress, uncertainty, or decision fatigue.

## Product Definition

Frankie Resume AI is a frictionless, anonymous AI-powered resume builder with a payment-gated PDF export. It is built for a six-month MVP with a solo developer, a free-tier infrastructure stack, and a B2B-first commercial direction.

The product must:

- Support anonymous resume creation and preview without public user accounts
- Use AI-generated resume content through Gemini in a rate-limited and abuse-aware way
- Require verified payment before enabling PDF export
- Maintain a private creator admin dashboard for Franklin Coetzee only
- Respect the legal, trust, privacy, and compliance requirements specified in the PRD
- Ship only features that fit the MVP and launch constraints

## SDLC Operating Principles

### 1. Calm-before-clarity decision-making

The AI-context guidance requires reducing decision complexity under stress. In this lifecycle, that means:

- Stop and simplify when a requirement is unclear
- Separate urgent decisions from strategic ones
- Prefer a minimal viable solution over a broader architectural solution
- Re-state decisions in evidence-based terms before implementation

### 2. Heart + Mind rule

All project-level decisions should pass two checks:

- Mind check: Is the decision technically sound, secure, and sustainable?
- Heart check: Is it aligned with the product’s purpose, values, and user trust model?

If either check fails, the solution is not ready for execution.

### 3. Resource-aware delivery

This project has a small execution budget and free-tier technology constraints. SDLC decisions must favor:

- high-ROI work only
- minimal dependencies and complexity
- use of safe serverless patterns
- near-term value over speculative features

### 4. Document-first delivery

Before building, the requirements, technical architecture, and acceptance criteria must be clear enough that the work does not drift. This is especially important for a solo developer because implementation memory is limited and the product is highly operationally sensitive.

## Lifecycle Overview

The lifecycle for this project follows a disciplined progression:

1. Initiation and scope definition
2. Requirements governance
3. Architecture and design
4. Build and implementation
5. Verification and quality assurance
6. Release and deployment
7. Operations, support, and iteration

Each phase should produce explicit evidence, not just assumptions.

## Success Criteria for the SDLC

The lifecycle is successful only if it produces an implementation that satisfies the PRD and remains safe to operate:

- Anonymous session ownership model works and is secure
- AI generation remains rate limited and abuse-aware
- Payment is verified server-side before PDF delivery
- The product remains accessible without public accounts
- Admin access is restricted to Franklin Coetzee only
- The system remains deployable on Netlify + Firebase + Gemini free-tier constraints
- The product can be launched without leaking secrets or violating privacy boundaries

## Out-of-Scope Guardrail

The SDLC must explicitly separate MVP from future scope. Features such as organization accounts, team workspaces, enterprise billing, bulk generation, and advanced multi-user collaboration are not launch requirements and should remain clearly labeled as future-phase work.

## SDLC Document Map

- [01_PROJECT_CONTEXT_AND_GOVERNANCE.md](01_PROJECT_CONTEXT_AND_GOVERNANCE.md)
- [02_SDLC_PHASES.md](02_SDLC_PHASES.md)
- [03_QUALITY_ASSURANCE_AND_RELEASE.md](03_QUALITY_ASSURANCE_AND_RELEASE.md)
- [04_IMPLEMENTATION_ROADMAP.md](04_IMPLEMENTATION_ROADMAP.md)
- [05_IMPLEMENTATION_GUARDS_AND_RELEASE_RULES.md](05_IMPLEMENTATION_GUARDS_AND_RELEASE_RULES.md)

## Lifecycle Summary

This project is not a broad, open-ended product platform. It is a tightly scoped MVP with operational safeguards baked into the stack from the start. The SDLC therefore prioritizes:

- disciplined scope control
- security-first implementation
- verifiable payment correctness
- abuse prevention
- measurable user trust and operational readiness

This blueprint is intended to keep the project lean, testable, and launchable without drifting into feature sprawl.
