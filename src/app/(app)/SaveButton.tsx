"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { celebrate } from "@/components/confetti";

export default function SaveButton({
  label = "Enregistrer",
  pendingLabel = "Enregistrement…",
  savedLabel = "✅ Enregistré !",
  sticky = false,
}: {
  label?: string;
  pendingLabel?: string;
  savedLabel?: string;
  sticky?: boolean;
}) {
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
    <div className={sticky ? "sticky bottom-20 z-30 mt-4 sm:bottom-4" : "mt-4"}>
      {saved && (
        <p className="mb-2 rounded-xl bg-primary/15 px-3 py-2 text-center text-sm font-semibold text-primary">
          {savedLabel}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full shadow-xl"
      >
        {pending ? pendingLabel : saved ? "✅ Enregistré" : label}
      </button>
    </div>
  );
}
