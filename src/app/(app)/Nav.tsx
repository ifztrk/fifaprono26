"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/accueil", label: "Accueil", icon: "🏠" },
  { href: "/matchs", label: "Matchs", icon: "⚽" },
  { href: "/poules", label: "Groupes", icon: "📊" },
  { href: "/finale", label: "Finale", icon: "🏆" },
  { href: "/classement", label: "Classement", icon: "🥇" },
];

function useLinks(isAdmin: boolean) {
  return isAdmin
    ? [...LINKS, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : LINKS;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = useLinks(isAdmin);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md sm:hidden">
      <ul className="mx-auto flex max-w-3xl">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <span
                  className={`text-lg transition ${active ? "scale-110" : ""}`}
                >
                  {l.icon}
                </span>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DesktopNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = useLinks(isAdmin);

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-surface-2/60 hover:text-foreground"
            }`}
          >
            <span className="mr-1">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
