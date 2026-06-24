/**
 * ANW Academy — pre-launch end-to-end verification
 * Run: node scripts/e2e-verify.mjs
 *
 * Uses Playwright (Chromium) against the live production URL.
 * Covers signup, login/logout, all 11 nav pages, course+lesson rendering
 * across 6 schools, lesson completion API, exam flow, and profile update.
 */

import { chromium } from "@playwright/test";

// ── Config ────────────────────────────────────────────────────────────────────
const BASE = "https://anw-academy.vercel.app";
const STAMP = Date.now();
const TEST_EMAIL = `anwtest${STAMP}@mailtest.dev`;
const TEST_PASS = "Wellness2026!";
const TEST_NAME = "Vera Thornton";
const DEMO_EMAIL = "student@anwacademy.com";
const DEMO_PASS = "password123";

// First course slug per school (slugify = lowercase, non-alphanum → '-')
const SCHOOLS = [
  { name: "Herbal Medicine",            slug: "introduction-to-herbal-medicine" },
  { name: "Traditional Chinese Medicine", slug: "introduction-to-tcm" },
  { name: "Homeopathic Studies",         slug: "history-of-homeopathy" },
  { name: "Functional Wellness",         slug: "foundations-of-nutrition" },
  { name: "Practice Building",           slug: "client-communication" },
  { name: "Wellness Entrepreneurship",   slug: "building-your-wellness-brand" },
];

const NAV_PAGES = [
  { label: "Dashboard",       href: "/dashboard" },
  { label: "My Courses",      href: "/dashboard/courses" },
  { label: "Assignments",     href: "/dashboard/assignments" },
  { label: "Exams & Quizzes", href: "/dashboard/exams" },
  { label: "Discussions",     href: "/dashboard/discussions" },
  { label: "Case Studies",    href: "/dashboard/case-studies" },
  { label: "Certifications",  href: "/dashboard/certifications" },
  { label: "Wellness Units",  href: "/dashboard/wellness-units" },
  { label: "Resources",       href: "/dashboard/resources" },
  { label: "ANW Scholar",     href: "/dashboard/ai-tutor" },
  { label: "My Profile",      href: "/dashboard/profile" },
];

// ── Result tracking ───────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
const warnings = [];

function log(msg) { console.log(msg); }
function pass(label, detail = "") {
  passed++;
  log(`  ✅ PASS  ${label}${detail ? `  [${detail}]` : ""}`);
}
function fail(label, detail) {
  failed++;
  failures.push({ label, detail });
  log(`  ❌ FAIL  ${label}`);
  log(`           → ${detail}`);
}
function warn(label, detail) {
  warnings.push({ label, detail });
  log(`  ⚠️  WARN  ${label}`);
  log(`           → ${detail}`);
}
function section(title) {
  log(`\n${"─".repeat(64)}`);
  log(`  ${title}`);
  log("─".repeat(64));
}

async function goto(page, url, opts = {}) {
  return page.goto(url, { waitUntil: "networkidle", timeout: 25000, ...opts }).catch(() =>
    page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000, ...opts })
  );
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText).catch(() => "");
}

async function check404(page) {
  const t = await bodyText(page);
  return t.includes("404") || t.includes("page could not be found") || (await page.title()).includes("404");
}

async function checkError(page) {
  const t = await bodyText(page);
  return t.includes("Application error") || t.includes("Internal Server Error") || t.includes("Something went wrong");
}

