# SEO Specification & Optimization

## Overview

This document outlines the SEO strategy and implementation specifications for Frankie Resume AI to ensure maximum discoverability and organic traffic growth.

## Core SEO Objectives

1. **Organic visibility** for resume-builder related keywords
2. **Local SEO** targeting South African job seekers
3. **High-intent keyword capture** (e.g., "AI resume builder", "resume writing tool")
4. **Long-tail keyword targeting** for niche queries

## Technical SEO

### On-Page Optimization

- **Meta Tags:** Unique, compelling titles and descriptions for each page
- **Heading Structure:** Proper H1-H6 hierarchy
- **Schema Markup:** Implement JSON-LD for:
  - Organization schema
  - Product schema (resume builder)
  - LocalBusiness schema (South African focus)
  - FAQ schema (common resume questions)

### Performance & Core Web Vitals

- **Page Speed:** Optimize Next.js build for fast load times
- **Mobile Optimization:** Fully responsive design (already implemented with Tailwind)
- **Core Web Vitals:** Focus on:
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1

### URL Structure

- Clean, descriptive URLs
- Keyword-rich slugs where appropriate
- Consistent URL patterns across site

### About and Contact Pages

- Publish an indexable About page at `/about` titled "About Frankie Resume AI".
- Publish an indexable Contact page at `/contact` titled "Contact Frankie Resume AI".
- Publish Privacy and Terms pages at `/privacy` and `/terms`; link them in the global footer and payment flow.
- Include Frankie Resume AI's public name, purpose, creator Franklin Coetzee, and relevant contact information in page metadata and visible headings.
- Add About and Contact links to the global navigation and footer.
- Add Organization and WebSite structured data where appropriate; do not expose private admin credentials or sensitive identifiers.

## Content SEO

### Target Keywords (High Priority)

- AI resume builder with PDF export
- AI-powered resume writing
- Resume builder South Africa
- Resume builder with payment-gated PDF download
- AI resume generator

### Content Strategy

- **Blog/Resource Hub:** How-to guides for resume writing
- **FAQ Section:** Common questions about resume building and AI
- **Case Studies:** Success stories (user job placements)
- **Localized Content:** South African job market insights

### Internal Linking

- Link related guides and resources
- Use descriptive anchor text
- Create topic clusters around resume building

## Local SEO (South Africa Focus)

- **Location Pages:** Target major South African cities
- **Local Keywords:** Include "South Africa", city names in strategic places
- **Google Business Profile:** Set up and optimize if applicable
- **Local Backlinks:** Partner with South African job sites and career resources

## Off-Page Optimization

### Backlink Strategy

- Reach out to career blogs and resume resources
- Partner with job boards (LinkedIn, Indeed)
- Educational content for link generation
- Press releases for major milestones

### Social Signals

- Share valuable resume tips on social media
- Encourage user-generated content (success stories)
- Build community around the product

## Implementation Priority

### Phase 1 (MVP Launch)
- [ ] Core meta tags and descriptions
- [ ] Basic schema markup (Organization + Product)
- [ ] Mobile optimization verification
- [ ] sitemap.xml generation
- [ ] robots.txt configuration

### Phase 2 (Post-Launch)
- [ ] Blog/Resource section with SEO-optimized articles
- [ ] Expanded schema markup (FAQ, LocalBusiness)
- [ ] Backlink outreach campaign
- [ ] Internal linking structure refinement

### Phase 3 (Growth)
- [ ] Local SEO optimization for South African cities
- [ ] Advanced content marketing
- [ ] Technical SEO audits and improvements
- [ ] Competitive keyword analysis and response

## Monitoring & Analytics

### Tools & Setup

- **Google Search Console:** Monitor indexing and search performance
- **Google Analytics 4:** Track user behavior and conversions
- **Rank Tracking:** Monitor keyword positions (consider tools like SEMrush or Ahrefs)

### Key Metrics to Track

- Organic traffic growth
- Keyword rankings (target keywords)
- Click-through rate (CTR) from SERPs
- Conversion rate from organic traffic
- Bounce rate by landing page

## SEO Best Practices

- Keep content fresh and updated
- Avoid keyword stuffing
- Focus on user experience first, SEO second
- Ensure all redirects are properly configured
- Test changes and measure impact

## South Africa-Specific Considerations

- Use local language variants (e.g., "colour" vs "color")
- Include local currency (ZAR, R)
- Reference local job market trends
- Partner with local career resources
- Consider Afrikaans localization (future phase)
