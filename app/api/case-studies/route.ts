import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const fields = input as Record<string, unknown>;
  const names = ["title", "scenario", "observations", "wellnessSupport", "safetyConsiderations", "reflection"] as const;
  if (names.some((name) => typeof fields[name] !== "string" || !(fields[name] as string).trim())) {
    return NextResponse.json({ error: "All sections are required." }, { status: 400 });
  }
  if (names.some((name) => (fields[name] as string).trim().length > 12_000)) {
    return NextResponse.json({ error: "A case-study section is too long." }, { status: 400 });
  }
  const [title, scenario, observations, wellnessSupport, safetyConsiderations, reflection] = names.map((name) => (fields[name] as string).trim());

  if (title.length > 180) return NextResponse.json({ error: "The title must be 180 characters or fewer." }, { status: 400 });

  const caseStudy = await prisma.caseStudy.create({
    data: {
      userId: user.id,
      title,
      scenario,
      observations,
      wellnessSupport,
      safetyConsiderations,
      reflection,
      status: "submitted",
    },
  });

  return NextResponse.json({ id: caseStudy.id, status: caseStudy.status });
}
