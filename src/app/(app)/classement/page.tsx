import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";
import TeamFlag from "@/components/TeamFlag";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function ClassementPage() {
  const user = (await getCurrentUser())!;
  const rows = await getLeaderboard();

  return (
    <div>
      <div className="mb-4">
        <h1 className="display text-2xl font-extrabold">Classement 🥇</h1>
        <p className="text-sm text-muted">
          Le grand duel entre amis · {rows.length} joueur
          {rows.length > 1 ? "s" : ""} en lice.
        </p>
      </div>

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
