import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { teamColor } from "@/lib/teamColors";
import { dayKey, formatDay, formatTime, stageLabel } from "@/lib/format";
import { getTimeZone } from "@/lib/timezone";
import { computeStandings } from "@/lib/scoring";
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

  const [tz, matches, preds, teams, myGroupPreds] = await Promise.all([
    getTimeZone(),
    prisma.match.findMany({
      orderBy: { kickoff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.matchPrediction.findMany({ where: { userId: user.id } }),
    prisma.team.findMany(),
    prisma.groupPrediction.findMany({ where: { userId: user.id } }),
  ]);

  type MatchRow = (typeof matches)[number];
  type DayBucket = { key: string; date: Date; matches: MatchRow[] };

  const predMap = new Map(preds.map((p) => [p.matchId, p]));
  const now = new Date();

  // On affiche un match dès que ses 2 équipes sont connues OU qu'il a des
  // libellés (matchs à venir de phase finale, équipes pas encore qualifiées).
  const visibleMatches = matches.filter(
    (m) => (m.homeTeam && m.awayTeam) || (m.homeLabel && m.awayLabel),
  );

  // Une fois le coup d'envoi passé, on peut voir les pronos de tout le monde.
  const lockedIds = visibleMatches
    .filter((m) => m.kickoff <= now)
    .map((m) => m.id);
  const allPreds =
    lockedIds.length > 0
      ? await prisma.matchPrediction.findMany({
          where: { matchId: { in: lockedIds } },
          include: {
            user: { select: { displayName: true, favoriteCode: true } },
          },
        })
      : [];
  const predsByMatch = new Map<string, typeof allPreds>();
  for (const p of allPreds) {
    const arr = predsByMatch.get(p.matchId) ?? [];
    arr.push(p);
    predsByMatch.set(p.matchId, arr);
  }

  if (visibleMatches.length === 0) {
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

  // La phase de groupe est archivée quand TOUS ses matchs sont terminés.
  const groupMatchesAll = matches.filter((m) => m.stage === "GROUP");
  const groupArchived =
    groupMatchesAll.length > 0 && groupMatchesAll.every((m) => m.finished);

  // Regroupement des matchs par jour
  function groupByDay(ms: MatchRow[]): DayBucket[] {
    const days: DayBucket[] = [];
    for (const m of ms) {
      const k = dayKey(m.kickoff, tz);
      let bucket = days.find((d) => d.key === k);
      if (!bucket) {
        bucket = { key: k, date: m.kickoff, matches: [] };
        days.push(bucket);
      }
      bucket.matches.push(m);
    }
    return days;
  }

  // Rendu d'une carte de match (prono, résultat, pronos des autres)
  function renderMatchCard(m: MatchRow) {
    const locked = m.kickoff <= now;
    const teamsKnown = !!(m.homeTeam && m.awayTeam);
    const finished =
      m.finished && m.homeScore !== null && m.awayScore !== null;
    const pred = predMap.get(m.id);
    const homeWin = finished && (m.homeScore ?? 0) > (m.awayScore ?? 0);
    const awayWin = finished && (m.awayScore ?? 0) > (m.homeScore ?? 0);

    let homeCell: React.ReactNode;
    let awayCell: React.ReactNode;
    if (!locked && teamsKnown) {
      homeCell = (
        <input
          type="number"
          inputMode="numeric"
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
          inputMode="numeric"
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
            {formatTime(m.kickoff, tz)}
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

        {finished &&
          m.stage !== "GROUP" &&
          m.homeScore === m.awayScore &&
          m.shootoutWinner &&
          (() => {
            const q = m.shootoutWinner === "HOME" ? m.homeTeam : m.awayTeam;
            if (!q) return null;
            return (
              <p className="mt-1.5 text-center text-xs font-semibold text-primary">
                🎟️ {q.name} qualifié aux t.a.b.
              </p>
            );
          })()}

        {locked && (
          <>
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

            {(() => {
              const all = [...(predsByMatch.get(m.id) ?? [])].sort((a, b) =>
                finished
                  ? b.points - a.points ||
                    a.user.displayName.localeCompare(b.user.displayName)
                  : a.user.displayName.localeCompare(b.user.displayName),
              );
              if (all.length === 0) return null;
              return (
                <details className="mt-2 border-t border-border/60 pt-2">
                  <summary className="cursor-pointer select-none text-xs text-muted hover:text-foreground">
                    👀 Voir les pronos ({all.length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {all.map((p) => {
                      const meRow = p.userId === user.id;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <TeamFlag code={p.user.favoriteCode} size={18} />
                          <span
                            className={`min-w-0 flex-1 truncate ${
                              meRow ? "font-semibold text-primary" : ""
                            }`}
                          >
                            {p.user.displayName}
                            {meRow && " (toi)"}
                          </span>
                          <span className="shrink-0 font-bold tabular-nums">
                            {p.homeScore}-{p.awayScore}
                          </span>
                          {finished && (
                            <span
                              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                p.points >= 3
                                  ? "bg-primary/20 text-primary"
                                  : p.points > 0
                                    ? "bg-gold/20 text-gold"
                                    : "bg-danger/20 text-danger"
                              }`}
                            >
                              +{p.points}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })()}
          </>
        )}
      </div>
    );
  }

  // Rendu d'un jour. foldable = repli auto des jours passés (page courante).
  function renderDay(day: DayBucket, foldable: boolean) {
    const body = (
      <div className="space-y-2.5">{day.matches.map(renderMatchCard)}</div>
    );
    if (!foldable) {
      return (
        <section key={day.key}>
          <h2 className="mb-2 text-sm font-bold capitalize text-muted">
            {formatDay(day.date, tz)}
          </h2>
          {body}
        </section>
      );
    }
    return (
      <section key={day.key}>
        <details
          open={day.matches.some((mm) => mm.kickoff > now)}
          className="[&[open]>summary>.j-when]:hidden"
        >
          <summary className="mb-2 cursor-pointer select-none text-sm font-bold capitalize text-muted marker:text-muted hover:text-foreground">
            {formatDay(day.date, tz)}
            <span className="j-when ml-1 text-xs font-normal normal-case text-muted">
              · terminé · {day.matches.length} match
              {day.matches.length > 1 ? "s" : ""}
            </span>
          </summary>
          {body}
        </details>
      </section>
    );
  }

  // Archive de la phase de groupe (classements finaux + qualifiés + tes points)
  let archive: React.ReactNode = null;
  if (groupArchived) {
    const groupNames = [...new Set(teams.map((t) => t.groupName))].sort();
    const standings = groupNames.map((g) => ({
      name: g,
      rows: computeStandings(
        teams
          .filter((t) => t.groupName === g)
          .map((t) => ({ id: t.id, code: t.code, name: t.name })),
        groupMatchesAll.filter((m) => m.groupName === g),
      ),
    }));

    const groupMatchIds = new Set(groupMatchesAll.map((m) => m.id));
    const myMatchPts = preds
      .filter((p) => groupMatchIds.has(p.matchId))
      .reduce((s, p) => s + p.points, 0);
    const myQualPts = myGroupPreds.reduce((s, p) => s + p.points, 0);
    const myTotal = myMatchPts + myQualPts;

    const groupDays = groupByDay(visibleMatches.filter((m) => m.stage === "GROUP"));

    archive = (
      <details className="rounded-2xl border border-border bg-surface-2/40 p-3">
        <summary className="cursor-pointer select-none text-sm font-bold text-muted marker:text-muted hover:text-foreground">
          📁 Phase de groupe (archivée) · {groupMatchesAll.length} matchs
        </summary>

        <div className="mt-3 space-y-5">
          {/* Tes points en phase de groupe */}
          <div className="card-2 !p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">
                Tes points en phase de groupe
              </span>
              <span className="text-xl font-black text-primary">
                {myTotal}
                <span className="ml-1 text-xs font-semibold text-muted">
                  pts
                </span>
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              🎯 Matchs : {myMatchPts} · 📊 Qualifiés : {myQualPts}
            </p>
          </div>

          {/* Classements finaux des poules */}
          <div>
            <h3 className="display mb-2 text-sm font-bold">
              Classements finaux des poules
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {standings.map((s) => (
                <div key={s.name} className="card-2 !p-3">
                  <p className="mb-1.5 text-xs font-bold uppercase text-muted">
                    Groupe {s.name}
                  </p>
                  <div className="space-y-1">
                    {s.rows.map((r, i) => {
                      const qualified = i < 2;
                      return (
                        <div
                          key={r.code}
                          className={`flex items-center gap-2 text-sm ${
                            qualified ? "" : "text-muted"
                          }`}
                        >
                          <span className="w-4 shrink-0 text-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <TeamFlag code={r.code} size={18} />
                          <span className="min-w-0 flex-1 truncate">
                            {r.name}
                          </span>
                          {qualified && (
                            <span className="shrink-0 text-[10px]">✅</span>
                          )}
                          <span className="shrink-0 font-bold tabular-nums">
                            {r.points}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tous les matchs de la phase de groupe */}
          <div className="space-y-5">
            {groupDays.map((d) => renderDay(d, false))}
          </div>
        </div>
      </details>
    );
  }

  // Jours à afficher hors archive
  const liveDays = groupByDay(
    groupArchived
      ? visibleMatches.filter((m) => m.stage !== "GROUP")
      : visibleMatches,
  );

  return (
    <form action={savePredictionsAction}>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Les matchs ⚽</h1>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="chip">🎯 Score exact · ✅ Bon résultat</span>
          <span className="chip">🔥 Points renforcés en phase finale</span>
          <span className="chip">🔒 Verrou au coup d&apos;envoi</span>
          <span className="chip">🕒 Heures dans ton fuseau</span>
        </div>
      </div>

      <div className="space-y-6">
        {liveDays.map((d) => renderDay(d, true))}
        {archive}
      </div>

      <SaveBar />
    </form>
  );
}
