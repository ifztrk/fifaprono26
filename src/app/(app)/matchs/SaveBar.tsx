"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { celebrate } from "@/components/confetti";

export default function SaveBar() {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) celebrate();
    wasPending.current = pending;
  }, [pending]);

  return (
    <div className="sticky bottom-20 z-30 mt-4 sm:bottom-4">
      <button type="submit" disabled={pending} className="btn-primary w-full shadow-xl">
        {pending ? "Enregistrement…" : "💾 Enregistrer mes pronos"}
      </button>
    </div>
  );
}
