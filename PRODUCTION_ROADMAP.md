# Syllaboom Production Roadmap

## Current State: 3.3/10 - NOT PRODUCTION READY

### Critical Gaps Identified
- No database (localStorage only)
- No authentication
- No payment verification
- Zero test coverage
- No monitoring/analytics
- No SEO optimization
- Generic error handling

---

## PHASE 1: FOUNDATION (Critical)

### 1.1 Database & Persistence
**Why**: Users lose everything on browser clear. Can't verify payments. No audit trail.

```
[ ] Install Prisma + PostgreSQL (Supabase or Neon for managed)
[ ] Schema design:
    - users (id, email, stripeCustomerId, createdAt)
    - purchases (id, userId, stripeSessionId, type, amount, createdAt)
    - study_guides (id, purchaseId, courseCode, data JSON, createdAt)
    - usage_logs (id, userId, endpoint, timestamp)
[ ] Migration scripts
[ ] Seed data for testing
[ ] Connection pooling for serverless
```

**Files to create/modify**:
- `prisma/schema.prisma`
- `src/lib/db.ts`
- All API routes (add DB calls)

### 1.2 Authentication
**Why**: Anyone can access results without paying. No user accounts.

```
[ ] NextAuth.js with:
    - Email magic link (primary)
    - Google OAuth (secondary)
    - Guest checkout with email capture
[ ] Session management
[ ] Protected routes middleware
[ ] Link Stripe customers to users
```

**Files to create**:
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/middleware.ts`
- `src/lib/auth.ts`

### 1.3 Payment Verification
**Why**: Currently no verification that user paid before showing results.

```
[ ] Webhook handler saves purchase to DB
[ ] Results page verifies purchase exists
[ ] Generate secure token on payment success
[ ] Token validation on guide access
[ ] Receipt emails via Resend/SendGrid
```

**Flow**:
```
Payment Success → Webhook → DB Insert → Redirect with token →
Verify token → Show results → Save to user account
```

### 1.4 Input Validation & Security
**Why**: No file size limits, no rate limiting, potential for abuse.

```
[ ] Zod schemas for all API inputs
[ ] File upload limits:
    - Max 10MB PDF
    - Max 50 pages
    - PDF mime type validation
[ ] Rate limiting middleware:
    - 10 uploads/hour per IP
    - 5 guide generations/hour per IP
    - 100 API calls/hour per IP
[ ] Sanitize LLM outputs (XSS prevention)
[ ] CSRF protection
[ ] Security headers (helmet equivalent)
```

**Files to create**:
- `src/lib/validation.ts`
- `src/middleware.ts` (rate limiting)

---

## PHASE 2: RELIABILITY & ERROR HANDLING

### 2.1 Structured Error Handling
**Why**: All errors currently return generic 500. Can't debug production issues.

```
[ ] Custom error classes:
    - ValidationError (400)
    - AuthenticationError (401)
    - PaymentRequiredError (402)
    - NotFoundError (404)
    - RateLimitError (429)
    - LLMError (503)
    - PDFParseError (422)
[ ] Error response format:
    {
      error: true,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests",
      retryAfter?: 3600
    }
[ ] Client-side error boundaries
[ ] Graceful degradation UI
```

**Files to create**:
- `src/lib/errors.ts`
- `src/components/ErrorBoundary.tsx`

### 2.2 LLM Fallbacks & Retry Logic
**Why**: LLM calls can fail, timeout, or return malformed JSON.

```
[ ] Retry with exponential backoff (3 attempts)
[ ] Model fallback chain:
    1. llama-3.3-70b-versatile (primary)
    2. gpt-4o-mini (fallback)
    3. claude-3-haiku (emergency)
