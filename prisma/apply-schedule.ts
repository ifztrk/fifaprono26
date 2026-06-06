import { PrismaClient } from "@prisma/client";
import {
  GROUP_FIXTURES,
  KNOCKOUT_SLOTS,
  kickoffFromBst,
} from "./schedule2026";

const prisma = new PrismaClient();

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

async function main() {
  // code ISO -> id d'équipe
  const teams = await prisma.team.findMany({ select: { id: true, code: true } });
  const idByCode = new Map(teams.map((t) => [t.code, t.id]));

  // -------- Phase de groupes : appariement par PAIRE d'équipes --------
  const groupMatches = await prisma.match.findMany({
    where: { stage: "GROUP" },
    select: { id: true, homeTeamId: true, awayTeamId: true },
  });
  const matchByPair = new Map<string, string>();
  for (const m of groupMatches) {
    if (m.homeTeamId && m.awayTeamId) {
      matchByPair.set(pairKey(m.homeTeamId, m.awayTeamId), m.id);
    }
  }

  let updated = 0;
  const problems: string[] = [];

  for (const f of GROUP_FIXTURES) {
    const hid = idByCode.get(f.home);
    const aid = idByCode.get(f.away);
    if (!hid || !aid) {
      problems.push(`Code équipe inconnu : ${f.home} vs ${f.away}`);
      continue;
    }
    const matchId = matchByPair.get(pairKey(hid, aid));
    if (!matchId) {
      problems.push(`Paire absente en base : ${f.home} vs ${f.away}`);
      continue;
    }
    await prisma.match.update({
      where: { id: matchId },
      data: { kickoff: kickoffFromBst(f.date, f.time) },
    });
    updated++;
  }

  // -------- Phase finale : attribution des créneaux dans l'ordre --------
  const stages = ["R32", "R16", "QF", "SF", "THIRD", "FINAL"];
  for (const st of stages) {
    const slots = KNOCKOUT_SLOTS.filter((s) => s.stage === st);
    const koMatches = await prisma.match.findMany({
      where: { stage: st },
      orderBy: { number: "asc" },
      select: { id: true },
    });
    if (slots.length !== koMatches.length) {
      problems.push(
        `${st} : ${slots.length} créneaux pour ${koMatches.length} matchs en base`,
      );
    }
    for (let i = 0; i < Math.min(slots.length, koMatches.length); i++) {
      await prisma.match.update({
        where: { id: koMatches[i].id },
        data: { kickoff: kickoffFromBst(slots[i].date, slots[i].time) },
      });
      updated++;
    }
  }

  console.log(`✅ ${updated} matchs mis à jour avec le calendrier officiel.`);
  if (problems.length) {
    console.warn("⚠️ Points d'attention :");
    for (const p of problems) console.warn("  -", p);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
