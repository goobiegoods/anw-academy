# Academy 2.0 — Audit, Architecture, and Overnight Mission

Date: September 14, 2026

Branch: `academy-2.0-overnight-2026-09-14`

Baseline: `3262e3f9f789372af1bae9dfae3768a4fabdbabf`

## Executive assessment

The Academy is already valuable work. It is not a disposable prototype: it is a coherent full-stack institutional product with a strong visual identity, a broad academic domain model, 56 rendered pages, 20 API routes, six schools, 48 curricula, 288 composed lessons, assessments, student records, credentials, a practitioner network, and an administration surface.

The strongest transformation path is therefore selective. Preserve the institution, design system, curriculum taxonomy, lesson experience, and credential concepts. Strengthen the trust layer beneath them. The most important near-term gap is not visual polish; it is the difference between what the institution promises and what its authorization, assessment, evidence-labeling, and unfinished workflows currently guarantee.

Academy 2.0 should become an evidence-literate learning institution rather than merely a large wellness course catalog. Every meaningful claim should help a student understand whether it is established science, evidence-informed practice, an emerging research question, a traditional or historical framework, or a theoretical/speculative model. The Academy can teach traditions seriously without confusing historical importance with scientific validation.

## 1. Current-state audit

### Product footprint

- Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind 4.
- Prisma 7 with PostgreSQL/Supabase, plus Supabase Auth and Storage integration.
- Public institution: home, schools, school detail, programs, admissions, faculty, methodology, philosophy, founder, advisory board, calendar, practitioner network, and credential verification.
- Student institution: reading room, courses, modules, ten-card lessons, quizzes, exams, assignments, discussions, case studies, certifications, Wellness Units, resources, AI tutor, profile, transcript, and diploma.
- Practitioner institution: dashboard, clients, profile, resources, and continuing education.
- Administration: applications, students, schools, courses, content, certifications, case studies, faculty, discussions, support, and analytics.
- Static checks after dependency/client generation: TypeScript passes. Full-project ESLint reports nine pre-existing errors and 28 warnings; none are in this mission's changed files.
- Live public experience at baseline: responsive, coherent, fast to understand, and visually distinctive at desktop and mobile widths.

### What already works well

- **Institutional identity:** The seal, Latin motto, forest/gold/cream palette, editorial typography, restrained ornament, and transcript/diploma treatments create unusual cohesion and credibility.
- **Information architecture:** Six schools, departments, curricula, modules, lessons, assessments, WU, certifications, and student levels form a legible academic hierarchy.
- **Public homepage:** It communicates the Academy's scale, journey, philosophy, faculty, and verifiable credentials in a strong narrative sequence.
- **Lesson experience:** Ten-card lessons, read/swipe modes, objectives, teaching, primary-source quotations, vocabulary, scenarios, reflection, and assessment are an excellent learning interaction foundation.
- **Student identity:** Student number, record, transcript, diploma, public verification, and WU ledger make achievement feel institutional rather than gamified-only.
- **Assessment scaffolding:** Timed exams, cooldowns, rotated questions, server-side exam grading, case work, and capstones are the right conceptual pieces.
- **Safety intent:** Educational disclaimers, scope-of-practice reminders, contraindication language, referral boundaries, and explicit skepticism toward wellness overreach are present throughout the product.
- **Curriculum breadth:** All six schools contain substantive authored concepts, figures, terms, scenarios, cautions, and course progressions.
- **Recent implementation direction:** The latest work materially improved the homepage, faculty, reading room, records, credentials, and institutional pages. These should be built upon, not replaced.

### Material gaps and risks

#### Critical trust boundaries

1. `getCurrentUser()` silently falls back to the first student when session lookup or user mapping fails. On protected routes this can attribute reads and writes to the wrong student.
2. The practitioner route group checks only whether a session exists; it does not require the practitioner role. A student session can enter the practitioner portal.
3. Student and practitioner sign-out controls are links to `/login`; they do not terminate the Supabase session.
4. `/api/auth/register` accepts an arbitrary email and name without proving that the caller owns the corresponding authenticated identity.
5. `/api/ai-tutor` has no authentication, request-size limits, history limits, or abuse boundary before invoking a paid model.
6. Lesson completion accepts client-supplied score/answers and marks the quiz passed. The server does not independently prove mastery.
7. WU awards and profile totals are not one atomic, uniquely constrained ledger operation. Concurrent or repeated activity can produce inconsistent academic records.
8. Public student IDs and certificate numbers are sequential. Graduate lookup by student ID can expose a student's name and awards through enumeration.

