# Academy completion audit and development handoff

Branch: `academy-completion-2026-11-03`  
Target: Vercel project `anw-academy`, team `goobie`, preview only.  
Production, production database, production environment variables and production domains were not modified.

## Recovery audit

| Branch | Audited head | Result |
|---|---|---|
| `master` | `641261b` | Earlier dashboard, administration and cache fixes; already incorporated in main. |
| `main` | `3262e3f` | July production baseline; Oxford identity, seal, faculty, student IDs, academic record, diploma and public verification. |
| `academy-2.0-overnight-2026-09-14` | `a8c21af` | Identity and trust-boundary fixes, evidence standard. |
| `academy-2.0-phase-2-lymphatic-atlas-2026-09-16` | `7e036e3` | Human Body foundation spine, lymphatic Atlas teaching slice, server lesson grading and WU integrity. |
| `academy-2.0-night-build-2026-09-16` | `3d842fc` | Latest existing development head; includes all preceding work, student snapshot/academic plan, assignments, announcements and academic-access controls. Used as recovery base. |

All five repository branches were enumerated. No later development branches were present at audit time. Vercel deployment records confirmed production was still the July main build; September work existed in three READY previews. The current public homepage was also inspected in the browser. Counts were six schools, 48 courses, 288 lessons and eight credential definitions. Older five-school/16-course planning notes do not describe the implemented catalog.

## Implemented in this branch

- **Lesson journey:** repaired the actual active lesson page, which previously sent only a lesson ID to an answers-required API and claimed success even after rejection. Client and server now select the same assessment questions, submit actual answers, require persisted server success, and update enrollment progress. Direct URLs enforce enrollment and preceding lessons.
- **Identity and administration:** verified Supabase identity remains authoritative. Shared admin guards now support a server-stored ADMIN role consistently across layouts and APIs. Email-only allowlisting additionally requires confirmed email. Refreshed session cookies survive redirects. Callback redirects reject protocol-relative and backslash destinations. Interrupted registration can repair an Academy profile through an authenticated POST; provisioning uses upsert.
- **Student record:** real transactional profile persistence, current-password verification followed by Supabase password update, no direct email/role edits. Viewing profiles, transcripts, credentials or diplomas no longer creates or awards academic records. A hardcoded claim of good academic standing was removed.
- **Registrar:** administrators can grant published-course access from the student detail page. Required course selections can be configured per credential. Explicit credential issuance checks completed required lessons, case/capstone requirements, WU ledger consistency and student identity in a serializable transaction. Empty course requirements block issuance. Issued diplomas remain owner-only and public certificate verification uses actual awarded records.
- **Faculty review:** a real Review Room for coursework, case studies and capstones, with complete submission text, required feedback, explicit human decisions, and atomic decision/WU records. Replaying an approval cannot award more WU. Case awards are bounded at the existing 10–25 WU; capstones use the existing published 50 WU policy.
- **Practitioner workspace:** removed fictional clinician identities, clients, sessions, certifications and follow-ups. Added owned client intake, durable session notes and follow-up dates, real directory profile persistence, approval-pending edits and real dashboard metrics. Another practitioner's record returns 404. Practitioner academic access is available through Academic Studies. Replaced nonexistent resource download cards with usable intake, notes and communication references.
- **Scholar:** relevant instructional lesson excerpts are retrieved from the student's actual enrolled coursework, with Academy lesson links and source labels. Assessment answers are excluded from retrieval. Missing relevant material produces a grounded refusal rather than an invented Academy citation. Paid model calls were not exercised.
- **Tuition plumbing:** authenticated course checkout using server-configured one-time Stripe Price IDs, explicit test/live key policy, signed/timestamp-bounded webhook verification, order/amount/currency/identity matching, and atomic paid-order/enrollment persistence. Browser return URLs never unlock coursework. Billing remains disabled until pricing, test credentials, schema and webhook configuration are explicitly supplied. No Stripe account, product, price, charge or subscription was created.
- **Preview safety:** unconfigured previews reject mutations, including the auth callback, and serve the versioned authored catalog without inventing student or faculty records. A preview notice and service-status page distinguish catalog availability from configured services.
- **Database security:** prepared server-only Prisma Data API lockdown for every application table, including the tuition table. It enables RLS and revokes `anon`/`authenticated` direct table access. No invented `auth.uid()` policies: these Prisma user IDs are not Supabase Auth IDs. No migration was applied remotely. Legacy destructive seed now requires explicitly naming a disposable isolated target.
- **Presentation:** retained the forest, parchment and gold palette, institutional serif typography, seal and motto. Practitioner navigation now supports narrow viewports. Homepage school icon identifiers now render as icons rather than raw strings; displayed lesson count comes from actual curriculum.

