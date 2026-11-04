import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const updated = await prisma.supportMessage.update({
    where: { id },
    data: { status: "resolved", resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
