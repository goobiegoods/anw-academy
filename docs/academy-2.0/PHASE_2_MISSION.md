# Academy 2.0 — Phase 2 Architecture and Proof Slice

Date: September 16, 2026

Branch: `academy-2.0-phase-2-lymphatic-atlas-2026-09-16`

Base: `academy-2.0-overnight-2026-09-14` at `a8c21af3a8c30d637c3e45a891a08b912f09d145`

## Executive understanding

The Academy of Natural Wellness is a lifelong institution for understanding the human being and becoming deeply educated in natural wellness. It is not merely an LMS and should not be reorganized around whatever course a student happens to be taking today.

The existing school → course → module → lesson structure remains valuable for sequence, enrollment, records, and credentials. Academy 2.0 adds a cross-curricular academic layer beneath and between those containers:

- a shared Human Body and Evidence Literacy spine beneath every school;
- a curated Body/Knowledge Atlas that makes relationships navigable;
- practical learning that produces evidence of understanding;
- recurring founder whiteboards treated as academic objects;
- server-authoritative assessment and an honest academic record;
- an Academy Scholar that uses a compact, rebuildable view of relevant student learning rather than replaying a lifetime of chat.

The central product principle is **progressive depth**. A complete beginner should acquire a correct mental model quickly. A nurse, therapist, herbalist, or experienced practitioner should then be able to keep descending into mechanism, cross-system relationships, evidence limits, safety, practical reasoning, and primary sources without entering a separate “advanced version” of the Academy.

## Phase 2 decision map

| Area | Decision | Phase 2 expression |
|---|---|---|
| Existing six schools and curriculum | **KEEP** | Remain the institutional departments and sequenced study containers. |
| Human Body / Anatomy / Physiology | **ADD** | An eight-unit common-core spine, not a seventh school. |
| Knowledge navigation | **ADD** | A curated Atlas layer over concepts, claims, sources, learning objects, and competencies. |
| Evidence labeling | **UPGRADE** | Evidence status belongs to individual claims, never a whole concept, herb, or tradition. |
| Lesson completion | **UPGRADE** | Final assessment is re-graded on the server from canonical lesson content. |
| Wellness Units | **UPGRADE** | New awards are transactionally recorded and source-deduplicated; the student page now shows real recorded data. |
| “Mastery” language | **POLISH** | Existing completion evidence is called completed, not mastered. |
| Labs | **ADD** | One scalable protocol contract plus a Tier 0 non-intervention proof lab. |
| Founder whiteboards | **ADD (architecture)** | A production-ready academic object and real first-episode brief; no fake video or ghost lesson. |
| Academy Scholar | **UPGRADE (architecture + entry)** | Atlas prompts can open the Scholar prefilled; the compact Student Intelligence architecture is specified for the next data phase. |
| Graph database / 3D anatomy / generic ontology editor | **DO NOT BUILD** | Premature engineering before one curated slice proves the vocabulary and student experience. |

## Exact Academy 2.0 academic architecture

### 1. Institutional course layer — preserved

`School → Department → Course → Module → Lesson → Assessment → Record → Credential`

This remains the official curricular sequence and transcript structure.

### 2. Shared Human Body spine — added beneath the schools

1. **HB-01 · How We Know** — evidence literacy, terminology, scale, safety, homeostasis, and the distinction between scientific and traditional models.
2. **HB-02 · Cells, Tissues & Compartments** — cells, connective tissue, membranes, extracellular space, and body fluids.
3. **HB-03 · Support & Movement** — skeleton, joints, muscle, fascia, and skin.
4. **HB-04 · Transport & Defense** — cardiovascular, lymphatic, and immune systems.
5. **HB-05 · Control & Communication** — nervous and endocrine systems, stress physiology, and mind-body signaling.
6. **HB-06 · Intake, Transformation & Energy** — respiration, digestion, liver, metabolism, and microbiome.
7. **HB-07 · Balance, Elimination & Life Course** — renal function, fluids/electrolytes, reproduction, development, and aging.
8. **HB-08 · Whole-Person Integration** — sleep, movement, nutrition, psychology, environment, and bridges into all six schools.

