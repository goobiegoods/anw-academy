# Academy 2.0 Night Build Ledger

Date: 2026-09-16
Branch: `academy-2.0-night-build-2026-09-16`
Base: `7e036e3069a8a98ff235bb0e58ee3d1f47c2a6a1`

This ledger records reversible decisions made during the autonomous build. It does not represent production changes.

## Dependency map

`Public institution → applicant identity → admissions decision → student identity → orientation/path → enrollment/access → curriculum + Atlas → assessment/human review → academic evidence → WU/records → credential/registrar → graduation → alumni/CE → Practitioner OS bridge`

Cross-cutting rails: evidence and safety governance, faculty review queues, communications, Scholar context, accessibility, and auditability.

## Checkpoint 00 — choose the operating spine

- **Discovered problem:** The Academy has many strong surfaces, but important lifecycle state is reconstructed independently. Coursework and case-study pages contain simulated records despite real database models; exams/discussions leak availability when a student has no enrollment; Scholar trusts client-declared course context; announcements are modeled but unused.
- **Decision:** Prioritize one migration-free academic journey/read model, honest human-reviewed work queues, enrollment enforcement, bounded Scholar context, and institutional communications. Do not add a new academic-event schema tonight.
- **Why it matters:** These foundations connect multiple later systems without declaring incomplete historical data canonical or requiring founder policy.
- **Implementation:** In progress.
- **Verification:** Pending focused tests, type-check, lint, production build, and local responsive inspection.
- **Deferred work:** Admissions invitation policy, initial enrollment, mastery thresholds, registrar issuance, production WU reconciliation, alumni eligibility, and Practitioner OS remain founder-gated.

## Reassessment rule

At each major system boundary, ask: **Is the next task still the highest-leverage thing we can safely accomplish without the founder?** Continue only when the answer is yes.

## Checkpoint 01 — make the student journey legible

- **Discovered problem:** No surface explained how identity, study, the Human Body foundation, assessment evidence, reviewed practice, and credentials fit together. Scholar context was supplied by the client instead of authoritative academic state.
- **Decision:** Add a migration-free Student Snapshot, pure course/credential/WU policies, an Academic Plan, and a bounded server-only Scholar context packet.
- **Why it matters:** One read model can later power onboarding, dashboard prioritization, mentoring, records, graduation, alumni, and continuing education without persisting AI inference or inventing mastery.
- **Implementation:** Added `lib/academics/*`, `/dashboard/academic-plan`, navigation, and server-grounded Scholar context. Credential requirements now include required courses; WU drift is labeled unreconciled rather than hidden.
- **Verification:** Pure academic-domain assertions and strict TypeScript pass.
- **Deferred work:** Persistent onboarding preferences, competency state, registrar standing, and academic-event storage require policy/reconciliation.

## Checkpoint 02 — remove simulated academic work

- **Discovered problem:** Coursework was entirely mock client state, and Case Studies displayed a fabricated approved record despite real models and submission APIs.
- **Decision:** Replace both with authenticated database-backed student surfaces using existing tables only.
- **Why it matters:** These are credential-bearing, human-reviewed activities. Simulated records undermine the institution more than a missing feature would.
- **Implementation:** Coursework now loads assignments only from active enrollments, supports bounded draft/submission persistence, and shows real review status/feedback. Case Studies now lists only the student’s real submissions and links the existing safe submission form. No WU is claimed before recorded approval.
- **Verification:** Type-check and route validation pass; production build pending.
- **Deferred work:** Assignment and case approval queues need a founder-approved reviewer role/rubric. Case WU remains 10–25 and cannot be auto-awarded responsibly without that rubric.

## Checkpoint 03 — enforce academic access and assessment integrity

- **Discovered problem:** Zero-enrollment students could see all discussions and assessments. APIs did not consistently enforce enrollment. Exam attempts could be empty or duplicated, submission and WU recording were separate, and responses implied configured rather than actual awards.
- **Decision:** Centralize enrollment access, fail closed, and make exam finalization atomic without inventing prerequisite policy.
- **Why it matters:** This protects student records and ensures UI availability, server authorization, assessment evidence, and WU recognition agree.
- **Implementation:** Added course/school access helpers; fixed listings; enforced enrollment for lesson completion, discussions, and exams; hardened request parsing; blocked empty/active attempts; required exact answer sets; atomically finalized exam + first-pass WU; returned actual WU. Discussion replies must target the same discussion and report actual awards.
- **Verification:** Access/answer/active-attempt policy assertions pass; integration build pending.
- **Deferred work:** School-final prerequisites, retake policy, and enrollment creation remain founder-gated.

## Checkpoint 04 — activate student life

- **Discovered problem:** The public calendar promised Reading Room announcements, but the existing `Announcement` model had no publishing or student surface.
- **Decision:** Add durable admin publishing, Student Life, and a Reading Room notice preview with no email, deletion, or audience expansion.
- **Why it matters:** One communications rail supports orientation, office hours, founder whiteboards, deadlines, graduation, and urgent institutional notices.
- **Implementation:** Added `/admin/announcements`, authenticated create API, `/dashboard/student-life`, navigation, and dashboard notices.
- **Verification:** Type-check pending after final reconciliation.
- **Deferred work:** Cohorts, events, notification delivery, archival, scheduling, and role-specific audiences need policy and schema.

## Final leverage reassessment

The next candidate tasks—admissions gating, automatic enrollment, case-review awards, registrar standing, competency migrations, founder-whiteboard publication, alumni eligibility, and Practitioner OS work—now cross explicit founder or production-data boundaries. Autonomous high-confidence implementation is exhausted after verification, documentation, and visual QA.
