"use client";

import { useActionState, useEffect, useRef } from "react";
import { postMessageAction, type PostState } from "./actions";

export default function PostForm({ friends }: { friends: string[] }) {
  const [state, action, pending] = useActionState<PostState, FormData>(
    postMessageAction,
    {},
  );
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.ok && ref.current) ref.current.value = "";
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
      <textarea
        ref={ref}
        name="content"
        rows={2}
        maxLength={280}
        required
        className="input resize-none"
        placeholder="Balance ta vanne, ton prono ou ton avis… 😏 (tape @ pour mentionner)"
      />

      {friends.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
      )}

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Envoi…" : "Publier 💬"}
      </button>
    </form>
  );
}
