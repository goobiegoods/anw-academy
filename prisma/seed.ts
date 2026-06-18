/**
 * ANW Academy seed — university-grade curriculum.
 *
 * Uses the Supabase REST API (fetch) instead of a direct pg connection to
 * bypass pg-pool / IPv6 / driver-adapter issues. Composes the full 6-school,
 * 48-course, 288-lesson curriculum from prisma/curriculum, each lesson carrying
 * complete 10-card content, plus lesson quizzes, course midterms, school finals,
 * and module discussions.
 */

import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import {
  SCHOOLS,
  composeLessonContent,
  buildCourseQuestionPool,
  type GeneratedQuestion,
} from "./curriculum";
import { CERTIFICATIONS } from "./curriculum/certifications";

dotenv.config({ path: ".env.local", override: true });
dotenv.config();

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BASE = `${SUPABASE_URL}/rest/v1`;

async function rq(table: string, method: "POST" | "DELETE", params: string, body?: unknown) {
  const url = `${BASE}/${table}?${params}`;
  const headers: Record<string, string> = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
  if (method === "POST") headers["Prefer"] = "return=minimal";
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} /${table}?${params} → ${res.status}: ${text}`);
  }
  return null;
}

async function batchIns(table: string, rows: Record<string, unknown>[], size = 50) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    await rq(table, "POST", "", chunk);
    if (rows.length > size) console.log(`    ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

async function del(table: string) {
  await rq(table, "DELETE", "id=not.is.null");
}

async function cleanAuthUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000&page=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) return;
  const data = await res.json() as { users?: { id: string }[] };
  for (const u of (data.users ?? [])) {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
      method: "DELETE",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
  }
}

async function createAuthUser(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (!text.toLowerCase().includes("already")) {
      throw new Error(`createAuthUser ${email} → ${res.status}: ${text}`);
    }
  }
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function questionRows(quizId: string, questions: GeneratedQuestion[]): Record<string, unknown>[] {
  return questions.map((q) => ({
    id: randomUUID(),
    quizId,
    type: "multiple_choice",
    prompt: q.q,
    options: q.opts,
    correctAnswer: q.correct,
    explanation: q.explanation,
  }));
}

// Deduplicate by prompt so rotated pools don't repeat questions in one exam.
function dedupe(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const seen = new Set<string>();
  const out: GeneratedQuestion[] = [];
  for (const q of questions) {
    if (!seen.has(q.q)) {
      seen.add(q.q);
      out.push(q);
    }
  }
  return out;
}

