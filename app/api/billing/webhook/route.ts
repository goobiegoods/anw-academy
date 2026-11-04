import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripeSignatureValid } from "@/lib/billing-policy";
import { apiError, HttpError } from "@/lib/http";
export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new HttpError(503, "Payments are not configured.");
    const body = await req.text();
    if (body.length > 100000) throw new HttpError(413, "Payload too large.");
    if (
      !stripeSignatureValid(body, req.headers.get("stripe-signature"), secret)
    )
      throw new HttpError(400, "Invalid payment signature.");
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      throw new HttpError(400, "Invalid payment event.");
    }
    if (
      ![
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    )
      return NextResponse.json({ received: true });
    if (
      event.livemode &&
      !(
        process.env.VERCEL_ENV === "production" &&
        process.env.ANW_LIVE_PAYMENTS_ENABLED === "true"
      )
    )
      throw new HttpError(400, "Live events are disabled.");
    const session = event.data?.object;
    if (session?.payment_status !== "paid")
      return NextResponse.json({ received: true });
    await prisma.$transaction(
      async (tx) => {
        const order = await tx.tuitionOrder.findUnique({
          where: { stripeSessionId: session.id },
        });
        if (!order)
          throw new HttpError(
            409,
            "Payment order not yet available; retry event.",
          );
        if (order.status === "paid") return;
        if (
          session.amount_total !== order.amount ||
          session.currency !== order.currency ||
          session.client_reference_id !== order.userId ||
          session.metadata?.orderId !== order.id
        )
          throw new HttpError(400, "Payment does not match the order.");
        await tx.tuitionOrder.update({
          where: { id: order.id },
          data: { status: "paid", paidAt: new Date() },
        });
        await tx.enrollment.upsert({
          where: {
            userId_courseId: { userId: order.userId, courseId: order.courseId },
          },
          create: { userId: order.userId, courseId: order.courseId },
          update: { status: "active" },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