Every system uses one academic grammar:

`Orient → Locate → Name → Explain function → Connect systems → Compare frameworks → Practice safely → Demonstrate understanding`

### 3. Academic Atlas / knowledge layer

The tested Phase 2 contract uses typed, reviewed content. The later normalized model should contain:

- **AcademicConcept** — a system, structure, process, substance, plant, preparation, practice, tradition, thinker, sign, or safety concept.
- **AcademicClaim** — one precise statement with evidence class, limitations, safety note, review state, review date, and reviewer.
- **ConceptRelation** — a directional relation between concepts that resolves to an AcademicClaim; a line in the Atlas is therefore reviewable, not decorative.
- **Source** — title, author/organization, source type, edition/translator/locator, stable URL or DOI, publication date, and verification status.
- **ClaimSource** — the exact support relationship between a claim and a source.
- **LearningObject** — chapter, lesson, lab, founder whiteboard, case, assessment, or reference object.
- **Competency** — one observable ability with level, domain, prerequisites, and version.
- **LearningObjectConcept / LearningObjectClaim / LearningObjectCompetency** — explicit placements connecting the curriculum to the Atlas.

Phase 2 deliberately uses typed static content for the lymphatic slice. This lets the Academy prove its academic vocabulary and experience before hardening it into a production migration.

### 4. Evidence architecture

The shared ANW Evidence Standard is:

1. Established science
2. Evidence-informed practice
3. Emerging research
4. Traditional / historical framework
5. Theoretical / speculative model

Evidence status is assigned to **claims**. “Lymphatic system” is not established, traditional, or speculative as one unit. “Lymphatic vessels return excess interstitial fluid to circulation” is an established anatomy/physiology claim; “calendula is a lymphatic herb” is a traditional category that does not prove a physiological effect.

### 5. Practical learning / LabProtocol

Every scalable lab should specify:

- title, version, duration, intended competency, and academic placement;
- safety tier, eligibility, contraindications, self-exclusion criteria, and red flags;
- required materials and a non-ingestion/non-intervention alternative;
- ordered steps and observations;
- required evidence artifact, rubric, reflection, reviewer, and review state.

Safety tiers:

- **Tier 0:** diagram, model, identification, or non-intervention observation.
- **Tier 1:** ordinary movement or food-sensory activity with a low-risk alternative.
- **Tier 2:** ingestion, topical use, or physiologic intervention; requires explicit contraindication gating, review, and a no-intervention alternative.
- **Tier 3:** client/human-subject, biomarker interpretation, or clinical activity; outside autonomous Phase 2 scope.

The lymph proof uses a Tier 0 “Build & Explain a One-Way Flow Model.” It involves no ingestion, palpation, massage, edema self-diagnosis, or treatment.

### 6. Founder whiteboards

A Founder Whiteboard is a first-class LearningObject, not a video feed. Its stable contract includes:

- episode title, series, presenter, release date, duration, and publication/review state;
- video, transcript, board capture, and accessible description;
- objectives, linked concepts, precise claims, sources, competencies, and safety annotations;
- retrieval/reflection questions, optional discussion, curriculum placements, and revision history.

The first production brief is **“Why Lymph Changes How You See the Body”**: tissue space → return network → immune checkpoint → intestinal-fat route → three common misconceptions. No fake recording, founder quotation, or student-facing ghost episode was created.

### 7. Mastery, progress, and Wellness Units

Phase 2 establishes an important distinction:

- **Progress** records what a student has opened or completed.
- **Assessment evidence** records what a server or human reviewer observed.
- **Competency state** is a rebuildable interpretation of multiple evidence events.
- **Wellness Units** recognize verified academic participation; they are not, by themselves, mastery.

Implemented now:

