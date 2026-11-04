import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeKey, stripeRequest, tuitionPrices } from "@/lib/billing";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
import { randomUUID } from "node:crypto";
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Not authenticated.");
    const key = stripeKey(),
      body = await readObject(req),
      courseId = textField(body, "courseId", 100, true);
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: "published" },
    });
    if (!course) throw new HttpError(404, "Course not found.");
    const priceId = tuitionPrices()[course.slug];
    if (!priceId)
      throw new HttpError(
        503,
        "Tuition for this course has not been configured.",
      );
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (enrolled && ["active", "completed"].includes(enrolled.status))
      throw new HttpError(409, "You already have access to this course.");
    const price = await stripeRequest(`prices/${priceId}`, key);
    if (
      !price.active ||
      price.type !== "one_time" ||
      !Number.isInteger(price.unit_amount) ||
      price.unit_amount <= 0
    )
      throw new HttpError(503, "This tuition price is not ready for checkout.");
    const id = randomUUID();
    await prisma.tuitionOrder.create({
      data: {
        id,
        userId: user.id,
        courseId,
        amount: price.unit_amount,
        currency: price.currency,
      },
    });
    const origin = new URL(req.url).origin;
    const form = new URLSearchParams({
      mode: "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      customer_email: user.email,
      success_url: `${origin}/dashboard/billing?checkout=returned`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
      "metadata[orderId]": id,
      client_reference_id: user.id,
    });
    const session = await stripeRequest("checkout/sessions", key, form, id);
    if (
      typeof session.id !== "string" ||
      typeof session.url !== "string" ||
      new URL(session.url).hostname !== "checkout.stripe.com"
    )
      throw new HttpError(503, "Invalid checkout response.");
    await prisma.tuitionOrder.update({
      where: { id },
      data: { stripeSessionId: session.id },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return apiError(error);
  }
}
