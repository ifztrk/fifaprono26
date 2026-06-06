import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { flagEmoji } from "@/lib/countries";
import { formatDay, formatTime, stageLabel } from "@/lib/format";
import {
  recomputeAction,
  saveSettingsAction,
  updateMatchAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/matchs");

  const [matches, teams, settings] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.team.findMany({ orderBy: [{ groupName: "asc" }, { name: "asc" }] }),
    getAllSettings(),
  ]);

  const doublePoints = settings.doublePointsKnockout === "1";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Administration 🛠️</h1>
        <p className="text-sm text-muted">
          Saisis les scores (les points se recalculent automatiquement) et fais
          avancer la phase finale.
        </p>
      </div>

      {/* Réglages */}
      <form action={saveSettingsAction} className="card space-y-3">
        <h2 className="font-bold">Réglages</h2>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="doublePointsKnockout"
            defaultChecked={doublePoints}
            className="size-5 accent-[var(--color-primary)]"
          />
          Doubler les points en phase à élimination directe (8es → finale)
        </label>
        <button type="submit" className="btn-primary">
          Enregistrer les réglages
        </button>
      </form>

      <form action={recomputeAction} className="card">
        <h2 className="mb-2 font-bold">Recalcul</h2>
        <p className="mb-2 text-sm text-muted">
          Force le recalcul de tous les points (normalement automatique).
        </p>
        <button type="submit" className="btn-ghost">
          🔄 Recalculer les points
        </button>
      </form>

      {/* Matchs */}
      <div>
        <h2 className="mb-2 font-bold">Matchs ({matches.length})</h2>
        <div className="space-y-2">
          {matches.map((m) => {
            const isKnockout = m.stage !== "GROUP";
            return (
              <form
                key={m.id}
                action={updateMatchAction}
                className="card !p-3"
              >
                <input type="hidden" name="matchId" value={m.id} />
                <div className="mb-2 flex items-center justify-between text-xs text-muted">
                  <span>
                    #{m.number} · {stageLabel(m.stage)}
                    {m.groupName ? ` · Gr. ${m.groupName}` : ""}
                  </span>
                  <span>
                    {formatDay(m.kickoff)} {formatTime(m.kickoff)}
                  </span>
                </div>

                {isKnockout ? (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <select
                      name="homeTeamId"
                      defaultValue={m.homeTeamId ?? ""}
                      className="input text-sm"
                    >
                      <option value="">
                        {m.homeLabel ?? "Équipe domicile"}
                      </option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {flagEmoji(t.code)} {t.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="awayTeamId"
                      defaultValue={m.awayTeamId ?? ""}
                      className="input text-sm"
                    >
                      <option value="">
                        {m.awayLabel ?? "Équipe extérieur"}
                      </option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {flagEmoji(t.code)} {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>
                      {m.homeTeam
                        ? `${flagEmoji(m.homeTeam.code)} ${m.homeTeam.name}`
                        : "?"}
                    </span>
                    <span>
                      {m.awayTeam
                        ? `${m.awayTeam.name} ${flagEmoji(m.awayTeam.code)}`
                        : "?"}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="homeScore"
                    min={0}
                    defaultValue={m.homeScore ?? ""}
                    placeholder="-"
                    className="input w-14 text-center font-bold"
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    name="awayScore"
                    min={0}
                    defaultValue={m.awayScore ?? ""}
                    placeholder="-"
                    className="input w-14 text-center font-bold"
                  />
                  <button type="submit" className="btn-primary ml-auto !py-2">
                    {m.finished ? "Modifier" : "Valider"}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
