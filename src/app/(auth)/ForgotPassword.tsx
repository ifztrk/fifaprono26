"use client";

import { useActionState, useState } from "react";
import { requestPasswordHelpAction, type HelpState } from "./actions";

export default function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<HelpState, FormData>(
    requestPasswordHelpAction,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-center text-sm font-semibold text-muted hover:text-foreground"
      >
        Mot de passe oublié ?
      </button>
    );
  }

  if (state.ok) {
    return (
      <div className="mt-3 rounded-xl bg-primary/15 px-3 py-3 text-center text-sm text-primary">
        ✅ Ta demande a été envoyée à l&apos;administrateur. Il te communiquera un
        nouveau mot de passe rapidement.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface-2/50 p-3">
      <p className="mb-2 text-sm font-semibold">Mot de passe oublié</p>
      <p className="mb-3 text-xs text-muted">
        Laisse ton email à l&apos;administrateur : il te renverra un nouveau mot
        de passe (que tu pourras changer ensuite).
      </p>
      <form action={action} className="space-y-2">
        <input
          name="email"
          type="email"
          required
          className="input"
          placeholder="Ton email"
        />
        <textarea
          name="message"
          rows={2}
          maxLength={500}
          className="input resize-none"
          placeholder="Message (optionnel) : ton pseudo, etc."
        />
        {state.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-ghost flex-1 !py-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="btn-primary flex-1 !py-2"
          >
            {pending ? "Envoi…" : "Envoyer à l'admin"}
          </button>
        </div>
      </form>
    </div>
  );
}
