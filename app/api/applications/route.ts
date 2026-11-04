import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
import { catalogSchools } from "@/lib/catalog";
export async function POST(req: Request) {
  try {
    const b = await readObject(req),
      name = textField(b, "name", 120, true),
      email = textField(b, "email", 320, true).toLowerCase(),
      motivation = textField(b, "motivation", 6000, true),
      experienceLevel = textField(b, "experienceLevel", 30, true),
      schoolInterest = textField(b, "schoolInterest", 120, true),
      pathway = textField(b, "pathway", 30, true);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !["beginner", "intermediate", "advanced"].includes(experienceLevel) ||
      !["personal", "practitioner", "entrepreneur"].includes(pathway) ||
      ![
        ...catalogSchools.map((s) => s.name),
        "Multiple Schools / Undecided",
      ].includes(schoolInterest)
    )
      throw new HttpError(400, "Please check your application details.");
    const recent = await prisma.application.findFirst({
      where: { email, submittedAt: { gte: new Date(Date.now() - 86400000) } },
    });
    if (recent)
      return NextResponse.json(
        { error: "An application for this email was already received today." },
        { status: 409 },
      );
    const a = await prisma.application.create({
      data: {
        name,
        email,
        motivation,
        experienceLevel,
        schoolInterest,
        pathway,
        phone: textField(b, "phone", 60),
        location: textField(b, "location", 160),
        status: "SUBMITTED",
      },
    });
    return NextResponse.json({ id: a.id, status: a.status }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
