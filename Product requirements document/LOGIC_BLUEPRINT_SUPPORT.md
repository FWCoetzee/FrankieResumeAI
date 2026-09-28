# Logic Blueprint: Error Reporting & Support Engine

## 1. Goal
To allow anonymous users to report payment or PDF issues securely and provide the Admin with a unified view to resolve them.

## 2. Submission Logic (The "Anonymous Pipe")
Since the user is anonymous, we must "contextualize" their error report without an account.

### Logic Flow:
1.  **Trigger:** User hits an error (e.g., `PAID_EXPORT_FAILED`).
2.  **Context Capture:** The UI automatically bundles the following metadata:
    - `transactionId` (from the payment state).
    - `resumeId` (the active document).
    - `errorCode` (e.g., `PDF_GEN_TIMEOUT`).
    - `ownerHash` (to verify the reporter owns the session).
3.  **User Input:** User provides an optional description and an email address (for follow-up).
4.  **Security Check:**
    - The API verifies that the `ownerHash` in the report matches the `__gr_session` cookie.
    - Rate limit: 1 report per session per 10 minutes (prevents spam).
5.  **Storage:** Report is saved to a `support_tickets` collection in Firestore.

## 3. Admin Resolution Logic
1.  **Notification:** (Optional) Franklin receives an email alert for new tickets.
2.  **Dashboard View:** Tickets are listed in the Admin Dashboard, sorted by "Newest."
3.  **Data Lookup:** Clicking a ticket allows Franklin to:
    - View the associated `Payment Transaction` status.
    - Check the `Resume` content.
4.  **Action:** Franklin can "Resolve" the ticket, which might involve manually triggering a "Refund" via the provider or emailing the client the PDF.

## 4. Privacy & Compliance
- **Data Minimization:** Only store the email if provided. 
- **Encryption:** Emails are stored at rest (Firestore default).
- **Auto-Expiry:** Tickets are deleted after 12 months (Retention Policy).
