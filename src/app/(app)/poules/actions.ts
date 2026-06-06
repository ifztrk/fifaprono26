"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { arePreTournamentPredictionsLocked } from "@/lib/lock";

// Sauvegarde les pronostics de qualifiés de poule (1er + 2e par groupe).
// Champs attendus : first_<groupe> et second_<groupe>.
export async function saveGroupPredictionsAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  if (await arePreTournamentPredictionsLocked()) return; // verrouillé

  const teams = await prisma.team.findMany();
  const groups = [...new Set(teams.map((t) => t.groupName))];

  for (const g of groups) {
    const first = String(formData.get(`first_${g}`) ?? "");
    const second = String(formData.get(`second_${g}`) ?? "");
    if (!first || !second || first === second) continue;

    const codes = teams.filter((t) => t.groupName === g).map((t) => t.code);
    if (!codes.includes(first) || !codes.includes(second)) continue;

    await prisma.groupPrediction.upsert({
      where: { userId_groupName: { userId: user.id, groupName: g } },
      update: { firstCode: first, secondCode: second },
      create: {
        userId: user.id,
        groupName: g,
        firstCode: first,
        secondCode: second,
      },
    });
  }

  revalidatePath("/poules");
}
