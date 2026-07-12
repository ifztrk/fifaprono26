import "server-only";
import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  // "1" = points des 8es et des quarts de finale doublés ; sinon points normaux partout
  doublePointsKnockout: "0",
  // Code d'invitation requis à l'inscription (vide = inscription ouverte)
  registerCode: "",
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

// Multiplicateur de points selon la phase et le réglage "double points".
// Quand activé, les 8es (R16) et les quarts (QF) de finale comptent double.
export function stageMultiplier(stage: string, doublePoints: boolean): number {
  if (!doublePoints) return 1;
  return stage === "R16" || stage === "QF" ? 2 : 1;
}