[ ] Response validation before parsing
[ ] Partial success handling (some LLM calls fail)
[ ] Queue system for retries (Bull/BullMQ)
[ ] Timeout handling (per-call and total)
```

**Current pipeline stages to protect**:
1. Core extraction - MUST succeed
2. Analysis - Can degrade gracefully
3. Content - Can degrade gracefully
4. Strategy - Can degrade gracefully
5. Priority Intel - Already optional

### 2.3 PDF Parsing Robustness
**Why**: Scanned PDFs fail silently. Large PDFs timeout.

```
[ ] OCR fallback (Tesseract.js or cloud OCR)
[ ] Chunked processing for large PDFs
[ ] Better error messages:
    - "This PDF appears to be scanned. OCR processing..."
    - "PDF too large. Please upload under 50 pages."
    - "Could not extract text. Try a different PDF."
[ ] PDF validation before processing
[ ] Progress reporting for long operations
```

---

## PHASE 3: TESTING

### 3.1 Unit Tests
**Target**: 80% coverage on critical paths

```
[ ] Test framework setup (Vitest - faster than Jest for Vite/Next)
[ ] Tests for:
    - src/lib/openrouter.ts
      - JSON repair logic (all edge cases)
      - Fallback model switching
      - Error handling
    - src/lib/pipeline.ts
      - Orchestration flow
      - Partial failure handling
    - Date/time parsing
      - "MWF 2:00-3:00 PM" → structured
      - "10:00 AM" → time object
      - Timezone handling
    - Calendar ICS generation
      - RRULE formatting
      - Date formatting
      - Special characters escaping
    - Grade calculation (when implemented)
      - Weighted averages
      - Drop lowest
      - What-if scenarios
```

### 3.2 Integration Tests
```
[ ] API route tests:
    - POST /api/parse-syllabus (valid PDF, invalid PDF, too large)
    - POST /api/generate-guide (valid, timeout, LLM failure)
    - POST /api/create-checkout (valid, invalid email)
    - POST /api/webhook (valid signature, invalid, replay attack)
[ ] Database integration
[ ] Stripe test mode flows
```

### 3.3 E2E Tests (Playwright)
```
[ ] Happy path:
    1. Land on homepage
    2. Upload PDF
    3. Select pricing
    4. Complete Stripe checkout (test mode)
    5. View results
    6. Export calendar
    7. Export grades CSV
[ ] Error paths:
    - Invalid file type
    - Payment cancelled
    - Network failure during generation
[ ] Edge cases:
    - Browser back during checkout
    - Refresh during generation
    - Multiple tabs
```

### 3.4 Load Testing
```
[ ] Artillery or k6 scripts
[ ] Baseline metrics:
    - Homepage: < 200ms TTFB
    - PDF parse: < 5s for 20 pages
    - Guide generation: < 3min
    - Concurrent users: 50 simultaneous
[ ] Identify bottlenecks
[ ] Set alerting thresholds
```

---

## PHASE 4: CORE FEATURE COMPLETION

### 4.1 Grade Calculator - Full Implementation
**Current**: Structure only, no calculations

```
[ ] Calculate current grade from entered scores
[ ] "What do I need on final" calculator
[ ] Drop-lowest computation
[ ] Weighted category averages
[ ] Grade projection with confidence intervals
[ ] Interactive grade entry UI
[ ] Persist grades to user account
[ ] Grade goal setting and tracking
```

**Component**: `src/components/GradeCalculator.tsx`

### 4.2 Calendar Export - Hardening
**Current**: Basic ICS, no timezone, hardcoded semester length

```
[ ] Proper timezone handling (VTIMEZONE component)
[ ] Dynamic semester length (from syllabus dates)
[ ] Google Calendar direct integration (API)
[ ] Apple Calendar support verification
[ ] Outlook compatibility testing
[ ] Recurring event exceptions (holidays, breaks)
[ ] Study block suggestions
[ ] Reminder customization
```

### 4.3 Flashcard System
**Current**: Generated but not interactive

```
[ ] Spaced repetition algorithm (SM-2)
[ ] Interactive flashcard UI
[ ] Progress tracking
[ ] Export to Anki format
[ ] Confidence rating per card
[ ] Card editing/deletion
[ ] Add custom cards
```

### 4.4 Study Guide Enhancements
```
[ ] PDF export of full guide
[ ] Shareable links (with purchase verification)
[ ] Guide versioning (regenerate with updates)
[ ] Manual edits/annotations
[ ] Print-optimized view
```

---

## PHASE 5: MONITORING & OBSERVABILITY

### 5.1 Error Tracking
```
[ ] Sentry integration
    - Source maps upload
    - Release tracking
    - User context
    - Performance monitoring