## Verification and its limits

`npm run test:journeys` uses a disposable in-memory PostgreSQL engine with the production Prisma schema and a deliberately local HTTP identity fixture. It calls actual Next routes and inspects persisted records. It does not substitute for hosted Supabase Auth verification, confirmation/reset emails, real Stripe checkout or browser interaction testing.

The 18 passing assertions cover anonymous access, student/admin boundaries, DB ADMIN access, CSRF, profile persistence and privilege rejection, unenrolled lesson rejection, registrar enrollment, lesson URL prerequisites, server grading/progress/WU idempotency, exam secrecy/ownership/replay, faculty review idempotency, cross-practitioner access rejection, client/session persistence, directory self-verification prevention, read-only academic views, credential requirements/issuance/diploma ownership/public verification, signed payment webhook enrollment/idempotency/forgery rejection, and the prepared RLS migration.

The inherited academic-domain and academic-integrity assertion suites pass. Request/redirect/payment-signature security assertions were added. The framework was patched from Next.js 16.2.7 to 16.4.5 and Prisma packages aligned at 7.10.1; production dependency audit reports zero known vulnerabilities after remediation. TypeScript, lint and production build are required before handoff. Lint reports existing warnings separately; passing lint is not proof of full accessibility or medical-content quality.

## Remaining launch blockers

1. **Isolated Academy backend:** Vercel variables were present only for production. No preview Supabase URL, client key or database URL was configured. The connected Supabase account lists only `atlas-production`; it does not expose the Academy project. Do not copy production database access into Preview. Connect the Academy account and identify an existing no-cost isolated backend, or approve a separate environment before any expense.
2. **Hosted security verification:** a prior context report mentioned an Academy RLS alert, but the actual Academy advisors/tables could not be inspected through the available Supabase connection. Do not claim the production issue is fixed. Review and validate the prepared migrations on the isolated backend, then obtain separate production-change approval.
3. **Curriculum governance:** all 48 course outlines and 288 authored/composed lesson definitions are preserved; this is not independent faculty verification of every scientific claim, historical quotation, source or teaching sequence. The body Atlas remains a lymphatic proof slice plus its existing eight-unit foundation spine, not a completed interactive atlas of every body system. Human faculty must review the evidence and credential coursework mappings before institutional launch.
4. **Hosted student journeys:** registration, email confirmation, recovery, real student login/session refresh, actual enrollment through a hosted preview, and hosted migration compatibility need verification against the isolated Academy backend. The local identity fixture is not a real Supabase server.
5. **Tuition:** exact course prices, approved terms/refund policy, test Stripe credentials, course-to-price mappings, webhook configuration and a real Stripe test checkout are still required. Refund/cancellation operations are not implemented. Live billing is disabled unless explicitly enabled in a production deployment after approval.
6. **Practitioner lifecycle:** the private workspace and directory edit workflow are implemented, but graduate-to-practitioner provisioning and directory approval operations still require registrar administration. Scheduling is follow-up dates and optional external booking links, not a calendar sync or client-facing scheduling/consent portal. Multi-reviewer audit/event history requires a further schema and policy decision.
7. **Communications and AI:** email delivery is not configured/verified. Scholar retrieval is implemented, but paid generation quality, retrieval relevance across the full catalog and model failure behavior require authorized nonproduction evaluation. No new AI usage was incurred.
8. **Browser evidence:** desktop/mobile public preview checks and actual authenticated browser journeys must be recorded separately from HTTP/database integration assertions.

## Nonproduction configuration

Set only after validating that each value belongs to the isolated Academy environment:

- `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANW_PREVIEW_BACKEND_ENABLED=true` (leave unset until isolation is verified)
- `ANW_DB_POOL_MAX` (optional, defaults to 4)
- `STRIPE_SECRET_KEY=sk_test_…`, `STRIPE_WEBHOOK_SECRET`, `ANW_COURSE_PRICE_IDS` (JSON map of course slug to test `price_…` ID)
- `ANTHROPIC_API_KEY` only with usage authorization; absence disables paid Scholar calls

Apply `20261103235900_tuition_orders.sql` before `20261104000000_lock_down_prisma_data_api.sql` to a compatible isolated database. The second migration deliberately denies direct Data API table access; server Prisma uses a privileged server-only connection. Review legacy seed behavior before using it; it deletes existing records and Auth identities and must never run against production.

Do not merge this branch or promote its deployment until these blockers are resolved and release approval is given.
