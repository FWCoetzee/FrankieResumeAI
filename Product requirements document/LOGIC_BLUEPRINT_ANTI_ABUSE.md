# Logic Blueprint: AI Anti-Abuse & Rate Limiting

## 1. Goal
Protect the Google Gemini free-tier quota (60 RPM / 2M TPM) from malicious actors and bot exhaustion while providing a seamless experience for legitimate anonymous visitors.

## 2. Multi-Layer Identification (The "Fingerprint")
Since we lack a User ID, we must create a composite identity to track usage.

**Logic:** The "Enforcement Key" used for rate-limiting counters will be:
`limit_key = SHA-256(Anonymized_IP + User_Agent + Device_Salt)`

- **Anonymized IP:** Use IP subnet (e.g., `192.168.1.0` instead of `192.168.1.45`).
- **Session Correlation:** If a valid `__gr_session` cookie exists, it is appended to the fingerprint to allow mobility across networks.

## 3. Rate Limit Tiers (Sliding Windows)
Enforced server-side:

| Window | Limit | Purpose |
| :--- | :--- | :--- |
| **Burst** | 3 req / 10 min | Prevents rapid-fire "spamming". |
| **Hourly** | 3 req / hour | Standard user iteration pace. |
| **Daily** | 10 req / day | Prevents long-term scraping/abuse. |
| **Monthly** | 30 req / month | Hard cap for anonymous usage. |

## 4. State Management: The "Atomic Counter" Pattern
Using **Firestore Transactions** for counter management.

### Logic Flow:
1.  **Request Arrival:** User clicks "Generate".
2.  **Lookup:** Fetch the `UsageRecord` document matching the `limit_key`.
3.  **Validation:** Check current timestamps against windows. Return 429 if exceeded.
4.  **Concurrency Lock:** Check `isGenerating` flag. Return 409 if active.
5.  **Atomic Increment:** 
    - Increment counters.
    - Set `lastRequestAt = now()`.
    - Set `isGenerating = true`.
6.  **Execute Gemini:** Call Genkit/Gemini.
7.  **Finalize:** Update document setting `isGenerating = false`.

## 5. Graceful Degradation & Response Logic
- **HTTP 429 Response:** Include `Retry-After` header (in seconds).
- **Client-Side:** Parse header and disable "Generate" button with a countdown.
- **Transparency:** Neutral message: *"To ensure fair access for everyone, AI generation is temporarily limited for your session."*

## 6. Global "Circuit Breaker"
- **Logic:** Singleton document in Firestore tracks total tokens used this month.
- **Action:** If total usage hits 90% of the Gemini Free Tier limit, switch to "Maintenance" mode for AI features.

## 7. Engineering Best Practices
- **Idempotency:** Refund/decrement counter if Gemini call fails due to network/provider errors.
- **Data Retention:** Usage records expire via TTL after 31 days.
