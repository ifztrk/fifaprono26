import { toggleReactionAction } from "./actions";
import { REACTION_EMOJIS } from "./constants";

export default function ReactionBar({
  postId,
  counts,
  mine,
}: {
  postId: string;
  counts: Record<string, number>;
  mine: Set<string>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = counts[emoji] ?? 0;
        const active = mine.has(emoji);
        return (
          <form key={emoji} action={toggleReactionAction}>
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="emoji" value={emoji} />
            <button
              type="submit"
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition ${
                active
                  ? "border-primary/60 bg-primary/15"
                  : "border-border bg-surface-2/60 hover:border-primary/40"
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-semibold text-muted">
                  {count}
                </span>
              )}
            </button>
          </form>
        );
      })}
    </div>
  );
}
