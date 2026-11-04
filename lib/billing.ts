import { HttpError } from "@/lib/http";
import { billingKeyAllowed } from "@/lib/billing-policy";
export function stripeKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (
    !billingKeyAllowed(
      key,
      process.env.VERCEL_ENV,
      process.env.ANW_LIVE_PAYMENTS_ENABLED === "true",
    )
  )
    throw new HttpError(503, "Tuition checkout is not enabled.");
  return key!;
}
export async function stripeRequest(
  path: string,
  key: string,
  body?: URLSearchParams,
  idempotency?: string,
) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
    },
    body: body?.toString(),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new HttpError(
      503,
      "The payment provider could not prepare checkout. Please try again.",
    );
  return result;
}
export function tuitionPrices(): Record<string, string> {
  try {
    const v = JSON.parse(process.env.ANW_COURSE_PRICE_IDS || "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    return Object.fromEntries(
      Object.entries(v).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && /^price_[a-zA-Z0-9]+$/.test(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}