#### Academic integrity and evidence literacy

1. The curriculum contains unusually honest caveats, but the evidence status of claims is embedded in prose rather than expressed as a consistent learning system.
2. Traditional frameworks, historical accounts, established physiology, emerging research, and disputed claims can appear with the same visual authority.
3. The AI tutor prompt asks for an authoritative, clinically grounded voice but does not require an explicit evidence classification or citations that distinguish source type from scientific support.
4. Lesson quizzes generated from composed content can reward recall of the Academy's framing without measuring source evaluation, evidence quality, or uncertainty.
5. Primary-source quotations are central to the brand, but citation metadata is not modeled deeply enough for edition, translator, chapter/section, stable link, or verification status.
6. The curriculum composer creates consistent depth and coverage, but repeated rhetorical templates across 288 lessons risk an industrial, synthetic learning feel. Bespoke content is strongest at the `focus`, themes, terms, cases, voice banks, and quotations; connective teaching prose needs progressive human editorial replacement.

#### Product completeness

1. The practitioner portal is mostly static sample data while its database models imply real client records. This creates both expectation debt and privacy/compliance risk.
2. Several admin areas are view-only or explicitly “coming soon”; case-study review is not yet operational.
3. Admissions collects applications but does not show requirements, decision stages, tuition/funding, cohort expectations, readiness criteria, or an applicant status experience.
4. Registration and admissions are separate flows without an explicit accepted-applicant invitation or enrollment contract.
5. Onboarding is absent: there is no orientation, readiness diagnostic, school selection confirmation, study-plan creation, accessibility preference, or first-week checklist.
6. Course enrollment and prerequisite logic are represented in the experience but not strongly modeled or enforced as academic policy.
7. Community is discussion-centric; cohorts, study groups, faculty office hours, announcements, events, moderation policy, and founder lessons are not first-class concepts.
8. Founder whiteboard lessons have no content model, recurrence model, archive, transcript, citations, or placement in the student journey.
9. Anatomy and physiology are not a shared foundational spine across the six schools.
10. The public site makes strong institutional promises (“faculty reviewed,” “lifetime access,” “publicly verifiable permanently”) before every operational workflow exists to sustain them.

#### Engineering and operations

1. There is no committed automated unit/integration test suite; existing browser scripts are operational diagnostics and depend on shared demo accounts.
2. Public demo credentials are displayed on the production login page. Seed and diagnostic scripts share a fixed password.
3. Admin authorization is inconsistent: middleware and layout use an email allowlist while some helpers also recognize the database `ADMIN` role.
4. Public application and support endpoints have no visible spam/rate controls or bounded input validation.
5. Many route handlers parse untrusted JSON without a shared schema, size limits, or normalized error model.
6. Some page renders create or update records, including lazy student profiles and certificate numbers. Reads should not unexpectedly become writes.
7. The home page and many institutional pages require live database access and force dynamic rendering, increasing availability coupling for content that changes infrequently.
8. The root layout loads Google Fonts twice—via `<link>` and CSS `@import`—instead of using one optimized font path.
9. There are no application-level `error`, `global-error`, `not-found`, or loading experiences.
10. The README includes a production deployment command beside destructive seed instructions without sufficiently prominent environment safety separation.

## 2. KEEP / POLISH / UPGRADE / ADD / REBUILD map

