# Logic Blueprint: Payment & PDF Export State Machine

## 1. Goal
To provide a secure, idempotent payment workflow across three providers (PayPal, PayFast, Lemon Squeezy) that grants access to a PDF download without requiring a user account.

## 2. The Payment Transaction Document
The source of truth for anonymous purchases.

**Key Schema:**
- `transactionId`: Unique ID (pre-generated).
- `resumeId`: Reference to the resume being purchased.
- `ownerHash`: SHA-256 hash of the session (ownership check).
- `provider`: `paypal` | `payfast` | `lemonsqueezy`.
- `status`: `CREATED` | `PENDING` | `COMPLETED` | `FAILED` | `EXPIRED`.
- `amount`: Decimal.
- `currency`: `USD` | `ZAR`.
- `downloadToken`: Unique, short-lived string (generated after payment).

## 3. The State Machine Logic

### Step 1: Initialization (`POST /api/payments/create`)
1.  **Geo-Routing:** Detect IP location to set currency (ZAR for ZA, USD fallback).
2.  **Provider Selection:** Route to PayFast (ZA) or PayPal/LemonSqueezy (Intl).
3.  **Idempotency Check:** If `PENDING` exists for this `resumeId` + `ownerHash`, return existing session.
4.  **Doc Creation:** Create Firestore doc in `CREATED` state.

### Step 2: The Provider Handshake
1.  Redirect to provider checkout.
2.  Update status to `PENDING`.

### Step 3: Server-to-Server Verification (The "Webhook")
1.  **Incoming Webhook:** Provider sends POST with signature.
2.  **Signature Validation:** Verify using provider `WEBHOOK_SECRET`.
3.  **Atomic Transition:** Use Firestore Transaction to:
    - Check if status is `PENDING`.
    - If yes, update to `COMPLETED`.
    - Generate `downloadToken` and set `tokenExpiresAt` (now + 15 mins).

### Step 4: PDF Generation & Delivery
1.  Frontend calls `GET /api/resumes/:id/download?token=...`.
2.  **Server Check:** 
    - Token valid and not expired?
    - `ownerHash` matches session?
3.  **Execution:** Trigger PDF generation and stream to browser.
4.  **Cleanup:** Mark `downloadToken` as "Used".

## 4. Handling "Paid-But-Failed" Scenarios
1.  **Logic:** Do not revert payment.
2.  **Recovery:** Provide "Retry Download" button to re-trigger generation if session is active.

## 5. Security & Anti-Fraud
- **Price Integrity:** Price is set server-side; not accepted from client.
- **Session Locking:** `downloadToken` is tied to `session_secret`.
- **Webhook Idempotency:** Log `provider_reference_id` to prevent double-processing.

## 6. Engineering Principles
- **Separation of Concerns:** Use a `PaymentFactory` pattern for provider abstraction.
- **Atomic Updates:** Status transitions must be atomic.