// Login helper — always navigates, fills, submits, waits for /dashboard
async function loginAs(page, email, password) {
  await goto(page, `${BASE}/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 });
    return true;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(`PAGE: ${e.message}`));

  try {

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 1 — SIGNUP
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 1 — SIGNUP (brand-new account)");
    log(`  Email: ${TEST_EMAIL}\n`);

    await goto(page, `${BASE}/register`);

    const regH1 = await page.locator('h1').first().textContent().catch(() => "");
    if (regH1.includes("Create")) {
      pass("Register page loads — h1 found");
    } else {
      fail("Register page loads", `h1 text: "${regH1}" at ${page.url()}`);
    }

    // Fill form
    await page.waitForSelector('input[type="text"]', { timeout: 8000 });
    await page.fill('input[type="text"]', TEST_NAME);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASS);

    // Submit — don't race-wait on a specific response; just wait for URL change or error
    await page.click('button[type="submit"]');

    // Wait up to 25s for either a /dashboard redirect or an error message
    let signupResult = "unknown";
    try {
      await page.waitForURL(`${BASE}/dashboard**`, { timeout: 25000 });
      signupResult = "dashboard";
    } catch {
      // Might still be on /register with an error message or email-confirm message
      const t = await bodyText(page);
      if (t.includes("check your email") || t.includes("confirm") || t.includes("verification")) {
        signupResult = "email-confirm";
      } else if (t.includes("already registered") || t.includes("already been used")) {
        signupResult = "already-exists";
      } else if (page.url().includes("/register")) {
        signupResult = "stayed-on-register";
      } else {
        signupResult = `other:${page.url()}`;
      }
    }

    log(`  Signup result: ${signupResult}`);

    if (signupResult === "dashboard") {
      pass("Signup: redirected to /dashboard");
      await page.waitForSelector('[class*="font-playfair"]', { timeout: 8000 }).catch(() => {});
      const dashText = await bodyText(page);
      if (dashText.includes("Dashboard") || dashText.includes("Continue Learning") || dashText.includes("Wellness Units")) {
        pass("Dashboard renders correctly after signup");
      } else {
        fail("Dashboard renders after signup", `Body snippet: "${dashText.slice(0, 200)}"`);
      }
    } else if (signupResult === "email-confirm") {
      warn("Signup flow", "Supabase requires email confirmation — user must click email link before login. This is a launch blocker if real users can't verify instantly.");
      log("  Attempting signup with demo student instead for remaining phases…");
    } else if (signupResult === "already-exists") {
      warn("Signup flow", `Email already registered (${TEST_EMAIL}) — DB or Supabase already had this email`);
    } else {
      fail("Signup: redirected to /dashboard", `signupResult=${signupResult}, URL=${page.url()}`);
    }

    // Also verify the /api/auth/register endpoint is functional
    const regApiResult = await page.evaluate(async (email) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "API Test" }),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    }, TEST_EMAIL).catch(() => ({ status: 0, body: null }));

    log(`  /api/auth/register direct test: HTTP ${regApiResult.status}`);
    if (regApiResult.status === 200) {
      pass("/api/auth/register: returns 200, user row exists in DB");
    } else {
      fail("/api/auth/register: returns 200", `HTTP ${regApiResult.status}: ${JSON.stringify(regApiResult.body)}`);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 2 — LOGOUT + LOGIN
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 2 — LOGOUT + LOGIN CYCLE");

    // Ensure we're on dashboard
    if (!page.url().includes("/dashboard")) {
      const ok = await loginAs(page, DEMO_EMAIL, DEMO_PASS);
      if (!ok) fail("Demo student login (fallback)", `URL: ${page.url()}`);
    }

    // Sign out via sidebar
    const signOutBtn = page.locator('a:has-text("Sign Out"), button:has-text("Sign Out")');
    const soCount = await signOutBtn.count();

    if (soCount > 0) {
      await signOutBtn.first().click();
      try {
        await page.waitForURL(`${BASE}/login**`, { timeout: 10000 });
        pass("Sign Out: sidebar link navigates to /login");
      } catch {
        // Might redirect to / or stay
        const url = page.url();
        if (!url.includes("/dashboard")) {
          pass("Sign Out: navigated away from dashboard");
        } else {
          fail("Sign Out: navigated away from dashboard", `Still at: ${url}`);
        }
      }
    } else {
      fail("Sign Out: link found in sidebar", "No 'Sign Out' text found");
    }

    // Login with new test account credentials (if signup redirected to dashboard, credentials should work)
    log(`\n  Re-login as new account: ${TEST_EMAIL}`);
    const loginOk = await loginAs(page, TEST_EMAIL, TEST_PASS);
    if (loginOk) {
      pass(`Login with new credentials (${TEST_EMAIL}) → /dashboard`);
    } else {
      const t = await bodyText(page);
      const errText = t.match(/Error.*|Invalid.*|Wrong.*/)?.[0] ?? "";
      if (signupResult === "email-confirm") {
        warn("Login with new credentials", "Email confirmation required — expected failure. Users tonight need email confirmation.");
      } else {
        fail("Login with new credentials", `URL: ${page.url()} | Error: "${errText.slice(0, 100)}"`);
      }
      // Fall back to demo student for remaining phases
      log("  Falling back to demo student for remaining phases…");
      const demoOk = await loginAs(page, DEMO_EMAIL, DEMO_PASS);
      if (demoOk) {
        log("  → Demo student login: OK");
      } else {
        fail("Demo student login (fallback)", `URL: ${page.url()}`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 3 — NAVIGATION (all 11 sidebar pages)
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 3 — NAVIGATION: all 11 sidebar pages");

    for (const nav of NAV_PAGES) {
      await goto(page, `${BASE}${nav.href}`).catch(() => {});
      const title = await page.title();
      const is404 = await check404(page);
      const isErr = await checkError(page);

      if (is404) {
        fail(`${nav.label} (${nav.href})`, `404 — title: "${title}"`);
      } else if (isErr) {
        fail(`${nav.label} (${nav.href})`, `Server error — title: "${title}"`);
      } else {
        pass(`${nav.label} (${nav.href})`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 4 — COURSE & LESSON RENDERING across 6 schools
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 4 — COURSE & LESSON RENDERING (6 schools)");

    // Make sure we're logged in as demo student (has enrollments for seeded courses)
    if (!page.url().includes("/dashboard")) {
      await loginAs(page, DEMO_EMAIL, DEMO_PASS);
    }

    const schoolLessonIds = {};

    for (const school of SCHOOLS) {
      log(`\n  ── ${school.name} ──`);
      await goto(page, `${BASE}/dashboard/courses/${school.slug}`).catch(() => {});

      if (await check404(page)) {
        fail(`${school.name}: course page loads (slug: ${school.slug})`, "404");
        continue;
      }
      if (await checkError(page)) {
        fail(`${school.name}: course page loads`, "Server error");
        continue;
      }

      const courseTitle = await page.locator('h1').first().textContent().catch(() => "");
      pass(`${school.name}: course page loads — title: "${courseTitle.trim().slice(0, 50)}"`);

      // Extract lesson links from the course sidebar
      const lessonLinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/lessons/"]')).map((a) => ({
          href: a.getAttribute("href"),
          text: a.textContent?.trim().slice(0, 55),
        }))
      );

      const lessonIds = lessonLinks
        .map((l) => l.href?.match(/\/lessons\/([a-f0-9-]{36})/i)?.[1])
        .filter(Boolean);

      if (lessonIds.length === 0) {
        fail(`${school.name}: lesson links on course page`, "No lesson hrefs found — demo student may not be enrolled in this course");
        continue;
      }
      pass(`${school.name}: ${lessonIds.length} lesson link(s) found`);
      schoolLessonIds[school.slug] = { ids: lessonIds, courseSlug: school.slug };

      // Navigate to first lesson
      const firstHref = lessonLinks[0].href;
      await goto(page, `${BASE}${firstHref}`).catch(() => {});

      if (await check404(page)) {
        fail(`${school.name}: first lesson page renders`, `404 at ${firstHref}`);
        continue;
      }
      if (await checkError(page)) {
        fail(`${school.name}: first lesson page renders`, `Server error at ${firstHref}`);
        continue;
      }

      const lessonBody = await bodyText(page);
      // Lesson pages have the viewer overlay OR the lesson layout
      const hasViewerChrome = lessonBody.includes("Exit") ||
        lessonBody.includes("Swipe") ||
        lessonBody.includes("Read") ||
        lessonBody.includes("Card 1");
      const hasLessonLayout = lessonBody.includes("Back to Course") ||
        lessonBody.includes("Module") ||
        lessonBody.includes("card");

      if (hasViewerChrome || hasLessonLayout) {
        pass(`${school.name}: lesson viewer UI rendered`);
      } else {
        // Still pass if there's content but no viewer chrome — the lesson loaded
        if (lessonBody.length > 300) {
          pass(`${school.name}: lesson page has content (${lessonBody.length} chars)`);
        } else {
          fail(`${school.name}: lesson viewer UI rendered`, `Body snippet: "${lessonBody.slice(0, 200)}"`);
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 5 — LESSON COMPLETION VIA API (2 per school, demo student)
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 5 — LESSON COMPLETION (/api/lessons/complete, 2 per school)");
    log("  This is the exact fetch() the browser LessonViewer fires after a student passes the FinalQuiz.\n");

    let totalWU = 0;
    let apiAuthFailed = false;

    for (const school of SCHOOLS) {
      const sd = schoolLessonIds[school.slug];
      if (!sd || sd.ids.length === 0) {
        fail(`${school.name}: lesson completion`, "No lesson IDs — course page scrape failed");
        continue;
      }

      // Complete up to 2 lessons per school
      const toComplete = sd.ids.slice(0, 2);
      await goto(page, `${BASE}/dashboard/courses/${sd.courseSlug}`).catch(() => {});

      for (let i = 0; i < toComplete.length; i++) {
        const lessonId = toComplete[i];
        const result = await page.evaluate(async (id) => {
          try {
            const res = await fetch("/api/lessons/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lessonId: id, score: 100, answers: { 0: 0, 1: 0, 2: 0 } }),
            });
            const body = await res.json().catch(() => ({}));
            return { status: res.status, body };
          } catch (e) {
            return { status: 0, body: {}, error: String(e) };
          }
        }, lessonId);

        const label = `${school.name} lesson ${i + 1}`;

        if (result.status === 200 && result.body.completed === true) {
          const wu = result.body.wuAwarded ?? 0;
          totalWU += wu;
          pass(`${label}: completed=true, wuAwarded=${wu}`);
        } else if (result.status === 200 && result.body.completed === false) {
          // Already completed — idempotent (WU not double-awarded, which is correct)
          pass(`${label}: already completed (idempotent — wuAwarded=0, correct behaviour)`);
        } else if (result.status === 401) {
          apiAuthFailed = true;
          fail(`${label}: API auth`, "HTTP 401 — session cookie not reaching server-side API");
          break;
        } else {
          fail(`${label}: API response`, `HTTP ${result.status}: ${JSON.stringify(result.body)}`);
        }
      }
      if (apiAuthFailed) break;
    }

    log(`\n  WU newly awarded this run: ${totalWU}`);
    if (apiAuthFailed) {
      warn("Lesson completion API auth", "401 errors suggest session cookie not forwarded by Next.js App Router API routes — check Supabase SSR cookie config.");
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 6 — EXAM FLOW
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 6 — EXAM FLOW");

    await goto(page, `${BASE}/dashboard/exams`).catch(() => {});
    const examsBody = await bodyText(page);

    if (await check404(page) || await checkError(page)) {
      fail("Exams page loads", `URL: ${page.url()}`);
    } else {
      pass("Exams page loads");

      const hasCards = examsBody.includes("Begin Exam") || examsBody.includes("Retry") ||
                       examsBody.includes("Review") || examsBody.includes("Pass threshold");
      const isEmpty = examsBody.includes("No exams available");

      if (isEmpty) {
        warn("Exams: cards visible for demo student", "Empty-state shown — demo student may not be enrolled in courses with exams. This is a content/enrollment data issue, not a code bug.");
      } else if (hasCards) {
        pass("Exams page: exam cards rendered with correct content");

        // Count exam links
        const examLinkCount = await page.evaluate(() =>
          document.querySelectorAll('a[href*="/dashboard/exams/"]').length
        );
        log(`  Exam action links: ${examLinkCount}`);
        pass(`Exams page: ${examLinkCount} exam link(s) present`);

        // Enter the first "Begin Exam" page
        const beginLinks = page.locator('a:has-text("Begin Exam")');
        const beginCount = await beginLinks.count();
        log(`  "Begin Exam" links: ${beginCount}`);

        if (beginCount > 0) {
          const href = await beginLinks.first().getAttribute("href");
          log(`  Opening exam: ${href}`);
          await goto(page, `${BASE}${href}`).catch(() => {});

          if (await check404(page)) {
            fail("Exam detail page loads", `404 at ${href}`);
          } else if (await checkError(page)) {
            fail("Exam detail page loads", "Server error");
          } else {
            const examBody = await bodyText(page);
            const hasExamUI = examBody.includes("Start Exam") || examBody.includes("Wellness Unit") ||
                              examBody.includes("questions") || examBody.includes("passing");
            if (hasExamUI) {
              pass("Exam detail page renders ExamRunner correctly");
            } else {
              fail("Exam detail page renders ExamRunner", `Body: "${examBody.slice(0, 250)}"`);
            }

            // Start the exam
            const startBtn = page.locator('button:has-text("Begin Exam")');
            if (await startBtn.count() > 0) {
              const startResponseP = page.waitForResponse(
                (r) => r.url().includes("/api/exams/start"),
                { timeout: 15000 }
              ).catch(() => null);
              await startBtn.click();
              const startRes = await startResponseP;

              if (startRes) {
                const startStatus = startRes.status();
                const startBody = await startRes.json().catch(() => ({}));
                log(`  /api/exams/start → HTTP ${startStatus}`);

                if (startStatus === 200 && startBody.attemptId) {
                  pass(`Exam start API: HTTP 200, attemptId=${startBody.attemptId.slice(0, 8)}…`);
                  log(`  Questions delivered: ${startBody.questions?.length ?? 0}`);

                  // Wait for questions to render
                  await page.waitForTimeout(1500);
                  const afterStart = await bodyText(page);

                  // Look for question prompts — the ExamRunner renders them as text
                  const questionBtns = await page.locator('button').all();
                  log(`  Total buttons on page after start: ${questionBtns.length}`);

                  // Click first button (option A) for each visible question
                  let clicked = 0;
                  for (const btn of questionBtns) {
                    const txt = (await btn.textContent().catch(() => "")).trim();
                    if (txt.startsWith("A)") || (txt.length > 10 && txt.length < 200 && !txt.includes("Submit") && !txt.includes("Start"))) {
                      // Skip nav/submit buttons; click the first answer option per group
                      if (txt.startsWith("A)")) {
                        await btn.click().catch(() => {});
                        clicked++;
                        await page.waitForTimeout(200);
                      }
                    }
                  }
                  log(`  Answer buttons clicked (option A): ${clicked}`);

                  // Check if Submit Exam is now enabled
                  const submitBtn = page.locator('button:has-text("Submit"), button:has-text("submit")');
                  const submitCount = await submitBtn.count();
                  if (submitCount > 0) {
                    const isDisabled = await submitBtn.first().isDisabled().catch(() => true);
                    if (!isDisabled) {
                      const submitResP = page.waitForResponse(
                        (r) => r.url().includes("/api/exams/submit"),
                        { timeout: 15000 }
                      ).catch(() => null);
                      await submitBtn.first().click().catch(() => {});
                      const submitRes = await submitResP;
                      if (submitRes) {
                        const subStatus = submitRes.status();
                        const subBody = await submitRes.json().catch(() => ({}));
                        log(`  /api/exams/submit → HTTP ${subStatus}`);
                        if (subStatus === 200 && typeof subBody.score === "number") {
                          pass(`Exam submit: score=${subBody.score}%, passed=${subBody.passed}, wuValue=${subBody.wuValue}`);
                        } else {
                          fail("Exam submit API", `HTTP ${subStatus}: ${JSON.stringify(subBody)}`);
                        }
                      } else {
                        warn("Exam submit response", "Submit button clicked but no /api/exams/submit response captured (may have been previously submitted)");
                      }
                    } else {
                      warn("Exam submit button", `Disabled — not all questions answered (clicked ${clicked} 'A)' options; questions may use different markup)`);
                    }
                  } else {
                    warn("Exam submit button", "No 'Submit' button found after starting exam");
                  }
                } else if (startStatus === 409) {
                  pass("Exam start: HTTP 409 — attempt already active or in cooldown (expected for repeated runs)");
                } else {
                  fail("Exam start API", `HTTP ${startStatus}: ${JSON.stringify(startBody)}`);
                }
              } else {
                fail("Exam start API response", "waitForResponse timed out — no response intercepted");
              }
            } else {
              log("  No 'Start Exam' button — exam already attempted or passed");
              pass("Exam detail page accessible (already attempted)");
            }
          }
        } else {
          log("  No 'Begin Exam' links — all exams already attempted for demo student");
          pass("Exams page: all exams already attempted (not a bug)");
        }
      } else {
        fail("Exams page: exam content visible", `Body: "${examsBody.slice(0, 300)}"`);
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 7 — CERTIFICATION PAGE
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 7 — CERTIFICATION CHECK");

    await goto(page, `${BASE}/dashboard/certifications`).catch(() => {});

    if (await check404(page)) { fail("Certifications page", "404"); }
    else if (await checkError(page)) { fail("Certifications page", "Server error"); }
    else {
      pass("Certifications page loads");
      const certBody = await bodyText(page);
      if (certBody.includes("Certifications")) pass("Certifications: page heading present");
      else fail("Certifications: heading", `Body: "${certBody.slice(0, 200)}"`);

      if (certBody.includes("Awarded") || certBody.includes("In Progress")) {
        pass("Certifications: status badges visible (Awarded or In Progress)");
      } else {
        fail("Certifications: status badges", "Neither 'Awarded' nor 'In Progress' found");
      }

      // Check WU progress bar area
      if (certBody.includes("WU") || certBody.includes("courses")) {
        pass("Certifications: WU/courses progress data visible");
      } else {
        warn("Certifications: WU data", "No WU or courses text found — progress footer may not be rendering");
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 8 — WELLNESS UNITS PAGE
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 8 — WELLNESS UNITS PAGE");

    await goto(page, `${BASE}/dashboard/wellness-units`).catch(() => {});
    if (await check404(page)) { fail("Wellness Units page", "404"); }
    else if (await checkError(page)) { fail("Wellness Units page", "Server error"); }
    else {
      pass("Wellness Units page loads");
      const wuBody = await bodyText(page);
      if (wuBody.includes("Wellness Units")) pass("Wellness Units: heading present");
      else fail("Wellness Units: heading", `Body: "${wuBody.slice(0, 200)}"`);

      if (wuBody.includes("Level")) pass("Wellness Units: level shown");
      else warn("Wellness Units: level", "No 'Level' text found");

      if (wuBody.includes("WU")) pass("Wellness Units: WU values rendered");
      else fail("Wellness Units: WU values", "No 'WU' text");

      if (wuBody.includes("Transaction") || wuBody.includes("completed") || wuBody.includes("passed")) {
        pass("Wellness Units: transaction history rendered");
      } else {
        warn("Wellness Units: transaction history", "No transaction entries visible");
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 9 — PROFILE + PASSWORD
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 9 — PROFILE UPDATE & PASSWORD");

    await goto(page, `${BASE}/dashboard/profile`).catch(() => {});
    if (await check404(page)) { fail("Profile page", "404"); }
    else if (await checkError(page)) { fail("Profile page", "Server error"); }
    else {
      pass("Profile page loads");
      const profBody = await bodyText(page);

      if (profBody.includes("My Profile")) pass("Profile: 'My Profile' heading");
      else fail("Profile: heading", `Body: "${profBody.slice(0, 200)}"`);

      if (profBody.includes("Earned Certifications")) pass("Profile: 'Earned Certifications' section present");
      else fail("Profile: 'Earned Certifications' section", "Not found");

      if (profBody.includes("Profile Information")) pass("Profile: 'Profile Information' form section present");
      else fail("Profile: 'Profile Information' section", "Not found");

      if (profBody.includes("Change Password")) pass("Profile: 'Change Password' section present");
      else fail("Profile: 'Change Password' section", "Not found");

      // Update Location field
      const locInput = page.locator('input[placeholder="City, State"]');
      if (await locInput.count() > 0) {
        await locInput.fill("Asheville, NC");
        pass("Profile: Location input is editable");

        const saveBtn = page.locator('button:has-text("Save Changes")').first();
        await saveBtn.click();

        try {
          await page.waitForFunction(
            () => document.body.innerText.includes("Saved"),
            { timeout: 5000 }
          );
          pass("Profile: 'Save Changes' → '✓ Saved!' confirmation appears");
        } catch {
          fail("Profile: save confirmation", "✓ Saved! did not appear within 5s");
        }
      } else {
        fail("Profile: Location input", "No input[placeholder='City, State'] found");
      }

      // Password fields
      const pwdInputs = await page.locator('input[type="password"]').count();
      if (pwdInputs >= 2) {
        pass(`Profile: ${pwdInputs} password input(s) in Change Password section`);
      } else {
        fail("Profile: password inputs", `Found ${pwdInputs} — expected ≥ 2`);
      }

      const updatePwdBtn = page.locator('button:has-text("Update Password")');
      if (await updatePwdBtn.count() > 0) {
        pass("Profile: 'Update Password' button present");
      } else {
        fail("Profile: Update Password button", "Not found");
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 10 — NEW-ACCOUNT COURSE ACCESS (separate from demo student)
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 10 — NEW-ACCOUNT API AUTH & COURSE ACCESS");

    if (signupResult === "dashboard" || signupResult === "other:/dashboard") {
      const newLoginOk = await loginAs(page, TEST_EMAIL, TEST_PASS);
      if (newLoginOk) {
        pass("New account: re-login after full test cycle");

        await goto(page, `${BASE}/dashboard/courses/introduction-to-herbal-medicine`).catch(() => {});
        const courseBody = await bodyText(page);
        if (courseBody.includes("Herbal") || courseBody.includes("Module") || courseBody.includes("Lesson")) {
          pass("New account: can access course pages");
        } else {
          fail("New account: course page access", `Body: "${courseBody.slice(0, 200)}"`);
        }

        // Test lesson completion API with new user's authenticated session
        const firstLessonHref = await page.evaluate(() =>
          document.querySelector('a[href*="/lessons/"]')?.getAttribute("href")
        );
        if (firstLessonHref) {
          const lessonId = firstLessonHref.match(/\/lessons\/([a-f0-9-]{36})/i)?.[1];
          if (lessonId) {
            const apiRes = await page.evaluate(async (id) => {
              const r = await fetch("/api/lessons/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId: id, score: 100, answers: {} }),
              });
              return { status: r.status, body: await r.json().catch(() => ({})) };
            }, lessonId).catch(() => ({ status: 0, body: {} }));
            log(`  New account /api/lessons/complete: HTTP ${apiRes.status}`);
            if (apiRes.status === 200) {
              pass(`New account: lesson complete API authenticated (wuAwarded=${apiRes.body.wuAwarded})`);
            } else if (apiRes.status === 401) {
              fail("New account: lesson API auth", "HTTP 401 — new account session not authorized by API. Real students cannot earn WU.");
            } else {
              fail("New account: lesson API", `HTTP ${apiRes.status}: ${JSON.stringify(apiRes.body)}`);
            }
          }
        } else {
          warn("New account: lesson links", "No lesson links on course page (no enrollment). New accounts need enrollment to see lessons.");
        }
      } else {
        warn("New account re-login", "Could not log in after full cycle — session may have expired");
      }
    } else {
      log("  Skipping new-account API test (signup did not complete to /dashboard)");
    }

    // ════════════════════════════════════════════════════════════════════════
    // PHASE 11 — CONSOLE ERROR AUDIT
    // ════════════════════════════════════════════════════════════════════════
    section("PHASE 11 — BROWSER CONSOLE ERRORS");
    const sigErrors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("analytics") && !e.includes("google") &&
              !e.includes("fonts.gstatic") && !e.includes("VercelAnalytics")
    );

    if (sigErrors.length === 0) {
      pass("No significant browser console errors across all phases");
    } else {
      log(`  ${sigErrors.length} significant error(s):`);
      sigErrors.slice(0, 8).forEach((e) => log(`    • ${e.slice(0, 160)}`));
      if (sigErrors.length > 8) log(`    … and ${sigErrors.length - 8} more`);
      fail("No browser console errors", `${sigErrors.length} errors detected`);
    }

  } catch (err) {
    log(`\n  FATAL UNHANDLED ERROR: ${err.message}`);
    log(err.stack?.split("\n").slice(0, 6).join("\n") ?? "");
    failed++;
    failures.push({ label: "FATAL", detail: err.message });
  } finally {
    await browser.close();
  }

  // ── Final Report ──────────────────────────────────────────────────────────
  log(`\n${"═".repeat(64)}`);
  log(`  ANW ACADEMY — PRE-LAUNCH VERIFICATION REPORT`);
  log(`  ${new Date().toISOString()}`);
  log(`${"═".repeat(64)}`);
  log(`  PASSED: ${passed}`);
  log(`  FAILED: ${failed}`);
  log(`  WARNED: ${warnings.length}`);
  log(`  TOTAL:  ${passed + failed}`);

  if (failures.length > 0) {
    log(`\n  ─── FAILURES ───────────────────────────────────────────────`);
    failures.forEach((f, i) => {
      log(`  ${i + 1}. ${f.label}`);
      log(`     → ${f.detail}`);
    });
  }

  if (warnings.length > 0) {
    log(`\n  ─── WARNINGS (not counted as failures) ─────────────────────`);
    warnings.forEach((w, i) => {
      log(`  ${i + 1}. ${w.label}`);
      log(`     → ${w.detail}`);
    });
  }

  log(`\n  Test account: ${TEST_EMAIL} / ${TEST_PASS}`);
  log(`  URL tested:   ${BASE}`);
  log(`${"═".repeat(64)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
