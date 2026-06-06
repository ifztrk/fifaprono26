import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendToSubs } from "@/lib/push";

export const dynamic = "force-dynamic";

// Appelé par le cron Vercel (1×/jour) : rappelle aux joueurs abonnés
// les matchs des prochaines 24h qu'ils n'ont pas encore pronostiqués.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: { gt: now, lte: in24h },
      homeTeamId: { not: null },
      awayTeamId: { not: null },
    },
    select: { id: true },
  });
  if (matches.length === 0)
    return NextResponse.json({ ok: true, sent: 0, reason: "aucun match" });

  const matchIds = matches.map((m) => m.id);

  const users = await prisma.user.findMany({
    where: { pushSubs: { some: {} } },
    include: {
      pushSubs: true,
      matchPredictions: {
        where: { matchId: { in: matchIds } },
        select: { matchId: true },
      },
    },
  });

  let sent = 0;
  for (const u of users) {
    const predicted = new Set(u.matchPredictions.map((p) => p.matchId));
    const remaining = matchIds.filter((id) => !predicted.has(id)).length;
    if (remaining > 0) {
      await sendToSubs(u.pushSubs, {
        title: "FIFAPRONO 26 ⚽",
        body: `Tu as ${remaining} match${
          remaining > 1 ? "s" : ""
        } à pronostiquer aujourd'hui ! Ne te fais pas coiffer 😉`,
        url: "/matchs",
      });
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
