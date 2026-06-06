// Calendrier OFFICIEL de la Coupe du Monde 2026 (source : calendrier FIFA / Sky Sports).
// Les heures sont données en BST (heure du Royaume-Uni, = UTC+1) puis converties en
// instant UTC via kickoffFromBst() — ce qui gère automatiquement les passages de jour
// (ex : 00:30 BST le 28 juin = 23:30 UTC le 27 juin).
//
// Les équipes sont identifiées par leur code ISO (cf. prisma/seed.ts).
// L'appariement en base se fait sur la PAIRE d'équipes (sans tenir compte du
// domicile/extérieur) : on ne met à jour que l'horaire, jamais les affiches.

export type Fixture = { date: string; time: string; home: string; away: string };
export type KoSlot = { stage: string; date: string; time: string };

// "2026-06-12" + "03:00" (BST) → Date à l'instant UTC correct.
export function kickoffFromBst(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+01:00`);
}

// 72 matchs de poule, dans l'ordre chronologique officiel.
export const GROUP_FIXTURES: Fixture[] = [
  { date: "2026-06-11", time: "20:00", home: "MX", away: "ZA" },
  { date: "2026-06-12", time: "03:00", home: "KR", away: "CZ" },
  { date: "2026-06-12", time: "20:00", home: "CA", away: "BA" },
  { date: "2026-06-13", time: "02:00", home: "US", away: "PY" },
  { date: "2026-06-13", time: "20:00", home: "QA", away: "CH" },
  { date: "2026-06-13", time: "23:00", home: "BR", away: "MA" },
  { date: "2026-06-14", time: "02:00", home: "HT", away: "SCO" },
  { date: "2026-06-14", time: "05:00", home: "AU", away: "TR" },
  { date: "2026-06-14", time: "18:00", home: "DE", away: "CW" },
  { date: "2026-06-14", time: "21:00", home: "NL", away: "JP" },
  { date: "2026-06-15", time: "00:00", home: "CI", away: "EC" },
  { date: "2026-06-15", time: "03:00", home: "SE", away: "TN" },
  { date: "2026-06-15", time: "17:00", home: "ES", away: "CV" },
  { date: "2026-06-15", time: "20:00", home: "BE", away: "EG" },
  { date: "2026-06-15", time: "23:00", home: "SA", away: "UY" },
  { date: "2026-06-16", time: "02:00", home: "IR", away: "NZ" },
  { date: "2026-06-16", time: "20:00", home: "FR", away: "SN" },
  { date: "2026-06-16", time: "23:00", home: "IQ", away: "NO" },
  { date: "2026-06-17", time: "02:00", home: "AR", away: "DZ" },
  { date: "2026-06-17", time: "05:00", home: "AT", away: "JO" },
  { date: "2026-06-17", time: "18:00", home: "PT", away: "CD" },
  { date: "2026-06-17", time: "21:00", home: "ENG", away: "HR" },
  { date: "2026-06-18", time: "00:00", home: "GH", away: "PA" },
  { date: "2026-06-18", time: "03:00", home: "UZ", away: "CO" },
  { date: "2026-06-18", time: "17:00", home: "CZ", away: "ZA" },
  { date: "2026-06-18", time: "20:00", home: "CH", away: "BA" },
  { date: "2026-06-18", time: "23:00", home: "CA", away: "QA" },
  { date: "2026-06-19", time: "02:00", home: "MX", away: "KR" },
  { date: "2026-06-19", time: "20:00", home: "US", away: "AU" },
  { date: "2026-06-19", time: "23:00", home: "SCO", away: "MA" },
  { date: "2026-06-20", time: "01:30", home: "BR", away: "HT" },
  { date: "2026-06-20", time: "04:00", home: "TR", away: "PY" },
  { date: "2026-06-20", time: "18:00", home: "NL", away: "SE" },
  { date: "2026-06-20", time: "21:00", home: "DE", away: "CI" },
  { date: "2026-06-21", time: "01:00", home: "EC", away: "CW" },
  { date: "2026-06-21", time: "05:00", home: "TN", away: "JP" },
  { date: "2026-06-21", time: "17:00", home: "ES", away: "SA" },
  { date: "2026-06-21", time: "20:00", home: "BE", away: "IR" },
  { date: "2026-06-21", time: "23:00", home: "UY", away: "CV" },
  { date: "2026-06-22", time: "02:00", home: "NZ", away: "EG" },
  { date: "2026-06-22", time: "18:00", home: "AR", away: "AT" },
  { date: "2026-06-22", time: "22:00", home: "FR", away: "IQ" },
  { date: "2026-06-23", time: "01:00", home: "NO", away: "SN" },
  { date: "2026-06-23", time: "04:00", home: "JO", away: "DZ" },
  { date: "2026-06-23", time: "18:00", home: "PT", away: "UZ" },
  { date: "2026-06-23", time: "21:00", home: "ENG", away: "GH" },
  { date: "2026-06-24", time: "00:00", home: "PA", away: "HR" },
  { date: "2026-06-24", time: "03:00", home: "CO", away: "CD" },
  { date: "2026-06-24", time: "20:00", home: "CH", away: "CA" },
  { date: "2026-06-24", time: "20:00", home: "BA", away: "QA" },
  { date: "2026-06-24", time: "23:00", home: "MA", away: "HT" },
  { date: "2026-06-24", time: "23:00", home: "SCO", away: "BR" },
  { date: "2026-06-25", time: "02:00", home: "ZA", away: "KR" },
  { date: "2026-06-25", time: "02:00", home: "CZ", away: "MX" },
  { date: "2026-06-25", time: "21:00", home: "CW", away: "CI" },
  { date: "2026-06-25", time: "21:00", home: "EC", away: "DE" },
  { date: "2026-06-26", time: "00:00", home: "TN", away: "NL" },
  { date: "2026-06-26", time: "00:00", home: "JP", away: "SE" },
  { date: "2026-06-26", time: "03:00", home: "TR", away: "US" },
  { date: "2026-06-26", time: "03:00", home: "PY", away: "AU" },
  { date: "2026-06-26", time: "20:00", home: "NO", away: "FR" },
  { date: "2026-06-26", time: "20:00", home: "SN", away: "IQ" },
  { date: "2026-06-27", time: "01:00", home: "CV", away: "SA" },
  { date: "2026-06-27", time: "01:00", home: "UY", away: "ES" },
  { date: "2026-06-27", time: "04:00", home: "NZ", away: "BE" },
  { date: "2026-06-27", time: "04:00", home: "EG", away: "IR" },
  { date: "2026-06-27", time: "22:00", home: "PA", away: "ENG" },
  { date: "2026-06-27", time: "22:00", home: "HR", away: "GH" },
  { date: "2026-06-28", time: "00:30", home: "CO", away: "PT" },
  { date: "2026-06-28", time: "00:30", home: "CD", away: "UZ" },
  { date: "2026-06-28", time: "03:00", home: "DZ", away: "AT" },
  { date: "2026-06-28", time: "03:00", home: "JO", away: "AR" },
];

// 32 créneaux de phase finale, dans l'ordre chronologique par tour.
// (Équipes inconnues jusqu'au tirage : on n'attribue que l'horaire, dans l'ordre.)
export const KNOCKOUT_SLOTS: KoSlot[] = [
  // Barrages / 16es (R32) — 16 matchs
  { stage: "R32", date: "2026-06-28", time: "20:00" },
  { stage: "R32", date: "2026-06-29", time: "18:00" },
  { stage: "R32", date: "2026-06-29", time: "21:30" },
  { stage: "R32", date: "2026-06-30", time: "02:00" },
  { stage: "R32", date: "2026-06-30", time: "18:00" },
  { stage: "R32", date: "2026-06-30", time: "22:00" },
  { stage: "R32", date: "2026-07-01", time: "02:00" },
  { stage: "R32", date: "2026-07-01", time: "17:00" },
  { stage: "R32", date: "2026-07-01", time: "21:00" },
  { stage: "R32", date: "2026-07-02", time: "01:00" },
  { stage: "R32", date: "2026-07-02", time: "20:00" },
  { stage: "R32", date: "2026-07-03", time: "00:00" },
  { stage: "R32", date: "2026-07-03", time: "04:00" },
  { stage: "R32", date: "2026-07-03", time: "19:00" },
  { stage: "R32", date: "2026-07-03", time: "23:00" },
  { stage: "R32", date: "2026-07-04", time: "02:30" },
  // 8es (R16) — 8 matchs
  { stage: "R16", date: "2026-07-04", time: "18:00" },
  { stage: "R16", date: "2026-07-04", time: "22:00" },
  { stage: "R16", date: "2026-07-05", time: "21:00" },
  { stage: "R16", date: "2026-07-06", time: "01:00" },
  { stage: "R16", date: "2026-07-06", time: "20:00" },
  { stage: "R16", date: "2026-07-07", time: "01:00" },
  { stage: "R16", date: "2026-07-07", time: "17:00" },
  { stage: "R16", date: "2026-07-07", time: "21:00" },
  // Quarts (QF) — 4 matchs
  { stage: "QF", date: "2026-07-09", time: "21:00" },
  { stage: "QF", date: "2026-07-10", time: "20:00" },
  { stage: "QF", date: "2026-07-11", time: "22:00" },
  { stage: "QF", date: "2026-07-12", time: "02:00" },
  // Demies (SF) — 2 matchs
  { stage: "SF", date: "2026-07-14", time: "20:00" },
  { stage: "SF", date: "2026-07-15", time: "20:00" },
  // Petite finale (THIRD) — 1 match
  { stage: "THIRD", date: "2026-07-18", time: "22:00" },
  // Finale (FINAL) — 1 match
  { stage: "FINAL", date: "2026-07-19", time: "20:00" },
];