| Area | Decision | Direction |
|---|---|---|
| Brand, seal, motto, palette, editorial tone | **KEEP** | This is differentiated and credible. Protect it as the visual constitution. |
| Six-school institutional structure | **KEEP** | It gives the catalog shape and a strong mental model. |
| Homepage narrative and visual hierarchy | **POLISH** | Keep the composition; improve evidence promise, program clarity, and institutional proof. |
| Public school and curriculum discovery | **POLISH** | Add clearer level, prerequisites, outcomes, evidence mix, and sample-learning previews. |
| Lesson card reader | **KEEP + POLISH** | Preserve read/swipe modes; improve navigation semantics, evidence cues, notes, citations, and mastery feedback. |
| Curriculum prose pipeline | **UPGRADE** | Keep authored domain material; progressively replace generic composer connective prose with faculty-reviewed lessons. |
| Evidence communication | **ADD** | Introduce one Academy-wide evidence taxonomy visible in lessons, courses, search, AI answers, and faculty review. |
| Anatomy and physiology | **ADD** | Build a shared science spine before modality-specific interpretation. |
| Assessments and mastery | **UPGRADE** | Retain exams/cases/capstones; move all scoring and award decisions behind trustworthy server workflows and rubrics. |
| Wellness Units | **UPGRADE** | Preserve the motivating ledger; make awards transactional, idempotent, auditable, and tied to verified evidence. |
| Student identity, transcript, diploma | **KEEP + UPGRADE** | Preserve the institution-building concept; harden privacy, issuance, verification, and registrar controls. |
| Authentication and authorization | **REBUILD (boundary only)** | Do not replace Supabase; rebuild identity mapping and role enforcement around deny-by-default rules. |
| Admissions | **UPGRADE** | Connect application, review, acceptance, invitation, account creation, enrollment, and applicant status. |
| Onboarding | **ADD** | Add orientation, goals, diagnostic, learning plan, policies, accessibility, and first-week checklist. |
| Student dashboard / Reading Room | **KEEP + POLISH** | Strong recent work. Improve next-best-action logic and academic signals rather than redesigning. |
| AI Scholar | **UPGRADE** | Keep the companion; add authentication, limits, evidence labels, curriculum retrieval, citations, uncertainty, and escalation. |
| Community | **UPGRADE** | Grow discussions into cohorts, events, study groups, office hours, moderation, and mentor presence. |
| Faculty system | **KEEP + UPGRADE** | Strong foundation. Add academic ownership, review status, disclosures, course roles, and content approvals. |
| Founder whiteboard lessons | **ADD** | Model a recurring series with video, transcript, notes, sources, reflection, archive, and curriculum links. |
| Practitioner portal | **REBUILD or quarantine** | Current static client data should not masquerade as a live clinical system. Decide whether this is education, directory tooling, or regulated client-record software. |
| Administration | **UPGRADE** | Preserve broad navigation; add workflows, permissions, queues, audit history, bulk-safe operations, and content governance. |
| Error/loading/empty states | **ADD** | Add branded, calm recovery states across the institution. |
| Production operations | **ADD** | Establish environment boundaries, non-production seed policy, observability, backups, incident playbooks, and release gates. |

## 3. Academy 2.0 architecture and student journey

### Institutional architecture

Academy 2.0 should be organized into six layers:

1. **Institution layer** — public identity, schools, programs, faculty, admissions, policies, evidence standards, calendar, and credential verification.
2. **Identity layer** — applicant, accepted learner, student, mentor, faculty, practitioner-alumnus, registrar, content editor, support, and administrator roles with explicit permissions.
3. **Academic graph** — domains → schools → programs → curricula → modules → lessons → learning objects → claims → sources → assessments → competencies → credentials.
4. **Learning experience** — orientation, study plan, visual anatomy, lessons, labs/cases, notes, review, tutoring, community, office hours, and founder whiteboards.
5. **Mastery and records** — attempts, rubrics, feedback, competencies, WU ledger, standing, transcript, certification, diploma, continuing education, and revocation/correction history.
6. **Governance and operations** — admissions queues, content review, evidence review, faculty ownership, moderation, support, analytics, privacy, audit events, and releases.

### Evidence taxonomy

Every claim-bearing learning object should carry one primary status:

- **Established science** — supported by strong scientific consensus or replicated high-quality evidence.
- **Evidence-informed practice** — supported by meaningful but incomplete or context-dependent evidence.
- **Emerging research** — promising, actively studied, and not yet settled.
- **Traditional / historical framework** — taught for cultural, historical, or practice-system literacy; longevity is not presented as proof.
- **Theoretical / speculative** — a model or interpretation with limited direct evidence, taught explicitly as such.

Supporting metadata should include source type, citation, reviewed date, reviewer, known limitations, safety notes, and related/contrasting frameworks. “Disputed” and “deprecated/unsafe” should be available as warning overlays rather than primary categories.