[ ] Error grouping and alerting
[ ] Slack/Discord notifications for critical errors
```

### 5.2 Analytics
```
[ ] PostHog or Mixpanel setup
[ ] Events to track:
    - page_view (all pages)
    - pdf_upload_started
    - pdf_upload_completed
    - pdf_upload_failed (with reason)
    - pricing_selected (single/semester)
    - checkout_started
    - checkout_completed
    - checkout_abandoned
    - guide_generated
    - guide_generation_failed
    - calendar_exported
    - grades_exported
    - tab_switched (which tab)
    - feature_used (flashcards, calculator, etc)
[ ] Conversion funnel:
    Landing → Upload → Pricing → Checkout → Results
[ ] User properties:
    - First visit date
    - Number of guides generated
    - Total spend
```

### 5.3 Uptime Monitoring
```
[ ] Health check endpoint: GET /api/health
    - DB connection
    - OpenRouter API ping
    - Stripe API ping
    - Memory/CPU usage
[ ] External monitoring (UptimeRobot, Better Stack)
[ ] Status page
[ ] Incident response playbook
```

### 5.4 Performance Monitoring
```
[ ] Core Web Vitals tracking
[ ] API response time logging
[ ] LLM latency tracking per model
[ ] Database query performance
[ ] Bundle size monitoring
```

### 5.5 Logging
```
[ ] Structured JSON logging (pino)
[ ] Log levels: debug, info, warn, error
[ ] Request ID tracing
[ ] Log aggregation (Axiom, Logtail, or CloudWatch)
[ ] Log retention policy (30 days hot, 1 year cold)
```

---

## PHASE 6: SEO & DISCOVERABILITY

### 6.1 Technical SEO Foundation
```
[ ] Metadata optimization:
    - Dynamic titles per page
    - Meta descriptions
    - Open Graph tags
    - Twitter cards
[ ] Sitemap.xml generation
[ ] Robots.txt configuration
[ ] Canonical URLs
[ ] Structured data (JSON-LD):
    - Organization
    - Product (pricing)
    - FAQ
    - HowTo (3-step process)
[ ] Image optimization:
    - Next/Image for all images
    - WebP format
    - Alt text
    - Lazy loading
```

**File to create**: `src/app/sitemap.ts`, `src/app/robots.ts`

### 6.2 Performance for SEO
```
[ ] Core Web Vitals optimization:
    - LCP < 2.5s
    - FID < 100ms
    - CLS < 0.1
[ ] Server-side rendering for landing page
[ ] Static generation where possible
[ ] Font optimization (next/font)
[ ] Critical CSS inlining
[ ] Preconnect to external domains
```

### 6.3 Content SEO
```
[ ] Landing page copy optimization
[ ] H1/H2/H3 hierarchy audit
[ ] Internal linking structure
[ ] Blog section for organic traffic:
    - "How to read a syllabus"
    - "Study planning tips"
    - "Grade calculation explained"
    - "Best study techniques by subject"
[ ] University-specific landing pages (scalable)
[ ] Course-type landing pages (STEM, humanities, etc)
```

### 6.4 AI SEO (LLM Optimization)
**Why**: AI assistants (ChatGPT, Perplexity, Claude) are becoming search interfaces.

```
[ ] llms.txt file (emerging standard):
    /llms.txt - Machine-readable site description
    {
      "name": "Syllaboom",
      "description": "AI-powered study system generator from syllabus PDFs",
      "capabilities": ["syllabus parsing", "study guide generation", "calendar export"],
      "pricing": {"single": "$3", "semester": "$8"},
      "contact": "hello@syllaboom.com"
    }

[ ] Structured data for AI comprehension:
    - Clear product descriptions
    - Unambiguous pricing
    - Feature lists in parseable format

[ ] Content written for AI citation:
    - Factual, quotable statements
    - Clear definitions
    - Numbered lists and steps