- the server reconstructs the rotating lesson-final question set from canonical `Lesson.content`;
- the server grades the submitted answer indexes and no longer accepts a client score or defaults one to 100;
- preceding lessons are enforced at assessment submission;
- failed attempts are recorded when a quiz record exists;
- first completion, progress, ledger entry, and cached WU increment occur in one serializable transaction;
- the unique lesson-progress record plus source lookup make retries idempotent, with retry handling for transaction conflicts;
- other callers of `awardWU` now use a serializable transaction and reject an existing user/source/source-id award;
- the UI unlocks progress only after the server confirms the pass;
- the student WU page uses the authenticated student’s real recorded balance and available ledger rather than fabricated activity.

Required next additive model, after a read-only production duplicate/reconciliation preflight:

- immutable `AcademicEvent` / `CompetencyEvidence` records with unique idempotency keys;
- immutable WU entries with posted/reversed status and reversal links;
- rebuildable `StudentCompetencyState` projections;
- one invariant: the cached balance equals the sum of posted ledger entries;
- registrar correction and appeal history rather than destructive edits.

No migration was created in Phase 2 because current seed data already demonstrates incomplete ledger histories. Declaring the ledger canonical before a production reconciliation would create false certainty.

### 8. Compact Student Intelligence Profile for ANW Scholar

Scholar should not store a student’s entire chat history as “memory.” A server-only `ScholarContextBuilder` should compose a bounded request packet from authoritative and student-controlled data.

The compact profile should contain:

- schema version and source-event cursor;
- explicit interests and learning preferences the student can view, edit, or reset;
- a capped set of relevant strengths, needs, active misconception codes, and review-due competencies;
- completed/reviewed lab references;
- current course, concept, and recent verified academic events;
- confidence, evidence references, and last-observed time for every derived item.

Rules:

- server/human evidence can change mastery; Scholar observations cannot;
- Scholar may emit a low-confidence recommendation such as `MISCONCEPTION_OBSERVED`, never a WU award or certification;
- do not infer or persist diagnoses, health conditions, or sensitive wellness profiles from chat;
- retrieve approved concepts, claim/source identifiers, and safety notes, then require the answer to cite those retrieved identifiers;
- retain only the small recent local exchange needed for conversational coherence.

## The lymphatic vertical proof slice

The implemented Atlas plate proves that one concept can connect:

- established fluid-return anatomy and physiology;
- immune checkpoints and lymphoid organs;
- dietary lipid transport through intestinal lacteals;
- movement/pressure relationships without implying treatment;
- calendula’s historical “lymphatic” category with explicit evidentiary limits;
- “detox” language as a claim that must be made precise before it can be evaluated;
- symptom/referral boundaries;
- a safe practical model lab;
- connected study in the existing schools;
- focused Academy Scholar prompts;
- a transparent source register.

The source register uses OpenStax Anatomy & Physiology, U.S. National Cancer Institute/SEER, MedlinePlus, the European Medicines Agency calendula monograph, and existing ANW curriculum links. Medical and safety copy still requires qualified academic review before production publication.

## What was actually built

### New product surfaces

- `/dashboard/atlas` — Human Body Atlas entrance, eight-unit common-core map, evidence key, and available system plate.
- `/dashboard/atlas/lymphatic-system` — the complete vertical proof slice.
- Reading Room Atlas feature and persistent student-navigation entry.
- Atlas-to-Scholar prompts that arrive prefilled on the Scholar screen.

### New reusable architecture

- one shared evidence taxonomy used by Methodology and Atlas;
- typed Atlas concepts, claims, sources, structures, connections, LabProtocol, WhiteboardBrief, common-core spine, and lookup helpers;
- reusable claim-level `EvidenceMark`;
- accessible interactive `LymphaticFlowPlate` with an SVG title/description and complete visible text alternative;
- pure final-question selection, grading, and WU-level functions with focused verification coverage.

### Integrity and record improvements

- server-authoritative lesson-final grading;
- prerequisite enforcement at the submission boundary;
- atomic progress + WU issuance for first lesson completion;
- serializable, source-idempotent WU awards;
- real database-backed Wellness Unit screen;
- “completed” terminology replaces unsupported “mastered” labels in course and transcript surfaces;
- prefilled Scholar questions from the Atlas.

