"use client";

import { useMemo, useState } from "react";
import { COUNTRIES, flagEmoji } from "@/lib/countries";
import { saveFavoriteAction } from "./actions";

export default function CountryPicker({
  initial,
}: {
  initial: string | null;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(initial);

  const sorted = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, sorted]);

  return (
    <form action={saveFavoriteAction} className="space-y-4">
      <input type="hidden" name="favoriteCode" value={selected ?? ""} />

      <input
        type="search"
        className="input"
        placeholder="Rechercher un pays…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
        {filtered.map((c) => {
          const active = selected === c.code;
          return (
            <button
              type="button"
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                active
                  ? "border-primary bg-primary/15 font-semibold"
                  : "border-border bg-surface-2 hover:border-primary/50"
              }`}
            >
              <span className="text-xl">{flagEmoji(c.code)}</span>
              <span className="truncate">{c.name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-muted">
            Aucun pays trouvé.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className="btn-primary w-full"
      >
        {selected
          ? `C'est parti avec ${flagEmoji(selected)} !`
          : "Choisis ton pays"}
      </button>
    </form>
  );
}
