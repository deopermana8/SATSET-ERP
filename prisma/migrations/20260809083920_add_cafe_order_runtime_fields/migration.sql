-- AlterTable
ALTER TABLE "cafe_orders" ADD COLUMN     "cashierShiftId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "orderType" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "printedAt" TIMESTAMP(3),
ADD COLUMN     "tableNumber" TEXT,
ADD COLUMN     "voidedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'NEW';
