# Logic Blueprint: Admin Dashboard & Privileged Operations

## 1. Goal
To provide the creator (Franklin Coetzee) with a secure environment to monitor the platform and a "White-Glove" workflow to service private clients without public constraints.

## 2. Authentication & Authorization
**Server-Side Allowlist Strategy:**
1.  **Login:** Google, GitHub, or X.com (Firebase Auth).
2.  **Identity Verification:** Capture `uid` or `email`.
3.  **Allowlist Check:** Compare against `ADMIN_IDENTITIES` environment variable.
4.  **Strict Deny:** Unauthorized users receive `404 Not Found` for admin routes.

## 3. "White-Glove" Client Service Logic
Dedicated mode available only to the Admin.

**Privileges:**
1.  **AI Unlimited Access:** Bypass 3/hr and 10/day rate limits.
2.  **Payment Bypass:** Skip payment gateway for PDF exports.
3.  **Extended Retention:** Save resumes to `client_resumes` collection with **no auto-expiry**.
4.  **Admin UI:** Toggle between "Standard" and "Client Mode" in the builder.

## 4. Admin Dashboard Functionality
- **Platform Health:** AI quota tracker (tokens used vs. cap) and abuse logs.
- **Financial Overview:** Success/Fail logs and revenue counters (USD/ZAR).
- **Client Management:** List of all resumes created in "Admin Mode" with direct download links.

## 5. Engineering Best Practices
- **Middleware Protection:** Protect `/admin` routes with server-side role checks.
- **Audit Logging:** Record all bypass actions: `[ADMIN_ACTION] Franklin created PDF for Client X`.
- **Environment Isolation:** Keep allowlist and secrets out of source code.
