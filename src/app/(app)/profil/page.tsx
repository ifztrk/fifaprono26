import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import { countryName, flagEmoji } from "@/lib/countries";
import { logoutAction } from "../../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = (await getCurrentUser())!;
  const rows = await getLeaderboard();
  const rank = rows.findIndex((r) => r.userId === user.id) + 1;
  const me = rows.find((r) => r.userId === user.id);

  const badges: { icon: string; label: string }[] = [];
  if (rank === 1 && (me?.total ?? 0) > 0)
    badges.push({ icon: "👑", label: "En tête du classement" });
  if ((me?.exactCount ?? 0) >= 5)
    badges.push({ icon: "🔮", label: "Madame Irma (5 scores exacts)" });
  else if ((me?.exactCount ?? 0) >= 1)
    badges.push({ icon: "🎯", label: "Premier score exact" });
  if ((me?.predictionCount ?? 0) >= 10)
    badges.push({ icon: "🔥", label: "Pronostiqueur assidu" });
  if (user.isAdmin) badges.push({ icon: "🛠️", label: "Administrateur" });

  return (
    <div className="space-y-5">
      <div className="card text-center">
        <div className="text-6xl">{flagEmoji(user.favoriteCode ?? "")}</div>
        <h1 className="mt-2 text-2xl font-black">{user.displayName}</h1>
        <p className="text-sm text-muted">
          Coup de cœur : {countryName(user.favoriteCode)}
        </p>
        <Link
          href="/onboarding"
          className="mt-3 inline-block text-sm font-semibold text-primary"
        >
          Changer mon pays
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <p className="text-2xl font-black text-primary">{me?.total ?? 0}</p>
          <p className="text-xs text-muted">points</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-black">{rank || "—"}</p>
          <p className="text-xs text-muted">classement</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-black">{me?.exactCount ?? 0}</p>
          <p className="text-xs text-muted">scores exacts</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">Détail des points</h2>
        <ul className="space-y-1.5 text-sm">
          <li className="flex justify-between">
            <span className="text-muted">⚽ Pronostics de matchs</span>
            <span className="font-semibold">{me?.matchPoints ?? 0} pts</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">📊 Qualifiés de poule</span>
            <span className="font-semibold">{me?.groupPoints ?? 0} pts</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted">🏆 Vainqueur / finaliste</span>
            <span className="font-semibold">{me?.longPoints ?? 0} pts</span>
          </li>
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">Badges</h2>
        {badges.length === 0 ? (
          <p className="text-sm text-muted">
            Pas encore de badge — fais grimper tes pronos ! 💪
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm"
              >
                <span className="text-lg">{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <form action={logoutAction}>
        <button type="submit" className="btn-ghost w-full text-danger">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
