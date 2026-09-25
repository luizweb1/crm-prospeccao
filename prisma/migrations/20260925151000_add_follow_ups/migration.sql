BEGIN;
CREATE TABLE IF NOT EXISTS public."FollowUp" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FollowUp_leadId_dueAt_idx" ON public."FollowUp"("leadId", "dueAt");
CREATE INDEX IF NOT EXISTS "FollowUp_completedAt_dueAt_idx" ON public."FollowUp"("completedAt", "dueAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FollowUp_leadId_fkey') THEN
    ALTER TABLE public."FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES public."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE public."FollowUp" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."FollowUp" FROM anon, authenticated;
COMMIT;
