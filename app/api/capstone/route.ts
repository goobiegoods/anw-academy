import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { title, type, description, submission, action } = await req.json();

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
  }

  const status = action === "submit" ? "submitted" : "draft";

  const capstone = await prisma.capstone.create({
    data: {
      userId: user.id,
      title,
      type: type ?? "video",
      description,
      submission: submission ?? null,
      status,
      submittedAt: action === "submit" ? new Date() : null,
    },
  });

  return NextResponse.json({ id: capstone.id, status: capstone.status });
}
