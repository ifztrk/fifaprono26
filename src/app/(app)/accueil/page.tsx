import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { teamColor } from "@/lib/teamColors";
import { formatDay, formatTime } from "@/lib/format";
import { getTimeZone } from "@/lib/timezone";
import FlagMarquee from "../FlagMarquee";
import TeamFlag from "@/components/TeamFlag";
import ExactCelebration from "./ExactCelebration";

export const dynamic = "force-dynamic";

const QUICK = [
  { href: "/matchs", icon: "⚽", title: "Matchs", desc: "Pronostique les scores" },
  { href: "/poules", icon: "📊", title: "Groupes", desc: "Qualifiés de groupe" },
  { href: "/finale", icon: "🏆", title: "Finale", desc: "Vainqueur & finaliste" },
  { href: "/classement", icon: "🥇", title: "Classement", desc: "Le duel entre amis" },
];

export default async function AccueilPage() {
  const user = (await getCurrentUser())!;
  const now = new Date();

  // Un match est "jouable" quand ses 2 équipes sont connues et qu'il n'a pas commencé
  const playable = {
    kickoff: { gt: now },
    homeTeamId: { not: null },
    awayTeamId: { not: null },
  } as const;

  const [tz, rows, upcoming, playableCount, predictedUpcoming, teams] =
    await Promise.all([
      getTimeZone(),
      getLeaderboard(),
      prisma.match.findMany({
        where: playable,
        orderBy: { kickoff: "asc" },
        take: 4,
        include: { homeTeam: true, awayTeam: true },
      }),
      prisma.match.count({ where: playable }),
      prisma.matchPrediction.count({
        where: { userId: user.id, match: playable },
      }),
      prisma.team.findMany({ select: { code: true }, orderBy: { name: "asc" } }),
    ]);

  const me = rows.find((r) => r.userId === user.id);
  const rank = rows.findIndex((r) => r.userId === user.id) + 1;
  const remaining = Math.max(0, playableCount - predictedUpcoming);
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
      <ExactCelebration count={me?.exactCount ?? 0} />
      {/* Héro : salutation + rang/points */}
      <section className="card relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
          style={{
            background:
              "linear-gradient(90deg,#e23a4a,#ff8a1e,#ffce2b,#0bb04a,#2a6fe0,#9d1a4a)",
          }}
        />
        <div className="bob pointer-events-none absolute -right-4 -top-2 text-7xl opacity-20">
          🏆
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          Salut
          <TeamFlag code={user.favoriteCode} size={18} ring={false} />
          {user.displayName} 👋
        </p>
        <h1 className="display mt-0.5 text-2xl font-extrabold">
          Prêt pour la <span className="gradient-text">Coupe du Monde</span> ?
          🎉
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

      {/* Guirlande des 48 nations */}
      <FlagMarquee codes={teams.map((t) => t.code)} />

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
                  className="card relative block overflow-hidden !p-3 transition hover:border-primary/50"
                >
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1"
                    style={{
                      background: `linear-gradient(180deg, ${teamColor(
                        m.homeTeam?.code,
                      )}, ${teamColor(m.awayTeam?.code)})`,
                    }}
                  />
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right">
                      <span className="truncate">{m.homeTeam?.name ?? "?"}</span>
                      <TeamFlag code={m.homeTeam?.code} size={24} />
                    </span>
                    <span className="shrink-0 text-xs text-muted">vs</span>
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <TeamFlag code={m.awayTeam?.code} size={24} />
                      <span className="truncate">{m.awayTeam?.name ?? "?"}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>
                      {formatDay(m.kickoff, tz).split(" ").slice(0, 3).join(" ")}{" "}
                      · {formatTime(m.kickoff, tz)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        done
                          ? "bg-primary/20 text-primary"
                          : "bg-gold/20 text-gold"
                      }`}
                    >
                      {done ? "✓ Pronostiqué" : "! À pronostiquer"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {remaining > 0 && (
          <Link href="/matchs" className="btn-gold mt-3 flex w-full">
            ✍️ {remaining} match{remaining > 1 ? "s" : ""} à pronostiquer
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
