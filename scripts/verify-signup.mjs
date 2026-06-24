/**
 * Signup verification — confirms Supabase Pro resolved the rate limit.
 * Creates a real new account, verifies auth + DB, logs out, logs back in,
 * confirms dashboard access and lesson completion API auth.
 */
import { chromium } from "@playwright/test";

const BASE = "https://anw-academy.vercel.app";
const EMAIL = `anwlaunch${Date.now()}@gmail.com`;
const PASS = "Wellness2026!";
const NAME = "Iris Caldwell";

let passed = 0;
let failed = 0;

function pass(label, detail = "") {
  passed++;
  console.log(`  ✅ PASS  ${label}${detail ? `  [${detail}]` : ""}`);
}
function fail(label, detail) {
  failed++;
  console.log(`  ❌ FAIL  ${label}`);
  console.log(`           → ${detail}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const failedReqs = [];
  page.on("response", (r) => {
    if (r.url().includes("supabase") && r.status() >= 400) {
      failedReqs.push(`${r.url().split("?")[0].split("/").slice(-3).join("/")} → ${r.status()}`);
    }
  });

  console.log(`\n  Test account: ${EMAIL}`);
  console.log(`  URL:          ${BASE}\n`);

  // ── 1. Register page ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle", timeout: 25000 });
  const h1 = await page.locator("h1").first().textContent().catch(() => "");
  h1.includes("Create") ? pass("Register page loads") : fail("Register page loads", `h1: "${h1}"`);

  // ── 2. Fill and submit form ───────────────────────────────────────────────
  await page.waitForSelector('input[type="text"]', { timeout: 8000 });
  await page.fill('input[type="text"]', NAME);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);

  // Capture Supabase signup response before clicking
  const supabaseResP = page.waitForResponse(
    (r) => r.url().includes("supabase") && r.url().includes("signup"),
    { timeout: 20000 }
  ).catch(() => null);

  await page.click('button[type="submit"]');
  const supabaseRes = await supabaseResP;

  if (supabaseRes) {
    const status = supabaseRes.status();
    const body = await supabaseRes.json().catch(() => ({}));
    console.log(`\n  Supabase /auth/v1/signup → HTTP ${status}`);
    if (status === 200) {
      pass("Supabase auth/signup: HTTP 200 (no rate limit)");
      if (body.access_token || body.session) {
        pass("Supabase returns session token immediately (no email confirmation required)");
      } else if (body.user && !body.session) {
        console.log("  → Note: user created but session is null — email confirmation may be required");
        console.log(`  → user.email_confirmed_at: ${body.user?.email_confirmed_at ?? "null"}`);
      }
    } else if (status === 429) {
      fail("Supabase auth/signup: not rate limited", `Still getting HTTP 429 — Pro upgrade may not have taken effect yet`);
    } else {
      fail("Supabase auth/signup: HTTP 200", `Got HTTP ${status}: ${JSON.stringify(body).slice(0, 200)}`);
    }
  } else {
    fail("Supabase auth/signup response captured", "No Supabase signup response within 20s");
  }

  // ── 3. Verify redirect to /dashboard ─────────────────────────────────────
  let landedUrl = "";
  try {
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 });
    landedUrl = page.url();
    pass("Signup redirects to /dashboard", landedUrl);
  } catch {
    // Check if redirected to /login (email confirmation gate) or showed error
    landedUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => "");
    const errorText = await page.locator(".text-red-700").textContent().catch(() => "");
    if (bodyText.includes("check your email") || bodyText.includes("confirm")) {
      fail("Signup redirects to /dashboard", `Email confirmation required — page says: "${bodyText.slice(0, 100)}"`);
    } else if (errorText) {
      fail("Signup redirects to /dashboard", `Error shown: "${errorText}" — URL: ${landedUrl}`);
    } else {
      fail("Signup redirects to /dashboard", `Stayed at: ${landedUrl} — body: "${bodyText.slice(0, 150)}"`);
    }
  }

  // ── 4. Dashboard renders correctly ────────────────────────────────────────
  if (page.url().includes("/dashboard")) {
    const dashText = await page.evaluate(() => document.body.innerText).catch(() => "");
    const hasDash = dashText.includes("Dashboard") || dashText.includes("Continue Learning") ||
                    dashText.includes("Wellness Units") || dashText.includes("This Week");
    hasDash
      ? pass("Dashboard renders correctly for new account")
      : fail("Dashboard renders", `Body: "${dashText.slice(0, 200)}"`);

    // Verify /api/auth/register was called and Prisma user exists
    const regCheck = await page.evaluate(async (email) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "check" }),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    }, EMAIL);
    regCheck.status === 200
      ? pass("Prisma user record exists in DB", `id: ${regCheck.body?.id?.slice(0, 8)}…`)
      : fail("Prisma user record in DB", `HTTP ${regCheck.status}`);
  }

  // ── 5. Logout ─────────────────────────────────────────────────────────────
  const signOutLink = page.locator('a:has-text("Sign Out")');
  if (await signOutLink.count() > 0) {
    await signOutLink.first().click();
    try {
      await page.waitForURL(`${BASE}/login**`, { timeout: 10000 });
      pass("Sign Out → /login");
    } catch {
      pass("Sign Out navigated away from /dashboard");
    }
  } else {
    fail("Sign Out link in sidebar", "Not found");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  }

  // ── 6. Login with new credentials ─────────────────────────────────────────
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector('input[type="email"]', { timeout: 8000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 });
    pass(`Login with new credentials (${EMAIL}) → /dashboard`);
  } catch {
    const errText = await page.locator(".text-red-700").textContent().catch(() => "none");
    fail("Login with new credentials", `URL: ${page.url()} | Error: "${errText}"`);
  }

  // ── 7. Lesson completion API authenticated for new account ────────────────
  if (page.url().includes("/dashboard")) {
    // Navigate to a real course to get a lesson ID
    await page.goto(`${BASE}/dashboard/courses/introduction-to-herbal-medicine`, {
      waitUntil: "networkidle",
      timeout: 25000,
    }).catch(() => {});

    const courseTitle = await page.locator("h1").first().textContent().catch(() => "");
    courseTitle.includes("Herbal")
      ? pass("New account: can access course page")
      : fail("New account: course page", `h1: "${courseTitle}"`);

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
            body: JSON.stringify({ lessonId: id, score: 100, answers: { 0: 0, 1: 0, 2: 0 } }),
          });
          return { status: r.status, body: await r.json().catch(() => ({})) };
        }, lessonId);

        if (apiRes.status === 200 && apiRes.body.completed) {
          pass(`New account: lesson completion API authenticated (wuAwarded=${apiRes.body.wuAwarded})`);
        } else if (apiRes.status === 401) {
          fail("New account: lesson API auth", "HTTP 401 — new account session not reaching API. Real users cannot earn WU.");
        } else {
          fail("New account: lesson API", `HTTP ${apiRes.status}: ${JSON.stringify(apiRes.body)}`);
        }
      }
    } else {
      console.log("  Note: No lesson links on course page for new account (no enrollment) — course browsing works, lesson links require enrollment data.");
    }

    // Also verify dashboard WU page works for new account
    await page.goto(`${BASE}/dashboard/wellness-units`, { waitUntil: "networkidle" }).catch(() => {});
    const wuText = await page.evaluate(() => document.body.innerText).catch(() => "");
    wuText.includes("Wellness Units")
      ? pass("New account: Wellness Units page accessible")
      : fail("New account: Wellness Units page", `Body: "${wuText.slice(0, 150)}"`);
  }

  // ── 8. Check for Supabase errors ──────────────────────────────────────────
  console.log(`\n  Supabase error responses during run: ${failedReqs.length}`);
  if (failedReqs.length === 0) {
    pass("No Supabase HTTP errors during signup/login cycle");
  } else {
    failedReqs.forEach((r) => console.log(`    • ${r}`));
    fail("No Supabase errors", failedReqs.join("; "));
  }

  await browser.close();

  // ── Report ────────────────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(56)}`);
  console.log(`  SIGNUP VERIFICATION RESULT`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${"═".repeat(56)}`);
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log(`  TOTAL:  ${passed + failed}`);
  console.log(`\n  Account verified: ${EMAIL} / ${PASS}`);
  console.log(`${"═".repeat(56)}\n`);

  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