### Student journey

1. **Discover** — understand the institution, outcomes, evidence standard, scope, time, cost, and sample learning before applying.
2. **Apply** — submit goals and readiness; see the steps, decision criteria, timeline, and privacy terms.
3. **Acceptance** — receive a secure invitation tied to the accepted application; create the student identity only after acceptance.
4. **Orient** — complete institutional orientation, academic integrity, scope and safety, evidence literacy, accessibility preferences, and technology readiness.
5. **Diagnose** — take a non-clinical knowledge/readiness diagnostic that recommends a starting level without overclaiming precision.
6. **Plan** — choose an initial school/program and receive a visible degree map with prerequisites, milestones, estimated pace, and next actions.
7. **Learn foundations** — complete the shared anatomy, physiology, research literacy, ethics, and safety spine.
8. **Study deeply** — progress through course modules using visual explanations, primary sources, evidence labels, retrieval practice, and cumulative review.
9. **Practice safely** — work through simulations and anonymized cases with red flags, contraindications, scope, and referral reasoning.
10. **Demonstrate mastery** — complete server-verified assessments, faculty-reviewed work, oral/teaching demonstrations, and capstones against published rubrics.
11. **Build scholarly identity** — participate in cohorts, discussions, founder whiteboards, office hours, and interdisciplinary synthesis.
12. **Earn and verify** — receive registrar-controlled records and credentials with privacy-preserving verification.
13. **Continue** — enter alumni/practitioner education, continuing education, mentor pathways, and credential maintenance.

### Founder whiteboard lesson system

A whiteboard lesson should be a first-class academic object, not a generic video post. Each release should include:

- episode title, series, release date, founder/faculty presenter, duration, and learning level;
- video plus searchable transcript and a clean board capture;
- three learning objectives, key concepts, evidence-status labels, citations, and safety notes;
- linked schools/courses/competencies;
- reflection or retrieval questions;
- optional discussion thread and faculty follow-up;
- editorial review state and revision history;
- archive, search, and “continue from this idea” links into the curriculum.

## 4. Top 10 improvements — impact vs effort

| Rank | Improvement | Impact | Effort | Decision |
|---:|---|---:|---:|---|
| 1 | Deny-by-default user mapping and role enforcement | Very high | Low | Do now |
| 2 | Real sign-out and removal of public shared credentials | High | Low | Do now |
| 3 | Authenticate and bound paid AI tutor access | Very high | Low | Do now |
| 4 | Publish the Academy evidence taxonomy and align AI answers to it | Very high | Low | Do now |
| 5 | Rebuild lesson completion and WU awards as server-verified, atomic academic events | Very high | Medium | Design now; implement next phase |
| 6 | Connect admissions → acceptance → invitation → onboarding → enrollment | Very high | Medium | Founder workflow approval first |
| 7 | Add the anatomy/physiology and evidence-literacy foundation spine | Very high | High | Academic design phase |
| 8 | Convert the curriculum composer into a faculty editorial pipeline | High | Medium–high | Staged program |
| 9 | Privacy-harden credential verification and registrar issuance | High | Medium | Founder/privacy decision first |
| 10 | Define and build recurring founder whiteboard lessons | High | Medium | Founder format decision first |

## 5. Exact improvements completed overnight

All work is confined to `academy-2.0-overnight-2026-09-14`; nothing was deployed and no production data was read or changed.

