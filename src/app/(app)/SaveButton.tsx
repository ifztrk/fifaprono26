"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { celebrate } from "@/components/confetti";

export default function SaveButton({
  label = "Enregistrer",
  pendingLabel = "Enregistrement…",
  sticky = false,
}: {
  label?: string;
  pendingLabel?: string;
  sticky?: boolean;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) celebrate();
    wasPending.current = pending;
  }, [pending]);

  return (
    <div className={sticky ? "sticky bottom-20 z-30 mt-4 sm:bottom-4" : "mt-4"}>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full shadow-xl"
      >
        {pending ? pendingLabel : label}
      </button>
    </div>
  );
}