## Visual evidence

The implemented experience is represented by these routes and responsive components:

- Human Body Atlas entrance: `/dashboard/atlas`
- Lymphatic academic plate: `/dashboard/atlas/lymphatic-system`
- Reading Room Atlas feature: `/dashboard`
- Evidence taxonomy: `/about/methodology`

The Atlas is intentionally inside the authenticated student institution. No production login, production data, or shared credential was used. Both Atlas routes were visually inspected in a local, temporary preview at the default desktop viewport and at 390 × 844 mobile size. The navigation, editorial hierarchy, complete flow diagram text alternative, structure-selection interaction, evidence ledger, lab boundary, referral panel, curriculum links, Scholar prompts, and source register rendered correctly; the browser console reported no warnings or errors. The preview-only authorization bypass was removed before final verification and is not part of this branch. Production-quality screenshot artifacts should be captured from an authenticated non-production review environment before merge.

## Files changed

### Academic architecture and content

- `lib/academy-2.0/evidence-standard.ts`
- `lib/academy-2.0/knowledge-atlas.ts`
- `lib/academy-2.0/academic-progress.ts`
- `docs/academy-2.0/PHASE_2_MISSION.md`

### Atlas and student experience

- `app/(student)/dashboard/atlas/page.tsx`
- `app/(student)/dashboard/atlas/[conceptSlug]/page.tsx`
- `components/atlas/LymphaticFlowPlate.tsx`
- `components/academy-2.0/EvidenceMark.tsx`
- `components/dashboard/DashboardNav.tsx`
- `app/(student)/dashboard/page.tsx`
- `app/(student)/dashboard/ai-tutor/page.tsx`
- `components/dashboard/AITutor.tsx`
- `app/(public)/about/methodology/page.tsx`

### Academic integrity and records

- `app/api/lessons/complete/route.ts`
- `lib/lesson-types.ts`
- `lib/auth.ts`
- `components/lesson/LessonViewer.tsx`
- `components/lesson/CourseContent.tsx`
- `app/(student)/dashboard/wellness-units/page.tsx`
- `app/(student)/dashboard/transcript/page.tsx`
- `scripts/verify-academic-integrity.ts`
- `tsconfig.verify.json`
- `package.json`

## Verification

- Focused academic-integrity verification: passed.
- Strict TypeScript: passed after Phase 2 implementation.
- ESLint across changed application files: passed after Phase 2 implementation.
- `git diff --check`: passed.
- Optimized Next.js production build: passed (Next.js 16.2.7, all 36 static pages generated).
- Full-project lint debt from the overnight audit remains intentionally separate and is not represented as Phase 2 regression.

## Deliberately not built

- No production deployment, merge, data read/write, or credential use.
- No Prisma migration or production ontology tables before the content contract survives review.
- No graph database, node-cloud visualization, 3D body, universal search, or ontology editor.
- No fake founder video, quotation, transcript, or student-facing “coming soon” whiteboard.
- No ingestion, topical, massage, palpation, edema self-assessment, or client activity in the lab.
- No persistent AI memory, diagnosis inference, chat-history warehouse, or Scholar-generated mastery.
- No claim that historical WU ledgers are complete or reconciled.
- No Practitioner Wellness Operating System expansion.
- No accreditation, tuition, credential terminology, or regulated-practice decision.

## Founder decisions required

1. **Human Body core requirement:** Is the eight-unit spine mandatory for all credentials, and may experienced entrants place out through challenge assessments?
2. **Qualified review authority:** Which credentialed anatomy/physiology and medical-safety reviewers approve Atlas plates before production publication?
3. **Evidence governance:** Who may assign, challenge, and approve a claim’s evidence class and review date?
4. **Mastery threshold:** What combination of server-scored, lab, case, oral/teach-back, and faculty-reviewed evidence constitutes competency mastery?
5. **WU meaning:** Should WU remain participation/academic-credit recognition while credentials depend separately on competencies? This is the recommended model.
6. **Whiteboard cadence:** Recording cadence, academic weight, and whether whiteboards are required, enrichment, or placed selectively by competency.
7. **Scholar privacy:** Retention window, student visibility/control, and whether inferred interests or misconceptions may persist at all.
8. **Traditional practice scope:** Which traditional preparations or experiential activities may enter Tier 2 after safety, contraindication, and legal review?

