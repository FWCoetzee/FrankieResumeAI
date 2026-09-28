# Google Resume AI: Product Requirements Document (PRD)

## EXECUTIVE SUMMARY

### Project Context
- **Product name:** Google Resume AI
- **Developer:** Franklin Coetzee with AI assistance
- **Source Attribution:** Every newly written source-code file begins with a creator comment containing Franklin Coetzee's name, ID number, email, and AI assistance credit.
- **Timeline:** 6-month MVP (once per week, ~4 hours/week = ~100 hours total)
- **Budget:** Free tier only (Google Gemini and Firebase free tiers)
- **Architecture:** Next.js 15 + Firebase + Genkit with Google Gemini
- **Target:** Primarily global B2B, with B2C available as a secondary channel; South African niche focus
- **Hosting:** Netlify only

### Strategic Position
Google Resume AI is an **AI-powered resume builder** targeting businesses and organizations globally, with B2C access for job seekers where available and localization for South Africa. Visitors can build a resume with Gemini and preview the completed resume/CV without creating a user account or signing in. PDF download is offered after payment verification.

**Public information pages:** The site must include an About page explaining Google Resume AI's purpose, workflow, AI-assisted resume creation, payment-gated PDF export, and creator Franklin Coetzee's role. It must also include a Contact page with Franklin's public contact details and a way to report product, payment, PDF, or AI-generation issues.

**Trust and compliance pages:** The site must publish Privacy and Terms pages before launch. These pages must explain anonymous resume-session handling, Gemini processing, payment-provider processing, retention and deletion periods, support reporting, and the independent status of Google Resume AI.

**Business Focus:** Target businesses and organizations first while keeping AI-assisted resume creation and preview accessible without user accounts or subscription sign-up. The MVP supports the same single-resume workflow for B2B and B2C visitors; organization accounts, team workspaces, bulk generation, and enterprise billing are future features. Monetize PDF export through one-time payments via PayPal, Lemon Squeezy, PayFast, or Yoco.

**Success Definition:** MVP launch with a frictionless build-and-preview experience, verified payment before every PDF download, successful PDF delivery, and a clear error-reporting path when payment or download fails.

---

## CRITICAL CONSTRAINTS & IMPLICATIONS

### 1. **Development Bandwidth: ~100 Hours Over 6 Months**
- Realistic per-week: 4 hours (avg), some weeks 0h, some weeks 8h
- **Implication:** Every feature must have high ROI; cut low-value complexity
- **Strategy:** Focus on MVP essentials, defer "nice-to-haves" to post-launch

### 2. **AI API Costs: Free Credits Only**
- Google Gemini free tier: 60 req/min, 2M tokens/month (sufficient for MVP)
- **Implication:** Use the Gemini free tier efficiently and optimize for speed + cost
- **Strategy:** Use Gemini for bulk generation, cache prompts, avoid real-time personalization

### 3. **Infrastructure: Free Tier Stack**
- Firebase (Auth + Firestore + Storage): Free tier sufficient for <50k active users
- Netlify (Next.js hosting): Free tier for 100 req/sec
- **Implication:** No custom backend infrastructure needed
- **Strategy:** Serverless-first, rely on Firebase for database + auth

### 4. **Monetization: Payment-Gated PDF Export (No Subscription Wall)**
- Resume building with Gemini and resume/CV preview are available anonymously without a user account or subscription sign-up
- The **Download as PDF** action takes the user to a payment gateway
- Supported payment providers: PayPal, Lemon Squeezy, PayFast, and Yoco
- PDF download begins only after payment has been verified successfully
- If payment verification or PDF generation fails, provide a link for the user to report the error
- Recommended launch price: USD $4.99 for international visitors and ZAR R99 for South African visitors, charged once per PDF export
- Display the applicable local price before checkout; use USD as the fallback when the visitor's market cannot be determined
- Provider routing: PayFast is the primary South African option with Yoco as the local alternative; PayPal is the primary international option with Lemon Squeezy as the international alternative
- If the selected provider is unavailable, show an explicit provider error and allow the visitor to choose another configured provider without creating a duplicate charge
- Review pricing after the first 100 paid exports using payment conversion, provider fees, refund rate, and support volume
- Payment return pages are not proof of payment; the server must verify the provider webhook or provider API response
- A verified payment is idempotently associated with one resume and one anonymous session, preventing duplicate charges and repeated downloads
- If payment succeeds but PDF generation fails, preserve the verified payment record and provide support with a payment reference; do not silently charge again

### 5. **AI Generation Anti-Abuse Controls**
- Resume creation and preview remain available without user accounts, but AI generation is rate-limited server-side
- Anonymous visitors: maximum 3 AI generations per IP/device identity per hour, 10 per day, and 30 per month
- The only authenticated account is Franklin Coetzee's admin account; it is not a public user account and does not provide an end-user bypass of abuse controls
- Burst control: maximum 3 generation requests per user or IP in 10 minutes
- Concurrency control: one active AI generation per user or IP at a time; additional requests receive a retry-after response
- Request limits: reject oversized prompts and cap each generation at 8,000 input tokens and 4,000 output tokens
- Enforce Gemini's provider limits globally and stop requests when the monthly Gemini budget is reached
- Count accepted generation attempts, including failed provider attempts, toward the applicable limit
- Return HTTP `429` with a neutral retry message when a limit is reached; do not expose internal quota details
- Temporarily block identities that repeatedly rotate requests, send malformed payloads, or trigger abuse thresholds; provide an error-reporting path for legitimate users
- Store only the minimum identifiers and usage counters needed for enforcement, with automatic expiry of anonymous rate-limit records
- **Admin access:** A private admin dashboard is available only to creator Franklin Coetzee through verified Google, GitHub, or X.com social login. Google and GitHub use Firebase providers; X.com uses a server-side OAuth adapter when native Firebase support is unavailable.
- The resume preview page must always display this notice near the AI generation and preview controls: **"To protect the service from abuse by malicious users and automated bots, AI generation is rate-limited. Please submit requests responsibly. If you believe you have been limited in error, report the issue here."**

---

## BUILD STATUS ASSESSMENT

### ✅ COMPLETE (Ready to Use)
- **Frontend:** Resume form, preview, templates (Modern, Minimalist, Creative)
- **Auth:** Firebase Authentication for Franklin Coetzee's admin account only (Google, GitHub, and X.com)
- **Resume Schema:** Well-defined Zod schemas for forms, resume data, AI output
- **AI Integration:** Genkit setup for Google Gemini (structure exists, flows need work)
- **UI Components:** Radix UI + Tailwind CSS fully integrated

### ⚠️ PARTIAL (Needs Work)
- **Backend APIs:** Route structure exists but endpoints incomplete
  - Resume CRUD: `/api/resumes` (POST, GET) — partial
  - Generate: `/api/resumes/:id/generate` — skeleton only
