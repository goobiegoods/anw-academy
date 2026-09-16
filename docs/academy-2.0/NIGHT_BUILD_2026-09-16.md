# Academy 2.0 — Operating University Night Build

Date: September 16, 2026

Branch: `academy-2.0-night-build-2026-09-16`

Base: `7e036e3069a8a98ff235bb0e58ee3d1f47c2a6a1`

## Executive outcome

Before this build, the Academy already had a strong public institution, six real schools, a large seeded curriculum, authenticated student/admin/practitioner areas, lesson delivery, an evidence-aware Scholar, the Human Body Atlas proof, assessment and record models, diploma verification, and the Phase 2 distinction between completion, evidence, competency, and WU.

However, several important lifecycle connections were not operating truthfully: Coursework was entirely simulated; Case Studies displayed a fabricated approved record; zero-enrollment students could see assessments and discussions; academic actions reconstructed state independently; Scholar trusted client-declared context; required courses were ignored during credential awards; and the existing Announcement model had no institutional surface.

After this build, the Academy has a migration-free operating spine:

- one bounded Student Snapshot connects enrollments, lessons, submissions, assessments, faculty-reviewed work, WU, and credential requirements;
- an Academic Plan turns recorded activity into a truthful next-action queue and visible institutional journey;
- Scholar receives authoritative server-built academic context rather than trusting the browser;
- Coursework and Case Studies show real records instead of mock achievements;
- academic access is enforced consistently at student listings and write boundaries;
- exam finalization and first-pass WU are atomic and report actual awards;
- required courses now participate in credential award checks;
- Student Life and Reading Room announcements activate a durable communications rail.

This is not a complete university yet. It is a materially more coherent and honest one.

## Architecture and dependency map

```text
Public institution
  ↓
Applicant identity → admissions decision → secure invitation
  ↓
Student identity → orientation/preferences → academic plan
  ↓
Enrollment/access policy
  ↓
School → Course → Module → Lesson / Atlas / Lab / Whiteboard / Discussion
  ↓
Assessment attempt / coursework / case / capstone / human review
  ↓
Academic evidence → competency interpretation (future, rebuildable)
  ↓
WU participation record + dashboard actions + Scholar context
  ↓
Transcript / standing / credential requirements
  ↓
Registrar issuance → diploma → graduation
  ↓
Alumni / mentorship / continuing education → Practitioner OS bridge
```

Cross-cutting rails: evidence and safety governance, faculty review queues, announcements, accessibility, privacy, and auditability.

The new Student Snapshot is deliberately a read model over existing tables. It does not claim to be an immutable academic-event ledger and does not persist inferred mastery.

## Meaningful systems improved

### Student journey and intelligent onboarding foundation

- Added `/dashboard/academic-plan`.
- Shows identity, active study, Human Body foundation, verified completion, faculty-reviewed practice, and credential pathway as one journey.
- Produces next actions from real recorded activity rather than a generic checklist.
- Provides a safe foundation for later onboarding preferences and placement without inventing admissions policy.

### Academy Scholar

- Added a bounded server-only academic context builder.
- Current studies, verified lesson completions, recent assessment evidence, approved cases/capstones, and WU semantics are injected by the server.
- Client school/course selections are honored only when they match an active enrollment.
- Scholar still cannot award WU, change mastery, diagnose, or persist health inference.

### Coursework

- Removed the four fabricated assignments and client-only submissions.
- Loads assignments only from active enrolled courses.
- Supports bounded draft saving and submission using the existing `AssignmentSubmission` model.
- Shows only real review status and feedback.
- Does not claim WU before faculty approval.

### Case studies

- Removed the fabricated approved seasonal-allergies case.
- Lists authenticated student records from the database.
- Connects to the existing safe case-submission workflow.
- Makes the anonymization/privacy boundary prominent.
- Shows actual feedback/WU only when recorded.

### Academic access and assessments

- Added one course/school access context and pure access policies.
- Fixed the zero-enrollment disclosure of all discussions and assessments.
- Enforced active enrollment at lesson completion, discussion posting, coursework submission, and exam start.
- Exam start now rejects invalid bodies, inaccessible quizzes, empty pools, active duplicate attempts, and cooldown violations.
- Exam submission requires the exact assigned answer set and uses one serializable transaction for attempt finalization plus first-pass WU.
- API responses return actual `wuAwarded`, not merely configured value.
- Discussion replies must belong to the same discussion; original/reply award domains no longer collide.

