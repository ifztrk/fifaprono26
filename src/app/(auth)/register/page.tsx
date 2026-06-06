"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "../actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    {},
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">🏆</div>
        <h1 className="display text-4xl font-black tracking-tight">
          FIFA<span className="gradient-text">PRONO</span>
          <span className="text-muted"> 26</span>
        </h1>
        <p className="mt-2 text-muted">Rejoins le groupe et lance tes pronos !</p>
      </div>

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
            minLength={6}
            className="input"
            placeholder="6 caractères minimum"
          />
        </div>

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
    </main>
  );
}
