# Logic Blueprint: High-Scale Programmatic SEO (2,500 Pages)

## 1. Goal
Generate 2,500 unique, high-ranking landing pages without increasing hosting costs or slowing down the main web app.

## 2. Technical Stack
- **Framework:** Next.js 15 (App Router).
- **Rendering:** **Incremental Static Regeneration (ISR)**.
- **Data Source:** Structured JSON "Catalog".
- **Edge Cache:** Cloudflare (DNS/Proxy).

## 3. Data Structure (The 2,500-Page Matrix)
- **50 Roles** x **50 Locations** = **2,500 unique URLs**.
- **Route Structure:** `/templates/[role]-resume-builder-[location]`

## 4. Rendering Logic (ISR)
- **Static Generation:** Pre-render top 100 most popular pages at build time.
- **On-Demand:** Generate remaining 2,400 pages upon first visit.
- **Revalidation:** `revalidate: 604800` (1 week) background updates.

## 5. Content Quality
- **Variable Blocks:** Use Gemini to pre-generate multiple variations of role descriptions.
- **Dynamic Rotation:** Logic to select variations based on location to ensure textual uniqueness.
- **Deep Linking:** CTA buttons pre-fill the builder with the page's `role`.

## 6. Sitemaps & Indexing
- **Dynamic Sitemap:** Auto-generated `sitemap.xml` from the 2,500-combination matrix.
- **Canonical Tags:** Prevent duplicate content penalties.
- **JSON-LD:** `SoftwareApplication` and `HowTo` structured data for rich snippets.

## 7. Cloudflare Bandwidth Strategy
- **Edge Caching:** Configure "Cache Everything" for `/templates/*`.
- **Latency:** Target <100ms TTFB via global edge distribution.
