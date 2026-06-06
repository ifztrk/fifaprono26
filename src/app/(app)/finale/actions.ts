"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { arePreTournamentPredictionsLocked } from "@/lib/lock";

// Sauvegarde le pronostic vainqueur final (+ finaliste optionnel).
export async function saveLongPredictionAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  if (await arePreTournamentPredictionsLocked()) return;

  const champion = String(formData.get("championCode") ?? "");
  const finalist = String(formData.get("finalistCode") ?? "");
  if (!champion) return;

  const teams = await prisma.team.findMany({ select: { code: true } });
  const codes = new Set(teams.map((t) => t.code));
  if (!codes.has(champion)) return;
  const finalistValid = finalist && finalist !== champion && codes.has(finalist);

  await prisma.longPrediction.upsert({
    where: { userId: user.id },
    update: {
      championCode: champion,
      finalistCode: finalistValid ? finalist : null,
    },
    create: {
      userId: user.id,
      championCode: champion,
      finalistCode: finalistValid ? finalist : null,
    },
  });

  revalidatePath("/finale");
}
