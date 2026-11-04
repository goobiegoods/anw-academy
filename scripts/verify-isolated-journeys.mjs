/** Local contract/integration tests only. Uses disposable PostgreSQL (PGlite) and
 * an explicit Supabase HTTP identity fixture. Does not verify hosted Supabase,
 * email delivery, paid AI, Stripe, or real-browser rendering. Never uses .env. */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import http from "node:http";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
const db = await PGlite.create();
const schema = spawnSync(
  process.execPath,
  [
    "node_modules/prisma/build/index.js",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ],
  { encoding: "utf8", env: { ...process.env, DATABASE_URL: "" } },
);
assert.equal(schema.status, 0, schema.stderr);
await db.exec(schema.stdout);
const server = new PGLiteSocketServer({
  db,
  port: 54329,
  host: "127.0.0.1",
  maxConnections: 10,
});
await server.start();
const connectionString =
  "postgresql://postgres:postgres@127.0.0.1:54329/postgres";
const pool = new pg.Pool({ connectionString, max: 1, idleTimeoutMillis: 0 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const users = {};
for (const [i, role] of [
  "STUDENT",
  "STUDENT",
  "ADMIN",
  "PRACTITIONER",
  "PRACTITIONER",
].entries()) {
  const name = ["student", "other", "admin", "practitioner", "second"][i];
  users[name] = await prisma.user.create({
    data: {
      name,
      email: `${name}@fixture.test`,
      role,
      studentId: `ANW-2026-${String(i + 1).padStart(5, "0")}`,
      studentProfile: { create: {} },
      ...(["PRACTITIONER"].includes(role)
        ? {
            practitionerProfile: {
              create: {
                displayName: name,
                languages: ["English"],
                specialties: [],
                certifications: [],
              },
            },
          }
        : {}),
    },
    include: { practitionerProfile: true },
  });
}
const lessonContent = JSON.stringify({
  cards: [
    {
      type: "objectives",
      title: "Objectives",
      items: ["Trace lymphatic flow"],
    },
    {
      type: "teaching",
      title: "Fluid return",
      part: 1,
      body: "Lymphatic vessels return interstitial fluid toward venous circulation. Lymph nodes contribute to immune surveillance.",
    },
    {
      type: "reflection",
      prompt: "Explain lymphatic flow",
      quizQuestions: [
        {
          q: "What returns fluid?",
          opts: ["Lymphatic vessels", "Hair", "Nails", "Teeth"],
          correct: "a",
          explanation: "Lymphatic flow returns fluid.",
        },
        {
          q: "What participates in surveillance?",
          opts: ["Lymph nodes", "Nails", "Teeth", "Hair"],
          correct: "a",
          explanation: "Nodes contribute to immune surveillance.",
        },
        {
          q: "What is the study focus?",
          opts: ["Lymphatic flow", "Marketing", "Taxation", "Geography"],
          correct: "a",
          explanation: "Lymphatic physiology.",
        },
      ],
    },
  ],
});
const school = await prisma.school.create({
  data: {
    name: "Fixture School",
    slug: "fixture-school",
    description: "Isolated test data",
    color: "#1C3327",
    accent: "#D4A94A",
    icon: "Leaf",
    order: 1,
  },
});
const course = await prisma.course.create({
  data: {
    schoolId: school.id,
    title: "Fixture Anatomy",
    slug: "fixture-anatomy",
    description: "Isolated test course",
    estimatedHours: 1,
    wuValue: 10,
    order: 1,
    modules: {
      create: {
        title: "Fixture Module",
        order: 1,
        lessons: {
          create: [
            {
              title: "Lymphatic fluid return",
              content: lessonContent,
              objectives: [],
              keyTerms: [],
              order: 1,
            },
            {
              title: "Second lesson",
              content: lessonContent,
              objectives: [],
              keyTerms: [],
              order: 2,
            },
          ],
        },
      },
    },
  },
  include: { modules: { include: { lessons: { orderBy: { order: "asc" } } } } },
});
const lessons = course.modules[0].lessons;
const assignment = await prisma.assignment.create({
  data: {
    courseId: course.id,
    title: "Fixture reflection",
    prompt: "Explain the concept",
    wuValue: 5,
  },
});
const quiz = await prisma.quiz.create({
  data: {
    courseId: course.id,
    title: "Fixture midterm",
    type: "midterm",
    questionCount: 1,
    cooldownHours: 0,
    wuValue: 3,
    questions: {
      create: {
        type: "multiple_choice",
        prompt: "Return pathway?",
        options: ["Lymphatic vessels", "Hair", "Nails", "Teeth"],
        correctAnswer: "a",
      },
    },
  },
});
const clients = await Promise.all(
  ["practitioner", "second"].map((name) =>
    prisma.client.create({
      data: {
        practitionerId: users[name].practitionerProfile.id,
        name: `${name} private client`,
      },
    }),
  ),
);
function jwt(user) {
  return `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, email: user.email, role: "authenticated", aud: "authenticated", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.local-fixture`;
}
const auth = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const token = (req.headers.authorization || "").split(" ")[1];
  let sub;
  try {
    sub = JSON.parse(
      Buffer.from(token?.split(".")[1] || "", "base64url").toString(),
    ).sub;
  } catch {}
  const user = Object.values(users).find((u) => u.id === sub);
  if (req.url === "/auth/v1/user" && user) {
    res.end(
      JSON.stringify({
        id: user.id,
        email: user.email,
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      }),
    );
    return;
  }
  res.writeHead(401);
  res.end('{"error":"Not authenticated"}');
});
await new Promise((resolve) => auth.listen(0, "127.0.0.1", resolve));
const authURL = `http://127.0.0.1:${auth.address().port}`;
// Browser SSR cookie contract used by @supabase/ssr (not an app auth bypass).
function cookie(name) {
  const user = users[name];
  const session = {
    access_token: jwt(user),
    refresh_token: "fixture-only",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: user.id,
      email: user.email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: {},
    },
  };
  return `sb-127-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}
Object.assign(process.env, {
  VERCEL_ENV: "development",
  ANW_DB_POOL_MAX: "1",
  DATABASE_URL: connectionString,
  NEXT_PUBLIC_SUPABASE_URL: authURL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon",
  ANTHROPIC_API_KEY: "",
  STRIPE_WEBHOOK_SECRET: "whsec_local_fixture",
  STRIPE_SECRET_KEY: "",
  OPENAI_API_KEY: "",
  SUPABASE_SERVICE_ROLE_KEY: "",
});
const next = (await import("next")).default;
const academy = next({
  dev: true,
  webpack: true,
  hostname: "127.0.0.1",
  port: 3107,
  conf: { distDir: `.next-journeys-${process.pid}` },
});
await academy.prepare();
const app = http.createServer(academy.getRequestHandler());
await new Promise((resolve) => app.listen(3107, "127.0.0.1", resolve));
let logs = "";
const base = "http://127.0.0.1:3107";
const results = [];
async function test(name, fn) {
  await fn();
  results.push({ name, status: "PASS" });
  console.log(`PASS ${name}`);
}
async function request(
  path,
  { who, method = "GET", body, headers = {}, redirect = "manual" } = {},
) {
  return fetch(base + path, {
    method,
    redirect,
    headers: {
      ...(who ? { cookie: cookie(who) } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
try {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(base + "/login");
      if (r.status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    if (i === 89)
      throw new Error("Local app did not start: " + logs.slice(-3000));
  }
  await test("anonymous dashboard redirects to sign-in", async () => {
    const r = await request("/dashboard");
    assert.equal(r.status, 307);
    assert.match(r.headers.get("location"), /\/login/);
  });
  await test("student cannot access admin records", async () => {
    const r = await request("/admin", { who: "student" });
    assert.equal(r.status, 307);
    assert.match(r.headers.get("location"), /dashboard/);
  });
  await test("database ADMIN role reaches admin pages", async () => {
    const r = await request("/admin", { who: "admin" });
    assert.equal(r.status, 200);
  });
  await test("CSRF rejects foreign Origin", async () => {
    const r = await request("/api/profile", {
      who: "student",
      method: "PATCH",
      body: { name: "Injected" },
      headers: { origin: "https://foreign.test" },
    });
    assert.equal(r.status, 403);
  });
  await test("profile save persists and cannot modify identity or role", async () => {
    const r = await request("/api/profile", {
      who: "student",
      method: "PATCH",
      body: {
        name: "Saved Student",
        bio: "Saved biography",
        location: "Test City",
        email: "admin@fixture.test",
        role: "ADMIN",
      },
    });
    assert.equal(r.status, 200, await r.text());
    const saved = await prisma.user.findUnique({
      where: { id: users.student.id },
      include: { studentProfile: true },
    });
    assert.equal(saved.name, "Saved Student");
    assert.equal(saved.email, "student@fixture.test");
    assert.equal(saved.role, "STUDENT");
    assert.equal(saved.studentProfile.bio, "Saved biography");
  });
  await test("unenrolled student cannot complete lesson", async () => {
    const r = await request("/api/lessons/complete", {
      who: "student",
      method: "POST",
      body: {
        lessonId: lessons[0].id,
        attempt: 0,
        answers: { 0: 0, 1: 0, 2: 0 },
      },
    });
    assert.equal(r.status, 403);
  });
  await test("registrar enrollment persists; student cannot self-enroll", async () => {
    const body = { userId: users.student.id, courseId: course.id };
    assert.equal(
      (
        await request("/api/admin/enrollments", {
          who: "student",
          method: "POST",
          body,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/admin/enrollments", {
          who: "admin",
          method: "POST",
          body,
        })
      ).status,
      200,
    );
  });
  await test("direct URL cannot skip preceding lesson", async () => {
    const r = await request(
      `/dashboard/courses/${course.slug}/lessons/${lessons[1].id}`,
      { who: "student" },
    );
    assert.equal(r.status, 307);
    assert.ok(r.headers.get("location").endsWith(lessons[0].id));
  });
  await test("lesson grading persists once and updates progress", async () => {
    const body = {
      lessonId: lessons[0].id,
      attempt: 0,
      answers: { 0: 0, 1: 0, 2: 0 },
    };
    let r = await request("/api/lessons/complete", {
      who: "student",
      method: "POST",
      body,
    });
    let result = await r.json();
    assert.equal(r.status, 200, JSON.stringify(result));
    assert.equal(result.completed, true);
    assert.equal(result.wuAwarded, 1);
    r = await request("/api/lessons/complete", {
      who: "student",
      method: "POST",
      body,
    });
    result = await r.json();
    assert.equal(result.wuAwarded, 0);
    const enrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: users.student.id, courseId: course.id },
      },
    });
    assert.equal(enrolled.progressPercent, 50);
    assert.equal(
      await prisma.wellnessUnitTransaction.count({
        where: { userId: users.student.id, sourceId: lessons[0].id },
      }),
      1,
    );
  });
  await test("assessment answers hidden before submission; replay cannot award twice", async () => {
    let r = await request("/api/exams/start", {
      who: "student",
      method: "POST",
      body: { quizId: quiz.id },
    });
    const started = await r.json();
    assert.equal(r.status, 200, JSON.stringify(started));
    assert.equal(started.questions[0].correctAnswer, undefined);
    assert.equal(
      (
        await request("/api/exams/submit", {
          who: "other",
          method: "POST",
          body: {
            attemptId: started.attemptId,
            answers: { [started.questions[0].id]: "a" },
          },
        })
      ).status,
      404,
    );
    const body = {
      attemptId: started.attemptId,
      answers: { [started.questions[0].id]: "a" },
    };
    r = await request("/api/exams/submit", {
      who: "student",
      method: "POST",
      body,
    });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).passed, true);
    assert.equal(
      (
        await request("/api/exams/submit", {
          who: "student",
          method: "POST",
          body,
        })
      ).status,
      400,
    );
  });
  await test("faculty approval and WU are durable and replay-safe", async () => {
    const work = await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignment.id,
        userId: users.student.id,
        content: "A sufficiently detailed educational reflection.",
        status: "submitted",
      },
    });
    const body = {
      id: work.id,
      kind: "assignment",
      decision: "approved",
      feedback: "Thoughtful work and clear explanation.",
    };
    assert.equal(
      (
        await request("/api/admin/reviews", {
          who: "student",
          method: "POST",
          body,
        })
      ).status,
      403,
    );
    const r = await request("/api/admin/reviews", {
      who: "admin",
      method: "POST",
      body,
    });
    assert.equal(r.status, 200, await r.text());
    assert.equal(
      (
        await request("/api/admin/reviews", {
          who: "admin",
          method: "POST",
          body,
        })
      ).status,
      409,
    );
    assert.equal(
      await prisma.wellnessUnitTransaction.count({
        where: { sourceId: work.id },
      }),
      1,
    );
  });
  await test("practitioner cannot read or write another practice client", async () => {
    assert.equal(
      (
        await request(`/practitioner/clients/${clients[1].id}`, {
          who: "practitioner",
        })
      ).status,
      404,
    );
    const r = await request(
      `/api/practitioner/clients/${clients[1].id}/sessions`,
      {
        who: "practitioner",
        method: "POST",
        body: { sessionDate: "2026-11-03", notes: "Should never persist" },
      },
    );
    assert.equal(r.status, 404);
    assert.equal(
      await prisma.clientSession.count({ where: { clientId: clients[1].id } }),
      0,
    );
  });
  await test("client intake and session follow-up persist", async () => {
    let r = await request("/api/practitioner/clients", {
      who: "practitioner",
      method: "POST",
      body: { name: "New Fixture Client", goals: "Educational support" },
    });
    const client = await r.json();
    assert.equal(r.status, 201);
    r = await request(`/api/practitioner/clients/${client.id}/sessions`, {
      who: "practitioner",
      method: "POST",
      body: {
        sessionDate: "2026-11-03",
        notes: "Education and shared decision recorded",
        followUpDate: "2026-11-10",
      },
    });
    assert.equal(r.status, 201);
    const saved = await prisma.clientSession.findFirst({
      where: { clientId: client.id },
    });
    assert.equal(
      saved.practitionerId,
      users.practitioner.practitionerProfile.id,
    );
    assert.ok(saved.followUpDate);
  });
  await test("directory edits persist without self-verification", async () => {
    const r = await request("/api/practitioner/profile", {
      who: "practitioner",
      method: "PATCH",
      body: {
        displayName: "Updated Practitioner",
        bio: "Fixture biography",
        location: "Test City",
        specialties: "Education",
        languages: "English",
        bookingUrl: "https://example.test/book",
        virtualAvailable: true,
        inPersonAvailable: false,
        verifiedGraduate: true,
        directoryStatus: "active",
      },
    });
    assert.equal(r.status, 200);
    const p = await prisma.practitionerProfile.findUnique({
      where: { id: users.practitioner.practitionerProfile.id },
    });
    assert.equal(p.displayName, "Updated Practitioner");
    assert.equal(p.directoryStatus, "pending");
    assert.equal(p.verifiedGraduate, false);
  });
  await test("viewing credentials and transcript does not write records", async () => {
    const before = await prisma.studentCertification.count();
    for (const path of ["/dashboard/certifications", "/dashboard/transcript"])
      assert.equal((await request(path, { who: "student" })).status, 200);
    assert.equal(await prisma.studentCertification.count(), before);
  });
  await test("registrar refuses missing course requirements then issues a verified owned diploma", async () => {
    const cert = await prisma.certification.create({
      data: {
        title: "Fixture credential",
        description: "Contract fixture",
        requiredWU: 1,
        requiredCourses: [],
        requiredCaseStudies: 0,
        requiredCapstone: false,
        level: 1,
        duration: "fixture",
      },
    });
    let r = await request("/api/admin/credentials", {
      who: "admin",
      method: "POST",
      body: { userId: users.student.id },
    });
    let d = await r.json();
    assert.equal(r.status, 200, JSON.stringify(d));
    assert.equal(d.awarded.length, 0);
    assert.equal(d.blocked.length, 1);
    await prisma.certification.update({
      where: { id: cert.id },
      data: { requiredCourses: [course.slug] },
    });
    r = await request("/api/lessons/complete", {
      who: "student",
      method: "POST",
      body: {
        lessonId: lessons[1].id,
        attempt: 0,
        answers: { 0: 0, 1: 0, 2: 0 },
      },
    });
    assert.equal(r.status, 200);
    r = await request("/api/admin/credentials", {
      who: "admin",
      method: "POST",
      body: { userId: users.student.id },
    });
    d = await r.json();
    assert.equal(r.status, 200, JSON.stringify(d));
    assert.equal(d.awarded.length, 1);
    const credential = await prisma.studentCertification.findFirst({
      where: { userId: users.student.id, status: "awarded" },
    });
    assert.ok(credential.certificateNumber);
    assert.equal(
      (
        await request(`/dashboard/certifications/${credential.id}/diploma`, {
          who: "student",
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request(`/dashboard/certifications/${credential.id}/diploma`, {
          who: "other",
        })
      ).status,
      404,
    );
    const verify = await request(`/verify/${credential.certificateNumber}`);
    assert.equal(verify.status, 200);
    assert.match(await verify.text(), /VERIFIED/);
    r = await request("/api/admin/credentials", {
      who: "admin",
      method: "POST",
      body: { userId: users.student.id },
    });
    assert.equal((await r.json()).awarded.length, 0);
  });
  await test("signed payment webhook grants enrollment exactly once; forgery rejected", async () => {
    const order = await prisma.tuitionOrder.create({
      data: {
        userId: users.other.id,
        courseId: course.id,
        stripeSessionId: "cs_test_fixture",
        amount: 100,
        currency: "usd",
      },
    });
    const body = JSON.stringify({
      type: "checkout.session.completed",
      livemode: false,
      data: {
        object: {
          id: "cs_test_fixture",
          payment_status: "paid",
          amount_total: 100,
          currency: "usd",
          client_reference_id: users.other.id,
          metadata: { orderId: order.id },
        },
      },
    });
    const timestamp = String(Math.floor(Date.now() / 1000)),
      signature = createHmac("sha256", "whsec_local_fixture")
        .update(`${timestamp}.${body}`)
        .digest("hex");
    let r = await fetch(base + "/api/billing/webhook", {
      method: "POST",
      headers: { "stripe-signature": `t=${timestamp},v1=${"0".repeat(64)}` },
      body,
    });
    assert.equal(r.status, 400);
    for (let i = 0; i < 2; i++) {
      r = await fetch(base + "/api/billing/webhook", {
        method: "POST",
        headers: { "stripe-signature": `t=${timestamp},v1=${signature}` },
        body,
      });
      assert.equal(r.status, 200, await r.text());
    }
    assert.equal(
      await prisma.enrollment.count({
        where: { userId: users.other.id, courseId: course.id },
      }),
      1,
    );
    assert.equal(
      (await prisma.tuitionOrder.findUnique({ where: { id: order.id } }))
        .status,
      "paid",
    );
  });
  await test("prepared RLS migration denies direct student-data access", async () => {
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
    await db.exec(
      readFileSync(
        "supabase/migrations/20261104000000_lock_down_prisma_data_api.sql",
        "utf8",
      ),
    );
    const result = await db.query(
      `SELECT relname,relrowsecurity,has_table_privilege('anon',oid,'SELECT') AS anon_select,has_table_privilege('authenticated',oid,'SELECT') AS authenticated_select FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r'`,
    );
    assert.ok(result.rows.length >= 30);
    for (const row of result.rows) {
      assert.equal(row.relrowsecurity, true, row.relname);
      assert.equal(row.anon_select, false, row.relname);
      assert.equal(row.authenticated_select, false, row.relname);
    }
  });
  await test("faculty film attachment persists, rejects unsafe URLs and renders in the lesson", async () => {
    const body = {
      lessonId: lessons[0].id,
      videoUrl: "https://youtu.be/abcdefghijk",
    };
    assert.equal(
      (
        await request("/api/admin/teaching-media", {
          who: "student",
          method: "PATCH",
          body,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("/api/admin/teaching-media", {
          who: "admin",
          method: "PATCH",
          body: { ...body, videoUrl: "javascript:alert(1)" },
        })
      ).status,
      400,
    );
    const saved = await request("/api/admin/teaching-media", {
      who: "admin",
      method: "PATCH",
      body,
    });
    assert.equal(saved.status, 200, await saved.text());
    assert.equal(
      (await prisma.lesson.findUnique({ where: { id: lessons[0].id } }))
        .videoUrl,
      body.videoUrl,
    );
    const page = await request(
      `/dashboard/courses/${course.slug}/lessons/${lessons[0].id}`,
      { who: "student" },
    );
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Play the teaching/);
  });
  writeFileSync(
    "/tmp/anw-journey-results.json",
    JSON.stringify(
      {
        scope:
          "Local PostgreSQL + identity contract fixture; hosted integration and browser behavior not verified",
        results,
      },
      null,
      2,
    ),
  );
  console.log(`${results.length} isolated journey tests passed.`);
} catch (error) {
  console.error(error);
  console.error(logs.slice(-5000));
  process.exitCode = 1;
} finally {
  // The custom Next development server can retain framework watchers/pools.
  // All fixtures are memory-only; preserve the assertion exit code on shutdown.
  const shutdownDeadline = setTimeout(
    () => process.exit(process.exitCode || 0),
    5000,
  );
  app.closeAllConnections();
  await new Promise((resolve) => app.close(resolve));
  await academy.close();
  await new Promise((resolve) => auth.close(resolve));
  await prisma.$disconnect();
  await pool.end();
  await server.stop();
  await db.close();
  clearTimeout(shutdownDeadline);
  process.exit(process.exitCode || 0);
}