### Credentials and records

- Credential award checks now include `Certification.requiredCourses` and require every lesson in each required course to be completed.
- Academic Plan exposes requirement sets without calling WU mastery.
- Student Snapshot explicitly calculates profile/ledger drift as `unreconciled`; no production reconciliation or destructive correction was attempted.

### Student life and communications

- Added admin announcement publishing using the existing `Announcement` table.
- Added `/dashboard/student-life` with announcements and links to the Forum, Calendar, Faculty, and Support.
- Added recent announcements to the Reading Room.
- No email, push notification, deletion, scheduling, or production announcement was performed.

## Visual evidence

Materially changed routes:

- `/dashboard/academic-plan`
- `/dashboard/assignments`
- `/dashboard/case-studies`
- `/dashboard/student-life`
- `/dashboard` announcement preview
- `/admin/announcements`

No production or shared credentials were used to manufacture screenshots. These routes depend on authenticated, database-backed state; a safe non-production database/login was not available in this workspace. The optimized build validates all route boundaries. Screenshot capture remains a required pre-merge task in an authenticated preview environment.

## Verification

- Strict TypeScript: passed.
- Existing Phase 2 academic-integrity suite: passed.
- New academic-domain policy suite: passed.
- Changed-file ESLint: passed.
- `git diff --check`: passed.
- Next.js 16.2.7 optimized production build: passed; all 36 static pages generated and all new dynamic routes compiled.
- No schema migration created or applied.
- No production data read/write, deployment, merge, email, notification, or credential action performed.

## Founder decisions

1. Is the Academy open-registration or acceptance/invitation only?
2. What creates initial enrollment, and which Human Body units are mandatory or challengeable?
3. What are the prerequisite rules for course, school-final, and cross-school access?
4. What combination of server scores and human-reviewed evidence constitutes demonstrated competency or mastery?
5. Does WU remain participation/academic-credit recognition, separate from competency? Recommended: yes.
6. Who may review assignments, labs, cases, and capstones; under what rubric, turnaround, appeal, and WU rules?
7. Should credentials be auto-issued or registrar-approved, and how are standing, correction, revocation, and reissue handled?
8. Which announcement audiences exist, and who may publish/schedule urgent notices?
9. What Scholar learning signals may persist, for how long, and under what student controls?
10. What defines graduate/alumni eligibility and the legal boundary of the Practitioner OS bridge?

## Remaining gaps ranked by impact

1. **Admissions → invitation → identity → initial enrollment** — highest institutional gap; founder policy required.
2. **Faculty review operations** for assignments, labs, cases, and capstones — rubrics/authority required.
3. **Read-only production integrity preflight** for WU, duplicate sources, profiles, certifications, and historical progress.
4. **Immutable AcademicEvent and CompetencyEvidence model** after reconciliation and mastery approval.
5. **Registrar-grade credential issuance and standing** instead of page-triggered automatic awards.
6. **Human Body common-core breadth** beyond the lymphatic proof slice.
7. **Real founder-whiteboard publication workflow** with recording, transcript, board capture, sources, accessibility, and placements.
8. **Lab evidence submission/review** based on the Phase 2 safety-tier contract.
9. **Cohorts, events, office hours, mentorship, and notification delivery.**
10. **Graduation, alumni, and continuing-education state machine**, followed by the Practitioner OS bridge.

## Exact recommended next build

**Phase 4: Admissions-to-Enrollment + Faculty Review Operating Loop**

After the founder answers the admissions and reviewer-policy questions:

1. implement accepted-applicant invitation tokens and state transitions;
2. add a short orientation/readiness profile the student can view and edit;
3. create explicit program/course enrollment with prerequisite policies;
4. add one shared faculty review queue and versioned rubric contract for assignment, Tier 0 lab, case, and capstone evidence;
5. run a read-only production integrity report;
6. only then design the additive AcademicEvent/Competency migration and registrar workflow.

This phase should use the Student Snapshot as the projection boundary and keep AI observations outside authoritative records.
