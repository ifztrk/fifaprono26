import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ThemeToggle from "@/components/ThemeToggle";
import TeamFlag from "@/components/TeamFlag";
import Nav, { DesktopNav } from "./Nav";
import TimeZoneSync from "./TimeZoneSync";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");

  // Messages non lus du mur (hors les siens) pour la pastille de navigation
  const unread = await prisma.post.count({
    where: {
      userId: { not: user.id },
      ...(user.lastSeenPosts ? { createdAt: { gt: user.lastSeenPosts } } : {}),
    },
  });

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-28 pt-3 sm:pb-10">
      <TimeZoneSync />
      <header className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/accueil" className="flex items-center gap-1.5">
            <span className="text-xl">🏆</span>
            <span className="display text-lg font-extrabold leading-none">
              FIFA<span className="gradient-text">PRONO</span>
              <span className="text-muted"> 26</span>
            </span>
          </Link>

          <DesktopNav isAdmin={user.isAdmin} unread={unread} />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/profil"
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2/70 py-1 pl-1 pr-3 text-sm transition hover:border-primary/50"
            >
              <TeamFlag code={user.favoriteCode} size={26} />
              <span className="hidden max-w-[8rem] truncate font-semibold sm:inline">
                {user.displayName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {children}

      <Nav isAdmin={user.isAdmin} unread={unread} />
    </div>
  );
}
