import { LEAD_POTENTIALS, LEAD_SOURCES, LEAD_STATUSES } from "@/types";

export function isLeadStatus(value: unknown): value is (typeof LEAD_STATUSES)[number] {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

export function isLeadPotential(value: unknown): value is (typeof LEAD_POTENTIALS)[number] {
  return typeof value === "string" && (LEAD_POTENTIALS as readonly string[]).includes(value);
}

export function isLeadSource(value: unknown): value is (typeof LEAD_SOURCES)[number] {
  return typeof value === "string" && (LEAD_SOURCES as readonly string[]).includes(value);
}

export function validateLeadEnums(body: Record<string, unknown>): string | null {
  if (body.status !== undefined && !isLeadStatus(body.status)) return "Situação inválida.";
  if (body.potential !== undefined && !isLeadPotential(body.potential)) return "Potencial inválido.";
  if (body.source !== undefined && !isLeadSource(body.source)) return "Origem inválida.";
  return null;
}
