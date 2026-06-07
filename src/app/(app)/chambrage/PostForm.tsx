"use client";

import { useActionState, useEffect, useRef } from "react";
import { postMessageAction, type PostState } from "./actions";

export default function PostForm() {
  const [state, action, pending] = useActionState<PostState, FormData>(
    postMessageAction,
    {},
  );
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.ok && ref.current) ref.current.value = "";
  }, [state.ok]);

  return (
    <form action={action} className="card space-y-2">
      <textarea
        ref={ref}
        name="content"
        rows={2}
        maxLength={280}
        required
        className="input resize-none"
        placeholder="Balance ta vanne, ton prono ou ton avis… 😏"
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Envoi…" : "Publier 💬"}
      </button>
    </form>
  );
}
