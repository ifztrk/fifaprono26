import "server-only";
import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  // "1" = points normaux en phase finale, "2" = points doublés (8e → finale)
  doublePointsKnockout: "0",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

// Multiplicateur de points selon la phase et le réglage "double points"
export function stageMultiplier(stage: string, doublePoints: boolean): number {
  if (!doublePoints) return 1;
  return stage === "GROUP" ? 1 : 2;
}
