"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetState } from "./users-actions";

export default function ResetPasswordButton({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="userId" value={userId} />

      {state.password ? (
        <div className="text-right">
          <p className="text-[11px] text-muted">Mot de passe temporaire :</p>
          <code className="select-all rounded-md bg-surface-2 px-2 py-1 text-sm font-bold text-primary">
            {state.password}
          </code>
          <p className="mt-0.5 text-[11px] text-muted">
            à transmettre à {displayName}
          </p>
        </div>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-border bg-surface-2/70 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground disabled:opacity-50"
        >
          {pending ? "…" : "🔑 Réinitialiser"}
        </button>
      )}

      {state.error && (
        <p className="text-right text-xs text-danger">{state.error}</p>
      )}
    </form>
  );
}
