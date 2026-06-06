"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { recomputeAllPoints } from "@/lib/recompute";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Accès refusé");
  return user;
}

// Met à jour un match : équipes (pour la phase finale), score et statut terminé.
export async function updateMatchAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;

  const homeTeamId = String(formData.get("homeTeamId") ?? "");
  const awayTeamId = String(formData.get("awayTeamId") ?? "");
  const rawHome = String(formData.get("homeScore") ?? "");
  const rawAway = String(formData.get("awayScore") ?? "");

  const data: {
    homeTeamId?: string | null;
    awayTeamId?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
    finished?: boolean;
  } = {};

  // Affectation des équipes (phase à élimination directe)
  if (formData.has("homeTeamId")) data.homeTeamId = homeTeamId || null;
  if (formData.has("awayTeamId")) data.awayTeamId = awayTeamId || null;

  // Score : si les deux sont renseignés → match terminé ; sinon réinitialisé
  if (rawHome !== "" && rawAway !== "") {
    const h = Number(rawHome);
    const a = Number(rawAway);
    if (Number.isInteger(h) && Number.isInteger(a) && h >= 0 && a >= 0) {
      data.homeScore = h;
      data.awayScore = a;
      data.finished = true;
    }
  } else {
    data.homeScore = null;
    data.awayScore = null;
    data.finished = false;
  }

  await prisma.match.update({ where: { id: matchId }, data });
  await recomputeAllPoints();

  revalidatePath("/admin");
  revalidatePath("/matchs");
  revalidatePath("/poules");
  revalidatePath("/classement");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const doublePoints = formData.get("doublePointsKnockout") ? "1" : "0";
  await setSetting("doublePointsKnockout", doublePoints);
  await recomputeAllPoints();
  revalidatePath("/admin");
  revalidatePath("/classement");
}

export async function recomputeAction(): Promise<void> {
  await assertAdmin();
  await recomputeAllPoints();
  revalidatePath("/classement");
  revalidatePath("/admin");
}
