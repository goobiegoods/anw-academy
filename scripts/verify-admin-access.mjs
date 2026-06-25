/**
 * Verifies admin access control:
 * 1. Student account → /admin blocked (redirect to /dashboard)
 * 2. Admin account → /admin accessible
 * 3. Unauthenticated → /admin redirects to /login
 */
import { chromium } from "@playwright/test";

const BASE = "https://anw-academy.vercel.app";

// These credentials should exist from prior signup tests and the provision script
const STUDENT_EMAIL = "anwlaunch1782278878528@gmail.com";
const STUDENT_PASS  = "Wellness2026!";
const ADMIN_EMAIL   = "orel.shemen@gmail.com";
const ADMIN_PASS    = "AdminANW1782281304500!"; // temp password from provision-admin output

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

  // ── Test 1: Unauthenticated → /admin → /login ─────────────────────────
  console.log("\n  Test 1: Unauthenticated access to /admin\n");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 25000 });
    const url = page.url();
    if (url.includes("/login")) {
      pass("Unauthenticated /admin → redirects to /login", url);
    } else {
      fail("Unauthenticated /admin redirect", `Landed at: ${url}`);
    }
    await page.close();
  }

  // ── Test 2: Student → /admin → /dashboard ─────────────────────────────
  console.log("\n  Test 2: Student account blocked from /admin\n");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    // Intercept the /admin request to capture the raw HTTP response
    const adminResponses = [];
    page.on("response", (resp) => {
      if (resp.url().includes("/admin") && !resp.url().includes("_next")) {
        adminResponses.push({ url: resp.url(), status: resp.status(), location: resp.headers()["location"] });
      }
    });

    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 20000 });
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASS);
    await page.click('button[type="submit"]');
    const waitResult = await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 }).then(() => "reached").catch(() => "timeout");
    const urlAfterLogin = page.url();
    console.log(`  Debug — waitForURL result: ${waitResult}`);
    console.log(`  Debug — URL after login: ${urlAfterLogin}`);

    // Check role from the server using student's cookies
    const roleCheck = await page.evaluate(() =>
      fetch("/api/auth/role").then((r) => r.json()).catch(() => ({ error: "fetch failed" }))
    );
    console.log(`  Debug — /api/auth/role for student: ${JSON.stringify(roleCheck)}`);

    // Raw HTTP check: get student's cookies and fetch /admin with redirect:manual
    const cookies = await page.context().cookies();
    console.log(`  Debug — All cookies in context: ${JSON.stringify(cookies.map(c => ({ domain: c.domain, name: c.name })))}`);
    const cookieHeader = cookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const rawResp = await fetch(`${BASE}/admin`, {
      headers: { cookie: cookieHeader },
      redirect: "manual",
    });
    const vercelCache = rawResp.headers.get("x-vercel-cache");
    const contentType = rawResp.headers.get("content-type");
    console.log(`  Debug — Raw HTTP /admin → status: ${rawResp.status}, location: ${rawResp.headers.get("location")}, x-vercel-cache: ${vercelCache}, content-type: ${contentType?.slice(0,40)}`);
    // Decode the Supabase auth token to see whose email is in the JWT
    const authCookie = cookies.find(c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
    if (authCookie) {
      try {
        // Supabase cookie value is URL-encoded JSON with access_token
        const decoded = JSON.parse(decodeURIComponent(authCookie.value));
        const accessToken = decoded.access_token || decoded;
        if (typeof accessToken === "string") {
          const [, jwtPayload] = accessToken.split(".");
          const jwtDecoded = JSON.parse(Buffer.from(jwtPayload, "base64url").toString());
          console.log(`  Debug — JWT email: ${jwtDecoded.email}, sub: ${jwtDecoded.sub}`);
        } else {
          console.log(`  Debug — Cookie value (first 200): ${authCookie.value.slice(0, 200)}`);
        }
      } catch (e) {
        console.log(`  Debug — Cookie value (first 200): ${authCookie.value.slice(0, 200)}`);
      }
    } else {
      console.log(`  Debug — No Supabase auth cookie found. Cookie names: ${cookies.map(c=>c.name).join(", ")}`);
    }

    // Capture ALL responses (not just /admin) during the goto
    const allResponses = [];
    const allHandler = (resp) => {
      const u = resp.url();
      if (!u.includes("_next/static") && !u.includes("_next/image") && !u.includes(".js") && !u.includes(".css")) {
        allResponses.push({ url: u.replace(BASE, ""), status: resp.status() });
      }
    };
    page.on("response", allHandler);

    // Now try to go to /admin
    await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 20000 });
    page.off("response", allHandler);
    const url = page.url();
    const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => "");
    console.log(`  Debug — URL after goto /admin: ${url}`);
    console.log(`  Debug — Body snippet: "${bodySnippet.slice(0, 150)}"`);
    console.log(`  Debug — All responses during goto /admin:`);
    allResponses.filter(r => r.url.startsWith("/admin") || r.url.startsWith("/login") || r.url.startsWith("/dashboard") || r.url.startsWith("/api")).forEach(r => console.log(`    ${r.status} ${r.url}`));
    console.log(`  Debug — /admin responses captured: ${JSON.stringify(adminResponses)}`);
    if (!url.includes("/admin")) {
      pass(`Student /admin → blocked (redirected to ${url.split("/").pop()})`, url);
    } else {
      fail("Student blocked from /admin", `Student reached /admin: ${url}`);
    }
    await page.close();
  }

  // ── Test 3: Admin → /admin → works ────────────────────────────────────
  console.log("\n  Test 3: Admin account can access /admin\n");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 20000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 }).catch(() => {});

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

    // Spot-check a sub-section
    await page.goto(`${BASE}/admin/students`, { waitUntil: "networkidle", timeout: 20000 });
    const studentsH1 = await page.locator("h1").first().textContent().catch(() => "");
    studentsH1.includes("Students")
      ? pass("Admin /admin/students loads", studentsH1)
      : fail("Admin /admin/students", `h1: "${studentsH1}" at ${page.url()}`);

    await page.close();
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
