import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { flagEmoji } from "@/lib/countries";
import { computeStandings } from "@/lib/scoring";
import { teamColor } from "@/lib/teamColors";
import { arePreTournamentPredictionsLocked } from "@/lib/lock";
import { saveGroupPredictionsAction } from "./actions";
import SaveButton from "../SaveButton";

export const dynamic = "force-dynamic";

export default async function PoulesPage() {
  const user = (await getCurrentUser())!;

  const [teams, groupMatches, preds, locked] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.match.findMany({ where: { stage: "GROUP" } }),
    prisma.groupPrediction.findMany({ where: { userId: user.id } }),
    arePreTournamentPredictionsLocked(),
  ]);

  if (teams.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-4xl">📊</p>
        <h1 className="mt-2 text-xl font-bold">Poules non configurées</h1>
        <p className="mt-1 text-muted">
          Les groupes apparaîtront ici une fois le tirage saisi par
          l&apos;administrateur.
        </p>
      </div>
    );
  }

  const predMap = new Map(preds.map((p) => [p.groupName, p]));
  const groups = [...new Set(teams.map((t) => t.groupName))].sort();

  return (
    <form action={saveGroupPredictionsAction}>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Poules & qualifiés 📊</h1>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="chip">🥇🥈 2 qualifiés / groupe</span>
          <span className="chip">+2 pts par bonne équipe</span>
          <span className="chip">
            {locked ? "🔒 Verrouillé" : "✏️ Modifiable avant le tournoi"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((g) => {
          const gTeams = teams.filter((t) => t.groupName === g);
          const gMatches = groupMatches.filter((m) => m.groupName === g);
          const standings = computeStandings(
            gTeams.map((t) => ({ id: t.id, code: t.code, name: t.name })),
            gMatches,
          );
          const allDone =
            gMatches.length > 0 && gMatches.every((m) => m.finished);
          const top2 = allDone ? standings.slice(0, 2).map((r) => r.code) : [];
          const pred = predMap.get(g);

          return (
            <section key={g} className="card relative overflow-hidden !p-3">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${gTeams
                    .map((t) => teamColor(t.code))
                    .join(", ")})`,
                }}
              />
              <h2 className="display mb-2 text-lg font-bold">Groupe {g}</h2>

              {/* Classement */}
              <table className="mb-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="font-medium">Équipe</th>
                    <th className="w-8 text-center font-medium">J</th>
                    <th className="w-8 text-center font-medium">Diff</th>
                    <th className="w-8 text-center font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r, i) => {
                    const qualified = allDone && i < 2;
                    return (
                      <tr
                        key={r.code}
                        className={`border-t border-border/50 ${
                          qualified ? "text-primary" : ""
                        }`}
                      >
                        <td className="py-1.5">
                          <span className="mr-1.5 text-muted">{i + 1}</span>
                          <span
                            className="flag-badge mr-1.5 inline-grid size-6 align-middle text-sm"
                            style={
                              { "--tc": teamColor(r.code) } as React.CSSProperties
                            }
                          >
                            {flagEmoji(r.code)}
                          </span>
                          {r.name}
                        </td>
                        <td className="text-center">{r.played}</td>
                        <td className="text-center">
                          {r.gd > 0 ? "+" : ""}
                          {r.gd}
                        </td>
                        <td className="text-center font-bold">{r.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pronostic des qualifiés */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">🥇 1er</label>
                  <select
                    name={`first_${g}`}
                    defaultValue={pred?.firstCode ?? ""}
                    disabled={locked}
                    className="input"
                  >
                    <option value="">—</option>
                    {gTeams.map((t) => (
                      <option key={t.code} value={t.code}>
                        {flagEmoji(t.code)} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">🥈 2e</label>
                  <select
                    name={`second_${g}`}
                    defaultValue={pred?.secondCode ?? ""}
                    disabled={locked}
                    className="input"
                  >
                    <option value="">—</option>
                    {gTeams.map((t) => (
                      <option key={t.code} value={t.code}>
                        {flagEmoji(t.code)} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {allDone && pred && (
                <p className="mt-2 text-center text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold ${
                      pred.points > 0
                        ? "bg-primary/20 text-primary"
                        : "bg-danger/20 text-danger"
                    }`}
                  >
                    +{pred.points} pts
                  </span>
                </p>
              )}
            </section>
          );
        })}
      </div>

      {!locked && (
        <SaveButton
          label="💾 Enregistrer mes qualifiés"
          pendingLabel="Enregistrement…"
          sticky
        />
      )}
    </form>
  );
}
