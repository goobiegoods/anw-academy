import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getAdminUser } from "@/lib/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (
    ![
      "SUBMITTED",
      "UNDER_REVIEW",
      "ACCEPTED",
      "WAITLISTED",
      "REJECTED",
    ].includes(status)
  )
    return NextResponse.json(
      { error: "Invalid application status." },
      { status: 400 },
    );

  const updated = await prisma.application.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });

  return NextResponse.json(updated);
}
