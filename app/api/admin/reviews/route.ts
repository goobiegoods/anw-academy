import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { awardWUInTransaction } from "@/lib/auth";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) throw new HttpError(403, "Administrator access required.");
    const body = await readObject(req),
      id = textField(body, "id", 100, true),
      kind = textField(body, "kind", 30, true),
      feedback = textField(body, "feedback", 6000, true);
    if (
      !["assignment", "case", "capstone"].includes(kind) ||
      !["approved", "rejected"].includes(String(body.decision))
    )
      throw new HttpError(400, "Invalid review decision.");
    const approved = body.decision === "approved";
    const result = await prisma.$transaction(
      async (tx) => {
        if (kind === "assignment") {
          const work = await tx.assignmentSubmission.findUnique({
            where: { id },
            include: { assignment: true },
          });
          if (!work) throw new HttpError(404, "Submission not found.");
          if (!["submitted", "under_review"].includes(work.status))
            throw new HttpError(
              409,
              "This submission has already been reviewed or is still a draft.",
            );
          await tx.assignmentSubmission.update({
            where: { id },
            data: {
              status: approved ? "approved" : "rejected",
              feedback,
              reviewedAt: new Date(),
            },
          });
          const awarded =
            approved &&
            (await awardWUInTransaction(
              tx,
              work.userId,
              work.assignment.wuValue,
              "assignment",
              `Faculty approval: ${work.assignment.title}`,
              id,
            ));
          return { wuAwarded: awarded ? work.assignment.wuValue : 0 };
        }
        if (kind === "case") {
          const work = await tx.caseStudy.findUnique({ where: { id } });
          if (!work) throw new HttpError(404, "Submission not found.");
          if (!["submitted", "under_review"].includes(work.status))
            throw new HttpError(409, "Already reviewed.");
          const wu = approved ? Number(body.wu) : 0;
          if (approved && (!Number.isInteger(wu) || wu < 10 || wu > 25))
            throw new HttpError(
              400,
              "Choose 10–25 WU for an approved case study.",
            );
          await tx.caseStudy.update({
            where: { id },
            data: {
              status: approved ? "approved" : "rejected",
              feedback,
              mentorId: admin.id,
              reviewedAt: new Date(),
              wuAwarded: wu,
            },
          });
          const awarded =
            approved &&
            (await awardWUInTransaction(
              tx,
              work.userId,
              wu,
              "case-study",
              `Faculty approval: ${work.title}`,
              id,
            ));
          return { wuAwarded: awarded ? wu : 0 };
        }
        const work = await tx.capstone.findUnique({ where: { id } });
        if (!work) throw new HttpError(404, "Submission not found.");
        if (!["submitted", "under_review"].includes(work.status))
          throw new HttpError(409, "Already reviewed or still a draft.");
        await tx.capstone.update({
          where: { id },
          data: {
            status: approved ? "approved" : "rejected",
            mentorFeedback: feedback,
            approvedAt: approved ? new Date() : null,
            wuAwarded: approved ? 50 : 0,
          },
        });
        const awarded =
          approved &&
          (await awardWUInTransaction(
            tx,
            work.userId,
            50,
            "capstone",
            `Faculty approval: ${work.title}`,
            id,
          ));
        return { wuAwarded: awarded ? 50 : 0 };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
