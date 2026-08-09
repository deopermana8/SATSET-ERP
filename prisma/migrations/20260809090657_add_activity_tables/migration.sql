-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_schedules" (
    "id" SERIAL NOT NULL,
    "activityId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_bookings" (
    "id" SERIAL NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING_PAYMENT',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "qrToken" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_code_key" ON "activities"("code");

-- CreateIndex
CREATE INDEX "activities_active_idx" ON "activities"("active");

-- CreateIndex
CREATE INDEX "activity_schedules_activityId_idx" ON "activity_schedules"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_schedules_activityId_date_session_key" ON "activity_schedules"("activityId", "date", "session");

-- CreateIndex
CREATE UNIQUE INDEX "activity_bookings_bookingNumber_key" ON "activity_bookings"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "activity_bookings_qrToken_key" ON "activity_bookings"("qrToken");

-- CreateIndex
CREATE INDEX "activity_bookings_reservationId_idx" ON "activity_bookings"("reservationId");

-- CreateIndex
CREATE INDEX "activity_bookings_activityId_idx" ON "activity_bookings"("activityId");

-- CreateIndex
CREATE INDEX "activity_bookings_scheduleId_idx" ON "activity_bookings"("scheduleId");
