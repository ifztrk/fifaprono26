"use client";

// Évènement partagé entre les boutons « Répondre » des messages et le formulaire
export type ReplyDetail = { id: string; author: string; snippet: string };

export default function ReplyButton({ id, author, snippet }: ReplyDetail) {
  return (
    <button
      type="button"
      aria-label="Répondre"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("disfoot:reply", {
            detail: { id, author, snippet } satisfies ReplyDetail,
          }),
        )
      }
      className="text-xs text-muted transition hover:text-primary"
    >
      ↪ Répondre
    </button>
  );
}
