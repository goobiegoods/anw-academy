import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Not authenticated.");
    const body = await readObject(req);
    const name = textField(body, "name", 120, true);
    const bio = textField(body, "bio", 2000);
    const location = textField(body, "location", 160);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name } }),
      prisma.studentProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, bio, location },
        update: { bio, location },
      }),
    ]);
    return NextResponse.json({ saved: true });
  } catch (error) {
    return apiError(error);
  }
}