1. **Removed cross-student identity fallback.** `getCurrentUser()` now requires a verified Supabase identity and an exact Academy user record. Missing or failed identity resolution returns no user instead of silently becoming the first student.
2. **Enforced portal roles at the server layout boundary.** Student pages now require a student role; practitioner pages require practitioner or mentor; admins route to administration; mismatched roles are redirected safely.
3. **Implemented real sign-out.** Student and practitioner navigation now terminate the Supabase session, handle failure, and return to sign-in.
4. **Removed published shared credentials.** The login page no longer advertises the seeded demo account or password.
5. **Bound registration to verified identity.** Registration validates bounded input, requires a Supabase user, checks that the submitted and authenticated emails match, and provisions the Academy record only for that identity. Email-confirmation callbacks provision the same way and sanitize redirect targets.
6. **Protected the AI tutor boundary.** The endpoint now requires an Academy user, rejects invalid or oversized questions, limits conversation history and context, and fails cleanly when the model key is unavailable.
7. **Made the AI tutor evidence-aware.** Its institutional prompt now requires calibrated confidence, the Academy evidence taxonomy, explicit conflict handling, non-invented citations, and safety escalation without diagnosing or prescribing.
8. **Published the ANW Evidence Standard.** The methodology page now explains five distinct statuses—established science, evidence-informed practice, emerging research, traditional/historical frameworks, and theoretical/speculative models—in plain language.
9. **Set expectations inside the tutoring experience.** The Scholar screen now tells students that answers distinguish evidence types and that the tool cannot diagnose or replace licensed care.
10. **Improved low-cost accessibility.** Mobile navigation exposes its expanded state and controlled menu to assistive technology, tutor selectors have accessible labels, and reduced-motion preferences disable nonessential motion globally.

### Verification performed

- Prisma client generation: passed; no database connection or mutation.
- Strict TypeScript (`tsc --noEmit`): passed.
- ESLint across all changed application files: passed.
- Optimized Next.js production build: passed compilation, TypeScript, page-data collection, and static generation for all routes.
- Local rendered checks: methodology returned 200 with the complete five-level evidence section in reading order; login returned 200 with no demo credentials.
- `git diff --check`: passed.
- Full-project lint debt remains at nine pre-existing errors and 28 warnings, principally React purity/effect rules and small text/link cleanup outside this change set.

## 6. Screens/pages materially improved

- **Curriculum Methodology:** A new, prominent ANW Evidence Standard turns a safety aspiration into a visible institutional promise.
- **Academy Scholar:** Evidence-aware expectations are visible before a question is asked; the server behavior now matches that promise.
- **Login:** Shared demo credentials were removed, reducing account exposure and making the page institution-ready.
- **Registration:** Email-confirmation states are handled honestly; Academy identity is not created until the caller is authenticated.
- **Student and practitioner navigation:** Sign-out now ends the session rather than merely changing pages.
- **Student and practitioner route groups:** Wrong-role sessions no longer enter the wrong portal.
- **Mobile global navigation:** Menu state is now announced correctly to assistive technology.

## 7. Founder approval required

1. **Accreditation and terminology:** Which uses of “university,” “degree,” “diploma,” “official transcript,” “clinical,” “certification,” and practitioner titles are intended and legally reviewed in target jurisdictions?
2. **Admissions model:** Open self-enrollment, application-only, or acceptance plus invitation? What are the decision criteria, tuition, refund terms, and enrollment contract?
3. **Credential privacy:** Should public verification reveal names from a guessable student ID, or require a high-entropy verification code and/or graduate consent?
4. **Practitioner product boundary:** Is the portal an alumni directory/education product or a real client-record system? Real client records trigger a much larger privacy, security, retention, and compliance program.
5. **Evidence governance:** Who can assign and approve evidence labels? Which external standards and review cadence should govern them?
6. **Academic authority:** Who owns curriculum approval, assessment rubrics, case review, capstone review, appeals, corrections, and credential revocation?
7. **Founder whiteboards:** Cadence, live vs recorded format, intended academic weight, and whether episodes earn WU or remain enrichment.
8. **AI boundaries:** Whether the Scholar may personalize from student history, which sources it may use, and when it must defer to faculty or licensed care.
9. **Student community:** Real-name policy, moderation standard, age eligibility, privacy expectations, and escalation process.
10. **Foundational curriculum:** Required anatomy/physiology depth and the credentialed academic reviewers who will validate it.

## 8. Recommended next autonomous phase

After tonight’s boundary and evidence-layer improvements, the next autonomous phase should be **Academic Integrity Infrastructure**:

1. design server-authoritative lesson quiz attempts;
2. make WU events transactional and idempotent;
3. model prerequisites and competencies;
4. create an evidence-claim/source schema and editorial status;
5. add safe automated tests for identity, role access, grading, WU duplication, and credential ownership;
6. introduce non-production fixtures that never share production credentials;
7. add branded error/loading/not-found states and run a complete responsive accessibility pass.

No production deployment, production database access, production mutation, or secret handling belongs in that phase.