## SPECIALIST_HANDOFFS

These are targeted specialist briefs—not invitations to redesign the Academy independently.

### Fable — motion and anatomical plate refinement

Use only after the coded Atlas proof is reviewed in an authenticated preview.

> Review the Academy of Natural Wellness “Lymphatic System” Atlas plate as a senior information designer and motion director. Preserve the existing old-world academic identity: forest, parchment, restrained gold, Playfair editorial typography, marginalia, and quiet authority. Do not turn it into generic SaaS, a glowing node graph, a wellness influencer aesthetic, or a 3D medical app. Propose one desktop and one mobile refinement for the flow plate that makes collection → transport → immune checkpoint → return immediately understandable to a complete beginner while retaining practitioner-level detail. Motion must be optional, subtle, reduced-motion safe, and instructional: a single guided trace or pressure/valve sequence, not ambient animation. Every structure must have a nonvisual text equivalent; no claim may be implied by an unlabeled line. Deliver: annotated frames, timing/easing notes, responsive behavior, accessibility notes, and exact asset/component requirements. Do not redesign global navigation or branding.

Why Fable: the coded proof establishes the correct academic relationships; a motion specialist can test whether one restrained sequence materially improves comprehension.

### Claude — independent academic/editorial challenge

Use with the Phase 2 dataset and source register, ideally reviewed by a qualified human subject-matter expert afterward.

> Act as a skeptical academic editor reviewing one natural-wellness university proof chapter: “The Lymphatic System — Return, Defense & Connection.” Audit every claim individually. For each claim, state whether its current ANW classification—Established science, Evidence-informed practice, Emerging research, Traditional/Historical, or Theoretical/Speculative—is defensible from the cited source; identify overstatement, missing nuance, terminology problems, or source mismatch; and suggest a corrected statement that remains understandable to a beginner without becoming shallow. Pay special attention to immune surveillance, mechanical forces in lymph transport, lymphoid organs versus the vessel network, dietary lipid transport, calendula’s historical “lymphatic” category, “detox” language, and symptom/referral copy. Do not diagnose, prescribe, invent citations, or treat historical longevity as efficacy. Output a claim-by-claim redline table, a missing-source list, and a prioritized review queue. Do not propose product design or a competing curriculum architecture.

Why Claude: a separate language model can be useful as an adversarial editorial pass, but cannot replace credentialed anatomy, physiology, or clinical-safety review.

## Recommended Phase 3

**Phase 3: Academic Event Integrity + Second Atlas Slice**

1. Run a read-only production preflight for duplicate WU sources, profile/ledger drift, incomplete histories, and certification dependencies.
2. Design the additive migration for immutable AcademicEvent, idempotent/reversible WU entries, Competency, CompetencyEvidence, and rebuildable competency state.
3. Add concurrency/integration tests against an isolated non-production database before applying any migration.
4. Connect existing DB-backed lesson quizzes to a unified start/submit attempt flow and add eligibility policies once enrollment rules are founder-approved.
5. Build the first student-visible Lab submission/review flow from the Tier 0 contract.
6. Record and publish the real lymph founder whiteboard with transcript, sources, board capture, and placements.
7. Build a second slice—recommended **fascia** or **salt/fluid balance**—to test whether the Atlas contract generalizes beyond lymph.
8. Implement the server-only ScholarContextBuilder with Atlas claim/source IDs and a read-only student profile preview before persisting AI-derived learning signals.

The Phase 3 gate remains the same: institutional quality gained per unit of engineering effort, with no production mutation until preflight, review, and founder approval are complete.
