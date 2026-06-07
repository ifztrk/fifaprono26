"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "../actions";

export default function RegisterForm({
  codeRequired,
}: {
  codeRequired: boolean;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    {},
  );

  return (
    <form action={action} className="card space-y-4">
      <h2 className="text-xl font-bold">Créer un compte</h2>

      <div>
        <label className="label" htmlFor="displayName">
          Pseudo
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          className="input"
          placeholder="Ton pseudo de pronostiqueur"
        />
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="toi@email.com"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
          placeholder="8 caractères minimum"
        />
      </div>

      {codeRequired && (
        <div>
          <label className="label" htmlFor="code">
            🔒 Code d&apos;invitation
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            className="input"
            placeholder="Code donné par l'organisateur"
          />
        </div>
      )}

      {state.error && (
        <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
