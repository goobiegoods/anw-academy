import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin-emails";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Admin routes: require login AND an allowlisted admin email.
    // Logged-in non-admins are silently sent to their dashboard.
    if (pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
      if (!isAdminEmail(user.email)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      // Prevent Vercel's edge CDN from caching admin responses
      supabaseResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0, private"
      );
      supabaseResponse.headers.set("CDN-Cache-Control", "no-store");
      supabaseResponse.headers.set("Vercel-CDN-Cache-Control", "no-store");
      return supabaseResponse;
    }

    const protectedPaths = ["/dashboard", "/practitioner"];
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // If session verification fails on a protected path, redirect to login
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/practitioner")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
}
