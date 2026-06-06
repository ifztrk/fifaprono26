"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/matchs", label: "Matchs", icon: "⚽" },
  { href: "/poules", label: "Poules", icon: "📊" },
  { href: "/finale", label: "Finale", icon: "🏆" },
  { href: "/classement", label: "Classement", icon: "🥇" },
  { href: "/profil", label: "Profil", icon: "👤" },
];

export default function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin
    ? [...LINKS, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : LINKS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur sm:hidden">
      <ul className="mx-auto flex max-w-3xl">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <span className="text-lg">{l.icon}</span>
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
  const links = isAdmin
    ? [...LINKS, { href: "/admin", label: "Admin", icon: "🛠️" }]
    : LINKS;

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted hover:text-foreground"
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
