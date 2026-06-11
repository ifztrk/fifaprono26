import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import { teamColor } from "@/lib/teamColors";
import TeamFlag from "@/components/TeamFlag";
import EvolutionChart from "./EvolutionChart";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];
// Hauteur et couleur du socle pour chaque marche du podium (or / argent / bronze)
const PEDESTAL = [
  "h-20 bg-gradient-to-b from-gold-soft to-gold text-[#2a1e00]",
  "h-14 bg-gradient-to-b from-border to-surface-2 text-foreground",
  "h-10 bg-gradient-to-b from-[#e0b07a] to-[#b9824e] text-[#2a1e00]",
];

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

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  // Ordre d'affichage des colonnes : argent à gauche, or au centre, bronze à droite
  const order =
    top.length >= 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];

  return (
    <div>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Classement 🥇</h1>
        <p className="text-sm text-muted">
          Le grand duel entre amis · {rows.length} joueur
          {rows.length > 1 ? "s" : ""} en lice.
        </p>
      </div>

      {top.length > 0 && (
        <div className="card mb-4">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {order.map((idx) => {
              const r = top[idx];
              if (!r) return null;
              const me = r.userId === user.id;
              const gold = idx === 0;
              return (
                <div
                  key={r.userId}
                  className="flex flex-1 flex-col items-center"
                >
                  <div className={gold ? "text-3xl" : "text-2xl"}>
                    {MEDALS[idx]}
                  </div>
                  <div className={gold ? "mt-0.5 scale-110" : "mt-0.5"}>
                    <TeamFlag code={r.favoriteCode} size={gold ? 52 : 40} />
                  </div>
                  <p
                    className={`mt-1 max-w-full truncate text-center text-sm font-bold ${
                      me ? "text-primary" : ""
                    }`}
                  >
                    {r.displayName}
                    {me && <span className="ml-1 text-[10px]">(toi)</span>}
                  </p>
                  <p className="text-lg font-black leading-none text-primary">
                    {r.total}
                  </p>
                  <p className="mb-1 text-[10px] uppercase text-muted">pts</p>
                  <div
                    className={`flex w-full items-start justify-center rounded-t-lg pt-1 text-lg font-black ${PEDESTAL[idx]}`}
                  >
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((r, i) => {
            const me = r.userId === user.id;
            const rank = i + 4;
            return (
              <div
                key={r.userId}
                className={`card flex items-center gap-3 !p-3 ${
                  me ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="w-8 shrink-0 text-center text-lg font-black text-muted">
                  {rank}
                </div>
                <TeamFlag code={r.favoriteCode} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {r.displayName}
                    {me && (
                      <span className="ml-1 text-xs text-primary">(toi)</span>
                    )}
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
        </div>
      )}

      {rows.length === 0 && (
        <div className="card text-center text-muted">
          Aucun joueur pour l&apos;instant.
        </div>
      )}

      {chart && (
        <div className="card mt-4">
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
    </div>
  );
}
