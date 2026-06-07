import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import NotificationsButton from "@/components/NotificationsButton";

export const dynamic = "force-dynamic";

export default async function OnboardingNotifications() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <p className="text-5xl">🔔</p>
        <h1 className="display mt-2 text-2xl font-black">
          Dernière étape !
        </h1>
        <p className="mt-2 text-muted">
          Active les notifications pour ne jamais oublier de pronostiquer avant
          les matchs et être prévenu quand on te mentionne dans Disfootons.
        </p>
      </div>

      <NotificationsButton />

      <Link href="/accueil" className="btn-ghost mt-4 w-full">
        C&apos;est parti ! →
      </Link>
    </main>
  );
}
