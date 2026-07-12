import "server-only";
import { prisma } from "./prisma";

const DEFAULTS: Record<string, string> = {
  // "1" = barème renforcé en phase finale (8es 6/2, quarts 8/4, demies & petite
  // finale 12/6, finale 20/10) ; "0" = 3/1 partout
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
