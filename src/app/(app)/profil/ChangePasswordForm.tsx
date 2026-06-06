"use client";

import { useActionState } from "react";
import { changePasswordAction, type PwState } from "./password-actions";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PwState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={action} className="card space-y-3">
      <h2 className="font-bold">🔒 Changer mon mot de passe</h2>

      <div>
        <label className="label" htmlFor="current">
          Mot de passe actuel
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="next">
          Nouveau mot de passe
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="confirm">
          Confirme le nouveau mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="input"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-primary/15 px-3 py-2 text-sm text-primary">
          ✅ Mot de passe mis à jour !
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Mise à jour…" : "Mettre à jour"}
      </button>
    </form>
  );
}
