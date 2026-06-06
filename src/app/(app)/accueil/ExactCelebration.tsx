"use client";

import { useEffect } from "react";
import { celebrate } from "@/components/confetti";

// Lance des confettis si l'utilisateur a décroché de nouveaux scores exacts
// depuis sa dernière visite (mémorisé localement, ne se répète pas).
export default function ExactCelebration({ count }: { count: number }) {
  useEffect(() => {
    try {
      const seen = Number(localStorage.getItem("fp_exact_seen") ?? "0");
      if (count > seen) {
        const t = setTimeout(celebrate, 500);
        localStorage.setItem("fp_exact_seen", String(count));
        return () => clearTimeout(t);
      }
    } catch {}
  }, [count]);

  return null;
}
