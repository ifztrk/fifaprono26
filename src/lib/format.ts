export const STAGE_LABELS: Record<string, string> = {
  GROUP: "Phase de groupes",
  R32: "16es de finale",
  R16: "8es de finale",
  QF: "Quarts de finale",
  SF: "Demi-finales",
  THIRD: "Petite finale",
  FINAL: "Finale",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

// Fuseau utilisé si l'appelant n'en fournit pas (ex: rendu serveur avant que
// le navigateur n'ait déclaré son fuseau). Voir src/lib/timezone.ts.
const FALLBACK_TZ = "Europe/Paris";

// Les formatteurs Intl sont coûteux à créer : on les met en cache par fuseau.
const dayFmts = new Map<string, Intl.DateTimeFormat>();
const timeFmts = new Map<string, Intl.DateTimeFormat>();
const keyFmts = new Map<string, Intl.DateTimeFormat>();

function getFmt(
  cache: Map<string, Intl.DateTimeFormat>,
  tz: string,
  make: () => Intl.DateTimeFormat,
): Intl.DateTimeFormat {
  let fmt = cache.get(tz);
  if (!fmt) {
    fmt = make();
    cache.set(tz, fmt);
  }
  return fmt;
}

export function formatDay(d: Date, tz: string = FALLBACK_TZ): string {
  return getFmt(dayFmts, tz, () =>
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: tz,
    }),
  ).format(d);
}

export function formatTime(d: Date, tz: string = FALLBACK_TZ): string {
  return getFmt(timeFmts, tz, () =>
    new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    }),
  ).format(d);
}

export function dayKey(d: Date, tz: string = FALLBACK_TZ): string {
  return getFmt(keyFmts, tz, () =>
    new Intl.DateTimeFormat("fr-CA", { timeZone: tz }),
  ).format(d);
}
