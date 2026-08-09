-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_shiftId_fkey";

-- DropIndex
DROP INDEX "transactions_cashierId_idx";

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "cashierId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "cashier_shifts" (
    "id" SERIAL NOT NULL,
    "shiftNumber" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "cashierName" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openingCash" INTEGER NOT NULL,
    "closingCash" INTEGER NOT NULL DEFAULT 0,
    "cashSales" INTEGER NOT NULL DEFAULT 0,
    "qrisSales" INTEGER NOT NULL DEFAULT 0,
    "transferSales" INTEGER NOT NULL DEFAULT 0,
    "ticketCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "difference" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cashier_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cashier_shifts_shiftNumber_key" ON "cashier_shifts"("shiftNumber");
