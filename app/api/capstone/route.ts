import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Not authenticated.");
    const b = await readObject(req),
      title = textField(b, "title", 200, true),
      description = textField(b, "description", 12000, true),
      submission = textField(b, "submission", 2000),
      action = textField(b, "action", 20, true);
    if (!["draft", "submit"].includes(action))
      throw new HttpError(400, "Invalid action.");
    if (action === "submit" && !submission)
      throw new HttpError(400, "A submission link is required.");
    if (submission) {
      let url: URL;
      try {
        url = new URL(submission);
      } catch {
        throw new HttpError(400, "Invalid submission link.");
      }
      if (url.protocol !== "https:")
        throw new HttpError(400, "Use an HTTPS submission link.");
    }
    const capstone = await prisma.capstone.create({
      data: {
        userId: user.id,
        title,
        description,
        submission: submission || null,
        type: "video",
        status: action === "submit" ? "submitted" : "draft",
        submittedAt: action === "submit" ? new Date() : null,
      },
    });
    return NextResponse.json({ id: capstone.id, status: capstone.status });
  } catch (error) {
    return apiError(error);
  }
}
