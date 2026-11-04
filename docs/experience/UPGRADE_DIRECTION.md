# Academy experience upgrade — working direction

Owner: Codex with Orel as founder/teacher and final product reviewer.  
Development branch: `academy-experience-upgrade-2026-11-03`.  
Production restrictions from the completion audit remain in force.

## Product north star

A living natural-wellness institution: understand the whole human, study nature and the traditions, practice the craft, demonstrate capability, and grow into responsible practice. Six schools share an academic foundation and one student identity. The Practitioner Wellness OS is a distinct professional destination, not a replacement for the Academy.

The acceptance standard is a student completing a coherent experience, not a count of routes or AI-generated lessons.

## Visual decision

Recover the richness of the earlier experience, not its unverified claims or invented metrics. The earlier source used light cream surfaces and distinct colors for each school; the later large forest panels reduced that variety. The archived preference was Oxford 1850 × Apple 2026. The new direction:

- Warm ivory and parchment as the dominant canvas; charcoal typography, copper and antique-gold detail. Green becomes an occasional botanical accent, not the background of the institution.
- Retain the seal, motto, student number, transcript and diploma. Scholarly credibility comes from typography, composition, sources, people and teaching—not a green wash.
- Generous light, tactile details, authentic footage, botanical material and carefully verified body illustrations. Generated art can supply decorative imagery; it must not invent faculty, scientific evidence or precise anatomy.
- Give each school its own restrained visual character within one design system.
- Student priority: what to do next, why it matters, the teacher beside you, and a visible path toward capability.
- Motion should clarify transitions or relationships. Honor reduced motion. No ambient animation that competes with reading or filmed teaching.

## Complete experience to build first

Use one real foundation module as the quality reference across the product:

1. Arrival: a brief founder welcome and a clear starting point.
2. Reading Room: continue studying; one meaningful next action; founder teaching; institutional notices.
3. Lesson: short film → understandable visual explanation → deeper reading → practical observation → reflection → server-graded assessment.
4. Scholar: questions grounded in that module's material and, once available, an approved transcript.
5. Academic record: correctly saved progress, WU and feedback, with no invented standing or credentials.
6. Return: a clear next lesson and a useful reason to come back.

Then apply the same visual and interaction system to all six schools, the catalog, admissions, coursework, assessments, records, faculty and practitioner workspace. Avoid making the public homepage beautiful while leaving the actual learning product inconsistent.

## Specialist responsibilities

One product owner keeps the vision, scope, source of truth and release decision coherent. Specialist work has bounded outputs:

| Specialist | Required output | Acceptance check |
|---|---|---|
| Experience/design | Original design recovery, final design tokens, responsive page compositions | Public arrival, Reading Room and lesson belong to one institution; founder presence and imagery add life |
| Implementation | Real components, video integration, state persistence and accessible interactions | Existing journeys continue to work; no mock achievements or success states |
| Curriculum/editorial | Foundation learning sequence, recording briefs, practice tasks and sources | Beginner-accessible depth, verified claims, distinct traditions/evidence, meaningful demonstration |
| Independent QA/security | Browser journeys, mobile keyboard/touch checks, auth boundaries, billing and credential verification | Evidence from the actual isolated preview, not screenshots or builder assertions alone |

Codex is the implementation/orchestration environment already connected to this repository. Claude Code is a reasonable optional independent reviewer if existing access is available; no external Claude agent has been launched or subscription purchased. Choose tools by the job and measured results, not an unsupported universal model ranking.

## Founder contribution

Start with two recorded modules, outlined in `FOUNDER_RECORDING_SESSION.md`. Record in a single calm session. Orel remains the human teacher. Editing can create focused chapter clips, captions, stills and excerpts without fabricating teaching or repeating one generic welcome everywhere.

## Delivery sequence and boundaries

- First: filming integration, recording packet and a concrete visual system.
- Next: a complete redesigned foundation experience and Reading Room using real content, followed by the other product surfaces.
- In parallel with implementation: resolve the isolated Academy backend access identified in the previous audit. Public design and filming infrastructure can progress without production database access; real hosted student verification cannot.
- Final: actual founder footage integrated, approved content/credential mappings, isolated authenticated browser tests, verified payment/email configuration and a reviewable release candidate.

No new paid services, production merge, production data edits or live payment activation are authorized. A read-only catalog preview is not a finished Academy, and a video player without supplied recordings is not a filmed curriculum.
