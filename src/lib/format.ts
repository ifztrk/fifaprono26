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

const dayFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

const timeFmt = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export function formatDay(d: Date): string {
  return dayFmt.format(d);
}

export function formatTime(d: Date): string {
  return timeFmt.format(d);
}

export function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
  }).format(d);
}
