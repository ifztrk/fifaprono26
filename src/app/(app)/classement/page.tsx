import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import { teamColor } from "@/lib/teamColors";
import TeamFlag from "@/components/TeamFlag";
import EvolutionChart from "./EvolutionChart";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

type ChartData = {
  dayLabels: string[];
  maxRank: number;
  series: { name: string; color: string; ranks: (number | null)[] }[];
};

async function buildChart(): Promise<ChartData | null> {
  const snaps = await prisma.rankSnapshot.findMany({
    orderBy: { day: "asc" },
    include: { user: { select: { displayName: true, favoriteCode: true } } },
  });
  if (snaps.length === 0) return null;

  const days = [...new Set(snaps.map((s) => s.day))].sort();
  if (days.length < 2) return null;

  // points[userId][day] = total
  const users = new Map<
    string,
    { name: string; favoriteCode: string | null; pts: Record<string, number> }
  >();
  for (const s of snaps) {
    if (!users.has(s.userId))
      users.set(s.userId, {
        name: s.user.displayName,
        favoriteCode: s.user.favoriteCode,
        pts: {},
      });
    users.get(s.userId)!.pts[s.day] = s.points;
  }

  // Rang par jour (à points égaux, même rang)
  const rankByDay: Record<string, Record<string, number>> = {};
  for (const day of days) {
    const present = [...users.entries()].filter(([, u]) => day in u.pts);
    present.sort((a, b) => b[1].pts[day] - a[1].pts[day]);
    rankByDay[day] = {};
    present.forEach(([id], idx) => (rankByDay[day][id] = idx + 1));
  }

  const series = [...users.entries()].map(([id, u]) => ({
    name: u.name,
    color: teamColor(u.favoriteCode),
    ranks: days.map((d) => rankByDay[d][id] ?? null),
  }));

  const dayLabels = days.map((d) => {
    const [, m, j] = d.split("-");
    return `${j}/${m}`;
  });

  return { dayLabels, series, maxRank: users.size };
}

export default async function ClassementPage() {
  const user = (await getCurrentUser())!;
  const [rows, chart] = await Promise.all([getLeaderboard(), buildChart()]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Classement 🥇</h1>
        <p className="text-sm text-muted">
          Le grand duel entre amis · {rows.length} joueur
          {rows.length > 1 ? "s" : ""} en lice.
        </p>
      </div>

      {chart && (
        <div className="card mb-4">
          <h2 className="display mb-2 text-base font-bold">
            📈 Évolution des places
          </h2>
          <EvolutionChart
            dayLabels={chart.dayLabels}
            series={chart.series}
            maxRank={chart.maxRank}
          />
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r, i) => {
          const me = r.userId === user.id;
          return (
            <div
              key={r.userId}
              className={`card flex items-center gap-3 !p-3 ${
                me ? "ring-2 ring-primary" : ""
              } ${i === 0 ? "border-gold/50" : ""}`}
            >
              <div className="w-8 shrink-0 text-center text-lg font-black">
                {MEDALS[i] ?? <span className="text-muted">{i + 1}</span>}
              </div>
              <TeamFlag code={r.favoriteCode} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">
                  {r.displayName}
                  {me && <span className="ml-1 text-xs text-primary">(toi)</span>}
                </p>
                <p className="text-xs text-muted">
                  🎯 {r.exactCount} score{r.exactCount > 1 ? "s" : ""} exact
                  {r.exactCount > 1 ? "s" : ""} · {r.predictionCount} prono
                  {r.predictionCount > 1 ? "s" : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-black text-primary">{r.total}</p>
                <p className="text-[10px] uppercase text-muted">pts</p>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="card text-center text-muted">
            Aucun joueur pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  );
}
