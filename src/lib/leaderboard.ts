import "server-only";
import { prisma } from "./prisma";
import { SCORING } from "./scoring";

export type LeaderboardRow = {
  userId: string;
  displayName: string;
  favoriteCode: string | null;
  total: number;
  matchPoints: number;
  groupPoints: number;
  longPoints: number;
  exactCount: number; // nombre de scores exacts trouvés
  predictionCount: number; // nombre de matchs pronostiqués
};

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    include: {
      matchPredictions: true,
      groupPredictions: true,
      longPrediction: true,
    },
  });

  const rows: LeaderboardRow[] = users.map((u) => {
    const matchPoints = u.matchPredictions.reduce((s, p) => s + p.points, 0);
    const groupPoints = u.groupPredictions.reduce((s, p) => s + p.points, 0);
    const longPoints = u.longPrediction?.points ?? 0;
    // Un score exact rapporte au moins SCORING.EXACT (3), le bon résultat au plus 2
    // (1 × multiplicateur) → points >= 3 ⇒ score exact trouvé.
    const exactCount = u.matchPredictions.filter(
      (p) => p.points >= SCORING.EXACT,
    ).length;
    return {
      userId: u.id,
      displayName: u.displayName,
      favoriteCode: u.favoriteCode,
      total: matchPoints + groupPoints + longPoints,
      matchPoints,
      groupPoints,
      longPoints,
      exactCount,
      predictionCount: u.matchPredictions.length,
    };
  });

  rows.sort(
    (a, b) =>
      b.total - a.total ||
      b.exactCount - a.exactCount ||
      a.displayName.localeCompare(b.displayName),
  );
  return rows;
}
