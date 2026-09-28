# Implementation Roadmap: Google Resume AI MVP

This roadmap breaks down the Logic Blueprints into manageable, high-ROI work slices designed for a ~100-hour development cycle (approx. 4 hours/week).

## Phase 1: Foundation (The Anonymous Core)
*Goal: Enable the "Build and Preview" experience without accounts.*

### Slice 1.1: Anonymous Session Middleware
- **Design:** `LOGIC_BLUEPRINT_SESSIONS.md`
- **Tasks:**
    - Implement Next.js Middleware to issue/verify the signed `__gr_session` cookie.
    - Create a server-side utility to compute the `ownerHash`.
- **Validation:** Verify cookie is issued on first visit and is `HttpOnly`.

### Slice 1.2: Identity-Aware Resume CRUD
- **Design:** `SYSTEM_ARCHITECTURE.md` (Section 3)
- **Tasks:**
    - Update `POST /api/resumes` to include `ownerHash` and `expiresAt`.
    - Update `GET /api/resumes/[id]` to verify `ownerHash` before returning data.
- **Validation:** Ensure a user with a modified cookie cannot access a previously created resume.

---

## Phase 2: Protection (The Anti-Abuse Layer)
*Goal: Secure the Gemini quota before enabling AI features.*

### Slice 2.1: Usage Tracking & Fingerprinting
- **Design:** `LOGIC_BLUEPRINT_ANTI_ABUSE.md`
- **Tasks:**
    - Implement the `limit_key` fingerprinting logic (Anonymized IP + Session).
    - Create the `UsageRecord` collection in Firestore.
- **Validation:** Verify logs show unique fingerprints for different "sessions."

### Slice 2.2: Rate Limit Enforcement
- **Tasks:**
    - Create a higher-order function (or middleware) to check/increment Firestore counters.
    - Implement the `isGenerating` concurrency lock.
- **Validation:** Hit the API 4 times in 1 minute and verify a `429` response.

---

## Phase 3: The AI Engine (Genkit + Gemini)
*Goal: Deliver the core value of AI resume generation.*

### Slice 3.1: Structured Prompting
- **Design:** `SYSTEM_ARCHITECTURE.md` (Section 5)
- **Tasks:**
    - Set up Genkit flows with the finalized Resume Zod schema.
    - Implement the "Content Generation" prompt for summary and experience.
- **Validation:** Verify Gemini returns valid JSON matching the schema.

---

## Phase 4: Monetization (The Payment Machine)
*Goal: Gating the PDF export behind a paywall.*

### Slice 4.1: Unified Payment Factory
- **Design:** `LOGIC_BLUEPRINT_PAYMENTS.md`
- **Tasks:**
    - Build the `PaymentProvider` adapter interface.
    - Implement the PayPal and PayFast "Create Session" logic.
- **Validation:** Successfully redirect to a sandbox checkout page.

### Slice 4.2: Webhook Idempotency & PDF Tokens
- **Tasks:**
    - Implement the secure webhook listener with signature verification.
    - Logic to generate the 15-minute `downloadToken` upon successful payment.
- **Validation:** Mock a webhook call and verify the transaction moves to `COMPLETED`.

---

## Phase 5: Administration & Maintenance
*Goal: Creator tools and data cleanup.*

### Slice 5.1: Admin Allowlist & Dashboard
- **Design:** `LOGIC_BLUEPRINT_ADMIN.md` & `X_AUTH.md`
- **Tasks:**
    - Implement server-side allowlist check for Franklin's IDs.
    - Create a basic `/admin` view showing total usage and error logs.
- **Validation:** Login as Franklin and access the dashboard; ensure others get a 404.

### Slice 5.2: The Sweeper (Cleanup)
- **Design:** `LOGIC_BLUEPRINT_RETENTION.md`
- **Tasks:**
    - Configure Firestore TTL indices on `expiresAt` fields.
    - Implement the Netlify Scheduled Function for ticket/log pruning.

---

## Phase 6: Growth (pSEO)
*Goal: Scaling traffic via programmatic SEO.*

### Slice 6.1: The 2,500-Page Matrix
- **Design:** `LOGIC_BLUEPRINT_PSEO.md`
- **Tasks:**
    - Create the `RoleCatalog` JSON file.
    - Implement the Dynamic Route `/templates/[role]-resume-builder-[location]` using ISR.
- **Validation:** Verify a specific template page loads and pre-fills the builder.
