import { cookies } from "next/headers";

// Fuseau par défaut tant que le navigateur n'a pas déclaré le sien.
export const DEFAULT_TZ = "Europe/Paris";
export const TZ_COOKIE = "tz";

function isValidTimeZone(tz: string | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Fuseau horaire du joueur, déduit du cookie posé par <TimeZoneSync />.
// Retombe sur Europe/Paris si absent ou invalide.
export async function getTimeZone(): Promise<string> {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  return isValidTimeZone(tz) ? tz : DEFAULT_TZ;
}
