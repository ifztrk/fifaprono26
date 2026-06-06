import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CountryPicker from "./CountryPicker";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <p className="text-4xl">🏆</p>
        <h1 className="mt-2 text-2xl font-black">
          Bienvenue {user.displayName} !
        </h1>
        <p className="mt-2 text-muted">
          Quel est ton <span className="font-semibold text-primary">pays
          coup de cœur</span> pour cette Coupe du Monde ? Son drapeau
          s&apos;affichera à côté de ton nom dans le classement.
        </p>
      </div>

      <div className="card">
        <CountryPicker initial={user.favoriteCode} />
      </div>
    </main>
  );
}
