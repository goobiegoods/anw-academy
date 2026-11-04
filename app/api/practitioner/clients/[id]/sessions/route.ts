import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { profile } = await requirePractitioner();
    const { id } = await params;
    const client = await prisma.client.findFirst({
      where: { id, practitionerId: profile.id },
      select: { id: true },
    });
    if (!client) throw new HttpError(404, "Client not found.");
    const body = await readObject(req);
    const date = textField(body, "sessionDate", 40, true);
    const followUp = textField(body, "followUpDate", 40);
    if (
      !Number.isFinite(Date.parse(date)) ||
      (followUp && !Number.isFinite(Date.parse(followUp)))
    )
      throw new HttpError(400, "Invalid date.");
    const session = await prisma.clientSession.create({
      data: {
        clientId: id,
        practitionerId: profile.id,
        sessionDate: new Date(date),
        notes: textField(body, "notes", 12000, true),
        followUpDate: followUp ? new Date(followUp) : null,
        resourcesShared: [],
      },
    });
    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
