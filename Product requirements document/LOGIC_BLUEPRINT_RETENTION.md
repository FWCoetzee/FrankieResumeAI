# Logic Blueprint: Global Data Retention & Cleanup Cron

## 1. Goal
To maintain platform performance and comply with privacy policies by automatically purging expired data.

## 2. Retention Schedules
| Data Type | Retention | Trigger |
| :--- | :--- | :--- |
| **Anonymous Resumes** | 24 Hours | Last Activity |
| **Payment Logs** | 7 Years | Legal requirement (Financial) |
| **Download Tokens** | 15 Minutes | Generation time |
| **Anti-Abuse Keys** | 31 Days | Creation time |
| **Support Tickets** | 12 Months | Submission time |
| **Admin Audit Logs** | 12 Months | Action time |

## 3. Implementation Logic (The "Sweeper")
Since Netlify and Firebase don't have a "Free Tier Cron" that runs every hour, we use two complementary methods:

### Method A: Firestore TTL (Primary)
- **Logic:** Add an `expiresAt` field to every document.
- **Benefit:** Firestore deletes these automatically and for free.
- **Usage:** Resumes, Download Tokens, and Anti-Abuse keys.

### Method B: Scheduled Netlify Function (Secondary)
- **Logic:** A Netlify Function at `/.netlify/functions/cleanup-cron` protected by an `ADMIN_KEY`.
- **Schedule:** Once per day (via Netlify Scheduled Functions).
- **Tasks:**
    1.  Delete `support_tickets` where `createdAt < (now - 12 months)`.
    2.  Delete `audit_logs` where `timestamp < (now - 12 months)`.
    3.  Summary: Log the number of deleted records to the `audit_logs`.

## 4. Engineering Safety
- **Soft Deletes:** (Optional) For the first 3 months post-launch, "Admin Resumes" will be marked `archived` instead of deleted, to allow for manual recovery during the MVP phase.
- **Batching:** The cleanup function deletes in batches of 500 to stay within Firestore transaction limits and execution time limits.
