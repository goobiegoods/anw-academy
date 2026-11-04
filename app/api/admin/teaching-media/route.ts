import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { teachingVideo } from "@/lib/teaching-video";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function PATCH(req: Request) {
  try {
    if (!(await getAdminUser()))
      throw new HttpError(403, "Faculty administration access required.");
    const body = await readObject(req);
    const lessonId = textField(body, "lessonId", 100, true);
    const videoUrl = textField(body, "videoUrl", 2000);
    if (videoUrl && !teachingVideo(videoUrl))
      throw new HttpError(
        400,
        "Use an HTTPS YouTube, Vimeo, MP4 or WebM video link.",
      );
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) throw new HttpError(404, "Lesson not found.");
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { videoUrl: videoUrl || null },
    });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return apiError(error);
  }
}
