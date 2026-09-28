# Logic Blueprint: Anonymous Sessions & Document Ownership

## 1. Goal
To provide a secure, stateless, and cost-effective way to identify visitors and protect their resume data for a 24-hour window without requiring a user account.

## 2. Session Initiation (The "Handshake")
When a visitor first interacts with the Resume Builder or any resume-related API:

1.  **Generation:** The server (Middleware or Server Action) generates a `session_secret` (a cryptographically secure 32-byte string).
2.  **Encryption/Signing:** The `session_secret` is signed using a server-side `SESSION_KEY` to prevent tampering.
3.  **Cookie Issuance:** A cookie named `__gr_session` is set with the following attributes:
    - `HttpOnly`: Prevents client-side JS from accessing the token (XSS protection).
    - `Secure`: Ensures transmission only over HTTPS.
    - `SameSite=Strict`: Prevents CSRF attacks.
    - `Max-Age`: 86400 (24 hours).
    - `Path`: `/` (Available across the app).

## 3. Data Ownership Model (The "Hash Binding")
We never store the raw `session_secret` in the database. Instead, we use a one-way hash to link a session to a resume document.

### Logic Flow:
1.  **Incoming Request:** Visitor sends a request to `/api/resumes/save` with the `__gr_session` cookie.
2.  **Server Verification:** The server verifies the signature of the cookie.
3.  **Hashing:** The server computes `owner_hash = SHA-256(session_secret + SERVER_SALT)`.
4.  **Firestore Storage:**
    - The Resume document is stored with an `ownerHash` field.
    - An `expiresAt` field is set to `now() + 24 hours`.

### Why this approach?
- **Privacy:** Even if the database is leaked, the `ownerHash` cannot be reversed to find the original session secret.
- **Statelessness:** The server doesn't need to keep a "sessions" table. Identity is verified on-the-fly from the cookie.
- **Cost-Effectiveness:** We leverage Firestore's built-in TTL (Time-To-Live) index on `expiresAt` to handle data cleanup for free.

## 4. API Authorization Logic (The "Gatekeeper")
Every request to a resume-specific endpoint (`GET`, `PUT`, `DELETE`, `GENERATE`) must follow this logical sequence:
- **Cookie Valid?** If no, return 401.
- **Extract session_secret** and compute `owner_hash`.
- **Fetch Resume Document** by ID.
- **Ownership Match?** If `doc.ownerHash == computed_hash`, proceed. Otherwise, return 403.

## 5. Session Extension (The "Rolling Window")
To provide a better UX, the session should be "sliding."
- **Logic:** Every time a user successfully saves or updates their resume, the server issues a fresh cookie with a new 24-hour expiry and updates the `expiresAt` field in Firestore.
- **Constraint:** We will hard-cap the total life of an anonymous session to 7 days to prevent "forever sessions" without an account.

## 6. Engineering Edge Cases
- **Cookie Cleared by User:** If a user clears their browser data, the `session_secret` is lost. Data becomes orphaned.
    - *UI Requirement:* Warning: "Closing your browser or clearing cookies will lose your progress."
- **IP Change:** Users can change networks without losing their session because identity is cookie-bound, not IP-bound.