[ ] FAQ optimization for AI:
    - Question format matches natural queries
    - Complete, standalone answers
    - Covers common variations

[ ] Brand mentions strategy:
    - Consistent naming: "Syllaboom"
    - Tagline: "Turn your syllabus into a study system"
    - Key phrases AI might surface
```

### 6.5 Local/University SEO (Future)
```
[ ] Google Business Profile (if applicable)
[ ] University partnerships for backlinks
[ ] Student forum presence (Reddit, Discord)
[ ] .edu backlink strategy
```

---

## PHASE 7: DEPLOYMENT & INFRASTRUCTURE

### 7.1 Environment Configuration
```
[ ] Environment variable validation at startup
[ ] .env.production template
[ ] Secrets management (Vercel env vars or Doppler)
[ ] Feature flags system (LaunchDarkly or simple)
```

### 7.2 Vercel Deployment
```
[ ] vercel.json configuration:
    - Function regions (us-east-1 for Stripe)
    - Cron jobs (if needed)
    - Redirects
    - Headers (security)
[ ] Preview deployments for PRs
[ ] Production deployment pipeline
[ ] Rollback procedures
[ ] Domain configuration
[ ] SSL/TLS verification
```

### 7.3 Database Hosting
```
[ ] Supabase or Neon PostgreSQL
[ ] Connection pooling (PgBouncer)
[ ] Automated backups
[ ] Point-in-time recovery
[ ] Read replicas (if needed)
```

### 7.4 CDN & Caching
```
[ ] Static asset caching (Vercel Edge)
[ ] API response caching (where appropriate)
[ ] Stale-while-revalidate patterns
[ ] Cache invalidation strategy
```

---

## PHASE 8: BUSINESS CONTINUITY

### 8.1 Backup & Recovery
```
[ ] Database backup schedule (daily)
[ ] Backup verification (monthly restore test)
[ ] Disaster recovery plan
[ ] Data export capability for users
```

### 8.2 Documentation
```
[ ] README.md overhaul
[ ] API documentation
[ ] Deployment guide
[ ] Environment setup guide
[ ] Incident response runbook
[ ] On-call procedures
```

### 8.3 Legal & Compliance
```
[ ] Privacy Policy
[ ] Terms of Service
[ ] Cookie consent (if using cookies)
[ ] GDPR compliance (if serving EU)
[ ] Data retention policy
[ ] User data deletion capability
```

---

## IMPLEMENTATION PRIORITY MATRIX

### P0 - Ship Blockers (Do First)
| Task | Effort | Impact | Risk if Skipped |
|------|--------|--------|-----------------|
| Database setup | 2 days | Critical | Data loss, no payment verification |
| Payment verification | 1 day | Critical | Revenue leakage |
| Basic auth | 2 days | Critical | Unauthorized access |
| Input validation | 1 day | High | Security vulnerabilities |
| Rate limiting | 0.5 day | High | Cost explosion from abuse |

### P1 - Launch Requirements
| Task | Effort | Impact |
|------|--------|--------|
| Error tracking (Sentry) | 0.5 day | High |
| Basic analytics | 0.5 day | High |
| Health check endpoint | 0.5 day | Medium |
| Technical SEO basics | 1 day | Medium |
| E2E tests (happy path) | 2 days | High |

### P2 - Post-Launch (Week 1-2)
| Task | Effort | Impact |
|------|--------|--------|
| Unit test coverage | 3 days | Medium |
| Grade calculator full | 2 days | High |
| Calendar timezone fix | 1 day | Medium |
| Logging infrastructure | 1 day | Medium |
| AI SEO (llms.txt) | 0.5 day | Medium |

### P3 - Growth Phase
| Task | Effort | Impact |
|------|--------|--------|
| Blog/content SEO | Ongoing | High |
| Flashcard interactivity | 3 days | Medium |
| PDF export | 2 days | Low |
| Google Calendar API | 2 days | Medium |

---

## TESTING CHECKLIST

### PDF Upload Edge Cases
```
[ ] Valid PDF, text-based
[ ] Valid PDF, scanned (OCR needed)
[ ] Valid PDF, mixed text/scanned
[ ] PDF with password protection
[ ] PDF with forms
[ ] PDF > 10MB
[ ] PDF > 50 pages
[ ] PDF with 0 extractable text
[ ] Corrupted PDF
[ ] Non-PDF file with .pdf extension
[ ] Image file renamed to .pdf
[ ] Empty file
[ ] File with special characters in name
[ ] Very long filename
[ ] Unicode filename
```

### Syllabus Content Edge Cases
```
[ ] Missing course code
[ ] Missing instructor name
[ ] No grading breakdown
[ ] Grading doesn't sum to 100%
[ ] No exam dates
[ ] Dates in various formats (MM/DD, DD/MM, written)
[ ] Multiple sections/instructors
[ ] Online vs in-person vs hybrid
[ ] Non-standard grading scale
[ ] Pass/fail course
[ ] Lab + lecture separate
[ ] Co-requisites mentioned
[ ] Prerequisites mentioned
[ ] Very short syllabus (1 page)
[ ] Very long syllabus (50+ pages)
[ ] Non-English syllabus
[ ] Multiple languages in syllabus
```

### Payment Edge Cases
```
[ ] Successful payment
[ ] Payment declined
[ ] Payment timeout
[ ] User cancels checkout
[ ] Duplicate webhook delivery
[ ] Webhook signature invalid
[ ] Webhook delayed (payment shows but guide not ready)
[ ] Refund requested
[ ] Chargeback
[ ] Currency mismatch
[ ] Stripe API down
```

### Calendar Export Edge Cases
```
[ ] Course with no meeting times
[ ] Course with multiple meeting patterns
[ ] Course with TBA times
[ ] Dates spanning year boundary
[ ] Holidays/breaks in middle
[ ] Daylight saving time transitions
[ ] Various calendar apps (Google, Apple, Outlook)
[ ] ICS file > 1MB
[ ] Special characters in event titles
[ ] Very long event descriptions
```

### Grade Calculator Edge Cases
```
[ ] All categories have items
[ ] Some categories empty
[ ] Drop lowest with only 1 item
[ ] Weights don't sum to 100
[ ] Extra credit category
[ ] Negative points possible
[ ] Very small weights (0.5%)
[ ] Very large weights (50%+)
[ ] Curved grading scale
[ ] Non-standard grade letters
```

---

## SUCCESS METRICS

### Launch Criteria
- [ ] Zero critical bugs in E2E tests
- [ ] < 5s PDF processing for 20-page syllabus
- [ ] < 3min guide generation
- [ ] 99% uptime over 1 week staging
- [ ] All P0 tasks complete
- [ ] Security audit passed

### Week 1 Targets
- [ ] 100 guides generated
- [ ] < 5% error rate
- [ ] < 10% checkout abandonment
- [ ] Zero data loss incidents
- [ ] < 1min average support response

### Month 1 Targets
- [ ] 1,000 guides generated
- [ ] 500 paying customers
- [ ] < 2% refund rate
- [ ] 99.9% uptime
- [ ] Core Web Vitals all green

---

## ESTIMATED TIMELINE

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 1 week | None |
| Phase 2: Reliability | 3 days | Phase 1 |
| Phase 3: Testing | 1 week | Phase 1-2 |
| Phase 4: Features | 1 week | Phase 1 |
| Phase 5: Monitoring | 2 days | Phase 1 |
| Phase 6: SEO | 3 days | Phase 1 |
| Phase 7: Deployment | 2 days | Phase 1-6 |
| Phase 8: Business | 2 days | Phase 7 |

**Total: ~4 weeks to production-ready**

---

## QUICK WINS (Can Do Today)

1. **Add health check endpoint** (30 min)
2. **Add file size validation** (30 min)
3. **Add rate limiting** (1 hour)
4. **Setup Sentry** (1 hour)
5. **Add basic meta tags** (30 min)
6. **Create llms.txt** (15 min)
7. **Add robots.txt** (15 min)
8. **Add sitemap** (30 min)

---

*Generated: 2026-01-09*
*Status: Planning Phase*
*Next Review: After Phase 1 completion*
