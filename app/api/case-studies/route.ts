import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { title, scenario, observations, wellnessSupport, safetyConsiderations, reflection } =
    await req.json();

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!title || !scenario || !observations || !wellnessSupport || !safetyConsiderations || !reflection) {
    return NextResponse.json({ error: "All sections are required." }, { status: 400 });
  }

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
