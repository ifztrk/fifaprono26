"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Déclare au serveur le fuseau horaire réel de l'appareil via un cookie.
// Le serveur s'en sert pour afficher les heures de match dans le bon fuseau.
// Ne rend rien : il pose le cookie au montage et ne rafraîchit la page
// que si le fuseau a changé (donc au plus une fois, à la 1re visite).
export default function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;

    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.slice(3);

    if (current === tz) return;

    // 1 an, accessible sur tout le site.
    document.cookie = `tz=${tz}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
