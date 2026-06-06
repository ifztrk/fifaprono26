"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { celebrate } from "@/components/confetti";

export default function SaveBar() {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      celebrate();
      setSaved(true);
    }
    wasPending.current = pending;
  }, [pending]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="sticky bottom-20 z-30 mt-4 sm:bottom-4">
      {saved && (
        <p className="mb-2 rounded-xl bg-primary/15 px-3 py-2 text-center text-sm font-semibold text-primary">
          ✅ Pronostics enregistrés !
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full shadow-xl"
      >
        {pending
          ? "Enregistrement…"
          : saved
            ? "✅ Enregistré"
            : "💾 Enregistrer mes pronos"}
      </button>
    </div>
  );
}
