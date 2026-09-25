import { test } from "node:test";
import assert from "node:assert/strict";
import { followUpCategory } from "./followUps";

test("separa atraso, hoje, próximos e ações concluídas pelo dia local", () => {
  const now = new Date(2026, 8, 25, 12, 0);
  const item = (day: number, completedAt: string | null = null) => ({
    dueAt: new Date(2026, 8, day, 10, 0).toISOString(), completedAt,
  });
  assert.equal(followUpCategory(item(24), now), "atrasados");
  assert.equal(followUpCategory(item(25), now), "hoje");
  assert.equal(followUpCategory(item(26), now), "proximos");
  assert.equal(followUpCategory(item(24, now.toISOString()), now), "concluidos");
});
