/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quota` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validUntil` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "quota" INTEGER NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validUntil" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");
