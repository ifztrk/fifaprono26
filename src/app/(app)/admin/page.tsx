import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { flagEmoji } from "@/lib/countries";
import { formatDay, formatTime, stageLabel } from "@/lib/format";
import { getTimeZone } from "@/lib/timezone";
import {
  recomputeAction,
  saveSettingsAction,
  updateMatchAction,
} from "./actions";
import { resolveHelpRequestAction } from "./users-actions";
import ResetPasswordButton from "./ResetPasswordButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/matchs");

  const [tz, matches, teams, settings, users, helpRequests] = await Promise.all([
    getTimeZone(),
    prisma.match.findMany({
      orderBy: { kickoff: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.team.findMany({ orderBy: [{ groupName: "asc" }, { name: "asc" }] }),
    getAllSettings(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.helpRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const userByEmail = new Map(users.map((u) => [u.email, u]));

  const doublePoints = settings.doublePointsKnockout === "1";

  // Formulaire de saisie d'un match (réutilisé pour « à valider » et « validés »)
  const renderMatchForm = (m: (typeof matches)[number]) => {
    const isKnockout = m.stage !== "GROUP";
    return (
      <form key={m.id} action={updateMatchAction} className="card !p-3">
        <input type="hidden" name="matchId" value={m.id} />
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>
            #{m.number} · {stageLabel(m.stage)}
            {m.groupName ? ` · Gr. ${m.groupName}` : ""}
          </span>
          <span>
            {formatDay(m.kickoff, tz)} {formatTime(m.kickoff, tz)}
          </span>
        </div>

        {isKnockout ? (
          <div className="mb-2 grid grid-cols-2 gap-2">
            <select
              name="homeTeamId"
              defaultValue={m.homeTeamId ?? ""}
              className="input text-sm"
            >
              <option value="">{m.homeLabel ?? "Équipe domicile"}</option>
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
              <option value="">{m.awayLabel ?? "Équipe extérieur"}</option>
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
            inputMode="numeric"
            name="homeScore"
            min={0}
            defaultValue={m.homeScore ?? ""}
            placeholder="-"
            className="input w-14 text-center font-bold"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            inputMode="numeric"
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

        {isKnockout && m.homeTeam && m.awayTeam && (
          <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2 text-xs">
            <span className="shrink-0 text-muted">Qualifié si nul (t.a.b.) :</span>
            <select
              name="shootoutWinner"
              defaultValue={m.shootoutWinner ?? ""}
              className="input !py-1 text-xs"
            >
              <option value="">—</option>
              <option value="HOME">
                {flagEmoji(m.homeTeam.code)} {m.homeTeam.name}
              </option>
              <option value="AWAY">
                {flagEmoji(m.awayTeam.code)} {m.awayTeam.name}
              </option>
            </select>
          </div>
        )}
      </form>
    );
  };

  // Matchs à valider d'abord, matchs déjà validés archivés (plus récents d'abord)
  const pendingMatches = matches.filter((m) => !m.finished);
  const validatedMatches = matches.filter((m) => m.finished).reverse();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Administration 🛠️</h1>
        <p className="text-sm text-muted">
          Saisis les scores (les points se recalculent automatiquement) et fais
          avancer la phase finale.
        </p>
      </div>

      {/* Demandes « mot de passe oublié » */}
      {helpRequests.length > 0 && (
        <div>
          <h2 className="mb-2 font-bold">
            🔔 Demandes de mot de passe ({helpRequests.length})
          </h2>
          <div className="space-y-2">
            {helpRequests.map((h) => {
              const u = userByEmail.get(h.email.toLowerCase());
              return (
                <div key={h.id} className="card !p-3 ring-1 ring-gold/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{h.email}</p>
                      <p className="text-xs text-muted">
                        {formatDay(h.createdAt, tz)} · {formatTime(h.createdAt, tz)}
                      </p>
                      {h.message && (
                        <p className="mt-1 text-sm">“{h.message}”</p>
                      )}
                      {!u && (
                        <p className="mt-1 text-xs text-danger">
                          ⚠️ Aucun compte avec cet email.
                        </p>
                      )}
                    </div>
                    <form action={resolveHelpRequestAction} className="shrink-0">
                      <input type="hidden" name="id" value={h.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground"
                      >
                        ✓ Traité
                      </button>
                    </form>
                  </div>
                  {u && (
                    <div className="mt-2 flex justify-end border-t border-border/60 pt-2">
                      <ResetPasswordButton
                        userId={u.id}
                        displayName={u.displayName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          Doubler les points des 8es et des quarts de finale
        </label>

        <div>
          <label className="label" htmlFor="registerCode">
            🔒 Code d&apos;invitation (laisser vide = inscription ouverte)
          </label>
          <input
            id="registerCode"
            name="registerCode"
            type="text"
            defaultValue={settings.registerCode ?? ""}
            placeholder="ex : ALLEZ2026"
            className="input"
          />
          <p className="mt-1 text-xs text-muted">
            Si renseigné, seuls ceux qui ont ce code pourront créer un compte.
          </p>
        </div>

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

      {/* Utilisateurs */}
      <div>
        <h2 className="mb-2 font-bold">Utilisateurs ({users.length})</h2>
        <p className="mb-2 text-sm text-muted">
          Réinitialise le mot de passe d&apos;un joueur : un mot de passe
          temporaire s&apos;affiche, transmets-le-lui (il pourra le changer dans
          son profil).
        </p>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="card flex items-center justify-between gap-3 !p-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  {u.displayName}
                  {u.isAdmin && (
                    <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                      ADMIN
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted">{u.email}</p>
              </div>
              <ResetPasswordButton userId={u.id} displayName={u.displayName} />
            </div>
          ))}
        </div>
      </div>

      {/* Matchs à valider */}
      <div>
        <h2 className="mb-2 font-bold">
          Matchs à valider ({pendingMatches.length})
        </h2>
        {pendingMatches.length === 0 ? (
          <p className="card text-center text-sm text-muted">
            Tous les matchs sont validés 🎉
          </p>
        ) : (
          <div className="space-y-2">{pendingMatches.map(renderMatchForm)}</div>
        )}

        {validatedMatches.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer select-none font-bold text-muted marker:text-muted hover:text-foreground">
              ✅ Matchs validés ({validatedMatches.length})
            </summary>
            <p className="mt-1 text-xs text-muted">
              Les plus récents d&apos;abord. Tu peux toujours corriger un score
              ici.
            </p>
            <div className="mt-2 space-y-2">
              {validatedMatches.map(renderMatchForm)}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
