/**
 * Quick exam-flow smoke test using the demo student session.
 * Navigates to the first exam that shows "Begin Exam", starts it,
 * selects answers, submits, and captures the result.
 */
import { chromium } from "@playwright/test";

const BASE = "https://anw-academy.vercel.app";
const DEMO_EMAIL = "student@anwacademy.com";
const DEMO_PASS = "password123";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Login as demo student
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard**`, { timeout: 20000 });
  console.log("Logged in as demo student");

  // Go to exams page
  await page.goto(`${BASE}/dashboard/exams`, { waitUntil: "networkidle" });
  const examsBody = await page.evaluate(() => document.body.innerText);
  const beginLinks = page.locator('a:has-text("Begin Exam")');
  const retryLinks = page.locator('a:has-text("Retry")');
  const reviewLinks = page.locator('a:has-text("Review")');
  console.log(`Begin Exam links: ${await beginLinks.count()}`);
  console.log(`Retry links: ${await retryLinks.count()}`);
  console.log(`Review links: ${await reviewLinks.count()}`);

  // Try a "Begin Exam" link
  const startableLinks = await beginLinks.count() > 0 ? beginLinks : retryLinks;
  const count = await startableLinks.count();

  if (count === 0) {
    console.log("All exams already passed (all 'Review'). Testing a Review-only exam page.");
    const href = await reviewLinks.first().getAttribute("href").catch(() => null);
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
      const body = await page.evaluate(() => document.body.innerText.slice(0, 300));
      console.log("Exam page body (already passed):", body);
    }
    await browser.close();
    return;
  }

  const href = await startableLinks.first().getAttribute("href");
  console.log(`\nOpening exam: ${href}`);
  await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
  const examBody = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("Exam page snippet:", examBody.slice(0, 200));

  // Look for Start Exam button
  const startBtn = page.locator('button:has-text("Begin Exam")');
  if (await startBtn.count() === 0) {
    console.log("No 'Begin Exam' button — exam in progress or already completed.");
    await browser.close();
    return;
  }

  // Intercept the start response
  const startResP = page.waitForResponse(
    (r) => r.url().includes("/api/exams/start"),
    { timeout: 15000 }
  );
  await startBtn.click();
  const startRes = await startResP;
  const startData = await startRes.json();
  console.log(`\n/api/exams/start → ${startRes.status()}`);
  console.log("attemptId:", startData.attemptId?.slice(0, 12));
  console.log("questions:", startData.questions?.length);

  if (!startData.attemptId || !startData.questions?.length) {
    console.log("Exam start failed or no questions returned.");
    await browser.close();
    return;
  }

  await page.waitForTimeout(2000);

  // Select first visible option for each question
  const allBtns = await page.locator("button").all();
  let answered = 0;
  for (const btn of allBtns) {
    const text = (await btn.textContent().catch(() => "")).trim();
    if (text.startsWith("A)")) {
      await btn.click().catch(() => {});
      answered++;
      await page.waitForTimeout(300);
    }
  }
  console.log(`\nAnswered ${answered} questions (all 'A)')`);

  // Submit
  const submitBtn = page.locator('button:has-text("Submit Exam"), button:has-text("Submit")').first();
  if (await submitBtn.count() === 0) {
    console.log("No Submit button found.");
    await browser.close();
    return;
  }
  const disabled = await submitBtn.isDisabled().catch(() => true);
  if (disabled) {
    console.log("Submit button is disabled — not all questions answered via 'A)' pattern.");
    // Debug: show all button texts
    const btnTexts = [];
    for (const btn of allBtns) {
      const t = (await btn.textContent().catch(() => "")).trim().slice(0, 60);
      if (t) btnTexts.push(t);
    }
    console.log("All button texts:", JSON.stringify(btnTexts));
    await browser.close();
    return;
  }

  const submitResP = page.waitForResponse(
    (r) => r.url().includes("/api/exams/submit"),
    { timeout: 15000 }
  );
  await submitBtn.click();
  const submitRes = await submitResP;
  const submitData = await submitRes.json();
  console.log(`\n/api/exams/submit → ${submitRes.status()}`);
  console.log("score:", submitData.score);
  console.log("passed:", submitData.passed);
  console.log("correct:", submitData.correct, "/", submitData.total);
  console.log("wuValue:", submitData.wuValue);

  await browser.close();
})().catch(console.error);
