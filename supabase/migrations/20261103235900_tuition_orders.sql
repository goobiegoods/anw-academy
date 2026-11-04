-- Apply to a dedicated preview database first. No production execution authorized.
CREATE TABLE public."TuitionOrder" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "userId" TEXT NOT NULL,
 "courseId" TEXT NOT NULL,
 "stripeSessionId" TEXT,
 "amount" INTEGER NOT NULL,
 "currency" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'pending',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "paidAt" TIMESTAMP(3)
);
CREATE UNIQUE INDEX "TuitionOrder_stripeSessionId_key" ON public."TuitionOrder"("stripeSessionId");
CREATE INDEX "TuitionOrder_userId_courseId_idx" ON public."TuitionOrder"("userId","courseId");
ALTER TABLE public."TuitionOrder" ADD CONSTRAINT "TuitionOrder_amount_positive" CHECK ("amount" > 0);
