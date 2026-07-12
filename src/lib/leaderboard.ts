import "server-only";
import { prisma } from "./prisma";

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
      matchPredictions: {
        include: {
          match: {
            select: { homeScore: true, awayScore: true, finished: true },
          },
        },
      },
      groupPredictions: true,
      longPrediction: true,
    },
  });

  const rows: LeaderboardRow[] = users.map((u) => {
    const matchPoints = u.matchPredictions.reduce((s, p) => s + p.points, 0);
    const groupPoints = u.groupPredictions.reduce((s, p) => s + p.points, 0);
    const longPoints = u.longPrediction?.points ?? 0;
    // Score exact = pronostic identique au résultat réel (indépendant du barème,
    // car un « bon résultat » en phase finale peut valoir ≥ 3 pts).
    const exactCount = u.matchPredictions.filter(
      (p) =>
        p.match.finished &&
        p.match.homeScore !== null &&
        p.match.awayScore !== null &&
        p.homeScore === p.match.homeScore &&
        p.awayScore === p.match.awayScore,
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
