-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'A receber';

-- CreateIndex
CREATE INDEX "Deal_paymentStatus_idx" ON "Deal"("paymentStatus");
