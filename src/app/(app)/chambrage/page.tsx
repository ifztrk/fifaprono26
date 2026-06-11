import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTimeZone } from "@/lib/timezone";
import { formatDay, formatTime } from "@/lib/format";
import TeamFlag from "@/components/TeamFlag";
import PostForm from "./PostForm";
import ReactionBar from "./ReactionBar";
import ReplyButton from "./ReplyButton";
import MarkSeen from "./MarkSeen";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Extrait court d'un message (citation, bandeau de réponse…)
function snippet(text: string, max = 80) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

// Surligne les @mentions dans le texte (mention de soi = surlignage fort)
function renderContent(
  content: string,
  regex: RegExp | null,
  myLower: string,
) {
  if (!regex) return content;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  regex.lastIndex = 0;
  while ((m = regex.exec(content)) !== null) {
    if (m.index > last) out.push(content.slice(last, m.index));
    const name = m[1];
    const lower = name.toLowerCase();
    const isMe = lower === myLower || lower === "tous";
    out.push(
      <span
        key={k++}
        className={
          isMe
            ? "rounded bg-primary/20 px-1 font-semibold text-primary"
            : "font-semibold text-primary"
        }
      >
        @{name}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < content.length) out.push(content.slice(last));
  return out;
}

export default async function ChambragePage() {
  const me = (await getCurrentUser())!;
  const [tz, posts, users] = await Promise.all([
    getTimeZone(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { displayName: true, favoriteCode: true } },
        reactions: { select: { emoji: true, userId: true } },
        replyTo: {
          select: {
            content: true,
            user: { select: { displayName: true } },
          },
        },
      },
    }),
    prisma.user.findMany({ select: { id: true, displayName: true } }),
  ]);

  const friends = users
    .filter((u) => u.id !== me.id)
    .map((u) => u.displayName);

  // Regex de toutes les mentions possibles (noms les plus longs en premier)
  // « tous » = @tous (ping général)
  const names = ["tous", ...users.map((u) => u.displayName)]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex);
  const mentionRegex =
    names.length > 0 ? new RegExp(`@(${names.join("|")})`, "gi") : null;
  const myLower = me.displayName.toLowerCase();

  // Séparateur "messages déjà lus"
  const lastSeen = me.lastSeenPosts;
  let boundary = -1;
  if (lastSeen) {
    const idx = posts.findIndex((p) => p.createdAt <= lastSeen);
    if (idx > 0 && idx < posts.length) boundary = idx;
  }

  return (
    <div className="space-y-4">
      <MarkSeen />
      <div>
        <h1 className="display text-2xl font-extrabold">Disfootons 💬</h1>
        <p className="text-sm text-muted">
          Le mur du groupe : vannes, pronos et mauvaise foi bienvenus.
        </p>
      </div>

      <PostForm friends={friends} />

      <div className="space-y-2">
        {posts.length === 0 ? (
          <div className="card text-center text-muted">
            Personne n&apos;a encore osé… lance la discussion ! 😏
          </div>
        ) : (
          posts.map((p, i) => {
            const mine = p.userId === me.id;
            const counts: Record<string, number> = {};
            const myReactions = new Set<string>();
            for (const r of p.reactions) {
              counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
              if (r.userId === me.id) myReactions.add(r.emoji);
            }
            return (
              <div key={p.id}>
                {i === boundary && (
                  <div className="my-3 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted">
                    <span className="h-px flex-1 bg-border" />
                    messages déjà lus
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className="card !p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <TeamFlag code={p.user.favoriteCode} size={22} />
                    <span className="font-semibold">{p.user.displayName}</span>
                    <span className="text-xs text-muted">
                      ·{" "}
                      {formatDay(p.createdAt, tz)
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}{" "}
                      {formatTime(p.createdAt, tz)}
                    </span>
                    <div className="ml-auto flex items-center gap-3">
                      <ReplyButton
                        id={p.id}
                        author={p.user.displayName}
                        snippet={snippet(p.content)}
                      />
                      {(mine || me.isAdmin) && (
                        <form action={deletePostAction}>
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
                  </div>
                  {p.replyTo && (
                    <div className="mb-1.5 flex items-center gap-1.5 rounded-lg border-l-2 border-primary/50 bg-surface-2/50 px-2 py-1 text-xs">
                      <span className="shrink-0 text-primary">↪</span>
                      <span className="min-w-0 truncate text-muted">
                        <span className="font-semibold text-foreground">
                          {p.replyTo.user.displayName}
                        </span>
                        {" : "}
                        {snippet(p.replyTo.content)}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words text-[15px]">
                    {renderContent(p.content, mentionRegex, myLower)}
                  </p>
                  <ReactionBar
                    postId={p.id}
                    counts={counts}
                    mine={myReactions}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
