import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { flagEmoji } from "@/lib/countries";
import { arePreTournamentPredictionsLocked } from "@/lib/lock";
import { saveLongPredictionAction } from "./actions";
import SaveButton from "../SaveButton";

export const dynamic = "force-dynamic";

export default async function FinalePage() {
  const user = (await getCurrentUser())!;

  const [teams, pred, locked] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.longPrediction.findUnique({ where: { userId: user.id } }),
    arePreTournamentPredictionsLocked(),
  ]);

  if (teams.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-4xl">🏆</p>
        <h1 className="mt-2 text-xl font-bold">Équipes non configurées</h1>
        <p className="mt-1 text-muted">
          Reviens une fois le tirage saisi par l&apos;administrateur.
        </p>
      </div>
    );
  }

  return (
    <form action={saveLongPredictionAction}>
      <div className="mb-4">
        <h1 className="text-2xl font-black">Vainqueur final 🏆</h1>
        <p className="text-sm text-muted">
          Qui soulève la Coupe ? Vainqueur = 10 pts · Finaliste = 5 pts.{" "}
          {locked
            ? "🔒 Verrouillé (le tournoi a commencé)."
            : "Modifiable jusqu'au coup d'envoi du tournoi."}
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">🏆 Champion du monde 2026</label>
          <select
            name="championCode"
            defaultValue={pred?.championCode ?? ""}
            disabled={locked}
            className="input"
          >
            <option value="">— Choisis une équipe —</option>
            {teams.map((t) => (
              <option key={t.code} value={t.code}>
                {flagEmoji(t.code)} {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">🥈 Finaliste (optionnel)</label>
          <select
            name="finalistCode"
            defaultValue={pred?.finalistCode ?? ""}
            disabled={locked}
            className="input"
          >
            <option value="">— Aucun —</option>
            {teams.map((t) => (
              <option key={t.code} value={t.code}>
                {flagEmoji(t.code)} {t.name}
              </option>
            ))}
          </select>
        </div>

        {pred && (
          <p className="text-center text-sm text-muted">
            Ton prono actuel : {flagEmoji(pred.championCode)} champion
            {pred.finalistCode
              ? `, ${flagEmoji(pred.finalistCode)} finaliste`
              : ""}{" "}
            {pred.points > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 font-bold text-primary">
                +{pred.points} pts
              </span>
            )}
          </p>
        )}
      </div>

      {!locked && (
        <SaveButton label="💾 Enregistrer mon pronostic" sticky />
      )}
    </form>
  );
}
