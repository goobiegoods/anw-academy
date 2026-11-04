import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { tuitionPrices } from "@/lib/billing";
import TuitionCheckout from "@/components/dashboard/TuitionCheckout";
export const dynamic = "force-dynamic";
export default async function Billing() {
  const user = await getCurrentUser();
  if (!user) return null;
  const prices = tuitionPrices();
  const courses = await prisma.course.findMany({
    where: { slug: { in: Object.keys(prices) }, status: "published" },
    select: { id: true, title: true },
  });
  const orders = process.env.STRIPE_SECRET_KEY
    ? await prisma.tuitionOrder.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  return (
    <div className="max-w-2xl space-y-7">
      <h1 className="font-playfair text-3xl">Tuition & Enrollment</h1>
      <section className="border border-[#DDD5C5] bg-[#FAF7F0] rounded-2xl p-6">
        {courses.length ? (
          <TuitionCheckout courses={courses} />
        ) : (
          <p>
            Tuition checkout is not enabled. Contact the registrar about
            enrollment; no payment is being collected here.
          </p>
        )}
      </section>
      <h2 className="font-playfair text-xl">Payment Record</h2>
      {orders.map((o) => (
        <div key={o.id} className="border rounded-xl p-5 text-sm">
          {o.status} ·{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: o.currency,
          }).format(o.amount / 100)}{" "}
          · {o.createdAt.toLocaleDateString("en-US")}
        </div>
      ))}
      {!orders.length && (
        <p className="text-sm">No tuition payments recorded.</p>
      )}
      <p className="text-sm text-[#6b6459]">
        Returning from checkout does not confirm payment. Course access is
        granted only after a verified payment notification.
      </p>
    </div>
  );
}
