"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Sauvegarde en lot les pronostics de matchs non verrouillés.
// Champs attendus : home_<matchId> et away_<matchId>.
export async function savePredictionsAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const matches = await prisma.match.findMany({
    where: { kickoff: { gt: now } }, // uniquement les matchs pas encore commencés
    select: { id: true },
  });

  for (const m of matches) {
    const rawHome = formData.get(`home_${m.id}`);
    const rawAway = formData.get(`away_${m.id}`);
    if (rawHome === null || rawAway === null) continue;
    if (rawHome === "" || rawAway === "") continue;

    const home = Number(rawHome);
    const away = Number(rawAway);
    if (
      !Number.isInteger(home) ||
      !Number.isInteger(away) ||
      home < 0 ||
      away < 0 ||
      home > 99 ||
      away > 99
    )
      continue;

    await prisma.matchPrediction.upsert({
      where: { userId_matchId: { userId: user.id, matchId: m.id } },
      update: { homeScore: home, awayScore: away },
      create: {
        userId: user.id,
        matchId: m.id,
        homeScore: home,
        awayScore: away,
      },
    });
  }

  revalidatePath("/matchs");
}
