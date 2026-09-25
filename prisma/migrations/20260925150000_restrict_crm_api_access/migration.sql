-- Prisma uses a direct Postgres connection. The browser uses Supabase only for Auth.
-- CRM tables therefore must not be reachable with the public Supabase API key.
-- Scope this migration to CRM tables: this database also hosts another system.
BEGIN;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Debt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DebtPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TemplateMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ActivityLog" ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public."Lead", public."Deal", public."Debt", public."DebtPayment",
  public."TemplateMessage", public."ActivityLog"
FROM anon, authenticated;
COMMIT;
