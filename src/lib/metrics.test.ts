import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDashboardMetrics } from "./metrics";
import type { Lead } from "@/types";

function lead(id: string, status: Lead["status"], contacted: boolean): Lead {
  return {
    id, status, contactName: null, instagramUsername: id, niche: "Estética", websiteUrl: null,
    whatsappUrl: null, improvementOpportunity: null, notes: null, potential: "Médio", source: "Instagram",
    firstMessageText: null, firstMessageSentAt: contacted ? "2026-09-22T00:00:00.000Z" : null,
    firstMessageChannel: null, secondMessageText: null, secondMessageSentAt: null,
    secondMessageChannel: null, thirdMessageText: null, thirdMessageSentAt: null,
    thirdMessageChannel: null, createdAt: "2026-09-20T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z",
  };
}

test("separa respostas estimadas, conversão da base e valor de negócios registrados", () => {
  const metrics = calculateDashboardMetrics([
    lead("a", "Em processo", true),
    lead("b", "Venda Negada", true),
    lead("c", "Venda Fechada", false),
  ], [{ value: 1000 }, { value: 500 }]);
  assert.equal(metrics.contatados, 2);
  assert.equal(metrics.respostasEstimadas, 2);
  assert.equal(metrics.taxaResposta, 100);
  assert.equal(metrics.taxaFechamento, 33.3);
  assert.equal(metrics.faturamentoFechado, 1500);
  assert.equal(metrics.ticketMedio, 750);
});
