-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "contactName" TEXT,
    "instagramUsername" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "whatsappUrl" TEXT,
    "improvementOpportunity" TEXT,
    "notes" TEXT,
    "firstMessageText" TEXT,
    "firstMessageSentAt" TIMESTAMP(3),
    "firstMessageChannel" TEXT,
    "secondMessageText" TEXT,
    "secondMessageSentAt" TIMESTAMP(3),
    "secondMessageChannel" TEXT,
    "thirdMessageText" TEXT,
    "thirdMessageSentAt" TIMESTAMP(3),
    "thirdMessageChannel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Gerando conexão',
    "potential" TEXT NOT NULL DEFAULT 'Médio',
    "source" TEXT NOT NULL DEFAULT 'Outro',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "clientName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "recommendedChannel" TEXT NOT NULL,
    "recommendedStep" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_niche_idx" ON "Lead"("niche");

-- CreateIndex
CREATE INDEX "Lead_potential_idx" ON "Lead"("potential");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_instagramUsername_idx" ON "Lead"("instagramUsername");

-- CreateIndex
CREATE INDEX "Deal_closedAt_idx" ON "Deal"("closedAt");

-- CreateIndex
CREATE INDEX "Deal_leadId_idx" ON "Deal"("leadId");

-- CreateIndex
CREATE INDEX "ActivityLog_leadId_idx" ON "ActivityLog"("leadId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
