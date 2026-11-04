import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { stripeSignatureValid, billingKeyAllowed } from "../lib/billing-policy";
import { mutationAllowed, safeInternalPath } from "../lib/request-policy";
const now = new Date("2026-11-03T20:00:00Z").getTime();
const timestamp = String(now / 1000);
const payload = '{"type":"checkout.session.completed"}';
const signature = createHmac("sha256", "fixture-secret")
  .update(`${timestamp}.${payload}`)
  .digest("hex");
assert.equal(
  stripeSignatureValid(
    payload,
    `t=${timestamp},v1=${signature}`,
    "fixture-secret",
    now,
  ),
  true,
);
assert.equal(
  stripeSignatureValid(
    payload + " ",
    `t=${timestamp},v1=${signature}`,
    "fixture-secret",
    now,
  ),
  false,
);
assert.equal(
  stripeSignatureValid(
    payload,
    `t=${timestamp},v1=${signature}`,
    "fixture-secret",
    now + 301000,
  ),
  false,
);
assert.equal(
  stripeSignatureValid(
    payload,
    `t=${timestamp},v1=not-hex`,
    "fixture-secret",
    now,
  ),
  false,
);
assert.equal(stripeSignatureValid(payload, null, "fixture-secret", now), false);
assert.equal(billingKeyAllowed("sk_live_fixture", "preview", true), false);
assert.equal(billingKeyAllowed("sk_live_fixture", "production", false), false);
assert.equal(billingKeyAllowed("sk_live_fixture", "production", true), true);
assert.equal(billingKeyAllowed("sk_test_fixture", "preview", false), true);
assert.equal(billingKeyAllowed(undefined, "production", true), false);
for (const path of [
  "https://evil.test",
  "//evil.test",
  "/\\evil.test",
  "/\n/evil.test",
  null,
])
  assert.equal(safeInternalPath(path), "/dashboard");
assert.equal(
  safeInternalPath("/dashboard/courses?next=1"),
  "/dashboard/courses?next=1",
);
assert.equal(
  mutationAllowed(
    "https://academy.test/api/profile",
    "https://evil.test",
    null,
  ),
  false,
);
assert.equal(
  mutationAllowed("https://academy.test/api/profile", null, "cross-site"),
  false,
);
assert.equal(
  mutationAllowed(
    "https://academy.test/api/profile",
    "https://academy.test",
    "same-origin",
  ),
  true,
);
console.log("Request, redirect and billing security assertions passed.");

// Teaching films must never accept arbitrary HTML, executable URLs or spoofed hosts.
import { teachingVideo } from "../lib/teaching-video";
assert.equal(teachingVideo("javascript:alert(1)"), null);
assert.equal(
  teachingVideo("https://youtube.com.evil.test/watch?v=abcdefghijk"),
  null,
);
assert.equal(
  teachingVideo("https://user:password@example.test/lesson.mp4"),
  null,
);
assert.equal(teachingVideo("https://example.test/lesson.html"), null);
assert.equal(teachingVideo("http://example.test/lesson.mp4"), null);
assert.deepEqual(teachingVideo("https://youtu.be/abcdefghijk"), {
  kind: "embed",
  src: "https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0",
});
assert.equal(teachingVideo("https://vimeo.com/123456789")?.kind, "embed");
assert.equal(
  teachingVideo("https://example.test/lesson.mp4?token=fixture")?.kind,
  "file",
);
console.log("Teaching media URL assertions passed.");
