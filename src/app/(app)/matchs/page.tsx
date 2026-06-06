import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { teamColor } from "@/lib/teamColors";
import { dayKey, formatDay, formatTime, stageLabel } from "@/lib/format";
import { savePredictionsAction } from "./actions";
import SaveBar from "./SaveBar";
import TeamFlag from "@/components/TeamFlag";

export const dynamic = "force-dynamic";

type TeamMini = { name: string; code: string } | null;

// Une ligne d'équipe : drapeau + nom (tronqué) + cellule de score à droite.
function TeamLine({
  team,
  label,
  scoreCell,
  dim = false,
}: {
  team: TeamMini;
  label: string | null;
  scoreCell: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {team ? (
        <TeamFlag code={team.code} size={28} />
      ) : (
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
          ?
        </span>
      )}
      <span
        className={`min-w-0 flex-1 truncate font-semibold ${
          team ? (dim ? "text-muted" : "") : "text-muted"
        }`}
      >
        {team?.name ?? label ?? "À déterminer"}
      </span>
      {scoreCell}
    </div>
  );
}

export default async function MatchsPage() {
  const user = (await getCurrentUser())!;

  const [matches, preds] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.matchPrediction.findMany({ where: { userId: user.id } }),
  ]);

  const predMap = new Map(preds.map((p) => [p.matchId, p]));
  const now = new Date();

  if (matches.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-4xl">⚽</p>
        <h1 className="mt-2 text-xl font-bold">Aucun match pour le moment</h1>
        <p className="mt-1 text-muted">
          Les matchs apparaîtront ici dès que l&apos;administrateur aura
          configuré le calendrier.
        </p>
      </div>
    );
  }

  // Regroupement par jour
  const days: { key: string; date: Date; matches: typeof matches }[] = [];
  for (const m of matches) {
    const k = dayKey(m.kickoff);
    let bucket = days.find((d) => d.key === k);
    if (!bucket) {
      bucket = { key: k, date: m.kickoff, matches: [] };
      days.push(bucket);
    }
    bucket.matches.push(m);
  }

  return (
    <form action={savePredictionsAction}>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Les matchs ⚽</h1>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="chip">🎯 Exact = 3 pts</span>
          <span className="chip">✅ Bon résultat = 1 pt</span>
          <span className="chip">🔒 Verrou au coup d&apos;envoi</span>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <section key={day.key}>
            <h2 className="mb-2 text-sm font-bold capitalize text-muted">
              {formatDay(day.date)}
            </h2>
            <div className="space-y-2.5">
              {day.matches.map((m) => {
                const locked = m.kickoff <= now;
                const finished =
                  m.finished && m.homeScore !== null && m.awayScore !== null;
                const pred = predMap.get(m.id);
                const homeWin =
                  finished && (m.homeScore ?? 0) > (m.awayScore ?? 0);
                const awayWin =
                  finished && (m.awayScore ?? 0) > (m.homeScore ?? 0);

                // Cellules de score selon l'état
                let homeCell: React.ReactNode;
                let awayCell: React.ReactNode;
                if (!locked) {
                  homeCell = (
                    <input
                      type="number"
                      name={`home_${m.id}`}
                      min={0}
                      max={99}
                      defaultValue={pred?.homeScore ?? ""}
                      className="score-input"
                      aria-label={`Score ${m.homeTeam?.name ?? "domicile"}`}
                    />
                  );
                  awayCell = (
                    <input
                      type="number"
                      name={`away_${m.id}`}
                      min={0}
                      max={99}
                      defaultValue={pred?.awayScore ?? ""}
                      className="score-input"
                      aria-label={`Score ${m.awayTeam?.name ?? "extérieur"}`}
                    />
                  );
                } else if (finished) {
                  homeCell = (
                    <span
                      className={`w-9 text-center text-2xl font-black ${
                        homeWin ? "" : "text-muted"
                      }`}
                    >
                      {m.homeScore}
                    </span>
                  );
                  awayCell = (
                    <span
                      className={`w-9 text-center text-2xl font-black ${
                        awayWin ? "" : "text-muted"
                      }`}
                    >
                      {m.awayScore}
                    </span>
                  );
                } else {
                  homeCell = <span className="w-9 text-center text-muted">–</span>;
                  awayCell = <span className="w-9 text-center text-muted">–</span>;
                }

                return (
                  <div key={m.id} className="card relative overflow-hidden !p-3">
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 w-1"
                      style={{
                        background: `linear-gradient(180deg, ${teamColor(
                          m.homeTeam?.code,
                        )}, ${teamColor(m.awayTeam?.code)})`,
                      }}
                    />

                    <div className="mb-2 flex items-center justify-between text-xs text-muted">
                      <span className="truncate">
                        {stageLabel(m.stage)}
                        {m.groupName ? ` · Groupe ${m.groupName}` : ""}
                      </span>
                      <span className="shrink-0">
                        {locked ? "🔒 " : "🕒 "}
                        {formatTime(m.kickoff)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <TeamLine
                        team={m.homeTeam}
                        label={m.homeLabel}
                        scoreCell={homeCell}
                        dim={awayWin}
                      />
                      <TeamLine
                        team={m.awayTeam}
                        label={m.awayLabel}
                        scoreCell={awayCell}
                        dim={homeWin}
                      />
                    </div>

                    {locked && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs">
                        {pred ? (
                          <span className="text-muted">
                            Ton prono :{" "}
                            <span className="font-semibold text-foreground">
                              {pred.homeScore}-{pred.awayScore}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted">Pas de prono 😴</span>
                        )}
                        {finished && pred && (
                          <span
                            className={`rounded-full px-2 py-0.5 font-bold ${
                              pred.points >= 3
                                ? "bg-primary/20 text-primary"
                                : pred.points > 0
                                  ? "bg-gold/20 text-gold"
                                  : "bg-danger/20 text-danger"
                            }`}
                          >
                            {pred.points >= 3 ? "🎯 " : ""}+{pred.points} pt
                            {pred.points > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <SaveBar />
    </form>
  );
}
