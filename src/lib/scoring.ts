// Règles de points — FIFAPRONO26
// Barème classique : 3 pts pour le score exact, 1 pt pour le bon résultat.

export const SCORING = {
  EXACT: 3, // score exact (ex: 2-1 pronostiqué, 2-1 réel)
  OUTCOME: 1, // bon résultat seulement (victoire / nul / défaite)
  QUALIFIER: 2, // par équipe correctement pronostiquée qualifiée d'une poule
  CHAMPION: 10, // bon vainqueur de la Coupe
  FINALIST: 5, // bon finaliste
};

function outcome(home: number, away: number): -1 | 0 | 1 {
  if (home > away) return 1;
  if (home < away) return -1;
  return 0;
}

// Barème renforcé et progressif en phase finale, appliqué quand le boost est
// activé (réglage "double points"). Hors boost, tout reste à 3/1.
const BOOSTED_STAGE_SCORING: Record<
  string,
  { exact: number; outcome: number }
> = {
  R16: { exact: 6, outcome: 2 }, // 8es
  QF: { exact: 8, outcome: 4 }, // quarts
  SF: { exact: 12, outcome: 6 }, // demies
  THIRD: { exact: 12, outcome: 6 }, // petite finale
  FINAL: { exact: 20, outcome: 10 }, // finale
};

// Barème (exact / bon résultat) pour une phase donnée
export function stageScoring(
  stage: string,
  boosted: boolean,
): { exact: number; outcome: number } {
  if (boosted && BOOSTED_STAGE_SCORING[stage])
    return BOOSTED_STAGE_SCORING[stage];
  return { exact: SCORING.EXACT, outcome: SCORING.OUTCOME };
}

// Points d'un pronostic de match face au résultat réel, selon le barème fourni
export function matchPoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number,
  exactPts: number = SCORING.EXACT,
  outcomePts: number = SCORING.OUTCOME,
): number {
  if (predHome === realHome && predAway === realAway) return exactPts;
  if (outcome(predHome, predAway) === outcome(realHome, realAway))
    return outcomePts;
  return 0;
}

// ---- Classements de poule calculés depuis les matchs terminés ----

export type TeamLite = { id: string; code: string; name: string };
export type MatchLite = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
};

export type StandingRow = {
  code: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // buts pour
  ga: number; // buts contre
  gd: number; // différence de buts
  points: number;
};

// Calcule le classement d'une poule à partir des équipes et des matchs terminés
export function computeStandings(
  teams: TeamLite[],
  matches: MatchLite[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const t of teams) {
    rows.set(t.id, {
      code: t.code,
      name: t.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }

  for (const m of matches) {
    if (
      !m.finished ||
      m.homeScore === null ||
      m.awayScore === null ||
      !m.homeTeamId ||
      !m.awayTeamId
    )
      continue;
    const home = rows.get(m.homeTeamId);
    const away = rows.get(m.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (m.homeScore < m.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  const result = [...rows.values()];
  for (const r of result) r.gd = r.gf - r.ga;

  result.sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name),
  );
  return result;
}

// Points d'un pronostic de qualifiés de poule (les 2 codes pronostiqués)
// face aux 2 codes réellement qualifiés (top 2 du classement final).
export function groupPoints(
  predicted: [string, string],
  actualTop2: string[],
): number {
  let pts = 0;
  for (const code of predicted) {
    if (actualTop2.includes(code)) pts += SCORING.QUALIFIER;
  }
  return pts;
}
