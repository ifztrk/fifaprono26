"use client";

import { useFormStatus } from "react-dom";

export default function SaveBar() {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-20 z-30 mt-4 sm:bottom-4">
      <button type="submit" disabled={pending} className="btn-primary w-full shadow-xl">
        {pending ? "Enregistrement…" : "💾 Enregistrer mes pronos"}
      </button>
    </div>
  );
}
