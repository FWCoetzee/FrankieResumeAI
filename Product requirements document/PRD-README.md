# Frankie Resume AI: Product Requirements Document

Welcome to the FrankieResumeAI PRD! This document is organized into focused sections for easy reference and management.

## 📋 Document Structure

- **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Project overview, context, and strategic position
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - System design, security, data flow, and implementation boundaries
- **[SEO_SPECIFICATION.md](SEO_SPECIFICATION.md)** - Search, metadata, and public-page requirements
- **[IMPLEMENTATION_HANDOFF.md](IMPLEMENTATION_HANDOFF.md)** - Current implementation status, verified checks, blockers, and safe takeover instructions

## 🚀 Quick Facts

- **Product:** AI-powered resume builder with payment-gated PDF export
- **Public name:** Frankie Resume AI
- **Timeline:** 6-month MVP
- **Developer:** Solo (FWCoetzee) with AI assistance
- **Creator:** Franklin Coetzee, with AI assistance
- **Source attribution:** Every newly written source-code file must begin with a comment containing Franklin Coetzee's name, ID number `8510305083081`, email `salazar3593@gmail.com`, and credit for AI assistance.
- **Architecture:** Next.js 15 + Firebase + Genkit with Google Gemini
- **Hosting:** Netlify only
- **Access model:** Visitors build with Gemini and preview the resume/CV anonymously without user accounts or subscription sign-up; PDF download requires verified payment.
- **Payment providers:** PayPal, Lemon Squeezy, and PayFast
- **Recommended launch price:** USD $4.99 internationally and ZAR R99 in South Africa, charged once per PDF export.
- **Payment routing:** PayFast primary for South Africa; PayPal primary and Lemon Squeezy alternative internationally.
- **Preview notice:** The preview page displays a visible AI rate-limit notice explaining that limits protect the service from malicious users and automated bots, with a link to report an incorrect limit.
- **Admin dashboard:** A creator-only dashboard for Franklin Coetzee, accessed through Google, GitHub, or X.com social login and protected by server-side authorization.
- **Accounts:** No public user accounts or end-user login; only Franklin Coetzee has an authenticated admin account.
- **Target:** Primarily global B2B, with B2C available as a secondary channel; South African niche focus
- **MVP scope:** One anonymous resume session per visitor for both B2B and B2C; organization accounts, team workspaces, bulk generation, and enterprise billing are out of scope until a later phase.
- **Public pages:** About and Contact pages describing the site, its creator, supported workflow, and issue-reporting options
- **Compliance pages:** Privacy and Terms pages are required before launch.

## 📌 Getting Started

Start with the **EXECUTIVE_SUMMARY** to understand the project context and strategic position, then review **SYSTEM_ARCHITECTURE** for implementation requirements and **SEO_SPECIFICATION** for public-page and search requirements.

## Decisions Required Before Implementation

- Confirm the recommended launch prices of USD $4.99 internationally and ZAR R99 in South Africa.
- Use a server-side X.com OAuth adapter unless native Firebase support is verified for the deployment; Google and GitHub use Firebase providers.
- Approve the Privacy and Terms content, retention periods, and independent-brand statement with appropriate legal guidance.
- Keep the source repository private permanently. Never commit API keys, OAuth secrets, payment credentials, or other secrets; store them only in secure Netlify/Firebase environment configuration.
