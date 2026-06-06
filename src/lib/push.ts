import "server-only";
import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT || "mailto:admin@fifaprono26.app";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

type Sub = { endpoint: string; p256dh: string; auth: string };

// Envoie une notification à une liste d'abonnements, en nettoyant les expirés
export async function sendToSubs(
  subs: Sub[],
  payload: PushPayload,
): Promise<number> {
  if (!ensureConfigured() || subs.length === 0) return 0;
  const data = JSON.stringify(payload);
  let ok = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data,
        );
        ok++;
      } catch (e: unknown) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await prisma.pushSubscription
            .deleteMany({ where: { endpoint: s.endpoint } })
            .catch(() => {});
        }
      }
    }),
  );
  return ok;
}

export async function sendToUser(
  userId: string,
  payload: PushPayload,
): Promise<number> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  return sendToSubs(subs, payload);
}
