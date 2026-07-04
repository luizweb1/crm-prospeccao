-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Gasto';

-- CreateIndex
CREATE INDEX "Debt_type_idx" ON "Debt"("type");
