import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "../(auth)/actions";
import { flagEmoji } from "@/lib/countries";
import Nav, { DesktopNav } from "./Nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-24 pt-4 sm:pb-10">
      <header className="mb-5 flex items-center justify-between gap-3">
        <Link href="/matchs" className="text-lg font-black tracking-tight">
          FIFAPRONO <span className="text-primary">26</span>
        </Link>

        <DesktopNav isAdmin={user.isAdmin} />

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted sm:inline">
            {flagEmoji(user.favoriteCode ?? "")} {user.displayName}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted hover:text-foreground"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {children}

      <Nav isAdmin={user.isAdmin} />
    </div>
  );
}
