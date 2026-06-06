import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tirage officiel de la Coupe du Monde 2026 (12 groupes de 4).
// Ordre = ordre des chapeaux (tête de série en premier).
// code = ISO alpha-2 utilisé pour le drapeau ; name = nom français.
const GROUPS: Record<string, { code: string; name: string }[]> = {
  A: [
    { code: "MX", name: "Mexique" },
    { code: "ZA", name: "Afrique du Sud" },
    { code: "KR", name: "Corée du Sud" },
    { code: "CZ", name: "République tchèque" },
  ],
  B: [
    { code: "CA", name: "Canada" },
    { code: "BA", name: "Bosnie-Herzégovine" },
    { code: "QA", name: "Qatar" },
    { code: "CH", name: "Suisse" },
  ],
  C: [
    { code: "BR", name: "Brésil" },
    { code: "MA", name: "Maroc" },
    { code: "HT", name: "Haïti" },
    { code: "SCO", name: "Écosse" },
  ],
  D: [
    { code: "US", name: "États-Unis" },
    { code: "PY", name: "Paraguay" },
    { code: "AU", name: "Australie" },
    { code: "TR", name: "Turquie" },
  ],
  E: [
    { code: "DE", name: "Allemagne" },
    { code: "CW", name: "Curaçao" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "EC", name: "Équateur" },
  ],
  F: [
    { code: "NL", name: "Pays-Bas" },
    { code: "JP", name: "Japon" },
    { code: "SE", name: "Suède" },
    { code: "TN", name: "Tunisie" },
  ],
  G: [
    { code: "BE", name: "Belgique" },
    { code: "EG", name: "Égypte" },
    { code: "IR", name: "Iran" },
    { code: "NZ", name: "Nouvelle-Zélande" },
  ],
  H: [
    { code: "ES", name: "Espagne" },
    { code: "CV", name: "Cap-Vert" },
    { code: "SA", name: "Arabie saoudite" },
    { code: "UY", name: "Uruguay" },
  ],
  I: [
    { code: "FR", name: "France" },
    { code: "SN", name: "Sénégal" },
    { code: "IQ", name: "Irak" },
    { code: "NO", name: "Norvège" },
  ],
  J: [
    { code: "AR", name: "Argentine" },
    { code: "DZ", name: "Algérie" },
    { code: "AT", name: "Autriche" },
    { code: "JO", name: "Jordanie" },
  ],
  K: [
    { code: "PT", name: "Portugal" },
    { code: "CD", name: "RD Congo" },
    { code: "UZ", name: "Ouzbékistan" },
    { code: "CO", name: "Colombie" },
  ],
  L: [
    { code: "ENG", name: "Angleterre" },
    { code: "HR", name: "Croatie" },
    { code: "GH", name: "Ghana" },
    { code: "PA", name: "Panama" },
  ],
};

// Schéma de rencontres pour 4 équipes (indices), 3 journées de 2 matchs
const ROUND_ROBIN: [number, number][][] = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [3, 1],
  ],
  [
    [3, 0],
    [1, 2],
  ],
];

function utc(year: number, month1: number, day: number, hour: number): Date {
  // month1 = mois 1-12
  return new Date(Date.UTC(year, month1 - 1, day, hour, 0, 0));
}

async function main() {
  console.log("→ Upsert des 48 équipes…");
  const teamIdByCode = new Map<string, string>();
  for (const [group, teams] of Object.entries(GROUPS)) {
    for (const t of teams) {
      const team = await prisma.team.upsert({
        where: { code: t.code },
        update: { name: t.name, groupName: group },
        create: { code: t.code, name: t.name, groupName: group },
      });
      teamIdByCode.set(t.code, team.id);
    }
  }

  const existingMatches = await prisma.match.count();
  if (existingMatches > 0) {
    console.log(
      `→ ${existingMatches} matchs déjà présents — on ne touche pas au calendrier (pour préserver les pronos).`,
    );
    console.log("✅ Seed terminé (équipes mises à jour).");
    return;
  }

  console.log("→ Création des 72 matchs de poule…");
  const groupKeys = Object.keys(GROUPS);
  let number = 1;
  const matchData: {
    number: number;
    stage: string;
    groupName: string | null;
    kickoff: Date;
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeLabel: string | null;
    awayLabel: string | null;
  }[] = [];

  groupKeys.forEach((g, gi) => {
    const teams = GROUPS[g];
    const offset = Math.floor(gi / 2); // 0..5
    const mdDays = [11 + offset, 18 + offset, 24 + offset]; // juin
    ROUND_ROBIN.forEach((md, mdi) => {
      md.forEach(([hi, ai], slot) => {
        const hour = slot === 0 ? 16 : 19; // 18h / 21h Paris
        matchData.push({
          number: number++,
          stage: "GROUP",
          groupName: g,
          kickoff: utc(2026, 6, mdDays[mdi], hour),
          homeTeamId: teamIdByCode.get(teams[hi].code)!,
          awayTeamId: teamIdByCode.get(teams[ai].code)!,
          homeLabel: null,
          awayLabel: null,
        });
      });
    });
  });

  // Phase à élimination directe — placeholders (équipes assignées par l'admin)
  console.log("→ Création de la phase finale (placeholders)…");
  const knockout: { stage: string; count: number; startDay: number }[] = [
    { stage: "R32", count: 16, startDay: 28 }, // 28 juin → 3 juil
    { stage: "R16", count: 8, startDay: 34 }, // 4-7 juil (34 = 4 juil)
    { stage: "QF", count: 4, startDay: 39 }, // 9-11 juil
    { stage: "SF", count: 2, startDay: 44 }, // 14-15 juil
    { stage: "THIRD", count: 1, startDay: 48 }, // 18 juil
    { stage: "FINAL", count: 1, startDay: 49 }, // 19 juil
  ];

  for (const ko of knockout) {
    for (let i = 0; i < ko.count; i++) {
      // startDay encodé en "jours depuis le 1er juin" pour franchir juin→juillet
      const dayOfJune = ko.startDay + Math.floor(i / 2);
      const hour = i % 2 === 0 ? 16 : 19;
      matchData.push({
        number: number++,
        stage: ko.stage,
        groupName: null,
        kickoff: utc(2026, 6, dayOfJune, hour), // les jours > 30 débordent sur juillet
        homeTeamId: null,
        awayTeamId: null,
        homeLabel: "À déterminer",
        awayLabel: "À déterminer",
      });
    }
  }

  await prisma.match.createMany({ data: matchData });
  console.log(`✅ ${matchData.length} matchs créés. Seed terminé.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
