import type { FollowUp } from "@/types";

export function followUpCategory(item: Pick<FollowUp, "dueAt" | "completedAt">, now = new Date()): "atrasados" | "hoje" | "proximos" | "concluidos" {
  if (item.completedAt) return "concluidos";
  const due = new Date(item.dueAt);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  if (due.getTime() < todayStart) return "atrasados";
  if (due.getTime() < tomorrowStart) return "hoje";
  return "proximos";
}
