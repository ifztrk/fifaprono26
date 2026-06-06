import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { teamColor } from "@/lib/teamColors";
import { dayKey, formatDay, formatTime, stageLabel } from "@/lib/format";
import { savePredictionsAction } from "./actions";
import SaveBar from "./SaveBar";
import TeamFlag from "@/components/TeamFlag";

export const dynamic = "force-dynamic";

type TeamMini = { name: string; code: string } | null;

function Side({
  team,
  label,
  align,
}: {
  team: TeamMini;
  label: string | null;
  align: "left" | "right";
}) {
  const content = team ? (
    <>
      <TeamFlag code={team.code} size={36} />
      <span className="font-semibold">{team.name}</span>
    </>
  ) : (
    <>
      <span className="text-2xl">❔</span>
      <span className="text-muted">{label ?? "À déterminer"}</span>
    </>
  );
  return (
    <div
      className={`flex flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      {content}
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
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
              {formatDay(day.date)}
            </h2>
            <div className="space-y-2">
              {day.matches.map((m) => {
                const locked = m.kickoff <= now;
                const finished =
                  m.finished && m.homeScore !== null && m.awayScore !== null;
                const pred = predMap.get(m.id);

                return (
                  <div
                    key={m.id}
                    className="card relative overflow-hidden !p-3"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
                      style={{
                        background: `linear-gradient(90deg, ${teamColor(
                          m.homeTeam?.code,
                        )}, ${teamColor(m.awayTeam?.code)})`,
                      }}
                    />
                    <div className="mb-2 flex items-center justify-between text-xs text-muted">
                      <span>
                        {stageLabel(m.stage)}
                        {m.groupName ? ` · Groupe ${m.groupName}` : ""}
                      </span>
                      <span>
                        {locked ? "🔒 " : ""}
                        {formatTime(m.kickoff)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Side
                        team={m.homeTeam}
                        label={m.homeLabel}
                        align="left"
                      />

                      <div className="flex shrink-0 items-center gap-1">
                        {locked ? (
                          <div className="text-center">
                            {finished ? (
                              <div className="rounded-lg bg-surface-2 px-3 py-1 text-lg font-black">
                                {m.homeScore}
                                <span className="mx-1 text-muted">-</span>
                                {m.awayScore}
                              </div>
                            ) : (
                              <div className="rounded-lg bg-surface-2 px-3 py-1 text-sm text-muted">
                                à venir
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <input
                              type="number"
                              name={`home_${m.id}`}
                              min={0}
                              max={99}
                              defaultValue={pred?.homeScore ?? ""}
                              className="score-input"
                              aria-label="Score domicile"
                            />
                            <span className="text-muted">-</span>
                            <input
                              type="number"
                              name={`away_${m.id}`}
                              min={0}
                              max={99}
                              defaultValue={pred?.awayScore ?? ""}
                              className="score-input"
                              aria-label="Score extérieur"
                            />
                          </>
                        )}
                      </div>

                      <Side
                        team={m.awayTeam}
                        label={m.awayLabel}
                        align="right"
                      />
                    </div>

                    {/* Rappel du prono + points une fois verrouillé */}
                    {locked && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                        {pred ? (
                          <span className="text-muted">
                            Ton prono : {pred.homeScore}-{pred.awayScore}
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
                            +{pred.points} pt{pred.points > 1 ? "s" : ""}
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
