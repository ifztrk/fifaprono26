// Liste de pays (code ISO alpha-2 + nom français) pour le "pays coup de cœur".
// Le drapeau est généré en emoji à partir du code via flagEmoji().

export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentine" },
  { code: "AU", name: "Australie" },
  { code: "AT", name: "Autriche" },
  { code: "BE", name: "Belgique" },
  { code: "BO", name: "Bolivie" },
  { code: "BA", name: "Bosnie-Herzégovine" },
  { code: "BR", name: "Brésil" },
  { code: "BG", name: "Bulgarie" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CM", name: "Cameroun" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chili" },
  { code: "CN", name: "Chine" },
  { code: "CO", name: "Colombie" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatie" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "DK", name: "Danemark" },
  { code: "EG", name: "Égypte" },
  { code: "AE", name: "Émirats arabes unis" },
  { code: "EC", name: "Équateur" },
  { code: "ES", name: "Espagne" },
  { code: "US", name: "États-Unis" },
  { code: "FI", name: "Finlande" },
  { code: "FR", name: "France" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Grèce" },
  { code: "GN", name: "Guinée" },
  { code: "HT", name: "Haïti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hongrie" },
  { code: "IN", name: "Inde" },
  { code: "ID", name: "Indonésie" },
  { code: "IQ", name: "Irak" },
  { code: "IR", name: "Iran" },
  { code: "IE", name: "Irlande" },
  { code: "IS", name: "Islande" },
  { code: "IL", name: "Israël" },
  { code: "IT", name: "Italie" },
  { code: "JM", name: "Jamaïque" },
  { code: "JP", name: "Japon" },
  { code: "JO", name: "Jordanie" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "Corée du Sud" },
  { code: "KP", name: "Corée du Nord" },
  { code: "KW", name: "Koweït" },
  { code: "MA", name: "Maroc" },
  { code: "MX", name: "Mexique" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norvège" },
  { code: "NZ", name: "Nouvelle-Zélande" },
  { code: "NL", name: "Pays-Bas" },
  { code: "PA", name: "Panama" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Pérou" },
  { code: "PL", name: "Pologne" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "CD", name: "RD Congo" },
  { code: "CZ", name: "République tchèque" },
  { code: "RO", name: "Roumanie" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "RU", name: "Russie" },
  { code: "SN", name: "Sénégal" },
  { code: "RS", name: "Serbie" },
  { code: "SK", name: "Slovaquie" },
  { code: "SI", name: "Slovénie" },
  { code: "SA", name: "Arabie saoudite" },
  { code: "SE", name: "Suède" },
  { code: "CH", name: "Suisse" },
  { code: "SCO", name: "Écosse" },
  { code: "WAL", name: "Pays de Galles" },
  { code: "ENG", name: "Angleterre" },
  { code: "DE", name: "Allemagne" },
  { code: "DZ", name: "Algérie" },
  { code: "TN", name: "Tunisie" },
  { code: "TR", name: "Turquie" },
  { code: "UA", name: "Ukraine" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
  { code: "ZA", name: "Afrique du Sud" },
  { code: "CV", name: "Cap-Vert" },
  { code: "CW", name: "Curaçao" },
  { code: "UZ", name: "Ouzbékistan" },
];

const SPECIAL_FLAGS: Record<string, string> = {
  ENG: "🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  SCO: "🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  WAL: "🏴\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
};

// Convertit un code ISO alpha-2 en emoji drapeau (lettres → indicateurs régionaux)
export function flagEmoji(code: string): string {
  if (!code) return "🏳️";
  if (SPECIAL_FLAGS[code]) return SPECIAL_FLAGS[code];
  if (code.length !== 2) return "🏳️";
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => base + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

const NAME_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c.name]));

export function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  return NAME_BY_CODE.get(code) ?? code;
}
