import { createHmac, timingSafeEqual } from "node:crypto";
export function stripeSignatureValid(
  body: string,
  header: string | null,
  secret: string,
  now = Date.now(),
) {
  if (!header || !secret) return false;
  const parts = header.split(",").map((p) => p.split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest();
  return parts
    .filter(([k]) => k === "v1")
    .some(([, value]) => {
      if (!value || !/^[a-f0-9]{64}$/i.test(value)) return false;
      return timingSafeEqual(expected, Buffer.from(value, "hex"));
    });
}
export function billingKeyAllowed(
  key: string | undefined,
  environment: string | undefined,
  liveEnabled: boolean,
) {
  return (
    !!key &&
    (key.startsWith("sk_test_") ||
      (environment === "production" &&
        liveEnabled &&
        key.startsWith("sk_live_")))
  );
}
