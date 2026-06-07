"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

// Barre du bas (mobile) : 5 onglets essentiels.
// Groupes & Finale restent accessibles via les cartes "Tes pronostics" de l'accueil.
const MOBILE: Item[] = [
  { href: "/accueil", label: "Accueil", icon: "🏠" },
  { href: "/matchs", label: "Matchs", icon: "⚽" },
  { href: "/classement", label: "Classement", icon: "🥇" },
  { href: "/chambrage", label: "Disfootons", icon: "💬" },
  { href: "/profil", label: "Profil", icon: "👤" },
];

// Barre du haut (desktop) : tout
const DESKTOP: Item[] = [
  { href: "/accueil", label: "Accueil", icon: "🏠" },
  { href: "/matchs", label: "Matchs", icon: "⚽" },
  { href: "/poules", label: "Groupes", icon: "📊" },
  { href: "/finale", label: "Finale", icon: "🏆" },
  { href: "/classement", label: "Classement", icon: "🥇" },
  { href: "/chambrage", label: "Disfootons", icon: "💬" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-[18px] text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Nav({
  isAdmin,
  unread = 0,
}: {
  isAdmin: boolean;
  unread?: number;
}) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...MOBILE, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : MOBILE;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <ul className="mx-auto flex max-w-3xl">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          const isChat = l.href === "/chambrage";
          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-1 py-2 transition ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <span
                  className={`relative grid size-9 place-items-center rounded-xl text-lg transition ${
                    active ? "scale-105 bg-primary/15" : ""
                  }`}
                >
                  {l.icon}
                  {isChat && <Badge count={unread} />}
                </span>
                <span className="w-full truncate text-center text-[10px] font-semibold leading-none">
                  {l.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DesktopNav({
  isAdmin,
  unread = 0,
}: {
  isAdmin: boolean;
  unread?: number;
}) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...DESKTOP, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : DESKTOP;

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        const isChat = l.href === "/chambrage";
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-surface-2/60 hover:text-foreground"
            }`}
          >
            <span className="mr-1">{l.icon}</span>
            {l.label}
            {isChat && <Badge count={unread} />}
          </Link>
        );
      })}
    </nav>
  );
}
