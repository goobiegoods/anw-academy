/**
 * Admin allowlist. Dependency-free so it can be imported from the
 * edge proxy as well as server code.
 */
export const ADMIN_EMAILS = ["orelfitch@gmail.com", "orel.shemen@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
