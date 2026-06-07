import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTimeZone } from "@/lib/timezone";
import { formatDay, formatTime } from "@/lib/format";
import TeamFlag from "@/components/TeamFlag";
import PostForm from "./PostForm";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ChambragePage() {
  const user = (await getCurrentUser())!;
  const [tz, posts] = await Promise.all([
    getTimeZone(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { displayName: true, favoriteCode: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="display text-2xl font-extrabold">Discutons 💬</h1>
        <p className="text-sm text-muted">
          Le mur du groupe : vannes, pronos et mauvaise foi bienvenus.
        </p>
      </div>

      <PostForm />

      <div className="space-y-2">
        {posts.length === 0 ? (
          <div className="card text-center text-muted">
            Personne n&apos;a encore osé… lance la discussion ! 😏
          </div>
        ) : (
          posts.map((p) => {
            const mine = p.userId === user.id;
            return (
              <div key={p.id} className="card !p-3">
                <div className="mb-1 flex items-center gap-2">
                  <TeamFlag code={p.user.favoriteCode} size={22} />
                  <span className="font-semibold">{p.user.displayName}</span>
                  <span className="text-xs text-muted">
                    · {formatDay(p.createdAt, tz).split(" ").slice(0, 2).join(" ")}{" "}
                    {formatTime(p.createdAt, tz)}
                  </span>
                  {(mine || user.isAdmin) && (
                    <form action={deletePostAction} className="ml-auto">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        aria-label="Supprimer"
                        className="text-xs text-muted hover:text-danger"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-[15px]">
                  {p.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