async function main() {
  console.log("\nSeeding ANW Academy — full-depth curriculum…\n");

  // ── 1. Clean (reverse dependency order) ──────────────────────────────────
  console.log("Cleaning existing data…");
  const cleanOrder = [
    "ClientSession", "DiscussionPost", "AssignmentSubmission", "QuizAttempt",
    "LessonProgress", "Enrollment", "CaseStudy", "WellnessUnitTransaction",
    "StudentCertification", "Capstone", "Client", "PractitionerProfile",
    "StudentProfile", "User", "Question", "Quiz", "Lesson", "Module",
    "Discussion", "Assignment", "Course", "Department", "School",
    "Certification", "Application", "Resource", "Announcement",
  ];
  for (const t of cleanOrder) {
    try { await del(t); } catch { /* already empty */ }
  }
  await cleanAuthUsers();
  console.log("  ✓ Cleared\n");

  // ── 2. Curriculum ────────────────────────────────────────────────────────
  console.log("Composing curriculum…");

  const schoolRows: Record<string, unknown>[] = [];
  const deptRows: Record<string, unknown>[] = [];
  const courseRows: Record<string, unknown>[] = [];
  const moduleRows: Record<string, unknown>[] = [];
  const lessonRows: Record<string, unknown>[] = [];
  const quizRows: Record<string, unknown>[] = [];
  const questionAllRows: Record<string, unknown>[] = [];
  const assignmentRows: Record<string, unknown>[] = [];
  const discussionRows: Record<string, unknown>[] = [];

  let lessonCount = 0;

  for (const school of SCHOOLS) {
    const schoolId = randomUUID();
    schoolRows.push({
      id: schoolId,
      name: school.name,
      slug: school.slug,
      description: school.description,
      color: school.color,
      accent: school.accent,
      icon: school.icon,
      order: school.order,
    });

    const deptIds = school.departments.map((name) => {
      const id = randomUUID();
      deptRows.push({
        id,
        schoolId,
        name,
        description: `Courses in ${name} within the ${school.name}.`,
      });
      return id;
    });

    // School final exam — drawn from across all courses in the school
    const schoolFinalQuizId = randomUUID();
    const schoolFinalPool: GeneratedQuestion[] = [];

    school.courses.forEach((course, ci) => {
      const courseId = randomUUID();
      courseRows.push({
        id: courseId,
        schoolId,
        departmentId: deptIds[course.department] ?? deptIds[0],
        title: course.title,
        slug: slugify(course.title),
        description: course.description,
        level: course.level,
        estimatedHours: course.estimatedHours,
        wuValue: course.wuValue,
        status: "published",
        order: ci + 1,
      });

      // Modules & lessons
      course.modules.forEach((mod, mi) => {
        const moduleId = randomUUID();
        moduleRows.push({
          id: moduleId,
          courseId,
          title: mod.title,
          description: `Module ${mi + 1} of ${course.title}.`,
          order: mi + 1,
        });

        mod.lessons.forEach((lesson, li) => {
          const lessonIndex = mi * 3 + li;
          const lessonId = randomUUID();
          const content = composeLessonContent(school, course, lesson, ci, lessonIndex);

          lessonRows.push({
            id: lessonId,
            moduleId,
            title: lesson.title,
            content,
            objectives: [],
            keyTerms: [],
            reflectionQuestion: null,
            order: li + 1,
            wuValue: 1,
          });
          lessonCount++;

          // Per-lesson gated quiz (3 questions drawn from this lesson's final pool)
          const parsed = JSON.parse(content) as {
            cards: { type: string; quizQuestions?: GeneratedQuestion[] }[];
          };
          const reflection = parsed.cards.find((c) => c.type === "reflection");
          const lessonPool = dedupe(reflection?.quizQuestions ?? []);
          const lessonQuizId = randomUUID();
          quizRows.push({
            id: lessonQuizId,
            courseId,
            schoolId: null,
            lessonId,
            title: `${lesson.title} — Lesson Quiz`,
            type: "lesson",
            passingScore: 70,
            wuValue: 1,
            timeLimitMinutes: null,
            questionCount: 3,
            cooldownHours: 0,
          });
          questionAllRows.push(...questionRows(lessonQuizId, lessonPool.slice(0, 3)));
        });
      });

      // Course question pool (for midterm + contributes to school final)
      const coursePool = dedupe(buildCourseQuestionPool(school, course, ci));
      schoolFinalPool.push(...coursePool);

      // Course midterm — 20 questions, 60 min, 75%
      const midtermId = randomUUID();
      quizRows.push({
        id: midtermId,
        courseId,
        schoolId: null,
        lessonId: null,
        title: `${course.title} — Midterm Exam`,
        type: "midterm",
        passingScore: 75,
        wuValue: 10,
        timeLimitMinutes: 60,
        questionCount: 20,
        cooldownHours: 24,
      });
      questionAllRows.push(...questionRows(midtermId, coursePool.slice(0, 24)));

      // One assignment + one discussion per module
      course.modules.forEach((mod, mi) => {
        assignmentRows.push({
          id: randomUUID(),
          courseId,
          title: `${mod.title} — Practical Assignment`,
          prompt: `Drawing on ${mod.title}, write a 500–800 word reflection or wellness plan. Describe your approach, the tools and concepts you would apply, any safety considerations, and how you would evaluate outcomes. This is an educational exercise — use no real client data.`,
          wuValue: 5,
        });
        discussionRows.push({
          id: randomUUID(),
          courseId,
          moduleId: null, // module IDs are not exposed here; discussions surface at course level
          title: `${mod.title} — Discussion`,
          prompt: `Share one insight from ${mod.title} that surprised you or shifted your perspective, and how it will change your practice (minimum 150 words). Then reply thoughtfully to at least one peer (minimum 75 words).`,
          requiredReplies: 1,
          wuOriginalPost: 2,
          wuReply: 1,
        });
      });
    });

    // School final — 40 questions, 90 min, 80%
    quizRows.push({
      id: schoolFinalQuizId,
      courseId: null,
      schoolId,
      lessonId: null,
      title: `${school.name} — Final Exam`,
      type: "final",
      passingScore: 80,
      wuValue: 25,
      timeLimitMinutes: 90,
      questionCount: 40,
      cooldownHours: 24,
    });
    questionAllRows.push(...questionRows(schoolFinalQuizId, dedupe(schoolFinalPool).slice(0, 48)));
  }

  console.log(`  Composed ${schoolRows.length} schools, ${courseRows.length} courses, ${lessonCount} lessons`);
  console.log(`  ${quizRows.length} quizzes, ${questionAllRows.length} questions`);
  console.log(`  ${assignmentRows.length} assignments, ${discussionRows.length} discussions\n`);

  console.log("Writing curriculum to database…");
  await batchIns("School", schoolRows, 20);
  await batchIns("Department", deptRows, 50);
  await batchIns("Course", courseRows, 48);
  await batchIns("Module", moduleRows, 50);
  await batchIns("Lesson", lessonRows, 20);
  await batchIns("Quiz", quizRows, 50);
  await batchIns("Question", questionAllRows, 100);
  await batchIns("Assignment", assignmentRows, 50);
  await batchIns("Discussion", discussionRows, 50);
  console.log("  ✓ Curriculum written\n");

  // ── 3. Certifications ────────────────────────────────────────────────────
  console.log("Creating certifications…");
  await batchIns("Certification", CERTIFICATIONS.map((c) => ({ id: randomUUID(), ...c })));
  console.log(`  ✓ ${CERTIFICATIONS.length} certifications\n`);

  // ── 4. Users & profiles ──────────────────────────────────────────────────
  console.log("Creating users…");
  const adminId = randomUUID();
  await batchIns("User", [{ id: adminId, email: "admin@anwacademy.com", name: "ANW Admin", role: "ADMIN" }]);

  const students = [
    { id: randomUUID(), email: "student@anwacademy.com", name: "Demo Student" },
    { id: randomUUID(), email: "emma.clarke@student.com", name: "Emma Clarke" },
    { id: randomUUID(), email: "liam.nguyen@student.com", name: "Liam Nguyen" },
    { id: randomUUID(), email: "sofia.petrov@student.com", name: "Sofia Petrov" },
    { id: randomUUID(), email: "noah.okafor@student.com", name: "Noah Okafor" },
    { id: randomUUID(), email: "maya.rodriguez@student.com", name: "Maya Rodriguez" },
  ];
  await batchIns("User", students.map((s) => ({ ...s, role: "STUDENT" })));

  const certIdForActive = randomUUID(); // placeholder unused, profiles reference by null below
  void certIdForActive;
  await batchIns("StudentProfile", students.map((s, i) => ({
    id: randomUUID(),
    userId: s.id,
    level: [1, 3, 2, 4, 1, 2][i],
    totalWU: [0, 560, 210, 820, 60, 340][i],
    status: "active",
    bio: `${s.name} is a dedicated student of natural wellness at the Academy.`,
    location: ["Remote", "Portland, OR", "Austin, TX", "New York, NY", "Chicago, IL", "Denver, CO"][i],
  })));

  const practitioners = [
    { id: randomUUID(), email: "evelyn.hartwood@practitioner.com", name: "Evelyn Hartwood", displayName: "Evelyn Hartwood, CNWP", specialties: ["Western Herbalism", "Women's Wellness"], location: "Asheville, NC" },
    { id: randomUUID(), email: "james.bloom@practitioner.com", name: "James Bloom", displayName: "James Bloom, CNWP", specialties: ["Traditional Chinese Medicine", "Qi Gong"], location: "San Francisco, CA" },
    { id: randomUUID(), email: "aria.chen@practitioner.com", name: "Aria Chen", displayName: "Aria Chen, CNWP", specialties: ["Classical Homeopathy", "Constitutional Wellness"], location: "Seattle, WA" },
    { id: randomUUID(), email: "marcus.reed@practitioner.com", name: "Marcus Reed", displayName: "Marcus Reed, CNWP", specialties: ["Functional Wellness", "Metabolic Health"], location: "Austin, TX" },
  ];
  await batchIns("User", practitioners.map((p) => ({ id: p.id, email: p.email, name: p.name, role: "PRACTITIONER" })));
  const practProfiles = practitioners.map((p) => ({
    id: randomUUID(),
    userId: p.id,
    displayName: p.displayName,
    bio: `${p.name} is a Certified Natural Wellness Practitioner supporting clients with evidence-aligned, individualized care.`,
    location: p.location,
    virtualAvailable: true,
    inPersonAvailable: true,
    specialties: p.specialties,
    languages: ["English"],
    certifications: ["Certified Natural Wellness Practitioner (ANW Academy)"],
    directoryStatus: "active",
    verifiedGraduate: true,
    bookingUrl: null,
  }));
  await batchIns("PractitionerProfile", practProfiles);

  // Create matching Supabase Auth accounts so signInWithPassword works
  console.log("Creating Supabase Auth accounts…");
  const demoPassword = "password123";
  await createAuthUser("admin@anwacademy.com", demoPassword);
  for (const s of students) await createAuthUser(s.email, demoPassword);
  for (const p of practitioners) await createAuthUser(p.email, demoPassword);
  console.log(`  ✓ Auth accounts created (password: ${demoPassword})\n`);

  console.log(`  ✓ 1 admin, ${students.length} students, ${practitioners.length} practitioners\n`);

  // ── 5. Enrollments ───────────────────────────────────────────────────────
  console.log("Creating enrollments…");
  const enrollments: Record<string, unknown>[] = [];
  students.forEach((student, si) => {
    // enroll each student in the first course of two schools
    const courseA = courseRows[(si % SCHOOLS.length) * 8];
    const courseB = courseRows[((si + 1) % SCHOOLS.length) * 8];
    [courseA, courseB].forEach((course, idx) => {
      if (course) {
        enrollments.push({
          id: randomUUID(),
          userId: student.id,
          courseId: course.id,
          status: "active",
          progressPercent: idx === 0 ? (si + 1) * 12 : 5,
        });
      }
    });
  });
  await batchIns("Enrollment", enrollments);
  console.log(`  ✓ ${enrollments.length} enrollments\n`);

  // ── 6. WU transactions (sample ledger for first student) ─────────────────
  console.log("Creating sample WU ledger…");
  const wuRows = [
    { sourceType: "lesson", amount: 1, description: "Lesson completed: Plant Medicine — The Original Pharmacy" },
    { sourceType: "lesson", amount: 1, description: "Lesson completed: How Plants Communicate — The Doctrine of Signatures" },
    { sourceType: "discussion", amount: 2, description: "Discussion post: Foundations of Plant Medicine" },
    { sourceType: "discussion", amount: 1, description: "Discussion reply to peer" },
    { sourceType: "midterm", amount: 10, description: "Midterm passed: Introduction to Herbal Medicine" },
  ].map((t, i) => ({
    id: randomUUID(),
    userId: students[0].id,
    sourceType: t.sourceType,
    sourceId: null,
    amount: t.amount,
    description: t.description,
    createdAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  await batchIns("WellnessUnitTransaction", wuRows);
  console.log(`  ✓ ${wuRows.length} transactions\n`);

  // ── 7. Applications ──────────────────────────────────────────────────────
  console.log("Creating applications…");
  const appBase = { phone: null as string | null, location: null as string | null, reviewedAt: null as string | null };
  await batchIns("Application", [
    { ...appBase, id: randomUUID(), name: "Clara Whitfield", email: "clara.whitfield@email.com", phone: "+1-503-555-0121", location: "Portland, OR", motivation: "I have studied herbalism independently for two years and want to deepen my knowledge within a structured, community-based program.", experienceLevel: "intermediate", schoolInterest: "School of Herbal Medicine", pathway: "practitioner", status: "SUBMITTED" },
    { ...appBase, id: randomUUID(), name: "Theo Marsh", email: "theo.marsh@email.com", location: "Denver, CO", motivation: "After years in conventional healthcare, I am drawn to integrative wellness. ANW offers the TCM foundation I have been searching for.", experienceLevel: "beginner", schoolInterest: "School of Traditional Chinese Medicine", pathway: "personal", status: "UNDER_REVIEW" },
    { ...appBase, id: randomUUID(), name: "Simone Okafor", email: "simone.okafor@email.com", location: "Atlanta, GA", motivation: "I want to combine functional nutrition with formal study to serve my community more holistically.", experienceLevel: "advanced", schoolInterest: "School of Functional Wellness", pathway: "practitioner", status: "ACCEPTED" },
    { ...appBase, id: randomUUID(), name: "Rafael Torres", email: "rafael.torres@email.com", location: "Miami, FL", motivation: "Wellness entrepreneurship has always called to me, and I am ready to build a business around natural health education.", experienceLevel: "beginner", schoolInterest: "School of Wellness Entrepreneurship", pathway: "entrepreneur", status: "SUBMITTED" },
  ]);
  console.log("  ✓ 4 applications\n");

  // ── 8. Resources & announcements ─────────────────────────────────────────
  console.log("Creating resources & announcements…");
  await batchIns("Resource", [
    { id: randomUUID(), title: "ANW Wellness Assessment Questionnaire", type: "template", tags: ["intake", "assessment"] },
    { id: randomUUID(), title: "Herb-Drug Interaction Reference Chart", type: "reference", tags: ["herbalism", "safety"] },
    { id: randomUUID(), title: "TCM Five Element Correspondences", type: "reference", tags: ["tcm", "theory"] },
    { id: randomUUID(), title: "Homeopathic Case-Taking Template", type: "template", tags: ["homeopathy", "case-taking"] },
    { id: randomUUID(), title: "Functional Intake & Lifestyle Audit", type: "template", tags: ["functional", "intake"] },
    { id: randomUUID(), title: "Scope of Practice & Referral Guide", type: "policy", tags: ["practice", "scope", "ethics"] },
    { id: randomUUID(), title: "Wellness Business Plan Template", type: "template", tags: ["entrepreneurship", "business"] },
  ]);
  await batchIns("Announcement", [
    { id: randomUUID(), title: "Welcome to the Academy of Natural Wellness", body: "Your journey toward natural wellness mastery begins here. Explore your courses, connect with your cohort, and reach out to the ANW Scholar whenever you have questions.", audience: "all" },
    { id: randomUUID(), title: "New full-depth curriculum now live", body: "Every lesson is now a complete ten-card teaching sequence with quizzes, primary sources, vocabulary, and clinical relevance. Dive in and start earning Wellness Units.", audience: "student" },
    { id: randomUUID(), title: "Case study review window open", body: "Submit completed case studies for mentor review and earn 10–25 WU per approved submission.", audience: "student" },
  ]);
  console.log("  ✓ resources & announcements\n");

  console.log("✅  ANW Academy seed complete.\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
