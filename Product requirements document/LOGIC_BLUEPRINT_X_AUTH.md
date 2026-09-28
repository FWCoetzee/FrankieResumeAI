# Logic Blueprint: X.com (Twitter) Admin Adapter

## 1. Goal
To allow Franklin (Admin) to authenticate using X.com when native Firebase support is unavailable or preferred, ensuring only his specific X identity grants access.

## 2. PKCE OAuth 2.0 Flow (Server-Side)
Because this is for admin access, we use a secure server-side flow rather than a client-side popup.

### Logic Steps:
1.  **Authorization Request:** 
    - Admin clicks "Sign in with X".
    - Server generates a `code_verifier` and `state`.
    - Redirects to `https://twitter.com/i/oauth2/authorize` with `code_challenge` and `offline.access` scopes.
2.  **Callback Processing:**
    - X redirects back to `/api/auth/callback/x`.
    - Server verifies the `state` to prevent CSRF.
    - Server exchanges the `code` for an `access_token` using the `code_verifier`.
3.  **Identity Verification:**
    - Server calls `GET https://api.twitter.com/2/users/me`.
    - Server extracts the immutable `id` (e.g., `12345678`) and `username` (e.g., `@franklin`).
4.  **Allowlist Match:**
    - Server checks if `x_id` matches the value in `ADMIN_IDENTITIES_X`.
5.  **Firebase Session Grant:**
    - If it matches, the Server uses the **Firebase Admin SDK** to call `admin.auth().createCustomToken(uid)`.
    - This token is returned to the client.
6.  **Client Sign-in:**
    - The client-side Firebase SDK calls `signInWithCustomToken(token)`, establishing the authenticated admin session.

## 3. Security Requirements
- **State Persistence:** The `state` and `code_verifier` are stored in a short-lived (10 min), signed, HttpOnly cookie.
- **Provider Binding:** Once authenticated via X, the Firebase user is tagged with a custom claim `admin: true`.
- **Credential Safety:** X.com Client ID and Client Secret reside only in Netlify environment variables.
