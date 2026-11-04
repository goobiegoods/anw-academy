import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { mutationAllowed } from "@/lib/request-policy";
export async function proxy(request: NextRequest) {
  const mutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (
    mutation &&
    !mutationAllowed(
      request.url,
      request.headers.get("origin"),
      request.headers.get("sec-fetch-site"),
    )
  ) {
    return NextResponse.json(
      { error: "Cross-site requests are not permitted." },
      { status: 403 },
    );
  }
  if (
    process.env.VERCEL_ENV === "preview" &&
    process.env.ANW_PREVIEW_BACKEND_ENABLED !== "true"
  ) {
    if (mutation || request.nextUrl.pathname.startsWith("/api/auth/callback"))
      return NextResponse.json(
        {
          error:
            "This preview is read-only until an isolated Academy backend is configured.",
        },
        { status: 503 },
      );
  }
  if (
    Number(request.headers.get("content-length") || 0) > 100_000 &&
    !request.nextUrl.pathname.endsWith("/photo")
  )
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  const response = await updateSession(request);
  if (
    /^\/(api|dashboard|admin|practitioner)(\/|$)/.test(request.nextUrl.pathname)
  ) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("CDN-Cache-Control", "no-store");
  }
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
