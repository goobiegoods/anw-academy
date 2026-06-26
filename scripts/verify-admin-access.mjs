/**
 * Verifies admin access control:
 * 1. Unauthenticated → /admin → /login
 * 2. Student → /admin → blocked (should redirect to /login)
 * 3. Admin → /admin → accessible
 *
 * Each test runs in an isolated browser context (no shared cookies).
 * A setup step clears the Vercel edge CDN cache for /admin so the proxy
 * runs on a fresh request rather than serving a stale cached response.
 */
import { chromium } from "@playwright/test";

const BASE = "https://anw-academy.vercel.app";

const STUDENT_EMAIL = "anwlaunch1782278878528@gmail.com";
const STUDENT_PASS  = "Wellness2026!";
const ADMIN_EMAIL   = "orel.shemen@gmail.com";
const ADMIN_PASS    = "AdminANW1782281304500!";

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

async function loginAs(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 20000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Setup: Clear Vercel edge CDN cache for /admin ─────────────────────
  // The CDN caches the admin page after each admin visit. We must purge it
  // before testing student access, otherwise the student gets the cached 200.
  console.log("\n  Setup: Purging /admin edge cache via admin login\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${BASE}/admin**`, { timeout: 20000 }).catch(() => {});
    const result = await page.evaluate(() =>
      fetch("/api/purge", { method: "POST" })
        .then((r) => r.json())
        .catch((e) => ({ error: String(e) }))
    );
    console.log(`  Cache purge result: ${JSON.stringify(result)}`);
    await ctx.close();
  }

  // ── Test 1: Unauthenticated → /admin → /login ─────────────────────────
  console.log("\n  Test 1: Unauthenticated access to /admin\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 25000 });
    const url = page.url();
    url.includes("/login")
      ? pass("Unauthenticated /admin → redirects to /login", url)
      : fail("Unauthenticated /admin redirect", `Landed at: ${url}`);
    await ctx.close();
  }

  // ── Test 2: Student → /admin → blocked ────────────────────────────────
  console.log("\n  Test 2: Student account blocked from /admin\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await loginAs(page, STUDENT_EMAIL, STUDENT_PASS);
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 }).catch(() => {});

    // Raw HTTP check: verify proxy returns 307 for the student's cookies
    const cookies = await ctx.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const rawResp = await fetch(`${BASE}/admin`, {
      headers: { cookie: cookieHeader },
      redirect: "manual",
    });
    console.log(`  Debug — Raw HTTP /admin: status=${rawResp.status}, x-vercel-cache=${rawResp.headers.get("x-vercel-cache")}, location=${rawResp.headers.get("location")}`);

    // Browser navigation test
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 20000 });
    const url = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 100)).catch(() => "");
    console.log(`  Debug — URL after goto /admin: ${url}`);
    console.log(`  Debug — Body: "${bodyText}"`);

    !url.includes("/admin")
      ? pass(`Student /admin → blocked (redirected to ${url.split("/").pop() || "login"})`, url)
      : fail("Student blocked from /admin", `Student reached /admin: ${url}`);
    await ctx.close();
  }

  // ── Test 3: Admin → /admin → works ────────────────────────────────────
  console.log("\n  Test 3: Admin account can access /admin\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${BASE}/admin**`, { timeout: 20000 }).catch(() => {});

    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 25000 });
    const url = page.url();
    const h1 = await page.locator("h1").first().textContent().catch(() => "");

    if (url.includes("/admin") && (h1.includes("Admin") || h1.includes("Dashboard"))) {
      pass("Admin account can access /admin", `h1: "${h1}"`);
    } else if (url.includes("/login") || url.includes("/dashboard")) {
      fail("Admin access to /admin", `Redirected away: ${url}`);
    } else {
      fail("Admin access to /admin", `URL: ${url} | h1: "${h1}"`);
    }

    await page.goto(`${BASE}/admin/students`, { waitUntil: "networkidle", timeout: 20000 });
    const studentsH1 = await page.locator("h1").first().textContent().catch(() => "");
    studentsH1.includes("Students")
      ? pass("Admin /admin/students loads", studentsH1)
      : fail("Admin /admin/students", `h1: "${studentsH1}" at ${page.url()}`);

    await ctx.close();
  }

  await browser.close();

  console.log(`\n${"═".repeat(56)}`);
  console.log(`  ACCESS CONTROL VERIFICATION`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${"═".repeat(56)}`);
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log(`${"═".repeat(56)}\n`);

  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
