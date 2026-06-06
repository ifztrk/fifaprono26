import "server-only";
import { prisma } from "./prisma";

// Les pronostics "avant tournoi" (qualifiés de poule, vainqueur, finaliste)
// se verrouillent au coup d'envoi du tout premier match.
export async function getTournamentStart(): Promise<Date | null> {
  const first = await prisma.match.findFirst({
    orderBy: { kickoff: "asc" },
    select: { kickoff: true },
  });
  return first?.kickoff ?? null;
}

export async function arePreTournamentPredictionsLocked(): Promise<boolean> {
  const start = await getTournamentStart();
  if (!start) return false;
  return new Date() >= start;
}
