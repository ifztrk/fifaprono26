// Une couleur vive et reconnaissable par pays (basée sur le drapeau),
// choisie pour bien ressortir sur fond bleu nuit.

const COLORS: Record<string, string> = {
  // Groupe A
  MX: "#03875b",
  ZA: "#007a4d",
  KR: "#0047a0",
  CZ: "#11457e",
  // Groupe B
  CA: "#ff2b2b",
  BA: "#1f4fd8",
  QA: "#9d1a4a",
  CH: "#ff3b3b",
  // Groupe C
  BR: "#0bb04a",
  MA: "#d3122a",
  HT: "#1750e8",
  SCO: "#1f6fe0",
  // Groupe D
  US: "#3a5bd9",
  PY: "#e23744",
  AU: "#ffc400",
  TR: "#ef2230",
  // Groupe E
  DE: "#f4c300",
  CW: "#1a4fd6",
  CI: "#ff8a1e",
  EC: "#ffd400",
  // Groupe F
  NL: "#ff7a1a",
  JP: "#e23150",
  SE: "#1f86d0",
  TN: "#e7283a",
  // Groupe G
  BE: "#ffd21f",
  EG: "#e23146",
  IR: "#16a34a",
  NZ: "#2b6fe8",
  // Groupe H
  ES: "#ff3636",
  CV: "#1f63e0",
  SA: "#0a8f47",
  UY: "#2f7be0",
  // Groupe I
  FR: "#2a6fe0",
  SN: "#13a04b",
  IQ: "#e22a3c",
  NO: "#e22a44",
  // Groupe J
  AR: "#74b6ee",
  DZ: "#0a8f47",
  AT: "#ef3340",
  JO: "#0f9d52",
  // Groupe K
  PT: "#e23a2e",
  CD: "#2a8fff",
  UZ: "#16a7c4",
  CO: "#ffcf2b",
  // Groupe L
  ENG: "#e23a4a",
  HR: "#ff3b3b",
  GH: "#ffce2b",
  PA: "#1f7bd6",
};

const FALLBACK = "#1fa463";

export function teamColor(code: string | null | undefined): string {
  if (!code) return FALLBACK;
  return COLORS[code] ?? FALLBACK;
}
