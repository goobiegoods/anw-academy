import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePractitioner } from "@/lib/practitioner";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(req: Request) {
  try {
    const { profile } = await requirePractitioner();
    const body = await readObject(req);
    const name = textField(body, "name", 120, true);
    const email = textField(body, "email", 320);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new HttpError(400, "Invalid email.");
    const client = await prisma.client.create({
      data: {
        practitionerId: profile.id,
        name,
        email: email || null,
        goals: textField(body, "goals", 4000),
        notes: textField(body, "notes", 8000),
      },
    });
    return NextResponse.json({ id: client.id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
