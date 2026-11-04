export function safeInternalPath(
  value: string | null,
  fallback = "/dashboard",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return fallback;
  return value;
}
export function mutationAllowed(
  requestUrl: string,
  origin: string | null,
  fetchSite: string | null,
) {
  if (fetchSite === "cross-site") return false;
  return !origin || origin === new URL(requestUrl).origin;
}
