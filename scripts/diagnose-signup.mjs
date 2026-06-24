import { chromium } from "@playwright/test";

const BASE = "https://anw-academy.vercel.app";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const failedReqs = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failedReqs.push(`${r.url()} → ${r.status()}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") console.log("CONSOLE ERROR:", m.text());
  });

  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  const email = `testlaunch${Date.now()}@gmail.com`;
  console.log("Attempting signup with:", email);

  await page.fill('input[type="text"]', "Launch Test User");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', "Wellness2026!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(10000);

  const url = page.url();
  const errorDiv = await page.locator(".text-red-700").textContent().catch(() => "none");
  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 500));

  console.log("\nResult URL:", url);
  console.log("Error div text:", errorDiv);
  console.log("Body text:", pageText.slice(0, 300));
  console.log("\nFailed requests during signup:");
  failedReqs.forEach((r) => console.log(" ", r));

  await browser.close();
})().catch(console.error);
