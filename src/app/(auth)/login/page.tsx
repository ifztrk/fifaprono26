"use client";

import { useActionState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import ForgotPassword from "../ForgotPassword";
import { loginAction, type AuthState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    {},
  );

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">🏆</div>
        <h1 className="display text-4xl font-black tracking-tight">
          FIFA<span className="gradient-text">PRONO</span>
          <span className="text-muted"> 26</span>
        </h1>
        <p className="mt-2 text-muted">
          Pronostics entre amis · Coupe du Monde 2026
        </p>
      </div>

      <form action={action} className="card space-y-4">
        <h2 className="text-xl font-bold">Connexion</h2>

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
            autoComplete="current-password"
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Connexion…" : "Se connecter"}
        </button>

        <p className="text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Crée-le ici
          </Link>
        </p>
      </form>

      <ForgotPassword />
    </main>
  );
}
