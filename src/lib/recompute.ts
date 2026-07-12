import "server-only";
import { prisma } from "./prisma";
import { getAllSettings } from "./settings";
import {
  computeStandings,
  groupPoints,
  matchPoints,
  stageScoring,
  SCORING,
} from "./scoring";

// Recalcule TOUS les points (matchs, qualifiés de poule, vainqueur/finaliste).
// Appelé après chaque mise à jour de résultat par l'admin.
export async function recomputeAllPoints(): Promise<void> {
  const settings = await getAllSettings();
  const doublePoints = settings.doublePointsKnockout === "1";

  // 1) Points des pronostics de matchs
  const matches = await prisma.match.findMany({
    include: { predictions: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const m of matches) {
      const done =
        m.finished && m.homeScore !== null && m.awayScore !== null;
      const { exact, outcome } = stageScoring(m.stage, doublePoints);
      for (const p of m.predictions) {
        const pts = done
          ? matchPoints(
              p.homeScore,
              p.awayScore,
              m.homeScore!,
              m.awayScore!,
              exact,
              outcome,
            )
          : 0;
        if (pts !== p.points) {
          await tx.matchPrediction.update({
            where: { id: p.id },
            data: { points: pts },
          });
        }
      }
    }
  });

  // 2) Points des pronostics de qualifiés de poule
  const teams = await prisma.team.findMany();
  const groupMatches = await prisma.match.findMany({
    where: { stage: "GROUP" },
  });
  const groupPreds = await prisma.groupPrediction.findMany();

  const groups = [...new Set(teams.map((t) => t.groupName))];
  const top2ByGroup: Record<string, string[]> = {};
  for (const g of groups) {
    const gTeams = teams.filter((t) => t.groupName === g);
    const gMatches = groupMatches.filter(
      (m) => m.groupName === g,
    );
    // On ne fige les qualifiés que lorsque tous les matchs de la poule sont terminés
    const allDone =
      gMatches.length > 0 && gMatches.every((m) => m.finished);
    if (!allDone) {
      top2ByGroup[g] = [];
      continue;
    }
    const standings = computeStandings(gTeams, gMatches);
    top2ByGroup[g] = standings.slice(0, 2).map((r) => r.code);
  }

  await prisma.$transaction(async (tx) => {
    for (const gp of groupPreds) {
      const top2 = top2ByGroup[gp.groupName] ?? [];
      const pts =
        top2.length === 2
          ? groupPoints([gp.firstCode, gp.secondCode], top2)
          : 0;
      if (pts !== gp.points) {
        await tx.groupPrediction.update({
          where: { id: gp.id },
          data: { points: pts },
        });
      }
    }
  });

  // 3) Points vainqueur / finaliste (dérivés du match FINAL)
  const final = await prisma.match.findFirst({
    where: { stage: "FINAL" },
    include: { homeTeam: true, awayTeam: true },
  });

  let championCode: string | null = null;
  let finalistCode: string | null = null;
  if (
    final?.finished &&
    final.homeScore !== null &&
    final.awayScore !== null &&
    final.homeTeam &&
    final.awayTeam
  ) {
    if (final.homeScore >= final.awayScore) {
      championCode = final.homeTeam.code;
      finalistCode = final.awayTeam.code;
    } else {
      championCode = final.awayTeam.code;
      finalistCode = final.homeTeam.code;
    }
  }

  const longPreds = await prisma.longPrediction.findMany();
  await prisma.$transaction(async (tx) => {
    for (const lp of longPreds) {
      let pts = 0;
      if (championCode && lp.championCode === championCode)
        pts += SCORING.CHAMPION;
      if (finalistCode && lp.finalistCode === finalistCode)
        pts += SCORING.FINALIST;
      if (pts !== lp.points) {
        await tx.longPrediction.update({
          where: { id: lp.id },
          data: { points: pts },
        });
      }
    }
  });

  // 4) Instantané quotidien des totaux (pour le graphique d'évolution)
  await snapshotTotals();
}

// Enregistre/met à jour le total de points de chaque joueur pour le jour courant
async function snapshotTotals(): Promise<void> {
  const day = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
  }).format(new Date());

  const users = await prisma.user.findMany({
    select: {
      id: true,
      matchPredictions: { select: { points: true } },
      groupPredictions: { select: { points: true } },
      longPrediction: { select: { points: true } },
    },
  });

  await prisma.$transaction(
    users.map((u) => {
      const total =
        u.matchPredictions.reduce((s, p) => s + p.points, 0) +
        u.groupPredictions.reduce((s, p) => s + p.points, 0) +
        (u.longPrediction?.points ?? 0);
      return prisma.rankSnapshot.upsert({
        where: { userId_day: { userId: u.id, day } },
        update: { points: total },
        create: { userId: u.id, day, points: total },
      });
    }),
  );
}
