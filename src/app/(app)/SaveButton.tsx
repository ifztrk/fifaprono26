"use client";

import { useFormStatus } from "react-dom";

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
