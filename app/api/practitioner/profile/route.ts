import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function PATCH(req: Request) {
  try {
    const { profile } = await requirePractitioner();
    const body = await readObject(req);
    const bookingUrl = textField(body, "bookingUrl", 500);
    if (bookingUrl) {
      let url: URL;
      try {
        url = new URL(bookingUrl);
      } catch {
        throw new HttpError(400, "Invalid booking URL.");
      }
      if (url.protocol !== "https:")
        throw new HttpError(400, "Use an HTTPS booking URL.");
    }
    if (
      typeof body.virtualAvailable !== "boolean" ||
      typeof body.inPersonAvailable !== "boolean"
    )
      throw new HttpError(400, "Invalid availability.");
    const list = (key: string) =>
      textField(body, key, 1000)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 20);
    await prisma.practitionerProfile.update({
      where: { id: profile.id },
      data: {
        displayName: textField(body, "displayName", 120, true),
        bio: textField(body, "bio", 4000),
        location: textField(body, "location", 160),
        specialties: list("specialties"),
        languages: list("languages"),
        bookingUrl: bookingUrl || null,
        virtualAvailable: body.virtualAvailable,
        inPersonAvailable: body.inPersonAvailable,
        directoryStatus: "pending",
      },
    });
    return NextResponse.json({ saved: true, directoryStatus: "pending" });
  } catch (error) {
    return apiError(error);
  }
}
