import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { flagEmoji } from "@/lib/countries";
import { formatDay, formatTime, stageLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

const QUICK = [
  { href: "/matchs", icon: "⚽", title: "Matchs", desc: "Pronostique les scores" },
  { href: "/poules", icon: "📊", title: "Poules", desc: "Qualifiés de groupe" },
  { href: "/finale", icon: "🏆", title: "Finale", desc: "Vainqueur & finaliste" },
  { href: "/classement", icon: "🥇", title: "Classement", desc: "Le duel entre amis" },
];

export default async function AccueilPage() {
  const user = (await getCurrentUser())!;
  const now = new Date();

  const [rows, upcoming, totalPreds, upcomingCount] = await Promise.all([
    getLeaderboard(),
    prisma.match.findMany({
      where: { kickoff: { gt: now } },
      orderBy: { kickoff: "asc" },
      take: 4,
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.matchPrediction.count({ where: { userId: user.id } }),
    prisma.match.count({ where: { kickoff: { gt: now } } }),
  ]);

  const me = rows.find((r) => r.userId === user.id);
  const rank = rows.findIndex((r) => r.userId === user.id) + 1;
  const predictedIds = new Set(
    (
      await prisma.matchPrediction.findMany({
        where: { userId: user.id, matchId: { in: upcoming.map((m) => m.id) } },
        select: { matchId: true },
      })
    ).map((p) => p.matchId),
  );

  return (
    <div className="space-y-6">
      {/* Héro : salutation + rang/points */}
      <section className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-10 text-[7rem] opacity-10">
          🏆
        </div>
        <p className="text-sm text-muted">Salut {user.displayName} 👋</p>
        <h1 className="display mt-0.5 text-2xl font-extrabold">
          Prêt pour la <span className="gradient-text">Coupe du Monde</span> ?
        </h1>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="card-2 text-center">
            <p className="display text-3xl font-black text-gold">
              {rank || "—"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Classement
            </p>
          </div>
          <div className="card-2 text-center">
            <p className="display text-3xl font-black text-primary">
              {me?.total ?? 0}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Points
            </p>
          </div>
          <div className="card-2 text-center">
            <p className="display text-3xl font-black">{me?.exactCount ?? 0}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Scores exacts
            </p>
          </div>
        </div>
      </section>

      {/* Prochains matchs */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="display text-lg font-bold">Prochains matchs</h2>
          <Link href="/matchs" className="text-sm font-semibold text-primary">
            Tout voir →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="card text-center text-muted">
            Aucun match à venir pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => {
              const done = predictedIds.has(m.id);
              return (
                <Link
                  key={m.id}
                  href="/matchs"
                  className="card flex items-center gap-3 !py-3 transition hover:border-primary/50"
                >
                  <div className="flex flex-1 items-center justify-center gap-2 text-sm font-semibold">
                    <span className="text-xl">
                      {flagEmoji(m.homeTeam?.code ?? "")}
                    </span>
                    <span className="hidden sm:inline">
                      {m.homeTeam?.name ?? "?"}
                    </span>
                    <span className="text-muted">vs</span>
                    <span className="hidden sm:inline">
                      {m.awayTeam?.name ?? "?"}
                    </span>
                    <span className="text-xl">
                      {flagEmoji(m.awayTeam?.code ?? "")}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted">
                      {formatDay(m.kickoff).split(" ").slice(0, 3).join(" ")}
                    </p>
                    <p className="text-xs font-semibold">
                      {formatTime(m.kickoff)}
                    </p>
                  </div>
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${
                      done
                        ? "bg-primary/20 text-primary"
                        : "bg-gold/20 text-gold"
                    }`}
                    title={done ? "Pronostiqué" : "À pronostiquer"}
                  >
                    {done ? "✓" : "!"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {upcomingCount > totalPreds && (
          <Link
            href="/matchs"
            className="btn-gold mt-3 flex w-full"
          >
            ✍️ {upcomingCount - totalPreds} match
            {upcomingCount - totalPreds > 1 ? "s" : ""} à pronostiquer
          </Link>
        )}
      </section>

      {/* Accès rapides */}
      <section>
        <h2 className="display mb-3 text-lg font-bold">Tes pronostics</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card flex flex-col gap-1 transition hover:border-primary/50"
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="font-bold">{q.title}</span>
              <span className="text-xs text-muted">{q.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
