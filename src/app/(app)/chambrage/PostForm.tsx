"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { postMessageAction, type PostState } from "./actions";
import type { ReplyDetail } from "./ReplyButton";

export default function PostForm({ friends }: { friends: string[] }) {
  const [state, action, pending] = useActionState<PostState, FormData>(
    postMessageAction,
    {},
  );
  const ref = useRef<HTMLTextAreaElement>(null);
  const [reply, setReply] = useState<ReplyDetail | null>(null);

  // Un message a cliqué « Répondre » → on cible son message
  useEffect(() => {
    function onReply(e: Event) {
      setReply((e as CustomEvent<ReplyDetail>).detail);
      ref.current?.focus();
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    window.addEventListener("disfoot:reply", onReply);
    return () => window.removeEventListener("disfoot:reply", onReply);
  }, []);

  useEffect(() => {
    if (state.ok && ref.current) {
      ref.current.value = "";
      setReply(null);
    }
  }, [state.ok]);

  function mention(name: string) {
    const ta = ref.current;
    if (!ta) return;
    const sep = ta.value && !ta.value.endsWith(" ") ? " " : "";
    ta.value = `${ta.value}${sep}@${name} `;
    ta.focus();
  }

  return (
    <form action={action} className="card space-y-2">
      {reply && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-3 py-2 text-sm">
          <span className="text-primary">↪</span>
          <span className="min-w-0 flex-1 truncate text-muted">
            Réponse à{" "}
            <span className="font-semibold text-foreground">
              {reply.author}
            </span>
            {" : "}
            {reply.snippet}
          </span>
          <button
            type="button"
            onClick={() => setReply(null)}
            aria-label="Annuler la réponse"
            className="shrink-0 text-muted transition hover:text-danger"
          >
            ✕
          </button>
        </div>
      )}
      {reply && <input type="hidden" name="replyToId" value={reply.id} />}

      <textarea
        ref={ref}
        name="content"
        rows={2}
        maxLength={280}
        required
        className="input resize-none"
        placeholder="Balance ta vanne, ton prono ou ton avis… 😏 (tape @ pour mentionner)"
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => mention("tous")}
          className="chip border-primary/50 font-semibold text-primary hover:bg-primary/10"
          title="Notifier tout le monde"
        >
          📣 @tous
        </button>
        {friends.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => mention(name)}
            className="chip hover:border-primary/60 hover:text-foreground"
          >
            @{name}
          </button>
        ))}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Envoi…" : reply ? "Répondre ↪" : "Publier 💬"}
      </button>
    </form>
  );
}
